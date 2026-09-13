import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { connectDb } from "./db.js";
import { optionalAuth } from "./middleware/auth.js";
import { attachGuest } from "./middleware/guest.js";
import { authRouter } from "./routes/auth.js";
import { productsRouter } from "./routes/products.js";
import { collectionsRouter } from "./routes/collections.js";
import { ordersRouter } from "./routes/orders.js";
import { mediaRouter } from "./routes/media.js";
import { wishlistRouter } from "./routes/wishlist.js";
import { siteRouter } from "./routes/site.js";
import { studioRouter } from "./routes/studio.js";
import { chatRouter } from "./routes/chat.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin: [env.clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(optionalAuth);
app.use(attachGuest);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "mehr-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/collections", collectionsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/media", mediaRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/studio", studioRouter);
app.use("/api/chat", chatRouter);
app.use("/api", siteRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  if (typeof err === "object" && err && "status" in err && (err as { status?: number }).status === 400) {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }
  const message = err instanceof Error ? err.message : "Something went wrong.";
  res.status(500).json({ error: message });
});

await connectDb();
app.listen(env.port, () => {
  console.log(`MEHR API listening on http://localhost:${env.port}`);
});
