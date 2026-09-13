import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import { asyncHandler } from "../helpers/async-handler.helper.js";
import { requireAdmin } from "../middleware/auth.middleware.js";

export const productRoutes = Router();

productRoutes.get("/", asyncHandler(productController.listPublished));
productRoutes.get("/all", requireAdmin, asyncHandler(productController.listAll));
productRoutes.post("/", requireAdmin, asyncHandler(productController.create));
productRoutes.put("/:id", requireAdmin, asyncHandler(productController.update));
productRoutes.patch("/:id", requireAdmin, asyncHandler(productController.patch));
productRoutes.delete("/:id", requireAdmin, asyncHandler(productController.remove));
