import { Router } from "express";
import * as studioController from "../controllers/studio.controller.js";
import { asyncHandler } from "../helpers/async-handler.helper.js";
import { requireAdmin } from "../middleware/auth.middleware.js";

export const studioRoutes = Router();

studioRoutes.get("/overview", requireAdmin, asyncHandler(studioController.overview));
studioRoutes.get("/customers", requireAdmin, asyncHandler(studioController.customers));
studioRoutes.patch("/customers/:id/role", requireAdmin, asyncHandler(studioController.updateRole));
studioRoutes.get("/inbox", requireAdmin, asyncHandler(studioController.inbox));
studioRoutes.patch("/inbox/:id/read", requireAdmin, asyncHandler(studioController.markRead));
studioRoutes.delete("/inbox/:id", requireAdmin, asyncHandler(studioController.removeInbox));
studioRoutes.get("/subscribers", requireAdmin, asyncHandler(studioController.subscribers));
studioRoutes.get("/settings", requireAdmin, asyncHandler(studioController.settings));
studioRoutes.put("/settings", requireAdmin, asyncHandler(studioController.updateSettings));
