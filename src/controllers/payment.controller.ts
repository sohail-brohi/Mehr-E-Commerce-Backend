import type { Request, Response } from "express";
import * as stripeService from "../services/stripe.service.js";
import type { AuthedRequest } from "../types/request.types.js";

export async function createStripeSession(req: AuthedRequest, res: Response) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  res.json(
    await stripeService.createCheckoutSession({
      orderId: String(body.orderId ?? ""),
      body,
      userId: req.user?.id,
      userEmail: req.user?.email,
      guestId: req.guestId,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    }),
  );
}

export async function confirmStripeSession(req: AuthedRequest, res: Response) {
  res.json(
    await stripeService.confirmCheckoutSession(String(req.params.sessionId ?? ""), {
      userId: req.user?.id,
      userEmail: req.user?.email,
      guestId: req.guestId,
    }),
  );
}

export async function stripeWebhook(req: Request, res: Response) {
  const raw = req.body;
  const payload = Buffer.isBuffer(raw) ? raw : Buffer.from(typeof raw === "string" ? raw : JSON.stringify(raw));
  res.json(
    await stripeService.handleWebhook(payload, req.headers["stripe-signature"] as string | undefined),
  );
}
