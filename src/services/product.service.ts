import { PRODUCT_CATEGORIES } from "../config/constants.js";
import { HttpError } from "../helpers/http-error.helper.js";
import { mapProduct } from "../helpers/mapper.helper.js";
import { slugify } from "../helpers/slug.helper.js";
import { Product } from "../models/index.js";

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
    category: (PRODUCT_CATEGORIES as readonly string[]).includes(category) ? category : "women",
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

export async function listPublished() {
  const rows = await Product.find({ published: true }).sort({ sortOrder: 1, createdAt: -1 });
  return rows.map(mapProduct);
}

export async function listAll() {
  const rows = await Product.find().sort({ sortOrder: 1, createdAt: -1 });
  return rows.map(mapProduct);
}

export async function createProduct(body: Record<string, unknown>) {
  const input = fromInput(body);
  if (input.name.length < 2 || !input.slug || input.price <= 0) {
    throw new HttpError(400, "Name, slug and a price are required.");
  }
  const created = await Product.create(input);
  return { id: created._id.toString(), product: mapProduct(created) };
}

export async function updateProduct(id: string, body: Record<string, unknown>) {
  const updated = await Product.findByIdAndUpdate(id, fromInput(body), { new: true });
  if (!updated) throw new HttpError(404, "Piece not found.");
  return { id: updated._id.toString(), product: mapProduct(updated) };
}

export async function patchProduct(id: string, body: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  if ("stock" in body) patch.stock = Number(body.stock);
  if ("featured" in body) patch.featured = Boolean(body.featured);
  if ("new_arrival" in body) patch.newArrival = Boolean(body.new_arrival);
  if ("published" in body) patch.published = Boolean(body.published);
  const updated = await Product.findByIdAndUpdate(id, patch, { new: true });
  if (!updated) throw new HttpError(404, "Piece not found.");
  return mapProduct(updated);
}

export async function deleteProduct(id: string) {
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) throw new HttpError(404, "Piece not found.");
  return { ok: true };
}
