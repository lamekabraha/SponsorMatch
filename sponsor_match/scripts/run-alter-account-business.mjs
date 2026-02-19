#!/usr/bin/env node
/**
 * Run: node scripts/run-alter-account-business.mjs
 * Adds CompanySize and Website columns to account table for business onboarding.
 */
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { join } from "path";

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
        ADD COLUMN CompanySize VARCHAR(50) DEFAULT NULL,
        ADD COLUMN Website VARCHAR(255) DEFAULT NULL
    `);
    console.log("Migration completed: CompanySize and Website columns added");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Columns already exist, skipping migration");
    } else {
      console.error("Migration failed:", err.message);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

run();
