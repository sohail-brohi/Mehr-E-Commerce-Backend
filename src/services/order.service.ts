import mongoose from "mongoose";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "../config/constants.js";
import { HttpError } from "../helpers/http-error.helper.js";
import { mapOrder } from "../helpers/mapper.helper.js";
import { Order, Product } from "../models/index.js";
import { sendOrderConfirmation, sendOrderStatusEmail, sendStudioOrderAlert } from "./mail.service.js";

const nextOrderNumber = () => `MHR-${Math.floor(100000 + Math.random() * 899999)}`;

export async function createOrder(input: {
  body: Record<string, unknown>;
  userId?: string;
  userEmail?: string;
  guestId?: string;
  clientIp?: string;
}) {
  const body = input.body;
  const lines = Array.isArray(body.items) ? body.items : [];
  if (lines.length === 0) throw new HttpError(400, "Your bag is empty.");

  const customerName = String(body.customerName ?? "").trim();
  const customerEmail = String(body.customerEmail ?? "").trim();
  const customerPhone = String(body.customerPhone ?? "").trim();
  const addressLine1 = String(body.addressLine1 ?? "").trim();
  const city = String(body.city ?? "").trim();
  if (
    customerName.length < 2 ||
    !customerEmail.includes("@") ||
    customerPhone.length < 10 ||
    addressLine1.length < 4 ||
    city.length < 2
  ) {
    throw new HttpError(400, "Please complete contact and shipping details.");
  }

  const items = [];
  let subtotal = 0;
  for (const line of lines as Record<string, unknown>[]) {
    const product = await Product.findById(line.productId);
    if (!product || !product.published) {
      throw new HttpError(400, "A piece in your bag is no longer available.");
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
  const paymentMethod = (PAYMENT_METHODS as readonly string[]).includes(String(body.paymentMethod))
    ? String(body.paymentMethod)
    : "cod";
  const paymentStatus = paymentMethod === "cod" ? "unpaid" : "pending";

  const created = await Order.create({
    orderNumber: nextOrderNumber(),
    userId: input.userId ?? null,
    guestId: input.guestId ?? null,
    ipAddress: input.clientIp ?? "",
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
  return mapped;
}

export async function listMine(input: { userId?: string; userEmail?: string; guestId?: string }) {
  const filter: Record<string, unknown>[] = [];
  if (input.userId) filter.push({ userId: input.userId });
  if (input.userEmail) filter.push({ customerEmail: input.userEmail });
  if (input.guestId) filter.push({ guestId: input.guestId });
  if (filter.length === 0) return [];
  const rows = await Order.find({ $or: filter }).sort({ createdAt: -1 });
  return rows.map(mapOrder);
}

export async function trackOrder(orderNumberRaw: unknown, emailRaw: unknown) {
  const email = String(emailRaw ?? "").trim().toLowerCase();
  const orderNumber = String(orderNumberRaw ?? "").trim();
  if (!email.includes("@") || !orderNumber) {
    throw new HttpError(400, "Order number and email are required.");
  }
  const row = await Order.findOne({
    orderNumber,
    customerEmail: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
  });
  if (!row) throw new HttpError(404, "We couldn't find that order.");
  return mapOrder(row);
}

export async function listAllOrders() {
  const rows = await Order.find().sort({ createdAt: -1 });
  return rows.map(mapOrder);
}

export async function updateStatus(id: string, statusRaw: unknown) {
  const status = String(statusRaw ?? "");
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    throw new HttpError(400, "Unknown order status.");
  }
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid order.");
  const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!updated) throw new HttpError(404, "Order not found.");
  const mapped = mapOrder(updated);
  void sendOrderStatusEmail(mapped);
  return mapped;
}

export async function updateNotes(id: string, notesRaw: unknown) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid order.");
  const notes = String(notesRaw ?? "").slice(0, 2000);
  const updated = await Order.findByIdAndUpdate(id, { notes }, { new: true });
  if (!updated) throw new HttpError(404, "Order not found.");
  return mapOrder(updated);
}

export async function updatePayment(id: string, paymentStatusRaw: unknown) {
  const paymentStatus = String(paymentStatusRaw ?? "");
  if (!(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) {
    throw new HttpError(400, "Unknown payment status.");
  }
  const updated = await Order.findByIdAndUpdate(id, { paymentStatus }, { new: true });
  if (!updated) throw new HttpError(404, "Order not found.");
  return mapOrder(updated);
}

export async function markOrderPaid(id: string, paymentReference?: string) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid order.");
  const order = await Order.findById(id);
  if (!order) throw new HttpError(404, "Order not found.");
  if (order.paymentStatus === "paid") return mapOrder(order);

  order.paymentStatus = "paid";
  if (paymentReference) order.paymentReference = paymentReference;
  if (order.status === "Pending") order.status = "Confirmed";
  await order.save();

  const mapped = mapOrder(order);
  void sendOrderStatusEmail(mapped);
  return mapped;
}
