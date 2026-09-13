import { Router } from "express";
import mongoose from "mongoose";
import { optionalAuth, type AuthedRequest } from "../middleware/auth.js";
import { Wishlist } from "../models/Wishlist.js";

export const wishlistRouter = Router();

async function findList(req: AuthedRequest) {
  if (req.user?.id && mongoose.isValidObjectId(req.user.id)) {
    return Wishlist.findOne({ userId: req.user.id });
  }
  if (req.guestId) return Wishlist.findOne({ guestId: req.guestId });
  return null;
}

wishlistRouter.get("/", optionalAuth, async (req: AuthedRequest, res) => {
  const row = await findList(req);
  res.json({ productIds: row?.productIds ?? [] });
});

wishlistRouter.put("/", optionalAuth, async (req: AuthedRequest, res) => {
  const incoming = Array.isArray(req.body?.productIds) ? req.body.productIds : [];
  const productIds = [...new Set(incoming.map((id: unknown) => String(id)).filter(Boolean))].slice(0, 100);

  if (req.user?.id && mongoose.isValidObjectId(req.user.id)) {
    const row = await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { userId: req.user.id, productIds },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    res.json({ productIds: row.productIds });
    return;
  }

  if (!req.guestId) {
    res.json({ productIds });
    return;
  }

  const row = await Wishlist.findOneAndUpdate(
    { guestId: req.guestId },
    { guestId: req.guestId, productIds },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  res.json({ productIds: row.productIds });
});
