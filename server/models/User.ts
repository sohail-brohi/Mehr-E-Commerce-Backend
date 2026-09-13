import mongoose from "mongoose";

export type UserRole = "admin" | "customer";

export type UserDoc = mongoose.InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
    resetTokenHash: { type: String, default: "" },
    resetExpires: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
