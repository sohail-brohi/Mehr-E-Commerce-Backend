import mongoose from "mongoose";
import { env } from "../config/env.js";
import { DEFAULT_PAY_TO } from "../config/constants.js";
import { HttpError } from "../helpers/http-error.helper.js";
import { mapOrder, mapUser } from "../helpers/mapper.helper.js";
import { ContactMessage, Order, Product, Setting, Subscriber, User } from "../models/index.js";

export async function getPayTo() {
  const row = await Setting.findOne({ key: "studio" }).lean();
  return row?.payTo ? { ...DEFAULT_PAY_TO, ...row.payTo } : { ...DEFAULT_PAY_TO };
}

export async function getOverview() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [orders, products, unread, subscribers, customers] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(400),
    Product.find(),
    ContactMessage.countDocuments({ read: false }),
    Subscriber.countDocuments(),
    User.countDocuments(),
  ]);
  const active = orders.filter((o) => o.status !== "Cancelled");
  const today = active.filter((o) => o.createdAt >= startOfDay);
  const awaiting = orders.filter((o) => o.status === "Pending" || o.status === "Confirmed");
  const unpaid = orders.filter((o) => o.paymentStatus !== "paid" && o.status !== "Cancelled");
  const lowStock = products.filter((p) => p.published && p.stock <= 3);
  return {
    orders: orders.length,
    todayOrders: today.length,
    todayRevenue: today.reduce((s, o) => s + o.total, 0),
    revenue: active.reduce((s, o) => s + o.total, 0),
    awaiting: awaiting.length,
    unpaid: unpaid.length,
    livePieces: products.filter((p) => p.published).length,
    lowStock: lowStock.length,
    unreadMessages: unread,
    subscribers,
    customers,
    recent: orders.slice(0, 6).map(mapOrder),
    lowStockPieces: lowStock.slice(0, 8).map((p) => ({
      id: p._id.toString(),
      name: p.name,
      stock: p.stock,
      slug: p.slug,
    })),
  };
}

export async function listCustomers() {
  const users = await User.find().sort({ createdAt: -1 }).limit(200);
  const counts = await Order.aggregate([
    { $group: { _id: { $toLower: "$customerEmail" }, n: { $sum: 1 }, spend: { $sum: "$total" } } },
  ]);
  const byEmail = new Map(counts.map((c) => [String(c._id).toLowerCase(), c]));
  return users.map((u) => {
    const stats = byEmail.get(u.email.toLowerCase());
    return {
      ...mapUser(u),
      orders: stats?.n ?? 0,
      spend: stats?.spend ?? 0,
      createdAt: u.createdAt.toISOString(),
    };
  });
}

export async function updateCustomerRole(id: string, roleRaw: unknown, actorId?: string) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid customer.");
  const role = String(roleRaw ?? "");
  if (role !== "admin" && role !== "customer") {
    throw new HttpError(400, "Role must be admin or customer.");
  }
  const user = await User.findById(id);
  if (!user) throw new HttpError(404, "Customer not found.");
  if (user.email === env.adminEmail && role !== "admin") {
    throw new HttpError(400, "The house email always keeps studio access.");
  }
  if (actorId === user._id.toString() && role !== "admin") {
    throw new HttpError(400, "You can't remove your own studio access.");
  }
  if (role === "customer" && user.role === "admin") {
    const admins = await User.countDocuments({ role: "admin" });
    if (admins <= 1) throw new HttpError(400, "Keep at least one studio account.");
  }
  user.role = role;
  await user.save();
  return mapUser(user);
}

export async function listInbox() {
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(100);
  return messages.map((m) => ({
    id: m._id.toString(),
    name: m.name,
    email: m.email,
    message: m.message,
    read: m.read,
    createdAt: m.createdAt.toISOString(),
  }));
}

export async function markInboxRead(id: string) {
  const updated = await ContactMessage.findByIdAndUpdate(id, { read: true }, { new: true });
  if (!updated) throw new HttpError(404, "Message not found.");
  return { ok: true };
}

export async function deleteInbox(id: string) {
  await ContactMessage.findByIdAndDelete(id);
  return { ok: true };
}

export async function listSubscribers() {
  const rows = await Subscriber.find().sort({ createdAt: -1 }).limit(500);
  return rows.map((s) => ({ id: s._id.toString(), email: s.email, createdAt: s.createdAt.toISOString() }));
}

export async function getSettings() {
  return { payTo: await getPayTo() };
}

export async function updateSettings(body: Record<string, unknown>) {
  const raw = (body.payTo ?? {}) as Record<string, unknown>;
  const payTo = {
    jazzcash: String(raw.jazzcash ?? "").trim() || DEFAULT_PAY_TO.jazzcash,
    easypaisa: String(raw.easypaisa ?? "").trim() || DEFAULT_PAY_TO.easypaisa,
    bankTitle: String(raw.bankTitle ?? "").trim() || DEFAULT_PAY_TO.bankTitle,
    bankName: String(raw.bankName ?? "").trim() || DEFAULT_PAY_TO.bankName,
    iban: String(raw.iban ?? "").trim() || DEFAULT_PAY_TO.iban,
  };
  await Setting.findOneAndUpdate(
    { key: "studio" },
    { key: "studio", payTo },
    { upsert: true, setDefaultsOnInsert: true },
  );
  return { payTo: await getPayTo() };
}
