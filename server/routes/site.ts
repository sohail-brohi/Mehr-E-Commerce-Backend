import { Router } from "express";
import { sendContactEmail, sendNewsletterWelcome } from "../lib/mailer.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { ContactMessage } from "../models/ContactMessage.js";
import { Subscriber } from "../models/Subscriber.js";
import { getPayTo } from "./studio.js";

export const siteRouter = Router();
const limit = rateLimit(6, 15 * 60 * 1000);

siteRouter.get("/pay-to", async (_req, res) => {
  res.json(await getPayTo());
});

siteRouter.post("/contact", limit, async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim();
  const message = String(req.body?.message ?? "").trim();
  if (name.length < 2 || !email.includes("@") || message.length < 8) {
    res.status(400).json({ error: "Name, email and a short message are required." });
    return;
  }
  await ContactMessage.create({ name, email, message });
  void sendContactEmail({ name, email, message });
  res.json({ ok: true });
});

siteRouter.post("/newsletter", limit, async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  if (!email.includes("@")) {
    res.status(400).json({ error: "A valid email is required." });
    return;
  }
  await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  void sendNewsletterWelcome(email);
  res.json({ ok: true });
});
