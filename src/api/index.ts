import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { chatRoutes } from "./chat.routes.js";
import { collectionRoutes } from "./collection.routes.js";
import { healthRoutes } from "./health.routes.js";
import { mediaRoutes } from "./media.routes.js";
import { orderRoutes } from "./order.routes.js";
import { paymentRoutes } from "./payment.routes.js";
import { productRoutes } from "./product.routes.js";
import { siteRoutes } from "./site.routes.js";
import { studioRoutes } from "./studio.routes.js";
import { wishlistRoutes } from "./wishlist.routes.js";

export function registerApi() {
  const api = Router();

  api.use("/health", healthRoutes);
  api.use("/auth", authRoutes);
  api.use("/products", productRoutes);
  api.use("/collections", collectionRoutes);
  api.use("/orders", orderRoutes);
  api.use("/payments", paymentRoutes);
  api.use("/media", mediaRoutes);
  api.use("/wishlist", wishlistRoutes);
  api.use("/studio", studioRoutes);
  api.use("/chat", chatRoutes);
  api.use(siteRoutes);

  return api;
}
