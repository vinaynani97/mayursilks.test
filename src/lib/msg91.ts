import { prisma } from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────

interface MSG91Response {
  type?: string;
  message?: string;
}

export interface OTPResult {
  success: boolean;
  message: string;
  /** Populated only in development mode to aid manual testing */
  otp?: string;
}

export interface VerifyResult {
  success: boolean;
  message: string;
}

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Accepts 10-digit numbers or numbers prefixed with 91/+91.
 * Returns the bare 10-digit mobile or null if invalid.
 */
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  const mobile =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 13 && digits.startsWith("091")
      ? digits.slice(3)
      : digits.length === 10
      ? digits
      : null;

  if (!mobile) return null;
  // Indian mobiles start with 6–9
  return /^[6-9]\d{9}$/.test(mobile) ? mobile : null;
}

function generateOTP(): string {
  return Math.floor(100_000 + Math.random() * 900_000).toString();
}

// ─── MSG91 Transport ─────────────────────────────────────────

/**
 * Calls MSG91 v5 OTP API. Returns true only when MSG91 confirms success.
 * Never throws — always resolves to a boolean.
 */
async function dispatchViaMSG91(mobile: string, otp: string): Promise<boolean> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID ?? "MAYURSILKS";

  // Skip silently if credentials are absent; caller decides how to handle
  if (!authKey || !templateId) {
    console.warn("[MSG91] MSG91_AUTH_KEY or MSG91_TEMPLATE_ID not configured");
    return false;
  }

  try {
    const res = await fetch("https://api.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: `91${mobile}`,
        otp,
        sender: senderId,
      }),
    });

    const data = (await res.json()) as MSG91Response;

    if (data.type !== "success") {
      console.error("[MSG91 send] Unexpected response:", data);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[MSG91 send] Network error:", err);
    return false;
  }
}

// ─── DB Helpers ──────────────────────────────────────────────

async function persistOTP(mobile: string, code: string): Promise<void> {
  // Remove any prior OTPs for this number before inserting the new one
  await prisma.otpCode.deleteMany({ where: { mobile } });
  await prisma.otpCode.create({
    data: {
      mobile,
      code,
      expiresAt: new Date(Date.now() + 10 * 60_000), // 10-minute window
    },
  });
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Validates the phone number, enforces a 60-second cooldown, generates a
 * fresh 6-digit OTP, persists it, and dispatches it via MSG91.
 *
 * In development the OTP is returned in the response body so you can test
 * without real SMS credits.
 */
export async function sendOTP(rawPhone: string): Promise<OTPResult> {
  const mobile = normalizePhone(rawPhone);
  if (!mobile) {
    return { success: false, message: "Enter a valid 10-digit Indian mobile number" };
  }

  // Enforce 60-second cooldown to prevent SMS flooding
  const recent = await prisma.otpCode.findFirst({
    where: { mobile, createdAt: { gt: new Date(Date.now() - 60_000) } },
  });
  if (recent) {
    const waitSecs = Math.ceil(
      (recent.createdAt.getTime() + 60_000 - Date.now()) / 1000
    );
    return {
      success: false,
      message: `Please wait ${waitSecs}s before requesting a new OTP`,
    };
  }

  const code = generateOTP();
  await persistOTP(mobile, code);

  const isDev = process.env.NODE_ENV !== "production";

  if (!isDev) {
    const sent = await dispatchViaMSG91(mobile, code).catch(() => false);

    if (!sent) {
      // Roll back the DB entry so the user can retry without waiting for cooldown
      await prisma.otpCode.deleteMany({ where: { mobile } }).catch(() => undefined);
      return {
        success: false,
        message: "OTP could not be delivered. Please try again.",
      };
    }
  }

  return {
    success: true,
    message: "OTP sent successfully",
    ...(isDev && { otp: code }),
  };
}

/**
 * Verifies the provided OTP against the database record.
 * Tracks failed attempts (max 3) to prevent brute-force attacks.
 * Deletes the record on success or after max attempts are exceeded.
 */
export async function verifyOTP(
  rawPhone: string,
  otp: string
): Promise<VerifyResult> {
  const mobile = normalizePhone(rawPhone);
  if (!mobile) {
    return { success: false, message: "Invalid phone number" };
  }

  if (!otp || !/^\d{6}$/.test(otp)) {
    return { success: false, message: "OTP must be exactly 6 digits" };
  }

  const record = await prisma.otpCode.findFirst({ where: { mobile } });

  if (!record) {
    return { success: false, message: "No OTP found. Please request a new one." };
  }

  // Check expiry before anything else
  if (record.expiresAt < new Date()) {
    await prisma.otpCode.deleteMany({ where: { mobile } });
    return { success: false, message: "OTP has expired. Please request a new one." };
  }

  // Block further attempts after threshold — prevents brute-force
  if (record.attempts >= 3) {
    await prisma.otpCode.deleteMany({ where: { mobile } });
    return {
      success: false,
      message: "Too many incorrect attempts. Please request a new OTP.",
    };
  }

  if (record.code !== otp) {
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = 3 - (record.attempts + 1);
    return {
      success: false,
      message:
        remaining > 0
          ? `Incorrect OTP. ${remaining} attempt(s) remaining.`
          : "Too many incorrect attempts. Please request a new OTP.",
    };
  }

  // Correct OTP — consume and delete
  await prisma.otpCode.deleteMany({ where: { mobile } });
  return { success: true, message: "OTP verified successfully" };
}

/**
 * Resends an OTP to the given phone number.
 * Subject to the same 60-second cooldown as sendOTP.
 */
export async function resendOTP(rawPhone: string): Promise<OTPResult> {
  return sendOTP(rawPhone);
}
