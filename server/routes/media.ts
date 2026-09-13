import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../middleware/auth.js";
import { uploadBuffer } from "../lib/s3.js";

export const mediaRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

mediaRouter.post("/", requireAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Choose a file to upload." });
    return;
  }
  const folder = String(req.body?.folder ?? "products").replace(/[^a-z0-9/_-]/gi, "") || "products";
  const uploaded = await uploadBuffer(req.file, folder);
  res.status(201).json(uploaded);
});
