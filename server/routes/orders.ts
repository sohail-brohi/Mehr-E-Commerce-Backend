import { Router } from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { optionalAuth, requireAdmin, type AuthedRequest } from "../middleware/auth.js";
import { sendOrderConfirmation, sendOrderStatusEmail, sendStudioOrderAlert } from "../lib/mailer.js";
import { mapOrder } from "../mappers.js";

export const ordersRouter = Router();

const orderNumber = () => `MHR-${Math.floor(100000 + Math.random() * 899999)}`;

ordersRouter.post("/", optionalAuth, async (req: AuthedRequest, res) => {
  const body = req.body ?? {};
  const lines = Array.isArray(body.items) ? body.items : [];
  if (lines.length === 0) {
    res.status(400).json({ error: "Your bag is empty." });
    return;
  }

  const customerName = String(body.customerName ?? "").trim();
  const customerEmail = String(body.customerEmail ?? "").trim();
  const customerPhone = String(body.customerPhone ?? "").trim();
  const addressLine1 = String(body.addressLine1 ?? "").trim();
  const city = String(body.city ?? "").trim();
  if (customerName.length < 2 || !customerEmail.includes("@") || customerPhone.length < 10 || addressLine1.length < 4 || city.length < 2) {
    res.status(400).json({ error: "Please complete contact and shipping details." });
    return;
  }

  const items = [];
  let subtotal = 0;
  for (const line of lines) {
    const product = await Product.findById(line.productId);
    if (!product || !product.published) {
      res.status(400).json({ error: "A piece in your bag is no longer available." });
      return;
    }
    const unitPrice = product.salePrice ?? product.price;
    const qty = Math.min(Math.max(Number(line.qty ?? 1), 1), 10);
    subtotal += unitPrice * qty;
    items.push({
      productId: product._id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: product.images[0] ?? null,
      size: String(line.size ?? "One size"),
      color: String(line.color ?? "Natural"),
      qty,
      unitPrice,
    });
    if (product.stock > 0) {
      product.stock = Math.max(0, product.stock - qty);
      await product.save();
    }
  }

  const shipping = Number(body.shipping ?? 0);
  const paymentMethod = ["cod", "card", "wallet", "bank"].includes(body.paymentMethod)
    ? body.paymentMethod
    : "cod";
  const paymentStatus = paymentMethod === "cod" ? "unpaid" : "pending";

  const created = await Order.create({
    orderNumber: orderNumber(),
    userId: req.user?.id ?? null,
    guestId: req.guestId ?? null,
    ipAddress: req.clientIp ?? "",
    customerName,
    customerEmail,
    customerPhone,
    addressLine1,
    city,
    postalCode: String(body.postalCode ?? "").trim(),
    subtotal,
    shipping,
    total: subtotal + shipping,
    paymentMethod,
    paymentStatus: body.paymentStatus ?? paymentStatus,
    paymentReference: body.paymentReference ? String(body.paymentReference) : null,
    status: "Pending",
    items,
  });

  const mapped = mapOrder(created);
  void sendOrderConfirmation(mapped);
  void sendStudioOrderAlert(mapped);
  res.status(201).json(mapped);
});

ordersRouter.get("/mine", optionalAuth, async (req: AuthedRequest, res) => {
  const filter: Record<string, unknown>[] = [];
  if (req.user?.id) filter.push({ userId: req.user.id });
  if (req.user?.email) filter.push({ customerEmail: req.user.email });
  if (req.guestId) filter.push({ guestId: req.guestId });
  if (filter.length === 0) {
    res.json([]);
    return;
  }
  const rows = await Order.find({ $or: filter }).sort({ createdAt: -1 });
  res.json(rows.map(mapOrder));
});

ordersRouter.get("/track/:orderNumber", async (req, res) => {
  const email = String(req.query.email ?? "").trim().toLowerCase();
  const orderNumber = String(req.params.orderNumber ?? "").trim();
  if (!email.includes("@") || !orderNumber) {
    res.status(400).json({ error: "Order number and email are required." });
    return;
  }
  const row = await Order.findOne({
    orderNumber,
    customerEmail: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
  });
  if (!row) {
    res.status(404).json({ error: "We couldn't find that order." });
    return;
  }
  res.json(mapOrder(row));
});

ordersRouter.get("/", requireAdmin, async (_req, res) => {
  const rows = await Order.find().sort({ createdAt: -1 });
  res.json(rows.map(mapOrder));
});

ordersRouter.patch("/:id/status", requireAdmin, async (req, res) => {
  const status = String(req.body?.status ?? "");
  const allowed = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
  if (!allowed.includes(status)) {
    res.status(400).json({ error: "Unknown order status." });
    return;
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Invalid order." });
    return;
  }
  const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!updated) {
    res.status(404).json({ error: "Order not found." });
    return;
  }
  const mapped = mapOrder(updated);
  void sendOrderStatusEmail(mapped);
  res.json(mapped);
});

ordersRouter.patch("/:id/notes", requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Invalid order." });
    return;
  }
  const notes = String(req.body?.notes ?? "").slice(0, 2000);
  const updated = await Order.findByIdAndUpdate(req.params.id, { notes }, { new: true });
  if (!updated) {
    res.status(404).json({ error: "Order not found." });
    return;
  }
  res.json(mapOrder(updated));
});

ordersRouter.patch("/:id/payment", requireAdmin, async (req, res) => {
  const paymentStatus = String(req.body?.paymentStatus ?? "");
  const allowed = ["unpaid", "paid", "pending", "failed", "refunded"];
  if (!allowed.includes(paymentStatus)) {
    res.status(400).json({ error: "Unknown payment status." });
    return;
  }
  const updated = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
  if (!updated) {
    res.status(404).json({ error: "Order not found." });
    return;
  }
  res.json(mapOrder(updated));
});
