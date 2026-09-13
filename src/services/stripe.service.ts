import Stripe from "stripe";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { allowedOrigins } from "../middleware/security.middleware.js";
import { HttpError } from "../helpers/http-error.helper.js";
import { mapOrder } from "../helpers/mapper.helper.js";
import { Order } from "../models/index.js";
import { createOrder, markOrderPaid } from "./order.service.js";

function stripeClient() {
  if (!env.stripe.secretKey) {
    throw new HttpError(503, "Card payments are not configured yet.");
  }
  return new Stripe(env.stripe.secretKey);
}

function toCents(amount: number) {
  return Math.max(0, Math.round(Number(amount) * 100));
}

function canAccessOrder(
  order: {
    userId?: { toString(): string } | null;
    guestId?: string | null;
    customerEmail: string;
  },
  actor: { userId?: string; userEmail?: string; guestId?: string },
) {
  if (actor.userId && order.userId?.toString() === actor.userId) return true;
  if (actor.guestId && order.guestId === actor.guestId) return true;
  if (actor.userEmail && order.customerEmail.toLowerCase() === actor.userEmail.toLowerCase()) {
    return true;
  }
  return false;
}

function sanitizeReturnUrl(raw: unknown, fallbackPath: string, requireSessionToken = false) {
  const fallback = `${env.clientUrl}${fallbackPath}`;
  const value = String(raw ?? "").trim();
  if (!value) return fallback;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new HttpError(400, "Invalid return URL.");
  }

  const allowed = allowedOrigins.some((origin) => {
    try {
      return new URL(origin).origin === parsed.origin;
    } catch {
      return false;
    }
  });
  if (!allowed || !parsed.pathname.startsWith("/checkout")) {
    throw new HttpError(400, "Return URL is not allowed.");
  }

  let next = parsed.toString().replace(/%7BCHECKOUT_SESSION_ID%7D/gi, "{CHECKOUT_SESSION_ID}");
  if (requireSessionToken && !next.includes("{CHECKOUT_SESSION_ID}")) {
    parsed.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
    next = parsed.toString().replace(/%7BCHECKOUT_SESSION_ID%7D/gi, "{CHECKOUT_SESSION_ID}");
  }
  return next;
}

async function resolveCardOrder(input: {
  orderId?: string;
  body?: Record<string, unknown>;
  userId?: string;
  userEmail?: string;
  guestId?: string;
}) {
  const rawId = String(input.orderId ?? input.body?.orderId ?? "").trim();
  const items = input.body?.items;

  if (mongoose.isValidObjectId(rawId)) {
    const existing = await Order.findById(rawId);
    if (!existing) throw new HttpError(404, "Order not found.");
    return { order: existing, createdNow: false };
  }

  if (rawId.startsWith("MHR-")) {
    const existing = await Order.findOne({ orderNumber: rawId });
    if (!existing) throw new HttpError(404, "Order not found.");
    return { order: existing, createdNow: false };
  }

  if (Array.isArray(items) && items.length > 0) {
    const created = await createOrder({
      body: { ...input.body, paymentMethod: "card", paymentStatus: "pending" },
      userId: input.userId,
      userEmail: input.userEmail,
      guestId: input.guestId,
    });
    const fresh = await Order.findById(created.id);
    if (!fresh) throw new HttpError(500, "Order was created but could not be reloaded.");
    return { order: fresh, createdNow: true };
  }

  throw new HttpError(400, "Missing order. Add your bag and try checkout again.");
}

export async function createCheckoutSession(input: {
  orderId?: string;
  body?: Record<string, unknown>;
  userId?: string;
  userEmail?: string;
  guestId?: string;
  successUrl?: unknown;
  cancelUrl?: unknown;
}) {
  const { order, createdNow } = await resolveCardOrder(input);
  if (!createdNow && !canAccessOrder(order, input)) {
    throw new HttpError(403, "You cannot pay for this order.");
  }
  if (order.paymentMethod !== "card") {
    throw new HttpError(400, "This order is not set up for card payment.");
  }
  if (order.paymentStatus === "paid") {
    return { url: null, alreadyPaid: true, order: mapOrder(order) };
  }

  const mapped = mapOrder(order);
  const stripe = stripeClient();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = mapped.items.map((item) => {
    const images = item.imageUrl?.startsWith("https://") ? [item.imageUrl] : undefined;
    return {
      quantity: item.qty,
      price_data: {
        currency: env.stripe.currency,
        unit_amount: toCents(item.unitPrice),
        product_data: {
          name: item.productName,
          description: `${item.color} · ${item.size}`,
          ...(images ? { images } : {}),
        },
      },
    };
  });

  if (mapped.shipping > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: env.stripe.currency,
        unit_amount: toCents(mapped.shipping),
        product_data: { name: "Shipping" },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: mapped.customerEmail,
    client_reference_id: mapped.id,
    metadata: {
      orderId: mapped.id,
      orderNumber: mapped.orderNumber,
    },
    line_items: lineItems,
    success_url: sanitizeReturnUrl(
      input.successUrl,
      "/checkout?stripe=success&session_id={CHECKOUT_SESSION_ID}",
      true,
    ),
    cancel_url: sanitizeReturnUrl(input.cancelUrl, "/checkout?stripe=cancel"),
  });

  if (!session.url) throw new HttpError(502, "Stripe did not return a checkout URL.");

  order.paymentReference = session.id;
  order.paymentStatus = "pending";
  await order.save();

  return { url: session.url, alreadyPaid: false, order: mapOrder(order) };
}

export async function confirmCheckoutSession(
  sessionId: string,
  actor: { userId?: string; userEmail?: string; guestId?: string },
) {
  if (!sessionId) throw new HttpError(400, "Missing Stripe session.");
  const session = await stripeClient().checkout.sessions.retrieve(sessionId);
  const orderId = session.metadata?.orderId ?? session.client_reference_id;
  if (!orderId || !mongoose.isValidObjectId(orderId)) {
    throw new HttpError(404, "We couldn't match that payment to an order.");
  }

  const order = await Order.findById(orderId);
  if (!order) throw new HttpError(404, "Order not found.");
  if (!canAccessOrder(order, actor)) {
    throw new HttpError(403, "You cannot view this order.");
  }

  if (session.payment_status === "paid") {
    return markOrderPaid(order.id, session.id);
  }
  if (session.status === "expired" || session.payment_status === "unpaid") {
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = session.status === "expired" ? "failed" : "pending";
      await order.save();
    }
  }
  return mapOrder(order);
}

export async function handleWebhook(rawBody: Buffer | string, signature: string | undefined) {
  if (!env.stripe.webhookSecret) {
    throw new HttpError(503, "Stripe webhook secret is not configured.");
  }
  if (!signature) throw new HttpError(400, "Missing Stripe signature.");

  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(rawBody, signature, env.stripe.webhookSecret);
  } catch {
    throw new HttpError(400, "Invalid Stripe signature.");
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId ?? session.client_reference_id;
    if (orderId && (session.payment_status === "paid" || event.type === "checkout.session.completed")) {
      await markOrderPaid(orderId, session.id);
    }
  }

  if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId ?? session.client_reference_id;
    if (orderId && mongoose.isValidObjectId(orderId)) {
      const order = await Order.findById(orderId);
      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "failed";
        await order.save();
      }
    }
  }

  return { received: true };
}
