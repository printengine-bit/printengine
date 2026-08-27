const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://printengine.in";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]!);
}

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(to: string, subject: string, html: string, options: { idempotencyKey?: string; tag?: string } = {}) {
  if (!emailConfigured()) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
      ...(options.idempotencyKey ? { "idempotency-key": options.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      html,
      reply_to: process.env.EMAIL_REPLY_TO || undefined,
      tags: options.tag ? [{ name: "category", value: options.tag }] : undefined,
    }),
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
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111"><p style="color:#709900;text-transform:uppercase;letter-spacing:.12em;font-size:12px">PrintEngine</p><h1>Order confirmed</h1><p>Thank you for your order. <strong>${escapeHtml(orderNumber)}</strong> has been paid and entered our artwork-check queue.</p><p style="font-size:20px"><strong>Total: ₹${total.toLocaleString("en-IN")}</strong></p><p><a style="display:inline-block;background:#b7ff00;color:#111;padding:14px 22px;text-decoration:none" href="${link}">View order status</a></p></div>`,
    { idempotencyKey: `order-confirmed-${orderNumber}`, tag: "order_confirmation" },
  );
}

export async function sendShipmentUpdate(email: string, orderNumber: string, status: string, trackingUrl: string | null) {
  const orderLink = `${SITE_URL}/order/${encodeURIComponent(orderNumber)}`;
  const safeStatus = escapeHtml(status);
  const link = trackingUrl || orderLink;
  return sendEmail(
    email,
    `${orderNumber}: ${status}`,
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111"><p style="color:#709900;text-transform:uppercase;letter-spacing:.12em;font-size:12px">PrintEngine delivery</p><h1>${safeStatus}</h1><p>Your order <strong>${escapeHtml(orderNumber)}</strong> has a new delivery update.</p><p><a style="display:inline-block;background:#b7ff00;color:#111;padding:14px 22px;text-decoration:none" href="${escapeHtml(link)}">Track your order</a></p></div>`,
    { idempotencyKey: `shipment-${orderNumber}-${status.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80)}`, tag: "shipment_update" },
  );
}
