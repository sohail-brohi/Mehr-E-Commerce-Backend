import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import { env } from "../config/env.js";

export const allowedOrigins = [
  env.clientUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://mehr-e-comerce.vercel.app",
  ...env.corsOrigins,
];

export const corsMiddleware = cors({
  origin: allowedOrigins,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Guest-Id"],
});

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
}
