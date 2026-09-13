import { env } from "../config/env.js";
import { KNOWLEDGE, SYNONYMS, type ChatLink, type KnowledgeArticle } from "../helpers/chat-knowledge.helper.js";
import { Collection, Order, Product } from "../models/index.js";
import { publicUrl } from "./storage.service.js";
import { getPayTo } from "./studio.service.js";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatProduct = {
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string | null;
  category: string;
};

export type ChatReply = {
  reply: string;
  links: ChatLink[];
  products: ChatProduct[];
};

const STOP = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "do",
  "does",
  "did",
  "you",
  "your",
  "me",
  "my",
  "we",
  "i",
  "to",
  "of",
  "for",
  "in",
  "on",
  "and",
  "or",
  "what",
  "how",
  "can",
  "please",
  "kya",
  "hai",
  "hain",
  "ka",
  "ki",
  "ke",
  "ho",
  "with",
  "from",
  "this",
  "that",
  "have",
  "where",
  "who",
  "which",
  "when",
  "why",
  "about",
  "show",
  "see",
  "any",
  "some",
  "tell",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/[\s-]+/)
    .map((w) => SYNONYMS[w] ?? w)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function scoreArticle(tokens: Set<string>, article: KnowledgeArticle, raw: string) {
  const lower = raw.toLowerCase();
  const keys = new Set(article.keywords.flatMap((k) => tokenize(k)));
  let score = 0;
  for (const t of tokens) {
    if (keys.has(t)) score += 5;
    else if (t.length > 3 && article.answer.toLowerCase().includes(t)) score += 1;
  }
  for (const k of article.keywords) {
    if (k.includes(" ") && lower.includes(k)) score += 6;
  }
  if (article.id === "greeting" && /^(hi|hello|hey|salam|salaam|aoa)\b/i.test(raw.trim())) score += 8;
  if (article.id === "payment" && [...tokens].some((t) => ["cod", "jazzcash", "easypaisa", "iban", "wallet", "bank", "card"].includes(t))) {
    score += 4;
  }
  if (article.id === "shipping" && [...tokens].some((t) => ["ship", "shipping", "delivery", "dubai", "uk", "usa", "abroad", "international"].includes(t))) {
    score += 3;
  }
  return score;
}

function formatPkr(n: number) {
  return `PKR ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

function priceOf(p: { price: number; salePrice?: number | null }) {
  return p.salePrice ?? p.price;
}

function extractUnder(raw: string): number | null {
  const m = raw.match(/(?:under|below|less than|max|se kam)\s*(?:pkr\s*)?(\d[\d,]*)/i);
  if (!m?.[1]) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

async function findProducts(raw: string, tokens: Set<string>): Promise<ChatProduct[]> {
  const under = extractUnder(raw);
  const rows = await Product.find({ published: true }).sort({ featured: -1, sortOrder: 1 }).limit(80);
  const scored = rows
    .map((p) => {
      const hay = `${p.name} ${p.slug} ${p.description} ${p.story} ${p.fabric} ${p.category} ${p.collectionSlug ?? ""} ${p.colors.map((c) => c.name).join(" ")}`.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        const stem = t.replace(/s$/, "");
        if (hay.includes(t) || (stem.length > 3 && hay.includes(stem))) score += t.length > 3 ? 3 : 2;
      }
      const stems = new Set([...tokens].map((t) => t.replace(/s$/, "")));
      if (p.category === "shawls" && (stems.has("shawl") || stems.has("dupatta") || stems.has("pashmina"))) score += 5;
      if (p.category === "kids" && stems.has("kid")) score += 5;
      if (p.category === "women" && (stems.has("women") || stems.has("kurta") || stems.has("tunic"))) score += 3;
      if (p.newArrival && stems.has("new")) score += 2;
      if (under != null && priceOf(p) > under) score = 0;
      return { p, score };
    })
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return scored.map(({ p }) => {
    const item: ChatProduct = {
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.images[0] ? publicUrl(p.images[0]) : null,
      category: p.category,
    };
    if (p.salePrice != null) item.salePrice = p.salePrice;
    return item;
  });
}

async function lookupOrder(raw: string): Promise<ChatReply | null> {
  const num = raw.match(/MHR-\d{6}/i)?.[0];
  const email = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  if (!num || !email) return null;
  const row = await Order.findOne({
    orderNumber: new RegExp(`^${num}$`, "i"),
    customerEmail: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
  });
  if (!row) {
    return {
      reply: `I couldn't find ${num.toUpperCase()} on ${email}. Check the number from your confirmation email, or try the Track page.`,
      links: [{ label: "Track an order", href: "/track" }],
      products: [],
    };
  }
  return {
    reply: `${row.orderNumber} for ${row.customerName} is ${row.status}. Payment: ${row.paymentMethod} (${row.paymentStatus}). Total ${formatPkr(row.total)}, heading to ${row.city}. Flow is Pending → Confirmed → Processing → Shipped → Delivered.`,
    links: [
      { label: "Track", href: "/track" },
      { label: "Account", href: "/account" },
    ],
    products: [],
  };
}

