import nodemailer from "nodemailer";

// ── Gmail SMTP transporter (lazy — created on first use) ────
let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Send an email
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"ShopCart" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  await getTransporter().sendMail(mailOptions);
};

// ── OTP email templates ─────────────────────────────────────

/**
 * Send registration OTP
 */
export const sendRegistrationOTP = async (email, name, otp) => {
  await sendEmail({
    to: email,
    subject: "ShopCart — Verify Your Email",
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">🛒 ShopCart</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Email Verification</p>
        </div>
        <div style="padding:32px 24px;">
          <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Use the code below to verify your email and complete your registration:</p>
          <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
            <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#4f46e5;">${otp}</span>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
        <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  });
};

/**
 * Send password-reset OTP
 */
export const sendPasswordResetOTP = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: "ShopCart — Password Reset Code",
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:32px 24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">🔑 Password Reset</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">ShopCart Account</p>
        </div>
        <div style="padding:32px 24px;">
          <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hello,</p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">We received a request to reset your password. Use the code below:</p>
          <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
            <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#dc2626;">${otp}</span>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
        <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  });
};

export default sendEmail;
