import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import { env } from "../config/env.js";

export const corsMiddleware = cors({
  origin: [env.clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
});

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
}
