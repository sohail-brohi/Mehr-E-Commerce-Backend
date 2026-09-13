import { Router } from "express";
import { Collection } from "../models/Collection.js";
import { requireAdmin } from "../middleware/auth.js";
import { mapCollection, slugify } from "../mappers.js";

export const collectionsRouter = Router();

collectionsRouter.get("/", async (_req, res) => {
  const rows = await Collection.find().sort({ sortOrder: 1, createdAt: 1 });
  res.json(rows.map(mapCollection));
});

collectionsRouter.post("/", requireAdmin, async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (name.length < 2) {
    res.status(400).json({ error: "Collection name is required." });
    return;
  }
  const created = await Collection.create({
    name,
    slug: slugify(String(req.body?.slug || name)),
    tagline: String(req.body?.tagline ?? ""),
    description: String(req.body?.description ?? ""),
    imageUrl: req.body?.image_url ? String(req.body.image_url) : null,
    sortOrder: Number(req.body?.sort_order ?? 0),
  });
  res.status(201).json({ id: created._id.toString(), collection: mapCollection(created) });
});

collectionsRouter.put("/:id", requireAdmin, async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const updated = await Collection.findByIdAndUpdate(
    req.params.id,
    {
      name,
      slug: slugify(String(req.body?.slug || name)),
      tagline: String(req.body?.tagline ?? ""),
      description: String(req.body?.description ?? ""),
      imageUrl: req.body?.image_url ? String(req.body.image_url) : null,
      sortOrder: Number(req.body?.sort_order ?? 0),
    },
    { new: true },
  );
  if (!updated) {
    res.status(404).json({ error: "Collection not found." });
    return;
  }
  res.json({ id: updated._id.toString(), collection: mapCollection(updated) });
});

collectionsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const deleted = await Collection.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Collection not found." });
    return;
  }
  res.json({ ok: true });
});
