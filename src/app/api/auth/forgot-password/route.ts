import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({ data: { email, token, expiresAt } });

    // Construct reset URL
    const baseUrl =
      process.env.NEXTAUTH_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const fromName = process.env.EMAIL_FROM_NAME ?? "Mayur Silks";
      const fromAddr = process.env.EMAIL_FROM_ADDRESS ?? "noreply@mayursilks.com";

      await resend.emails.send({
        from: `${fromName} <${fromAddr}>`,
        to: email,
        subject: "Reset your Mayur Silks password",
        html: `
          <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; background: #fdf8f3;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-flex; align-items: center; gap: 10px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #8B4513, #D4A853); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-weight: bold; font-size: 18px;">M</span>
                </div>
                <span style="font-weight: bold; color: #8B4513; font-size: 20px; letter-spacing: 2px;">MAYUR SILKS</span>
              </div>
            </div>

            <div style="background: white; border-radius: 16px; padding: 36px; border: 1px solid #e8d5b7;">
              <h2 style="font-size: 22px; color: #1a1a1a; margin: 0 0 12px;">Reset your password</h2>
              <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Hi ${user.name},<br><br>
                We received a request to reset the password for your Mayur Silks account.
                Click the button below to create a new password. This link expires in <strong>1 hour</strong>.
              </p>

              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: #8B4513; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                  Reset Password
                </a>
              </div>

              <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 0;">
                If you didn&apos;t request this, you can safely ignore this email. Your password won&apos;t change.
              </p>
              <hr style="border: none; border-top: 1px solid #e8d5b7; margin: 20px 0;">
              <p style="color: #aaa; font-size: 12px; margin: 0; word-break: break-all;">
                Or copy this link: <a href="${resetUrl}" style="color: #8B4513;">${resetUrl}</a>
              </p>
            </div>
          </div>
        `,
      }).catch((err) => console.error("[ForgotPassword] Email send failed:", err));
    } else {
      console.warn("[ForgotPassword] RESEND_API_KEY not set. Reset URL:", resetUrl);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[ForgotPassword]", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
