import { type RequestHandler } from "express";

const hits = new Map<string, number[]>();

export function rateLimit(max: number, windowMs: number): RequestHandler {
  return (req, res, next) => {
    const key = `${req.ip ?? "local"}:${req.path}`;
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= max) {
      res.status(429).json({ error: "Please wait a moment and try again." });
      return;
    }
    recent.push(now);
    hits.set(key, recent);
    next();
  };
}
