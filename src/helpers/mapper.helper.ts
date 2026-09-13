import { publicUrl } from "../services/storage.service.js";

export function mapProduct(doc: {
  _id: { toString(): string };
  slug: string;
  name: string;
  sku?: string | null;
  description: string;
  story: string;
  price: number;
  salePrice?: number | null;
  category: string;
  collectionSlug?: string | null;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  frames360: string[];
  modelUrl?: string | null;
  sizeGuideUrl?: string | null;
  fabric: string;
  fit: string;
  care: string;
  origin: string;
  stock: number;
  featured: boolean;
  newArrival: boolean;
  published: boolean;
  sortOrder: number;
}) {
  const images = doc.images ?? [];
  const frames = doc.frames360 ?? [];
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    sku: doc.sku ?? "",
    description: doc.description,
    story: doc.story,
    price: doc.price,
    salePrice: doc.salePrice ?? undefined,
    category: ["women", "kids", "shawls"].includes(doc.category) ? doc.category : "women",
    collection: doc.collectionSlug ?? "",
    sizes: doc.sizes ?? [],
    colors: doc.colors ?? [],
    images: images.map(publicUrl),
    imagePaths: images,
    frames360: frames.map(publicUrl),
    frames360Paths: frames,
    modelUrl: doc.modelUrl ? publicUrl(doc.modelUrl) : undefined,
    modelPath: doc.modelUrl ?? undefined,
    sizeGuideUrl: doc.sizeGuideUrl ? publicUrl(doc.sizeGuideUrl) : undefined,
    sizeGuidePath: doc.sizeGuideUrl ?? undefined,
    fabric: doc.fabric,
    fit: doc.fit,
    care: doc.care,
    origin: doc.origin,
    stock: doc.stock,
    featured: doc.featured,
    newArrival: doc.newArrival,
    published: doc.published,
    sortOrder: doc.sortOrder,
  };
}

export function mapCollection(doc: {
  _id: { toString(): string };
  slug: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
}) {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    tagline: doc.tagline ?? "",
    description: doc.description ?? "",
    image: doc.imageUrl ? publicUrl(doc.imageUrl) : "",
    imagePath: doc.imageUrl ?? "",
    sortOrder: doc.sortOrder,
  };
}

export function mapOrder(doc: {
  _id: { toString(): string };
  orderNumber: string;
  createdAt: Date;
  userId?: { toString(): string } | null;
  guestId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  city: string;
  postalCode?: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference?: string | null;
  status: string;
  notes?: string | null;
  items: {
    _id?: { toString(): string };
    productId?: { toString(): string } | null;
    productName: string;
    productSlug?: string | null;
    imageUrl?: string | null;
    size: string;
    color: string;
    qty: number;
    unitPrice: number;
  }[];
}) {
  return {
    id: doc._id.toString(),
    orderNumber: doc.orderNumber,
    createdAt: doc.createdAt.toISOString(),
    customerName: doc.customerName,
    customerEmail: doc.customerEmail,
    customerPhone: doc.customerPhone,
    addressLine1: doc.addressLine1,
    city: doc.city,
    postalCode: doc.postalCode ?? "",
    subtotal: doc.subtotal,
    shipping: doc.shipping,
    total: doc.total,
    paymentMethod: doc.paymentMethod,
    paymentStatus: doc.paymentStatus,
    paymentReference: doc.paymentReference ?? null,
    status: doc.status,
    notes: doc.notes ?? "",
    isGuest: !doc.userId,
    items: (doc.items ?? []).map((item, idx) => ({
      id: item._id?.toString() ?? String(idx),
      productId: item.productId ? item.productId.toString() : null,
      productName: item.productName,
      productSlug: item.productSlug ?? null,
      imageUrl: item.imageUrl ? publicUrl(item.imageUrl) : null,
      size: item.size,
      color: item.color,
      qty: item.qty,
      unitPrice: item.unitPrice,
    })),
  };
}

export function mapUser(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  phone?: string | null;
  role: string;
}) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role,
    isAdmin: user.role === "admin",
  };
}
