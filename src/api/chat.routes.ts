import { Router } from "express";
import { RATE_LIMITS } from "../config/constants.js";
import * as chatController from "../controllers/chat.controller.js";
import { asyncHandler } from "../helpers/async-handler.helper.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";

export const chatRoutes = Router();
const limit = rateLimit(RATE_LIMITS.chat.max, RATE_LIMITS.chat.windowMs);

chatRoutes.post("/", limit, asyncHandler(chatController.ask));
