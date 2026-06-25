import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getResend, getFrom } from "@/lib/email";
import { emailOtpTemplate } from "@/lib/email-templates";

// ─── Constants ────────────────────────────────────────────────

const OTP_EXPIRY_MS = 10 * 60 * 1000;       // 10 minutes
const OTP_COOLDOWN_MS = 30 * 1000;           // 30 seconds between sends
const OTP_MAX_ATTEMPTS = 5;
const OTP_BCRYPT_ROUNDS = 10;

// ─── OTP Generation ───────────────────────────────────────────

function generateOtp(): string {
  // crypto.randomInt is cryptographically secure
  return crypto.randomInt(100_000, 1_000_000).toString();
}

// ─── Send ─────────────────────────────────────────────────────

export type OtpSendResult =
  | { ok: true; devOtp?: string }
  | { ok: false; error: string; status: number };

export async function sendEmailOtp(
  email: string,
  name: string
): Promise<OtpSendResult> {
  // Enforce 30-second cooldown per email address
  const recent = await prisma.emailOtpCode.findFirst({
    where: {
      email,
      createdAt: { gt: new Date(Date.now() - OTP_COOLDOWN_MS) },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recent) {
    const waitSec = Math.ceil(
      (recent.createdAt.getTime() + OTP_COOLDOWN_MS - Date.now()) / 1000
    );
    return {
      ok: false,
      error: `Please wait ${waitSec} second${waitSec !== 1 ? "s" : ""} before requesting a new code.`,
      status: 429,
    };
  }

  // Invalidate all previous OTPs for this email
  await prisma.emailOtpCode.deleteMany({ where: { email } });

  // Generate, hash, and persist the new OTP
  const otp = generateOtp();
  const hashedCode = await bcrypt.hash(otp, OTP_BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await prisma.emailOtpCode.create({ data: { email, hashedCode, expiresAt } });

  const isDev = process.env.NODE_ENV !== "production";
  const resend = getResend();

  if (!resend) {
    if (isDev) {
      console.log(`\n[EmailOTP] DEV — No RESEND_API_KEY. OTP for ${email}: ${otp}\n`);
      return { ok: true, devOtp: otp };
    }
    await prisma.emailOtpCode.deleteMany({ where: { email } });
    return { ok: false, error: "Email service is not configured.", status: 503 };
  }

  const { error } = await resend.emails.send({
    from: getFrom(),
    to: email,
    subject: "Your Mayur Silks verification code",
    html: emailOtpTemplate(name, otp),
  });

  if (error) {
    await prisma.emailOtpCode.deleteMany({ where: { email } });
    console.error("[EmailOTP] Resend error:", error);
    return {
      ok: false,
      error: "Failed to send verification email. Please try again.",
      status: 503,
    };
  }

  if (isDev) {
    console.log(`\n[EmailOTP] DEV — OTP sent to ${email}: ${otp}\n`);
    return { ok: true, devOtp: otp };
  }

  return { ok: true };
}

// ─── Verify ───────────────────────────────────────────────────

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; error: string; status: number; attemptsLeft?: number };

export async function verifyEmailOtp(
  email: string,
  otp: string
): Promise<OtpVerifyResult> {
  const record = await prisma.emailOtpCode.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return {
      ok: false,
      error: "No verification code found. Please request a new one.",
      status: 400,
    };
  }

  if (record.expiresAt < new Date()) {
    await prisma.emailOtpCode.delete({ where: { id: record.id } });
    return {
      ok: false,
      error: "Your verification code has expired. Please request a new one.",
      status: 410,
    };
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.emailOtpCode.delete({ where: { id: record.id } });
    return {
      ok: false,
      error: "Too many failed attempts. Please request a new verification code.",
      status: 429,
    };
  }

  // Increment attempts before comparing — prevents brute-force via parallel requests
  const updated = await prisma.emailOtpCode.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 } },
  });

  const valid = await bcrypt.compare(otp, record.hashedCode);

  if (!valid) {
    const attemptsLeft = OTP_MAX_ATTEMPTS - updated.attempts;

    if (attemptsLeft <= 0) {
      await prisma.emailOtpCode.delete({ where: { id: record.id } });
      return {
        ok: false,
        error: "Too many failed attempts. Please request a new verification code.",
        status: 429,
      };
    }

    return {
      ok: false,
      error: `Incorrect code. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`,
      status: 400,
      attemptsLeft,
    };
  }

  // Correct OTP — delete immediately so it cannot be reused
  await prisma.emailOtpCode.delete({ where: { id: record.id } });
  return { ok: true };
}
