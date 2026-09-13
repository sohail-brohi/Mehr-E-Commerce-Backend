import nodemailer from "nodemailer";
import { env } from "../env.js";

const transporter = env.smtp.host
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth:
        env.smtp.user && env.smtp.pass
          ? { user: env.smtp.user, pass: env.smtp.pass }
          : undefined,
    })
  : null;

type Mail = { to: string; subject: string; html: string; text?: string };

export async function sendMail(mail: Mail) {
  if (!transporter) {
    console.log("[mailer] SMTP not configured. Skipping email:", mail.subject, "→", mail.to);
    return;
  }
  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
  } catch (error) {
    console.error("[mailer] failed to send", mail.subject, error);
  }
}

function wrap(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:32px;background:#F3EFE6;font-family:Georgia,serif;color:#3B3A38;">
    <div style="max-width:560px;margin:0 auto;background:#fff;padding:40px;">
      <p style="letter-spacing:.28em;font-size:12px;text-transform:uppercase;">MEHR</p>
      <h1 style="font-weight:400;font-size:28px;margin:16px 0 24px;">${title}</h1>
      ${body}
      <p style="margin-top:40px;font-size:12px;color:#7a7268;">Lahore, Pakistan · Cash on delivery · Nationwide shipping</p>
    </div>
  </body>
</html>`;
}

export async function sendWelcomeEmail(name: string, email: string) {
  await sendMail({
    to: email,
    subject: "Welcome to MEHR",
    html: wrap(
      `Welcome, ${name.split(" ")[0]}.`,
      `<p>Your account is ready. Track orders, save pieces, and check out a little faster next time.</p>
       <p><a href="${env.clientUrl}/account" style="color:#3B3A38;">Open your account</a></p>`,
    ),
  });
}

export async function sendOrderConfirmation(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentMethod: string;
  items: { productName: string; qty: number; size: string; color: string }[];
}) {
  const lines = order.items
    .map((i) => `<li>${i.productName} — ${i.color} · ${i.size} · Qty ${i.qty}</li>`)
    .join("");
  const pay =
    order.paymentMethod === "cod" ? "Pay the courier when it arrives." : "We'll confirm your payment shortly.";
  await sendMail({
    to: order.customerEmail,
    subject: `Order ${order.orderNumber} confirmed — MEHR`,
    html: wrap(
      `Shukriya, ${order.customerName.split(" ")[0]}.`,
      `<p>Your order <strong>${order.orderNumber}</strong> is confirmed. Total PKR ${order.total.toLocaleString("en-PK")}. ${pay}</p>
       <ul>${lines}</ul>
       <p><a href="${env.clientUrl}/account" style="color:#3B3A38;">Track in your account</a></p>`,
    ),
  });
}

export async function sendStudioOrderAlert(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
}) {
  await sendMail({
    to: env.adminEmail,
    subject: `New order ${order.orderNumber}`,
    html: wrap(
      "A new order landed.",
      `<p>${order.customerName} (${order.customerEmail}) placed ${order.orderNumber} for PKR ${order.total.toLocaleString("en-PK")}.</p>
       <p><a href="${env.clientUrl}/admin" style="color:#3B3A38;">Open studio</a></p>`,
    ),
  });
}

export async function sendOrderStatusEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
}) {
  await sendMail({
    to: order.customerEmail,
    subject: `Order ${order.orderNumber} is now ${order.status}`,
    html: wrap(
      `Update on ${order.orderNumber}`,
      `<p>Hello ${order.customerName.split(" ")[0]}, your order is now <strong>${order.status}</strong>.</p>
       <p><a href="${env.clientUrl}/account" style="color:#3B3A38;">See the full trail</a></p>`,
    ),
  });
}

export async function sendResetEmail(email: string, token: string) {
  const href = `${env.clientUrl}/account/reset?token=${encodeURIComponent(token)}`;
  await sendMail({
    to: email,
    subject: "Reset your MEHR password",
    html: wrap(
      "Reset your password",
      `<p>This link expires in one hour.</p>
       <p><a href="${href}" style="color:#3B3A38;">Choose a new password</a></p>
       <p>If you didn't ask for this, ignore the email.</p>`,
    ),
  });
}

export async function sendContactEmail(input: { name: string; email: string; message: string }) {
  await sendMail({
    to: env.adminEmail,
    subject: `Atelier note from ${input.name}`,
    html: wrap(
      "A note from the storefront",
      `<p><strong>${input.name}</strong> · ${input.email}</p>
       <p style="white-space:pre-wrap;">${input.message}</p>`,
    ),
  });
  await sendMail({
    to: input.email,
    subject: "We have your note — MEHR",
    html: wrap("Shukriya.", `<p>We've received your message and will write back on a working day.</p>`),
  });
}

export async function sendNewsletterWelcome(email: string) {
  await sendMail({
    to: email,
    subject: "You're on the MEHR list",
    html: wrap(
      "You're on the list.",
      `<p>We'll write when a new run lands — never more than that.</p>
       <p><a href="${env.clientUrl}/new-arrivals" style="color:#3B3A38;">See what's here now</a></p>`,
    ),
  });
}
