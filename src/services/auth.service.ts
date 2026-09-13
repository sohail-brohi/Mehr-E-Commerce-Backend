import { randomBytes } from "crypto";
import { env } from "../config/env.js";
import { HttpError } from "../helpers/http-error.helper.js";
import { comparePassword, hashPassword, sha256 } from "../helpers/hash.helper.js";
import { signToken } from "../helpers/jwt.helper.js";
import { mapUser } from "../helpers/mapper.helper.js";
import { User } from "../models/index.js";
import { claimGuest } from "./guest.service.js";
import { sendResetEmail, sendWelcomeEmail } from "./mail.service.js";

function sessionPayload(user: { _id: { toString(): string }; email: string; name: string; role: string }) {
  const mapped = mapUser(user);
  return {
    token: signToken({
      id: mapped.id,
      email: mapped.email,
      name: mapped.name,
      role: user.role === "admin" ? "admin" : "customer",
    }),
    user: mapped,
  };
}

export async function register(input: {
  name: unknown;
  email: unknown;
  password: unknown;
  phone: unknown;
  guestId?: string;
}) {
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");
  const phone = String(input.phone ?? "").trim();

  if (name.length < 2 || !email.includes("@") || password.length < 6) {
    throw new HttpError(400, "Name, a valid email and a 6+ character password are required.");
  }

  const existing = await User.findOne({ email });
  if (existing) throw new HttpError(409, "An account with that email already exists.");

  const user = await User.create({
    name,
    email,
    phone,
    passwordHash: await hashPassword(password),
    role: email === env.adminEmail ? "admin" : "customer",
  });

  void sendWelcomeEmail(user.name, user.email);
  await claimGuest(input.guestId, user._id.toString());
  return sessionPayload(user);
}

export async function login(input: { email: unknown; password: unknown; guestId?: string }) {
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");
  const user = await User.findOne({ email });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new HttpError(401, "Email or password is incorrect.");
  }

  if (email === env.adminEmail && user.role !== "admin") {
    user.role = "admin";
    await user.save();
  }

  await claimGuest(input.guestId, user._id.toString());
  return sessionPayload(user);
}

export async function getMe(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(401, "Account not found.");
  return { user: mapUser(user) };
}

export async function updateMe(userId: string, input: { name: unknown; phone: unknown }) {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(401, "Account not found.");
  const name = String(input.name ?? user.name).trim();
  const phone = String(input.phone ?? user.phone ?? "").trim();
  if (name.length < 2) throw new HttpError(400, "Please use your full name.");
  user.name = name;
  user.phone = phone;
  await user.save();
  return { user: mapUser(user) };
}

export async function forgotPassword(emailRaw: unknown) {
  const email = String(emailRaw ?? "").trim().toLowerCase();
  const user = email.includes("@") ? await User.findOne({ email }) : null;
  if (user) {
    const token = randomBytes(32).toString("hex");
    user.resetTokenHash = sha256(token);
    user.resetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    void sendResetEmail(user.email, token);
  }
  return { ok: true };
}

export async function resetPassword(tokenRaw: unknown, passwordRaw: unknown) {
  const token = String(tokenRaw ?? "");
  const password = String(passwordRaw ?? "");
  if (!token || password.length < 6) {
    throw new HttpError(400, "A new password of at least 6 characters is required.");
  }
  const user = await User.findOne({
    resetTokenHash: sha256(token),
    resetExpires: { $gt: new Date() },
  });
  if (!user) throw new HttpError(400, "That reset link has expired. Request a new one.");
  user.passwordHash = await hashPassword(password);
  user.resetTokenHash = "";
  user.resetExpires = null;
  await user.save();
  return { ok: true };
}
