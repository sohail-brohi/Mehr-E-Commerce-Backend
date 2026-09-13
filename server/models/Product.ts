import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
  { name: { type: String, required: true }, hex: { type: String, required: true } },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    sku: { type: String, default: "" },
    description: { type: String, default: "" },
    story: { type: String, default: "" },
    price: { type: Number, required: true, default: 0 },
    salePrice: { type: Number, default: null },
    category: { type: String, enum: ["women", "kids", "shawls"], default: "women" },
    collectionSlug: { type: String, default: null },
    sizes: { type: [String], default: [] },
    colors: { type: [colorSchema], default: [] },
    images: { type: [String], default: [] },
    frames360: { type: [String], default: [] },
    modelUrl: { type: String, default: null },
    sizeGuideUrl: { type: String, default: null },
    fabric: { type: String, default: "" },
    fit: { type: String, default: "" },
    care: { type: String, default: "" },
    origin: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", productSchema);
