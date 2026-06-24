import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import fs from "fs";
import path from "path";

// Load .env.local for standalone scripts
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
  console.warn("Could not load .env.local for check-db", e);
}

async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    console.log("DB connected:", result);
  } catch (e) {
    console.error("DB connection error:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
