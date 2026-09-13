import express from "express";
import { registerApi } from "./api/index.js";
import { optionalAuth } from "./middleware/auth.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { attachGuest } from "./middleware/guest.middleware.js";
import { notFound } from "./middleware/not-found.middleware.js";
import { corsMiddleware, securityHeaders } from "./middleware/security.middleware.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(corsMiddleware);
  app.use(express.json({ limit: "2mb" }));
  app.use(securityHeaders);
  app.use(optionalAuth);
  app.use(attachGuest);

  app.use("/api", registerApi());
  app.use("/api", notFound);
  app.use(errorHandler);

  return app;
}
