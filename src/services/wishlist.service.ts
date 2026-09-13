import mongoose from "mongoose";
import { Wishlist } from "../models/index.js";

async function findList(input: { userId?: string; guestId?: string }) {
  if (input.userId && mongoose.isValidObjectId(input.userId)) {
    return Wishlist.findOne({ userId: input.userId });
  }
  if (input.guestId) return Wishlist.findOne({ guestId: input.guestId });
  return null;
}

export async function getWishlist(input: { userId?: string; guestId?: string }) {
  const row = await findList(input);
  return { productIds: row?.productIds ?? [] };
}

export async function saveWishlist(input: { userId?: string; guestId?: string; productIds: unknown }) {
  const incoming = Array.isArray(input.productIds) ? input.productIds : [];
  const productIds = [...new Set(incoming.map((id) => String(id)).filter(Boolean))].slice(0, 100);

  if (input.userId && mongoose.isValidObjectId(input.userId)) {
    const row = await Wishlist.findOneAndUpdate(
      { userId: input.userId },
      { userId: input.userId, productIds },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    return { productIds: row.productIds };
  }

  if (!input.guestId) return { productIds };

  const row = await Wishlist.findOneAndUpdate(
    { guestId: input.guestId },
    { guestId: input.guestId, productIds },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return { productIds: row.productIds };
}
