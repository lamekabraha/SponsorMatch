#!/usr/bin/env node
/**
 * Run: node scripts/run-alter-account-contact.mjs
 * Adds ContactName, ContactPhone, AdditionalAdmins columns to account table.
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
        ADD COLUMN ContactName VARCHAR(100) DEFAULT NULL,
        ADD COLUMN ContactPhone VARCHAR(45) DEFAULT NULL,
        ADD COLUMN AdditionalAdmins VARCHAR(500) DEFAULT NULL
    `);
    console.log("Migration completed: ContactName, ContactPhone, AdditionalAdmins columns added");
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
