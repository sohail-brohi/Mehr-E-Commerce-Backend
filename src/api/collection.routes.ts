import { Router } from "express";
import * as collectionController from "../controllers/collection.controller.js";
import { asyncHandler } from "../helpers/async-handler.helper.js";
import { requireAdmin } from "../middleware/auth.middleware.js";

export const collectionRoutes = Router();

collectionRoutes.get("/", asyncHandler(collectionController.list));
collectionRoutes.post("/", requireAdmin, asyncHandler(collectionController.create));
collectionRoutes.put("/:id", requireAdmin, asyncHandler(collectionController.update));
collectionRoutes.delete("/:id", requireAdmin, asyncHandler(collectionController.remove));
