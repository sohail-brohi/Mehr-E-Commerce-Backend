import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { asyncHandler } from "../helpers/async-handler.helper.js";
import { optionalAuth, requireAdmin } from "../middleware/auth.middleware.js";

export const orderRoutes = Router();

orderRoutes.post("/", optionalAuth, asyncHandler(orderController.create));
orderRoutes.get("/mine", optionalAuth, asyncHandler(orderController.mine));
orderRoutes.get("/track/:orderNumber", asyncHandler(orderController.track));
orderRoutes.get("/", requireAdmin, asyncHandler(orderController.listAll));
orderRoutes.patch("/:id/status", requireAdmin, asyncHandler(orderController.updateStatus));
orderRoutes.patch("/:id/notes", requireAdmin, asyncHandler(orderController.updateNotes));
orderRoutes.patch("/:id/payment", requireAdmin, asyncHandler(orderController.updatePayment));
