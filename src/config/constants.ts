export const PRODUCT_CATEGORIES = ["women", "kids", "shawls"] as const;

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

export const PAYMENT_METHODS = ["cod", "card", "wallet", "bank"] as const;

export const PAYMENT_STATUSES = ["unpaid", "paid", "pending", "failed", "refunded"] as const;

export const USER_ROLES = ["admin", "customer"] as const;

export const RATE_LIMITS = {
  auth: { max: 8, windowMs: 15 * 60 * 1000 },
  site: { max: 6, windowMs: 15 * 60 * 1000 },
  chat: { max: 24, windowMs: 15 * 60 * 1000 },
} as const;

export const DEFAULT_PAY_TO = {
  jazzcash: "0300 8484848",
  easypaisa: "0300 8484848",
  bankTitle: "MEHR Atelier",
  bankName: "Habib Bank Limited",
  iban: "PK12 HABB 0000 0000 0000 0000",
} as const;
