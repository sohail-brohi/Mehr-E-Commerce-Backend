import { Router } from "express";
import mongoose from "mongoose";
import { env } from "../env.js";
import { requireAdmin, type AuthedRequest } from "../middleware/auth.js";
import { ContactMessage } from "../models/ContactMessage.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Setting } from "../models/Setting.js";
import { Subscriber } from "../models/Subscriber.js";
import { User } from "../models/User.js";
import { mapOrder, mapUser } from "../mappers.js";

export const studioRouter = Router();

const defaultPayTo = () => ({
  jazzcash: "0300 8484848",
  easypaisa: "0300 8484848",
  bankTitle: "MEHR Atelier",
  bankName: "Habib Bank Limited",
  iban: "PK12 HABB 0000 0000 0000 0000",
});

export async function getPayTo() {
  const row = await Setting.findOne({ key: "studio" }).lean();
  return row?.payTo ? { ...defaultPayTo(), ...row.payTo } : defaultPayTo();
}

studioRouter.get("/overview", requireAdmin, async (_req, res) => {
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
  res.json({
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
  });
});

studioRouter.get("/customers", requireAdmin, async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(200);
  const counts = await Order.aggregate([
    { $group: { _id: { $toLower: "$customerEmail" }, n: { $sum: 1 }, spend: { $sum: "$total" } } },
  ]);
  const byEmail = new Map(counts.map((c) => [String(c._id).toLowerCase(), c]));
  res.json(
    users.map((u) => {
      const stats = byEmail.get(u.email.toLowerCase());
      return {
        ...mapUser(u),
        orders: stats?.n ?? 0,
        spend: stats?.spend ?? 0,
        createdAt: u.createdAt.toISOString(),
      };
    }),
  );
});

studioRouter.patch("/customers/:id/role", requireAdmin, async (req: AuthedRequest, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Invalid customer." });
    return;
  }
  const role = String(req.body?.role ?? "");
  if (role !== "admin" && role !== "customer") {
    res.status(400).json({ error: "Role must be admin or customer." });
    return;
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ error: "Customer not found." });
    return;
  }
  if (user.email === env.adminEmail && role !== "admin") {
    res.status(400).json({ error: "The house email always keeps studio access." });
    return;
  }
  if (req.user?.id === user._id.toString() && role !== "admin") {
    res.status(400).json({ error: "You can't remove your own studio access." });
    return;
  }
  if (role === "customer" && user.role === "admin") {
    const admins = await User.countDocuments({ role: "admin" });
    if (admins <= 1) {
      res.status(400).json({ error: "Keep at least one studio account." });
      return;
    }
  }
  user.role = role;
  await user.save();
  res.json(mapUser(user));
});

studioRouter.get("/inbox", requireAdmin, async (_req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(100);
  res.json(
    messages.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      message: m.message,
      read: m.read,
      createdAt: m.createdAt.toISOString(),
    })),
  );
});

studioRouter.patch("/inbox/:id/read", requireAdmin, async (req, res) => {
  const updated = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!updated) {
    res.status(404).json({ error: "Message not found." });
    return;
  }
  res.json({ ok: true });
});

studioRouter.delete("/inbox/:id", requireAdmin, async (req, res) => {
  await ContactMessage.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

studioRouter.get("/subscribers", requireAdmin, async (_req, res) => {
  const rows = await Subscriber.find().sort({ createdAt: -1 }).limit(500);
  res.json(rows.map((s) => ({ id: s._id.toString(), email: s.email, createdAt: s.createdAt.toISOString() })));
});

studioRouter.get("/settings", requireAdmin, async (_req, res) => {
  res.json({ payTo: await getPayTo() });
});

studioRouter.put("/settings", requireAdmin, async (req, res) => {
  const body = req.body?.payTo ?? {};
  const payTo = {
    jazzcash: String(body.jazzcash ?? "").trim() || defaultPayTo().jazzcash,
    easypaisa: String(body.easypaisa ?? "").trim() || defaultPayTo().easypaisa,
    bankTitle: String(body.bankTitle ?? "").trim() || defaultPayTo().bankTitle,
    bankName: String(body.bankName ?? "").trim() || defaultPayTo().bankName,
    iban: String(body.iban ?? "").trim() || defaultPayTo().iban,
  };
  await Setting.findOneAndUpdate(
    { key: "studio" },
    { key: "studio", payTo },
    { upsert: true, setDefaultsOnInsert: true },
  );
  res.json({ payTo: await getPayTo() });
});
