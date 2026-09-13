import { Router } from "express";
import { RATE_LIMITS } from "../config/constants.js";
import * as siteController from "../controllers/site.controller.js";
import { asyncHandler } from "../helpers/async-handler.helper.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";

export const siteRoutes = Router();
const limit = rateLimit(RATE_LIMITS.site.max, RATE_LIMITS.site.windowMs);

siteRoutes.get("/pay-to", asyncHandler(siteController.payTo));
siteRoutes.post("/contact", limit, asyncHandler(siteController.contact));
siteRoutes.post("/newsletter", limit, asyncHandler(siteController.newsletter));
