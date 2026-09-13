import type { Response } from "express";
import * as wishlistService from "../services/wishlist.service.js";
import type { AuthedRequest } from "../types/request.types.js";

export async function get(req: AuthedRequest, res: Response) {
  res.json(await wishlistService.getWishlist({ userId: req.user?.id, guestId: req.guestId }));
}

export async function save(req: AuthedRequest, res: Response) {
  res.json(
    await wishlistService.saveWishlist({
      userId: req.user?.id,
      guestId: req.guestId,
      productIds: req.body?.productIds,
    }),
  );
}
