import { Router } from "express";
import * as wishlistController from "../controllers/wishlist.controller.js";
import { asyncHandler } from "../helpers/async-handler.helper.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

export const wishlistRoutes = Router();

wishlistRoutes.get("/", optionalAuth, asyncHandler(wishlistController.get));
wishlistRoutes.put("/", optionalAuth, asyncHandler(wishlistController.save));
