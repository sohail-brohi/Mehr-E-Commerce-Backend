import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./db.js";
import { uploadAtKey } from "./lib/s3.js";
import { Collection } from "./models/Collection.js";
import { Product } from "./models/Product.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(root, "assets");

async function uploadAsset(filename: string) {
  const filePath = path.join(assets, filename);
  const buffer = fs.readFileSync(filePath);
  const key = `catalogue/${filename}`;
  const uploaded = await uploadAtKey(buffer, key, "image/jpeg");
  console.log("uploaded", uploaded.path);
  return uploaded.path;
}

async function run() {
  await connectDb();

  const files = {
    hero: await uploadAsset("hero.jpg"),
    ivoryKurta: await uploadAsset("p-ivory-kurta-alt.jpg"),
    beigeLinen: await uploadAsset("p-beige-linen.jpg"),
    burgundy: await uploadAsset("p-burgundy-chikankari.jpg"),
    espresso: await uploadAsset("p-espresso-angarkha.jpg"),
    ivoryShawl: await uploadAsset("p-ivory-shawl.jpg"),
    jamawar: await uploadAsset("p-jamawar-dupatta.jpg"),
    kidsFrock: await uploadAsset("p-kids-frock.jpg"),
    kidsKurta: await uploadAsset("p-kids-kurta.jpg"),
    editorialWomen: await uploadAsset("editorial-women.jpg"),
    editorialShawls: await uploadAsset("editorial-shawls.jpg"),
    editorialKids: await uploadAsset("editorial-kids.jpg"),
  };

  const collections = [
    {
      slug: "noor",
      name: "Noor",
      tagline: "Ivory silk, light in the hand",
      description:
        "The opening chapter: unbleached silk, gold zari and organza cut for evenings that start in courtyards and end on rooftops.",
      imageUrl: files.hero,
      sortOrder: 0,
    },
    {
      slug: "sang",
      name: "Sang",
      tagline: "Earth, linen, espresso",
      description:
        "Stone and soil. Linen co-ords and charcoal silk for the hours between the atelier and the street.",
      imageUrl: files.editorialWomen,
      sortOrder: 1,
    },
    {
      slug: "virsa",
      name: "Virsa",
      tagline: "Pit-loom, still warm",
      description:
        "Shawls and dupattas from Kashmir and Multan. Wooden looms, merino, pashmina and jamawar — heritage worn as a layer.",
      imageUrl: files.editorialShawls,
      sortOrder: 2,
    },
  ];

  for (const row of collections) {
    await Collection.findOneAndUpdate({ slug: row.slug }, row, { upsert: true, new: true });
    console.log("collection", row.slug);
  }

  const ivory = { name: "Ivory", hex: "#F3EFE6" };
  const cream = { name: "Cream", hex: "#E8DFCC" };
  const beige = { name: "Warm Beige", hex: "#CBB99C" };
  const charcoal = { name: "Charcoal", hex: "#3B3A38" };
  const espresso = { name: "Espresso", hex: "#4A3728" };
  const burgundy = { name: "Burgundy", hex: "#6E2B3A" };
  const adult = ["XS", "S", "M", "L", "XL"];
  const kids = ["2–3Y", "4–5Y", "6–7Y", "8–9Y", "10–11Y"];
  const one = ["One size"];

  const products = [
    {
      slug: "noor-embroidered-kurta",
      name: "Noor embroidered kurta",
      sku: "MHR-NR-001",
      description:
        "Ivory silk kurta with a hand-worked zari panel and a weightless organza dupatta. Cut in a run of forty.",
      story:
        "Eleven days on the front panel. Zari is laid thread over thread in Shahdara, in the same sitting posture used a century ago.",
      price: 28500,
      salePrice: null,
      category: "women",
      collectionSlug: "noor",
      sizes: adult,
      colors: [ivory, cream],
      images: [files.hero, files.ivoryKurta],
      frames360: [files.hero, files.ivoryKurta],
      fabric: "Silk organza, unbleached lining",
      fit: "Relaxed through the body; falls to mid-thigh. Pair with the matching trousers.",
      care: "Dry clean only. Store folded in muslin.",
      origin: "Cut in Lahore. Embroidery in Shahdara.",
      stock: 14,
      featured: true,
      newArrival: true,
      published: true,
      sortOrder: 0,
    },
    {
      slug: "ivory-zari-tunic",
      name: "Ivory zari tunic",
      sku: "MHR-NR-002",
      description:
        "A quieter Noor piece: scattered zari motifs on ivory silk, viewed from the back so the hand stays visible.",
      story: "The motifs are counted, not printed. Each diamond sits where the embroiderer decided it should.",
      price: 19500,
      salePrice: null,
      category: "women",
      collectionSlug: "noor",
      sizes: adult,
      colors: [ivory],
      images: [files.ivoryKurta, files.hero],
      frames360: [files.ivoryKurta],
      fabric: "Silk, gold zari",
      fit: "Straight cut with side slits. Wear over wide trousers.",
      care: "Dry clean only.",
      origin: "Made in Lahore.",
      stock: 18,
      featured: false,
      newArrival: true,
      published: true,
      sortOrder: 1,
    },
    {
      slug: "burgundy-chikankari-set",
      name: "Burgundy chikankari set",
      sku: "MHR-NR-003",
      description:
        "Muted burgundy kurta, trousers and dupatta, covered in chikankari so fine it reads as texture before it reads as pattern.",
      story: "Chikankari is usually white on white. We asked for burgundy on burgundy — so the work only shows when the light does.",
      price: 32000,
      salePrice: 26800,
      category: "women",
      collectionSlug: "noor",
      sizes: adult,
      colors: [burgundy],
      images: [files.burgundy],
      frames360: [files.burgundy],
      fabric: "Viscose georgette, chikankari",
      fit: "Straight kurta with a matching dupatta. True to size.",
      care: "Dry clean. Do not wring.",
      origin: "Embroidery in Lucknow; cut in Lahore.",
      stock: 9,
      featured: true,
      newArrival: false,
      published: true,
      sortOrder: 2,
    },
    {
      slug: "beige-linen-coord",
      name: "Beige linen co-ord",
      sku: "MHR-SG-001",
      description:
        "Unbleached linen shirt and wide trousers. No embroidery — the hand is in the mill, not the needle.",
      story: "Four weaving villages send us linen still warm from the loom. This set is washed once, never dyed.",
      price: 16500,
      salePrice: null,
      category: "women",
      collectionSlug: "sang",
      sizes: adult,
      colors: [beige, cream],
      images: [files.beigeLinen],
      frames360: [files.beigeLinen],
      fabric: "Unbleached linen",
      fit: "Oversized shirt, full-length wide leg. Size down for a closer cut.",
      care: "Cold wash, hang dry. Linen wrinkles; that is the point.",
      origin: "Woven in Multan. Cut in Lahore.",
      stock: 22,
      featured: true,
      newArrival: true,
      published: true,
      sortOrder: 3,
    },
    {
      slug: "espresso-organza-angarkha",
      name: "Espresso organza angarkha",
      sku: "MHR-SG-002",
      description:
        "A flared angarkha in espresso organza, edged in antique gold. For weddings that start after dusk.",
      story: "Organza does not forgive a rushed hem. This one is rolled by hand, twice, so the flare holds.",
      price: 42000,
      salePrice: null,
      category: "women",
      collectionSlug: "sang",
      sizes: adult,
      colors: [espresso],
      images: [files.espresso],
      frames360: [files.espresso],
      fabric: "Silk organza, antique gold thread",
      fit: "Fit at the shoulder, flare from the waist. Inner slip included.",
      care: "Dry clean only. Hang, do not fold.",
      origin: "Made in Lahore.",
      stock: 6,
      featured: true,
      newArrival: false,
      published: true,
      sortOrder: 4,
    },
    {
      slug: "charcoal-silk-kurta",
      name: "Charcoal silk kurta",
      sku: "MHR-SG-003",
      description:
        "Charcoal silk with a hidden button placket and a matching dupatta. The Sang palette at its quietest.",
      story: "Dyed in small vats so no two batches match exactly. Yours will be this charcoal, not last month's.",
      price: 21000,
      salePrice: null,
      category: "women",
      collectionSlug: "sang",
      sizes: adult,
      colors: [charcoal],
      images: [files.editorialWomen],
      frames360: [files.editorialWomen],
      fabric: "Silk, hand-dyed",
      fit: "Slim through the shoulder, easy through the hip.",
      care: "Dry clean. Keep out of harsh sun.",
      origin: "Dyed and cut in Lahore.",
      stock: 11,
      featured: false,
      newArrival: false,
      published: true,
      sortOrder: 5,
    },
    {
      slug: "ivory-pashmina-shawl",
      name: "Ivory pashmina shawl",
      sku: "MHR-VR-001",
      description:
        "Pit-loom pashmina in ivory, with tonal floral embroidery that only appears when you turn it to the light.",
      story: "Spun in Kashmir, woven on a wooden pit loom, embroidered sitting on the floor. Nothing here is fast.",
      price: 48000,
      salePrice: null,
      category: "shawls",
      collectionSlug: "virsa",
      sizes: one,
      colors: [ivory, cream],
      images: [files.ivoryShawl],
      frames360: [files.ivoryShawl],
      fabric: "Pashmina, tonal embroidery",
      fit: "One size. Generous enough to wrap twice.",
      care: "Dry clean. Store folded with cedar.",
      origin: "Woven in Kashmir.",
      stock: 7,
      featured: true,
      newArrival: true,
      published: true,
      sortOrder: 6,
    },
    {
      slug: "gold-jamawar-dupatta",
      name: "Gold jamawar dupatta",
      sku: "MHR-VR-002",
      description:
        "A jamawar dupatta in warm gold with a paisley border. Wear it over ivory, espresso or nothing else.",
      story: "Jamawar used to be a court cloth. We still weave it on the same width of loom, just fewer metres a year.",
      price: 24500,
      salePrice: null,
      category: "shawls",
      collectionSlug: "virsa",
      sizes: one,
      colors: [cream, beige],
      images: [files.jamawar],
      frames360: [files.jamawar],
      fabric: "Jamawar silk-blend",
      fit: "One size. Full dupatta length.",
      care: "Dry clean only.",
      origin: "Woven in Kashmir.",
      stock: 12,
      featured: false,
      newArrival: true,
      published: true,
      sortOrder: 7,
    },
    {
      slug: "burgundy-pitloom-shawl",
      name: "Burgundy pit-loom shawl",
      sku: "MHR-VR-003",
      description:
        "Merino shawl in sand and burgundy, fringed by hand. The Virsa chapter at its heaviest.",
      story: "The motif is copied from a fragment in Multan, not from a moodboard. We paid the weaver for the drawing.",
      price: 18500,
      salePrice: null,
      category: "shawls",
      collectionSlug: "virsa",
      sizes: one,
      colors: [burgundy, beige],
      images: [files.editorialShawls],
      frames360: [files.editorialShawls],
      fabric: "Merino wool",
      fit: "One size. Heavy drape.",
      care: "Dry clean or cold hand wash. Lay flat.",
      origin: "Woven in Multan.",
      stock: 10,
      featured: false,
      newArrival: false,
      published: true,
      sortOrder: 8,
    },
    {
      slug: "burgundy-kids-frock",
      name: "Burgundy kids frock",
      sku: "MHR-KD-001",
      description:
        "A gathered frock in burgundy khaddar with gold bootis and a scalloped hem. Built for courtyards and weddings.",
      story: "The same palette as the women's line, scaled for someone who still runs.",
      price: 8900,
      salePrice: null,
      category: "kids",
      collectionSlug: "sang",
      sizes: kids,
      colors: [burgundy],
      images: [files.kidsFrock, files.editorialKids],
      frames360: [files.kidsFrock],
      fabric: "Handloom cotton khaddar",
      fit: "Gathered waist, midi length. Size up for growing room.",
      care: "Gentle cold wash. Iron on reverse.",
      origin: "Cut in Lahore.",
      stock: 16,
      featured: true,
      newArrival: true,
      published: true,
      sortOrder: 9,
    },
    {
      slug: "ivory-kids-kurta-set",
      name: "Ivory kids kurta set",
      sku: "MHR-KD-002",
      description:
        "Ivory cotton kurta and shalwar for boys. Mandarin collar, side slits, nothing fussy.",
      story: "We cut this from the same mill as the women's linen, just a lighter weave so it can be washed every week.",
      price: 7500,
      salePrice: null,
      category: "kids",
      collectionSlug: "noor",
      sizes: kids,
      colors: [ivory],
      images: [files.kidsKurta, files.editorialKids],
      frames360: [files.kidsKurta],
      fabric: "Handloom cotton",
      fit: "Straight kurta, easy shalwar. True to size.",
      care: "Cold wash, hang dry.",
      origin: "Made in Lahore.",
      stock: 20,
      featured: false,
      newArrival: true,
      published: true,
      sortOrder: 10,
    },
    {
      slug: "courtyard-kids-set",
      name: "Courtyard kids set",
      sku: "MHR-KD-003",
      description:
        "Mirror pieces for brother and sister: burgundy kurta, ivory angrakha with a wine lining, both in handloom cotton.",
      story: "Photographed in a haveli courtyard because that is where these clothes are actually worn.",
      price: 9800,
      salePrice: null,
      category: "kids",
      collectionSlug: "sang",
      sizes: kids,
      colors: [ivory, burgundy],
      images: [files.editorialKids, files.kidsFrock, files.kidsKurta],
      frames360: [files.editorialKids],
      fabric: "Handloom cotton",
      fit: "Easy, playable. Sold as individual pieces in the same palette.",
      care: "Cold wash.",
      origin: "Made in Lahore.",
      stock: 8,
      featured: false,
      newArrival: true,
      published: true,
      sortOrder: 11,
    },
  ];

  for (const row of products) {
    await Product.findOneAndUpdate({ slug: row.slug }, row, { upsert: true, new: true });
    console.log("product", row.slug);
  }

  console.log(`Seeded ${collections.length} collections and ${products.length} products.`);
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
