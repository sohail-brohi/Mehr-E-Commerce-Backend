import { Router } from "express";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { env } from "../env.js";
import { signToken } from "../lib/jwt.js";
import { sendResetEmail, sendWelcomeEmail } from "../lib/mailer.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { claimGuest } from "../lib/claimGuest.js";
import { User } from "../models/User.js";
import { mapUser } from "../mappers.js";

export const authRouter = Router();
const authLimit = rateLimit(8, 15 * 60 * 1000);

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

authRouter.post("/register", authLimit, async (req: AuthedRequest, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  const phone = String(req.body?.phone ?? "").trim();

  if (name.length < 2 || !email.includes("@") || password.length < 6) {
    res.status(400).json({ error: "Name, a valid email and a 6+ character password are required." });
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ error: "An account with that email already exists." });
    return;
  }

  const role = email === env.adminEmail ? "admin" : "customer";
  const user = await User.create({
    name,
    email,
    phone,
    passwordHash: await bcrypt.hash(password, 12),
    role,
  });

  void sendWelcomeEmail(user.name, user.email);
  await claimGuest(req.guestId, user._id.toString());

  const mapped = mapUser(user);
  res.status(201).json({
    token: signToken({
      id: mapped.id,
      email: mapped.email,
      name: mapped.name,
      role: user.role === "admin" ? "admin" : "customer",
    }),
    user: mapped,
  });
});

authRouter.post("/login", authLimit, async (req: AuthedRequest, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Email or password is incorrect." });
    return;
  }

  if (email === env.adminEmail && user.role !== "admin") {
    user.role = "admin";
    await user.save();
  }

  const mapped = mapUser(user);
  await claimGuest(req.guestId, mapped.id);
  res.json({
    token: signToken({
      id: mapped.id,
      email: mapped.email,
      name: mapped.name,
      role: user.role === "admin" ? "admin" : "customer",
    }),
    user: mapped,
  });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    res.status(401).json({ error: "Account not found." });
    return;
  }
  res.json({ user: mapUser(user) });
});

authRouter.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    res.status(401).json({ error: "Account not found." });
    return;
  }
  const name = String(req.body?.name ?? user.name).trim();
  const phone = String(req.body?.phone ?? user.phone ?? "").trim();
  if (name.length < 2) {
    res.status(400).json({ error: "Please use your full name." });
    return;
  }
  user.name = name;
  user.phone = phone;
  await user.save();
  res.json({ user: mapUser(user) });
});

authRouter.post("/forgot", authLimit, async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const user = email.includes("@") ? await User.findOne({ email }) : null;
  if (user) {
    const token = randomBytes(32).toString("hex");
    user.resetTokenHash = tokenHash(token);
    user.resetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    void sendResetEmail(user.email, token);
  }
  res.json({ ok: true });
});

authRouter.post("/reset", authLimit, async (req, res) => {
  const token = String(req.body?.token ?? "");
  const password = String(req.body?.password ?? "");
  if (!token || password.length < 6) {
    res.status(400).json({ error: "A new password of at least 6 characters is required." });
    return;
  }
  const user = await User.findOne({
    resetTokenHash: tokenHash(token),
    resetExpires: { $gt: new Date() },
  });
  if (!user) {
    res.status(400).json({ error: "That reset link has expired. Request a new one." });
    return;
  }
  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetTokenHash = "";
  user.resetExpires = null;
  await user.save();
  res.json({ ok: true });
});
