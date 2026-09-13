import type { NextFunction, Request, Response } from "express";
import type { AuthedRequest } from "./auth.js";

const GUEST_RE = /^[a-zA-Z0-9-]{8,64}$/;

export function attachGuest(req: Request, _res: Response, next: NextFunction) {
  const r = req as AuthedRequest;
  const raw = String(req.headers["x-guest-id"] ?? "").trim();
  if (GUEST_RE.test(raw)) r.guestId = raw;
  const ip = (req.ip || req.socket.remoteAddress || "").replace(/^::ffff:/, "");
  r.clientIp = ip.slice(0, 64);
  next();
}
