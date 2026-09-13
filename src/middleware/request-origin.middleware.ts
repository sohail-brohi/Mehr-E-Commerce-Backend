import { AsyncLocalStorage } from "node:async_hooks";
import type { NextFunction, Request, Response } from "express";

type OriginStore = { origin: string };

const store = new AsyncLocalStorage<OriginStore>();

export function requestOrigin() {
  return store.getStore()?.origin ?? "";
}

export function attachRequestOrigin(req: Request, _res: Response, next: NextFunction) {
  const forwarded = String(req.headers["x-forwarded-proto"] ?? "")
    .split(",")[0]
    .trim();
  const proto = forwarded || req.protocol || "http";
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "")
    .split(",")[0]
    .trim();
  store.run({ origin: host ? `${proto}://${host}` : "" }, next);
}
