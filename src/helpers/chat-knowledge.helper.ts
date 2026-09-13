export type ChatLink = { label: string; href: string };

export type KnowledgeArticle = {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
  links: ChatLink[];
};

export const KNOWLEDGE: KnowledgeArticle[] = [
  {
    id: "greeting",
    title: "Hello",
    keywords: ["hi", "hello", "hey", "salam", "salaam", "aoa", "assalam", "thanks", "shukriya", "who are you"],
    answer:
      "I'm the MEHR atelier desk. I can help with pieces, sizes, shipping, payments, exchanges, try-on, orders and the house. Ask in English or Roman Urdu.",
    links: [
      { label: "Shop women", href: "/women" },
      { label: "Try on", href: "/try-on" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    id: "house",
    title: "The house",
    keywords: [
      "about",
      "house",
      "mehr",
      "brand",
      "story",
      "artisan",
      "weav",
      "embroider",
      "lahore",
      "kashmir",
      "multan",
      "shahdara",
      "made",
      "pakistan",
      "who",
      "families",
      "villages",
      "zari",
    ],
    answer:
      "MEHR is a Pakistani fashion house in Lahore. We work with embroiderers in Shahdara and pit-loom weavers in Kashmir and Multan — eleven families, four villages. Everything is cut in Lahore in runs of forty or fewer, so the hand stays visible. Artisans are paid by the panel, not the hour. If a piece takes eleven days, it takes eleven days.",
    links: [
      { label: "The house", href: "/about" },
      { label: "Collections", href: "/collections" },
    ],
  },
  {
    id: "women",
    title: "Women",
    keywords: ["women", "woman", "ladies", "kurta", "tunic", "angarkha", "coord", "co-ord", "silk", "linen", "organza", "formal", "wedding", "shaadi"],
    answer:
      "Women's is silk, linen and organza — kurtas, tunics, angarkhas and co-ords in ivory, cream, espresso and muted burgundy. Sizes run XS–XL. Open a piece for fabric, fit and a size guide, or try it on a real body.",
    links: [
      { label: "Women", href: "/women" },
      { label: "New arrivals", href: "/new-arrivals" },
      { label: "Try on", href: "/try-on" },
    ],
  },
  {
    id: "kids",
    title: "Kids",
    keywords: ["kids", "kid", "child", "children", "bache", "bachay", "frock", "baby", "2y", "4y", "6y"],
    answer:
      "Kids wears the same palette, scaled down — handloom cotton kurtas, frocks and sets for courtyards and weddings. Sizes: 2–3Y, 4–5Y, 6–7Y, 8–9Y and 10–11Y. You can try a kids piece on in the fitting room too.",
    links: [
      { label: "Kids", href: "/kids" },
      { label: "Try on", href: "/try-on" },
    ],
  },
  {
    id: "shawls",
    title: "Shawls",
    keywords: ["shawl", "shawls", "dupatta", "pashmina", "jamawar", "merino", "loom", "wrap", "odhni"],
    answer:
      "Shawls and dupattas are pit-loom pashmina, merino and jamawar from Kashmir and Multan — one size, meant to drape. For hygiene, a shawl that has been draped and worn cannot be returned. You can still exchange an unused piece with tags on within 14 days.",
    links: [
      { label: "Shawls", href: "/shawls" },
      { label: "Virsa collection", href: "/collections#virsa" },
      { label: "Exchanges", href: "/returns" },
    ],
  },
  {
    id: "collections",
    title: "Collections",
    keywords: ["collection", "noor", "sang", "virsa", "chapter", "season", "ss26", "spring", "summer"],
    answer:
      "Three chapters. Noor is ivory silk, gold zari and organza — light in the hand. Sang is earth, linen and espresso for the hours between the atelier and the street. Virsa is pit-loom shawls and dupattas, still warm from the loom. Spring / Summer 2026 opened with Noor.",
    links: [
      { label: "Collections", href: "/collections" },
      { label: "Noor", href: "/collections#noor" },
      { label: "Sang", href: "/collections#sang" },
      { label: "Virsa", href: "/collections#virsa" },
    ],
  },
  {
    id: "new",
    title: "New arrivals",
    keywords: ["new", "arrival", "latest", "just landed", "weekly", "fresh"],
    answer:
      "New pieces land on New Arrivals as the atelier finishes a run. Check there for what is still warm — across women, shawls and kids.",
    links: [{ label: "New arrivals", href: "/new-arrivals" }],
  },
  {
    id: "shipping",
    title: "Shipping",
    keywords: [
      "ship",
      "shipping",
      "delivery",
      "deliver",
      "courier",
      "days",
      "nationwide",
      "pakistan",
      "karachi",
      "islamabad",
      "lahore",
      "free",
      "charges",
      "kitne din",
      "kab",
      "pohnche",
      "international",
      "abroad",
      "dubai",
      "uk",
      "usa",
      "canada",
    ],
    answer:
      "We ship across Pakistan in 3–5 working days via tracked courier. Orders over PKR 15,000 ship free; below that, delivery is PKR 300. Cash on delivery is available everywhere we ship. We do not currently ship outside Pakistan — write to hello@mehr.pk if you need a piece sent abroad and we will see what we can do. You get an email when the order is confirmed, and again when it leaves the atelier.",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Track an order", href: "/track" },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    keywords: [
      "pay",
      "payment",
      "cod",
      "cash",
      "jazzcash",
      "easypaisa",
      "wallet",
      "bank",
      "transfer",
      "iban",
      "card",
      "visa",
      "mastercard",
      "raast",
    ],
    answer:
      "Checkout starts with how you pay. Cash on delivery is available nationwide. JazzCash and Easypaisa: send the total, then you can add the number you paid from. Bank transfer: use the account shown at checkout; a reference can wait until after you place the order. We confirm wallet and bank payments within the hour on working days. Card checkout is not live yet — use COD, wallet or bank. We never store card numbers.",
    links: [
      { label: "Checkout", href: "/checkout" },
      { label: "Shipping & pay", href: "/shipping" },
    ],
  },
  {
    id: "returns",
    title: "Exchanges",
    keywords: [
      "return",
      "exchange",
      "refund",
      "wapas",
      "tabadla",
      "wrong size",
      "doesn't fit",
      "fit nahi",
      "sale",
      "final",
      "hygiene",
    ],
    answer:
      "Unused pieces can be exchanged within 14 days of delivery — unworn, unwashed, tags attached. Sale pieces and custom lengths are final. Shawls that have been draped and worn cannot be returned for hygiene. Write with your order number and we send a courier: you pay the return shipping, we cover the outbound exchange. When a refund is agreed, it goes back the way you paid, within 7 working days of the piece reaching us.",
    links: [
      { label: "Exchanges", href: "/returns" },
      { label: "Write to us", href: "/contact" },
    ],
  },
  {
    id: "cancel",
    title: "Cancel an order",
    keywords: ["cancel", "cancelled", "change order", "edit order", "stop order"],
    answer:
      "If the order is still Pending or Confirmed and has not left the atelier, write to hello@mehr.pk or use the contact form with your order number. Once it is Shipped we treat it as an exchange after delivery.",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Track", href: "/track" },
    ],
  },
  {
    id: "track",
    title: "Track an order",
    keywords: ["track", "tracking", "order status", "where is my", "mhr-", "pending", "shipped", "delivered"],
    answer:
      "Track with your order number (MHR- followed by six digits) and the email on the order — on the Track page, or in Account if you shopped on this phone. Status moves Pending → Confirmed → Processing → Shipped → Delivered. You can also paste your order number and email here and I will look it up.",
    links: [
      { label: "Track", href: "/track" },
      { label: "Account", href: "/account" },
    ],
  },
  {
    id: "sizing",
    title: "Sizing",
    keywords: ["size", "sizing", "chart", "xs", "xl", "fit", "measurement", "guide", "size guide", "loose", "tight"],
    answer:
      "Women's pieces are XS, S, M, L and XL. Kids are 2–3Y through 10–11Y. Most shawls are one size. Each product page has fit notes and a size guide when we have one. If you are between sizes, the house cut is usually relaxed — choose the size you wear in a similar kurta, or write to us with your bust and length and we will advise. Unused pieces exchange within 14 days.",
    links: [
      { label: "Women", href: "/women" },
      { label: "Kids", href: "/kids" },
      { label: "Exchanges", href: "/returns" },
    ],
  },
  {
    id: "tryon",
    title: "Virtual try-on",
    keywords: ["try", "try-on", "try on", "fitting", "photo", "model", "preview", "see on me", "virtual"],
    answer:
      "Open Try on, pick a kurta, shawl or kids piece, and see it on an atelier model — or on a photo of you that stays on this device. We never upload your picture. Drag, pinch and save the look. From any product card, the sparkle icon opens the fitting room for that piece.",
    links: [{ label: "Try on", href: "/try-on" }],
  },
  {
    id: "care",
    title: "Care",
    keywords: ["care", "wash", "dry clean", "iron", "store", "muslin", "stain"],
    answer:
      "Most embroidered and silk pieces are dry clean only and should be stored folded in muslin. Cotton kids pieces follow the care line on the product page. When in doubt, dry clean — zari and pit-loom weaves do not like a washing machine.",
    links: [{ label: "Shop", href: "/new-arrivals" }],
  },
  {
    id: "account",
    title: "Account",
    keywords: ["account", "login", "sign in", "register", "signup", "password", "forgot", "reset"],
    answer:
      "Create an account from Sign in — or shop as a guest. Forgot password sends a reset link if SMTP is configured; otherwise write to hello@mehr.pk. Once you are in, Account shows your orders, and you can edit your name and phone.",
    links: [
      { label: "Sign in", href: "/account/login" },
      { label: "Create account", href: "/account/login?mode=register" },
      { label: "Forgot password", href: "/account/forgot" },
    ],
  },
  {
    id: "guest",
    title: "Guest bag & wishlist",
    keywords: ["guest", "without login", "not logged", "wishlist", "favourites", "favorites", "heart", "bag", "cart"],
    answer:
      "You can add to bag and wishlist without an account. This phone keeps a private device id so your pieces and orders stay yours here. When you register or sign in, we attach those orders and merge the wishlist. A new phone or cleared storage will not see the old guest list unless you had signed in. We do not use your IP as identity — mobile IPs change.",
    links: [
      { label: "Wishlist", href: "/wishlist" },
      { label: "Account", href: "/account" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
  {
    id: "checkout",
    title: "How to order",
    keywords: ["order", "checkout", "buy", "bag", "cart", "how to shop", "place order", "khareed"],
    answer:
      "Add a piece with size and colour, open your bag, then Checkout. First choose payment (COD, JazzCash/Easypaisa, or bank), then your name, email, phone and address. Review and place the order. You will see a confirmation with your MHR number. Keep cash ready if you chose COD.",
    links: [
      { label: "Checkout", href: "/checkout" },
      { label: "Shipping", href: "/shipping" },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    keywords: ["contact", "email", "phone", "whatsapp", "press", "hours", "time", "hello@", "call", "address", "atelier"],
    answer:
      "Write to hello@mehr.pk or use the contact form. Phone +92 300 1234567. The atelier is in Lahore. We reply on working days, usually within a few hours. Desk hours: Sunday to Thursday, 11:00–18:00 PKT.",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Email", href: "mailto:hello@mehr.pk" },
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    keywords: ["privacy", "data", "gdpr", "delete account", "sell", "ip", "cookie"],
    answer:
      "We keep name, email, phone and address to fulfil orders, and a newsletter email if you join the list. Guest shopping uses a device id on this phone, not your IP. We do not sell your details. Ask us to delete your account any time; tax order records stay anonymised. Questions: hello@mehr.pk.",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    id: "newsletter",
    title: "Newsletter",
    keywords: ["newsletter", "list", "subscribe", "email me", "new run"],
    answer:
      "Join the list in the footer for new runs, once in a while — not a weekly blast. We only write when something actually lands.",
    links: [{ label: "Home", href: "/" }],
  },
  {
    id: "studio",
    title: "Studio",
    keywords: ["studio", "admin", "dashboard", "wholesale", "stockist", "press", "collaboration"],
    answer:
      "The studio desk is for house staff — catalogue, orders, customers and inbox. Sign in with a studio account; an existing admin grants access. For press, wholesale or a collaboration, write to hello@mehr.pk rather than the shopper desk.",
    links: [
      { label: "Studio", href: "/admin" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    id: "stock",
    title: "Stock & sales",
    keywords: ["stock", "sold out", "available", "sale", "discount", "price", "qeemat", "cost", "pkr", "expensive"],
    answer:
      "Prices are in Pakistani rupees, shown on each piece. A sale price appears in burgundy when a piece is reduced — sale pieces are final on exchange. Stock is live: if it is gone, the page will say sold out. Runs are small (forty or fewer), so a favourite can go. Wishlist it and we will not auto-email, but you will see it if it returns on New Arrivals.",
    links: [
      { label: "New arrivals", href: "/new-arrivals" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    id: "gift",
    title: "Gifts & custom",
    keywords: ["gift", "wrap", "custom", "bespoke", "length", "wholesale", "bulk"],
    answer:
      "We do not offer gift wrap on the site yet — a note in the order or an email to hello@mehr.pk is enough and we will pack with care. Custom lengths are possible on some pieces; they are final sale. For wholesale, write to the atelier.",
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    id: "damage",
    title: "Damaged or wrong piece",
    keywords: ["damage", "torn", "stain", "wrong", "missing", "defect", "quality"],
    answer:
      "If a piece arrives damaged, incomplete or not what you ordered, photograph it and write to hello@mehr.pk with your order number the same day if you can. We will send a replacement or collect it — you should not pay return shipping for our mistake.",
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    id: "360",
    title: "Seeing a piece",
    keywords: ["360", "rotate", "photos", "images", "video", "look"],
    answer:
      "Product pages show stills and, when we have them, a drag-to-rotate 360. Try-on lets you drape the cloth on a body. Search from the header magnifying glass finds pieces by name.",
    links: [
      { label: "Try on", href: "/try-on" },
      { label: "Women", href: "/women" },
    ],
  },
];

export const SYNONYMS: Record<string, string> = {
  wapas: "return",
  tabadla: "exchange",
  delivery: "shipping",
  deliver: "shipping",
  qeemat: "price",
  keemat: "price",
  paisay: "payment",
  paise: "payment",
  khareed: "order",
  kharid: "order",
  bache: "kids",
  bachay: "kids",
  larka: "kids",
  larki: "kids",
  dupatta: "shawl",
  odhni: "shawl",
  shaadi: "wedding",
  fit: "size",
  measurement: "size",
  aoa: "hello",
  salam: "hello",
  shukriya: "thanks",
  meharbani: "thanks",
};
