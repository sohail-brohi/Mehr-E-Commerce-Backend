import type { Response } from "express";
import * as orderService from "../services/order.service.js";
import type { AuthedRequest } from "../types/request.types.js";

export async function create(req: AuthedRequest, res: Response) {
  res.status(201).json(
    await orderService.createOrder({
      body: req.body ?? {},
      userId: req.user?.id,
      userEmail: req.user?.email,
      guestId: req.guestId,
      clientIp: req.clientIp,
    }),
  );
}

export async function mine(req: AuthedRequest, res: Response) {
  res.json(
    await orderService.listMine({
      userId: req.user?.id,
      userEmail: req.user?.email,
      guestId: req.guestId,
    }),
  );
}

export async function track(req: AuthedRequest, res: Response) {
  res.json(await orderService.trackOrder(req.params.orderNumber, req.query.email));
}

export async function listAll(_req: AuthedRequest, res: Response) {
  res.json(await orderService.listAllOrders());
}

export async function updateStatus(req: AuthedRequest, res: Response) {
  res.json(await orderService.updateStatus(req.params.id, req.body?.status));
}

export async function updateNotes(req: AuthedRequest, res: Response) {
  res.json(await orderService.updateNotes(req.params.id, req.body?.notes));
}

export async function updatePayment(req: AuthedRequest, res: Response) {
  res.json(await orderService.updatePayment(req.params.id, req.body?.paymentStatus));
}
