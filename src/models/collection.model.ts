import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: null },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Collection = mongoose.model("Collection", collectionSchema);
