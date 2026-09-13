import { Router } from "express";
import multer from "multer";
import * as mediaController from "../controllers/media.controller.js";
import { asyncHandler } from "../helpers/async-handler.helper.js";
import { requireAdmin } from "../middleware/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

export const mediaRoutes = Router();
mediaRoutes.get("/*", asyncHandler(mediaController.serve));
mediaRoutes.post("/", requireAdmin, upload.single("file"), asyncHandler(mediaController.upload));
