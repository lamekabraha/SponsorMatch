#!/usr/bin/env node
/**
 * Run: node scripts/run-alter-account-urls.mjs
 * Expands CompanyLogo and CompanyCover columns to VARCHAR(500) for storage URLs.
 */
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(process.cwd(), ".env.local");
try {
  const env = readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0 && !line.trim().startsWith("#")) {
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      process.env[key] = val;
    }
  }
} catch (e) {
  console.warn("Could not load .env.local:", e.message);
}

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
  });

  try {
    await pool.execute(`
      ALTER TABLE sponsor_match.account
        MODIFY COLUMN CompanyLogo VARCHAR(500) DEFAULT NULL,
        MODIFY COLUMN CompanyCover VARCHAR(500) DEFAULT NULL
    `);
    console.log("Migration completed: CompanyLogo and CompanyCover columns expanded to VARCHAR(500)");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
