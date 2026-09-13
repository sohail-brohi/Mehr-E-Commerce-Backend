import { Router } from "express";
import { RATE_LIMITS } from "../config/constants.js";
import * as authController from "../controllers/auth.controller.js";
import { asyncHandler } from "../helpers/async-handler.helper.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";

export const authRoutes = Router();
const authLimit = rateLimit(RATE_LIMITS.auth.max, RATE_LIMITS.auth.windowMs);

authRoutes.post("/register", authLimit, asyncHandler(authController.register));
authRoutes.post("/login", authLimit, asyncHandler(authController.login));
authRoutes.get("/me", requireAuth, asyncHandler(authController.me));
authRoutes.patch("/me", requireAuth, asyncHandler(authController.updateMe));
authRoutes.post("/forgot", authLimit, asyncHandler(authController.forgot));
authRoutes.post("/reset", authLimit, asyncHandler(authController.reset));
