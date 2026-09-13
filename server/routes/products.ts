import { Router } from "express";
import { Product } from "../models/Product.js";
import { requireAdmin } from "../middleware/auth.js";
import { mapProduct, slugify } from "../mappers.js";

export const productsRouter = Router();

function fromInput(body: Record<string, unknown>) {
  const category = String(body.category ?? "women");
  return {
    slug: slugify(String(body.slug ?? "")),
    name: String(body.name ?? "").trim(),
    sku: String(body.sku ?? ""),
    description: String(body.description ?? ""),
    story: String(body.story ?? ""),
    price: Number(body.price ?? 0),
    salePrice: body.sale_price == null || body.sale_price === "" ? null : Number(body.sale_price),
    category: ["women", "kids", "shawls"].includes(category) ? category : "women",
    collectionSlug: body.collection_slug ? String(body.collection_slug) : null,
    sizes: Array.isArray(body.sizes) ? body.sizes.map(String) : [],
    colors: Array.isArray(body.colors)
      ? body.colors.flatMap((c) => {
          if (c && typeof c === "object" && "name" in c && "hex" in c) {
            return [{ name: String((c as { name: unknown }).name), hex: String((c as { hex: unknown }).hex) }];
          }
          return [];
        })
      : [],
    images: Array.isArray(body.images) ? body.images.map(String) : [],
    frames360: Array.isArray(body.frames_360) ? body.frames_360.map(String) : [],
    modelUrl: body.model_url ? String(body.model_url) : null,
    sizeGuideUrl: body.size_guide_url ? String(body.size_guide_url) : null,
    fabric: String(body.fabric ?? ""),
    fit: String(body.fit ?? ""),
    care: String(body.care ?? ""),
    origin: String(body.origin ?? ""),
    stock: Number(body.stock ?? 0),
    featured: Boolean(body.featured),
    newArrival: Boolean(body.new_arrival),
    published: Boolean(body.published),
    sortOrder: Number(body.sort_order ?? 0),
  };
}

productsRouter.get("/", async (_req, res) => {
  const rows = await Product.find({ published: true }).sort({ sortOrder: 1, createdAt: -1 });
  res.json(rows.map(mapProduct));
});

productsRouter.get("/all", requireAdmin, async (_req, res) => {
  const rows = await Product.find().sort({ sortOrder: 1, createdAt: -1 });
  res.json(rows.map(mapProduct));
});

productsRouter.post("/", requireAdmin, async (req, res) => {
  const input = fromInput(req.body ?? {});
  if (input.name.length < 2 || !input.slug || input.price <= 0) {
    res.status(400).json({ error: "Name, slug and a price are required." });
    return;
  }
  const created = await Product.create(input);
  res.status(201).json({ id: created._id.toString(), product: mapProduct(created) });
});

productsRouter.put("/:id", requireAdmin, async (req, res) => {
  const input = fromInput(req.body ?? {});
  const updated = await Product.findByIdAndUpdate(req.params.id, input, { new: true });
  if (!updated) {
    res.status(404).json({ error: "Piece not found." });
    return;
  }
  res.json({ id: updated._id.toString(), product: mapProduct(updated) });
});

productsRouter.patch("/:id", requireAdmin, async (req, res) => {
  const patch: Record<string, unknown> = {};
  if ("stock" in (req.body ?? {})) patch.stock = Number(req.body.stock);
  if ("featured" in (req.body ?? {})) patch.featured = Boolean(req.body.featured);
  if ("new_arrival" in (req.body ?? {})) patch.newArrival = Boolean(req.body.new_arrival);
  if ("published" in (req.body ?? {})) patch.published = Boolean(req.body.published);
  const updated = await Product.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!updated) {
    res.status(404).json({ error: "Piece not found." });
    return;
  }
  res.json(mapProduct(updated));
});

productsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Piece not found." });
    return;
  }
  res.json({ ok: true });
});
