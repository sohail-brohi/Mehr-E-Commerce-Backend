import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    guestId: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    productIds: { type: [String], default: [] },
  },
  { timestamps: true },
);

wishlistSchema.index({ guestId: 1 }, { unique: true, sparse: true });
wishlistSchema.index({ userId: 1 }, { unique: true, sparse: true });

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
