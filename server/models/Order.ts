import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    productName: { type: String, required: true },
    productSlug: { type: String, default: null },
    imageUrl: { type: String, default: null },
    size: { type: String, required: true },
    color: { type: String, required: true },
    qty: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true, default: 0 },
  },
  { timestamps: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    guestId: { type: String, default: null, index: true },
    ipAddress: { type: String, default: "" },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, default: "" },
    subtotal: { type: Number, required: true, default: 0 },
    shipping: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    paymentMethod: { type: String, enum: ["cod", "card", "wallet", "bank"], default: "cod" },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "pending", "failed", "refunded"], default: "unpaid" },
    paymentReference: { type: String, default: null },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    notes: { type: String, default: "" },
    items: { type: [orderItemSchema], default: [] },
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);
