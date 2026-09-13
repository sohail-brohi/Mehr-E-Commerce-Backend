import { HttpError } from "../helpers/http-error.helper.js";
import { mapCollection } from "../helpers/mapper.helper.js";
import { slugify } from "../helpers/slug.helper.js";
import { Collection } from "../models/index.js";

export async function listCollections() {
  const rows = await Collection.find().sort({ sortOrder: 1, createdAt: 1 });
  return rows.map(mapCollection);
}

export async function createCollection(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  if (name.length < 2) throw new HttpError(400, "Collection name is required.");
  const created = await Collection.create({
    name,
    slug: slugify(String(body.slug || name)),
    tagline: String(body.tagline ?? ""),
    description: String(body.description ?? ""),
    imageUrl: body.image_url ? String(body.image_url) : null,
    sortOrder: Number(body.sort_order ?? 0),
  });
  return { id: created._id.toString(), collection: mapCollection(created) };
}

export async function updateCollection(id: string, body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  const updated = await Collection.findByIdAndUpdate(
    id,
    {
      name,
      slug: slugify(String(body.slug || name)),
      tagline: String(body.tagline ?? ""),
      description: String(body.description ?? ""),
      imageUrl: body.image_url ? String(body.image_url) : null,
      sortOrder: Number(body.sort_order ?? 0),
    },
    { new: true },
  );
  if (!updated) throw new HttpError(404, "Collection not found.");
  return { id: updated._id.toString(), collection: mapCollection(updated) };
}

export async function deleteCollection(id: string) {
  const deleted = await Collection.findByIdAndDelete(id);
  if (!deleted) throw new HttpError(404, "Collection not found.");
  return { ok: true };
}
