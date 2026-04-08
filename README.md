# SponsorMatch — Client setup guide

This document explains how to obtain the project, install dependencies, configure MySQL, and run the application locally or on your own server.

## What you receive

- **Application source code** (this repository or an agreed archive).
- **Database**: a full MySQL dump is included at **`SponsorMatchDump.sql`** (schema + seed/demo data).
- **Environment configuration**: you create a local secrets file (see below). Do not commit real passwords or secrets to version control.

The runnable Next.js app is in the **`sponsor_match`** folder at the root of this repository.

---

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| **Node.js** | Version **20.x or newer** (LTS recommended), matching the `@types/node` range used by the project. |
| **npm** | Comes with Node.js. This project includes `package-lock.json`; use `npm ci` for reproducible installs. |
| **MySQL** | **8.x** recommended (the sample SQL uses `utf8mb4` / `utf8mb4_0900_ai_ci`). |

Optional: **Git**, if you clone the repository instead of using a ZIP.

---

## 1. Get the code

**Option A — Git clone**

```bash
git clone lamekabraha/SponsorMatch
cd SponsorMatch
```

**Option B — ZIP archive**

Extract the archive, then open a terminal in the extracted folder (you should see a `sponsor_match` directory).

---

## 2. Install application dependencies

From the repository root:

```bash
cd sponsor_match
npm ci
```

If you do not have `package-lock.json` (unusual for this project), use:

```bash
npm install
```

This installs all JavaScript/Node dependencies listed in `package.json` (Next.js, React, MySQL client, NextAuth, etc.).

---

## 3. MySQL database

The application expects a MySQL database whose name and credentials you put in environment variables (see section 4). The codebase uses the schema name **`sponsor_match`** for tables (for example `sponsor_match.user`).

### 3a. Install MySQL (if you are hosting the database yourself)

- Download MySQL Server from [MySQL Community Downloads](https://dev.mysql.com/downloads/mysql/) and install it, **or**
- Use Docker, **or**
- Use a managed MySQL service (AWS RDS, Azure Database for MySQL, etc.).

Create an empty database and a user with appropriate privileges on that database.

### 3b. Load the database from a dump (typical handoff)

The repository includes **`sponsor_match/sql/smDump.sql`**. It does **not** contain `CREATE DATABASE`; create the database first, then import.

```bash
mysql -u YOUR_USER -p -e "DROP DATABASE IF EXISTS sponsor_match; CREATE DATABASE sponsor_match CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
mysql -u YOUR_USER -p sponsor_match < sponsor_match/sql/smDump.sql
```

Replace `YOUR_USER` and paths as appropriate. On Windows, if `mysql` is not on your `PATH`, use the full path to `mysql.exe` (for example under `C:\Program Files\MySQL\MySQL Server 8.0\bin\`) or import via MySQL Workbench.

**Important:** Keep the database name **`sponsor_match`** unless you change `DB_NAME` in `.env.local` and adjust your MySQL setup accordingly.

### 3c. Incremental SQL in the repository

The folder `sponsor_match/sql/` may contain scripts for specific tables or updates (for example `business_category_pref.sql`). Run these **only** when your technical contact says they apply to your version of the database, and **after** the base schema exists (they often depend on existing tables).

---

## 4. Environment variables

Inside **`sponsor_match`**, create a file named **`.env.local`** (this file is normally git-ignored). Use the following template and replace the placeholders:

```env
# MySQL — required for the app to connect
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=sponsor_match

# NextAuth — set the public URL of your app
NEXTAUTH_URL=http://localhost:3000

# NextAuth — required in production; recommended for local dev
# Generate a random string, e.g. openssl rand -base64 32
NEXTAUTH_SECRET=your_long_random_secret

# Optional: where uploaded files (logos, etc.) are stored.
# If omitted, the app uses a `storage` folder next to the repo root (see src/lib/storage.ts).
# STORAGE_PATH=C:\path\to\storage
```

- **`NEXTAUTH_URL`**: For production, set this to your real site URL (for example `https://yourdomain.com`).
- **`NEXTAUTH_SECRET`**: Keep this private; rotate it if it is ever exposed.

---

## 5. Run the application

From **`sponsor_match`**:

```bash
# Development (hot reload)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

**Production-style build:**

```bash
npm run build
npm start
```

---

## 6. File uploads (logos and other assets)

User-uploaded files are stored on disk under a **`storage`** directory (by default, relative to the project layout — see `STORAGE_PATH` above). If you migrate servers, copy this folder together with the database, or users may lose access to existing uploads.

---

## 7. Quick checklist

1. Install Node.js 20+ and MySQL 8.
2. `cd sponsor_match` → `npm ci`
3. Create MySQL database and user; import the provided `.sql` dump if supplied.
4. Create `.env.local` with `DB_*`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`.
5. `npm run dev` and verify [http://localhost:3000](http://localhost:3000).

---

## Support

For database dumps, production URLs, secrets rotation, or hosting questions, use the contact channel agreed in your statement of work or contract.