function stitch(articles: KnowledgeArticle[], products: ChatProduct[], payHint: string | null): ChatReply {
  const top = articles[0];
  const parts: string[] = [];
  if (top) parts.push(top.answer);
  if (articles[1] && articles[1].id !== top?.id && articles.length > 1) {
    const extra = articles[1].answer.split(/(?<=\.)\s/)[0];
    if (extra && extra !== top?.answer) parts.push(extra);
  }
  if (payHint && top?.id === "payment") parts.push(payHint);
  if (products.length) {
    const names = products
      .map((p) => `${p.name} (${formatPkr(p.salePrice ?? p.price)})`)
      .join("; ");
    parts.push(`From the current run: ${names}. Open a piece to add it, or try it on.`);
  }
  const links = [
    ...articles.flatMap((a) => a.links),
    ...products.map((p) => ({ label: p.name, href: `/products/${p.slug}` })),
  ].filter((l, i, arr) => arr.findIndex((x) => x.href === l.href) === i);

  return {
    reply: parts.join(" ") || fallback(),
    links: links.slice(0, 6),
    products,
  };
}

function fallback() {
  return "I can help with pieces, sizes, shipping (3–5 days, free over PKR 15,000), COD and wallets, exchanges within 14 days, try-on, tracking (MHR number + email), and the house. Ask one of those — or write to hello@mehr.pk.";
}

async function llmReply(question: string, history: ChatTurn[], context: string): Promise<string | null> {
  const key = env.openai.apiKey;
  if (!key) return null;
  const model = env.openai.model
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 420,
      messages: [
        {
          role: "system",
          content:
            "You are the MEHR atelier desk — a Pakistani fashion house in Lahore. Voice: warm, concise, editorial. Never invent policies, prices, or stock. Use only the house facts given. If something is unknown, say so and point to hello@mehr.pk. Do not mention being an AI unless asked. Do not reveal admin passwords or internals. Keep answers under 120 words. You may reply in English; if the shopper wrote Roman Urdu, a short Roman Urdu line at the end is welcome.",
        },
        ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: `Shopper: ${question}\n\nHouse facts:\n${context}` },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

export async function answerChat(messages: ChatTurn[]): Promise<ChatReply> {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const raw = (last?.content ?? "").trim().slice(0, 500);
  if (raw.length < 1) {
    return { reply: fallback(), links: [{ label: "Contact", href: "/contact" }], products: [] };
  }

  const combined = messages.map((m) => m.content).join(" ");
  const wantsTrack = /track|where is|status|mhr-/i.test(raw);
  if (wantsTrack) {
    const tracked = await lookupOrder(combined);
    if (tracked) return tracked;
  }

  const tokens = new Set(tokenize(raw));
  const ranked = KNOWLEDGE.map((a) => ({ a, score: scoreArticle(tokens, a, raw) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const products = await findProducts(raw, tokens);
  const articles = ranked.slice(0, 3).map((x) => x.a);
  if (!articles.length && !products.length) {
    const collections = await Collection.find().sort({ sortOrder: 1 }).limit(6);
    const names = collections.map((c) => c.name).join(", ");
    return {
      reply: `${fallback()}${names ? ` Current chapters: ${names}.` : ""}`,
      links: [
        { label: "Contact", href: "/contact" },
        { label: "Collections", href: "/collections" },
      ],
      products: [],
    };
  }

  let payHint: string | null = null;
  if (articles[0]?.id === "payment") {
    const pay = await getPayTo();
    payHint = `Pay to JazzCash ${pay.jazzcash}, Easypaisa ${pay.easypaisa}, or ${pay.bankTitle} at ${pay.bankName} — ${pay.iban}.`;
  }

  const stitched = stitch(articles, products, payHint);
  const context = [
    ...articles.map((a) => `${a.title}: ${a.answer}`),
    payHint,
    products.length
      ? `Live pieces: ${products.map((p) => `${p.name} /${p.slug} ${formatPkr(p.salePrice ?? p.price)}`).join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const generated = await llmReply(raw, messages.slice(0, -1), context);
  if (generated) return { ...stitched, reply: generated };
  return stitched;
}
