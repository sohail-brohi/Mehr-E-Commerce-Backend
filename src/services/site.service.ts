import { HttpError } from "../helpers/http-error.helper.js";
import { ContactMessage, Subscriber } from "../models/index.js";
import { sendContactEmail, sendNewsletterWelcome } from "./mail.service.js";
import { getPayTo } from "./studio.service.js";

export async function getPublicPayTo() {
  return getPayTo();
}

export async function submitContact(input: { name: unknown; email: unknown; message: unknown }) {
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim();
  const message = String(input.message ?? "").trim();
  if (name.length < 2 || !email.includes("@") || message.length < 8) {
    throw new HttpError(400, "Name, email and a short message are required.");
  }
  await ContactMessage.create({ name, email, message });
  void sendContactEmail({ name, email, message });
  return { ok: true };
}

export async function subscribe(emailRaw: unknown) {
  const email = String(emailRaw ?? "").trim().toLowerCase();
  if (!email.includes("@")) throw new HttpError(400, "A valid email is required.");
  await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  void sendNewsletterWelcome(email);
  return { ok: true };
}
