import { Router } from "express";
import * as paymentController from "../controllers/payment.controller.js";
import { asyncHandler } from "../helpers/async-handler.helper.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

export const paymentRoutes = Router();

paymentRoutes.post("/stripe/session", optionalAuth, asyncHandler(paymentController.createStripeSession));
paymentRoutes.get("/stripe/session/:sessionId", optionalAuth, asyncHandler(paymentController.confirmStripeSession));
