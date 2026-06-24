import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local for standalone scripts (no extra deps)
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const contents = fs.readFileSync(envPath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch (e) {
  console.warn("Could not load .env.local:", e);
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ────────────────────────────────────────
  const adminEmail = "admin@mayursilks.com";
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existing) {
    const hashed = await bcrypt.hash("Admin@123", 12);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashed,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });
    console.log("✅ Admin user created: admin@mayursilks.com / Admin@123");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  // ── Categories ────────────────────────────────────────
  const categoriesData = [
    {
      slug: "kanchipattu-sarees",
      name: "Kanchipattu Sarees",
      description:
        "Pure silk sarees from Kanchipuram, woven with gold zari borders and rich traditional motifs.",
      sortOrder: 1,
    },
    {
      slug: "pochampally-sarees",
      name: "Pochampally Sarees",
      description:
        "Iconic ikat-weave sarees from Pochampally, Telangana, known for geometric patterns.",
      sortOrder: 2,
    },
    {
      slug: "ikkat-sarees",
      name: "Ikkat Sarees",
      description:
        "Double ikat masterpieces with resist-dyed threads creating stunning symmetric designs.",
      sortOrder: 3,
    },
    {
      slug: "dharmavaram-sarees",
      name: "Dharmavaram Sarees",
      description:
        "Heavy silk sarees from Dharmavaram with broad zari borders and rich pallu.",
      sortOrder: 4,
    },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
      create: { ...cat, isActive: true },
    });
    categories[cat.slug] = upserted.id;
    console.log(`✅ Category: ${cat.name}`);
  }

  // ── Products ──────────────────────────────────────────
  const productsData = [
    {
      slug: "kanchipuram-royal-maroon-silk",
      sku: "KAN-001",
      name: "Kanchipuram Royal Maroon Silk Saree",
      description:
        "A stunning royal maroon Kanchipuram silk saree with intricate gold zari temple border and rich peacock motif pallu. Perfect for weddings and grand occasions.",
      price: 18500,
      originalPrice: 22000,
      fabric: "Pure Mulberry Silk",
      weavingTechnique: "Traditional Kanchipuram Weave",
      designDetails:
        "Temple border with peacock motif pallu, gold zari throughout",
      length: "6.3 meters with blouse piece",
      color: "Royal Maroon with Gold",
      availability: "IN_STOCK" as const,
      stock: 5,
      isNew: true,
      isBestSeller: true,
      isFeatured: true,
      tags: ["silk", "wedding", "kanchipuram", "zari"],
      images: [],
      categorySlug: "kanchipattu-sarees",
    },
    {
      slug: "pochampally-blue-geometric",
      sku: "POC-001",
      name: "Pochampally Blue Geometric Ikat Saree",
      description:
        "Exquisite blue Pochampally ikat saree with bold geometric diamond patterns. A masterpiece of Telangana's weaving tradition.",
      price: 12500,
      originalPrice: 15000,
      fabric: "Pure Silk",
      weavingTechnique: "Single Ikat",
      designDetails: "Diamond geometric patterns with contrast border",
      length: "6 meters with blouse piece",
      color: "Royal Blue with Gold",
      availability: "IN_STOCK" as const,
      stock: 8,
      isNew: false,
      isBestSeller: true,
      isFeatured: true,
      tags: ["ikat", "pochampally", "geometric", "blue"],
      images: [],
      categorySlug: "pochampally-sarees",
    },
    {
      slug: "double-ikkat-wine-masterpiece",
      sku: "IKK-001",
      name: "Double Ikat Wine Red Masterpiece",
      description:
        "Rare double ikat saree in deep wine red with symmetric traditional motifs. Each thread is individually resist-dyed before weaving.",
      price: 24000,
      originalPrice: 28000,
      fabric: "Pure Silk",
      weavingTechnique: "Double Ikat",
      designDetails: "Symmetric floral and geometric double ikat patterns",
      length: "6.2 meters with blouse piece",
      color: "Wine Red with Silver",
      availability: "IN_STOCK" as const,
      stock: 3,
      isNew: true,
      isBestSeller: false,
      isFeatured: true,
      tags: ["double-ikat", "premium", "wine", "rare"],
      images: [],
      categorySlug: "ikkat-sarees",
    },
    {
      slug: "dharmavaram-emerald-green",
      sku: "DHA-001",
      name: "Dharmavaram Emerald Green Silk Saree",
      description:
        "Rich emerald green Dharmavaram silk saree with broad gold zari border and traditional mango motifs. Perfect for festivals.",
      price: 16000,
      originalPrice: 19500,
      fabric: "Pure Dharmavaram Silk",
      weavingTechnique: "Dharmavaram Traditional Weave",
      designDetails: "Broad gold zari border with mango motifs and rich pallu",
      length: "6.3 meters with blouse piece",
      color: "Emerald Green with Gold",
      availability: "IN_STOCK" as const,
      stock: 6,
      isNew: false,
      isBestSeller: true,
      isFeatured: false,
      tags: ["dharmavaram", "festival", "emerald", "zari"],
      images: [],
      categorySlug: "dharmavaram-sarees",
    },
    {
      slug: "kanchipuram-bridal-red",
      sku: "KAN-002",
      name: "Kanchipuram Bridal Red Silk Saree",
      description:
        "Traditional bridal red Kanchipuram saree with elaborate gold zari border and bridal motifs. The quintessential South Indian wedding saree.",
      price: 32000,
      originalPrice: 38000,
      fabric: "Pure Mulberry Silk",
      weavingTechnique: "Traditional Kanchipuram Weave",
      designDetails: "Heavy gold zari with bridal elephant and peacock motifs",
      length: "6.5 meters with blouse piece",
      color: "Bridal Red with Heavy Gold",
      availability: "IN_STOCK" as const,
      stock: 4,
      isNew: false,
      isBestSeller: true,
      isFeatured: true,
      tags: ["bridal", "wedding", "red", "kanchipuram", "heavy-zari"],
      images: [],
      categorySlug: "kanchipattu-sarees",
    },
    {
      slug: "pochampally-mustard-yellow",
      sku: "POC-002",
      name: "Pochampally Mustard Yellow Ikat Saree",
      description:
        "Vibrant mustard yellow Pochampally saree with traditional wave and diamond ikat patterns. A joyful addition to any wardrobe.",
      price: 9500,
      originalPrice: 12000,
      fabric: "Cotton Silk",
      weavingTechnique: "Single Ikat",
      designDetails: "Wave and diamond patterns in contrast maroon",
      length: "6 meters with blouse piece",
      color: "Mustard Yellow with Maroon",
      availability: "IN_STOCK" as const,
      stock: 10,
      isNew: true,
      isBestSeller: false,
      isFeatured: false,
      tags: ["pochampally", "mustard", "ikat", "casual"],
      images: [],
      categorySlug: "pochampally-sarees",
    },
    {
      slug: "ikkat-peacock-blue-silk",
      sku: "IKK-002",
      name: "Ikkat Peacock Blue Silk Saree",
      description:
        "Elegant peacock blue ikat silk saree with intricate geometric patterns and contrast borders. A true collector's piece.",
      price: 14500,
      originalPrice: 17000,
      fabric: "Pure Silk",
      weavingTechnique: "Single Ikat",
      designDetails: "Peacock feather inspired geometric patterns",
      length: "6 meters with blouse piece",
      color: "Peacock Blue with Gold",
      availability: "MADE_TO_ORDER" as const,
      stock: 0,
      isNew: false,
      isBestSeller: false,
      isFeatured: false,
      tags: ["ikat", "peacock", "blue", "made-to-order"],
      images: [],
      categorySlug: "ikkat-sarees",
    },
    {
      slug: "dharmavaram-golden-pink",
      sku: "DHA-002",
      name: "Dharmavaram Golden Pink Silk Saree",
      description:
        "Gorgeous golden pink Dharmavaram saree with intricate floral zari work. Perfect for receptions and engagements.",
      price: 21000,
      originalPrice: 25000,
      fabric: "Pure Dharmavaram Silk",
      weavingTechnique: "Dharmavaram Traditional Weave",
      designDetails: "Floral gold zari motifs with contrast pallu",
      length: "6.3 meters with blouse piece",
      color: "Golden Pink with Gold",
      availability: "IN_STOCK" as const,
      stock: 4,
      isNew: true,
      isBestSeller: false,
      isFeatured: true,
      tags: ["dharmavaram", "pink", "reception", "floral"],
      images: [],
      categorySlug: "dharmavaram-sarees",
    },
  ];

  for (const p of productsData) {
    const { categorySlug, ...productData } = p;
    const categoryId = categories[categorySlug];
    if (!categoryId) continue;

    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: { price: productData.price, stock: productData.stock },
      create: { ...productData, categoryId },
    });
    console.log(`✅ Product: ${productData.name}`);
  }

  // ── Blogs ─────────────────────────────────────────────
  const blogsData = [
    {
      slug: "how-to-care-for-silk-sarees",
      title: "How to Care for Your Silk Sarees: A Complete Guide",
      excerpt:
        "Silk sarees are delicate treasures. Learn the right way to wash, store, and maintain them so they last for generations.",
      content: `# How to Care for Your Silk Sarees

Silk sarees are more than just garments — they are heirlooms. With proper care, a high-quality silk saree can be passed down through generations. Here is everything you need to know.

## Washing Your Silk Saree

**Never machine wash.** Always dry-clean or hand wash in cold water with mild soap. Avoid wringing or twisting the fabric.

## Storage Tips

Store silk sarees wrapped in muslin cloth (never plastic). Keep them in a cool, dry place away from direct sunlight.

## Handling Zari Work

Gold zari is delicate. Fold sarees with zari facing inward to prevent oxidation and scratching.

## When to Re-wear

Air your saree after every use before storing. This prevents moisture build-up and keeps the silk fresh.`,
      author: "Mayur Silks Team",
      isPublished: true,
      tags: ["care", "silk", "maintenance", "tips"],
      readingTime: 5,
      publishedAt: new Date("2024-11-01"),
    },
    {
      slug: "kanchipuram-silk-heritage",
      title: "The Royal Heritage of Kanchipuram Silk Sarees",
      excerpt:
        "Explore the 400-year-old tradition of Kanchipuram silk weaving and why these sarees are considered the gold standard of Indian textiles.",
      content: `# The Royal Heritage of Kanchipuram Silk Sarees

For over 400 years, the weavers of Kanchipuram have been creating some of the most coveted silk sarees in the world.

## The Silk Capital of India

Kanchipuram, located in Tamil Nadu, is known as the 'Silk City of India.' The district has over 50,000 weavers who have inherited this craft from their ancestors.

## What Makes Kanchipuram Special

1. Pure mulberry silk threads sourced from Karnataka
2. 24-carat gold and silver zari from Surat
3. Three shuttles used simultaneously for interlocking body, border, and pallu
4. Each saree takes 3–7 days to weave by hand

## The GI Tag

In 2005, Kanchipuram silk received the Geographical Indication (GI) tag, recognising it as a product unique to the region.`,
      author: "Mayur Silks Team",
      isPublished: true,
      tags: ["kanchipuram", "heritage", "history", "silk"],
      readingTime: 7,
      publishedAt: new Date("2024-10-15"),
    },
    {
      slug: "pochampally-ikat-art",
      title: "Pochampally Ikat: The Art of Resist-Dyeing",
      excerpt:
        "Discover how Pochampally weavers create mesmerising patterns by dyeing threads before weaving — an ancient technique that has no shortcuts.",
      content: `# Pochampally Ikat: The Art of Resist-Dyeing

Pochampally ikat is a UNESCO-recognised craft that involves a meticulous process of resist-dyeing threads before they are woven into fabric.

## The Ikat Process

The word 'ikat' comes from the Indonesian word meaning 'to tie.' The process involves:

1. Tying bundles of threads in specific patterns
2. Dipping them in dye — the tied portions resist the colour
3. Untying and re-tying for additional colours
4. Finally weaving the pre-dyed threads into the saree

## Single vs Double Ikat

In single ikat, either the warp or weft threads are dyed. In double ikat, both are dyed and aligned perfectly during weaving — making it twice as complex and twice as beautiful.

## Pochampally: A Village of Weavers

Located in Telangana, Pochampally (now Bhoodan Pochampally) is a village where nearly every household is involved in weaving. It received GI tag recognition in 2004.`,
      author: "Mayur Silks Team",
      isPublished: true,
      tags: ["pochampally", "ikat", "craft", "weaving"],
      readingTime: 6,
      publishedAt: new Date("2024-09-20"),
    },
  ];

  for (const blog of blogsData) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: { isPublished: blog.isPublished },
      create: blog,
    });
    console.log(`✅ Blog: ${blog.title}`);
  }

  // ── Sample coupon ─────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "MAYUR10" },
    update: {},
    create: {
      code: "MAYUR10",
      type: "PERCENTAGE",
      value: 10,
      minOrderAmt: 5000,
      maxUses: 100,
      isActive: true,
    },
  });
  console.log("✅ Sample coupon: MAYUR10 (10% off)");

  // ── Site settings ─────────────────────────────────────
  const settings = [
    { key: "site_name", value: "Mayur Silks" },
    { key: "site_tagline", value: "Pure Handloom Silk Sarees" },
    { key: "whatsapp_number", value: "919652803383" },
    { key: "email", value: "contact@mayursilks.com" },
    { key: "phone", value: "+91 96528 03383" },
    { key: "address", value: "Jangaon, Telangana, India" },
    { key: "free_shipping_above", value: "999" },
    { key: "instagram", value: "https://instagram.com/mayursilks" },
    { key: "facebook", value: "https://facebook.com/mayursilks" },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Site settings saved");

  console.log("\n🎉 Seeding complete!");
  console.log("   Admin: admin@mayursilks.com / Admin@123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
