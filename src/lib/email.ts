const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://printengine.in";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]!);
}

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!emailConfigured()) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, html }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Transactional email failed with status ${response.status}.`);
  return true;
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const link = `${SITE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  return sendEmail(
    email,
    "Verify your PrintEngine email",
    `<p>Hello ${escapeHtml(name)},</p><p>Confirm your email to protect your PrintEngine account.</p><p><a href="${link}">Verify email address</a></p><p>This link expires in 24 hours.</p>`,
  );
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const link = `${SITE_URL}/account/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail(
    email,
    "Reset your PrintEngine password",
    `<p>Hello ${escapeHtml(name)},</p><p><a href="${link}">Reset your password</a></p><p>This link expires in one hour. Ignore this email if you did not request it.</p>`,
  );
}

export async function sendOrderConfirmation(email: string, orderNumber: string, total: number) {
  const link = `${SITE_URL}/order/${encodeURIComponent(orderNumber)}`;
  return sendEmail(
    email,
    `Order ${orderNumber} confirmed`,
    `<p>Thank you for your order.</p><p><strong>${escapeHtml(orderNumber)}</strong> has been paid and entered our artwork-check queue.</p><p>Total: ₹${total.toLocaleString("en-IN")}</p><p><a href="${link}">View order status</a></p>`,
  );
}
