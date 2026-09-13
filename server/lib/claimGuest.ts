import { Order } from "../models/Order.js";
import { Wishlist } from "../models/Wishlist.js";

export async function claimGuest(guestId: string | undefined, userId: string) {
  if (!guestId) return;

  await Order.updateMany({ guestId, $or: [{ userId: null }, { userId: { $exists: false } }] }, { userId });

  const guestWish = await Wishlist.findOne({ guestId });
  const userWish = await Wishlist.findOne({ userId });
  const productIds = [...new Set([...(guestWish?.productIds ?? []), ...(userWish?.productIds ?? [])])].slice(0, 100);

  if (userWish) {
    userWish.productIds = productIds;
    await userWish.save();
  } else if (productIds.length > 0) {
    await Wishlist.create({ userId, productIds });
  }

  if (guestWish) await guestWish.deleteOne();
}
