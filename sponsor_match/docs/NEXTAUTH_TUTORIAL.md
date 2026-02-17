# NextAuth Implementation Tutorial for SponsorMatch

This tutorial walks you through implementing NextAuth.js (v5) with the Credentials provider for the existing login and register pages, using the MySQL database schema from `smDump.sql`.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Database Schema Overview](#2-database-schema-overview)
3. [Installation](#3-installation)
4. [Environment Variables](#4-environment-variables)
5. [Auth Configuration](#5-auth-configuration)
6. [API Route Handler](#6-api-route-handler)
7. [Session Provider](#7-session-provider)
8. [Registration API](#8-registration-api)
9. [Update Login Page](#9-update-login-page)
10. [Update Register Page](#10-update-register-page)
11. [Middleware (Optional)](#11-middleware-optional)
12. [Testing](#12-testing)

---

## 1. Prerequisites

- Next.js 16 project with `src/app` structure
- MySQL database with `sponsor_match` schema (from `smDump.sql`)
- Existing `src/lib/db.ts` for database connection
- Login page at `src/app/login/page.tsx`
- Register page at `src/app/register/page.tsx`

---

## 2. Database Schema Overview

From `smDump.sql`, the relevant tables are:

### `account_type`
| Column         | Type    | Description        |
|----------------|---------|--------------------|
| AccountTypeId  | int     | 1 = Business, 2 = VCSE/Charity |
| AccountType    | varchar | Name of type       |

### `account`
| Column        | Type      | Description                    |
|---------------|-----------|--------------------------------|
| AccountId     | int       | Primary key                    |
| Name          | varchar   | Business/Organisation name     |
| AccountType   | int       | FK → account_type              |
| Registration  | varchar   | Registration number            |
| IndustrySector| varchar  | Industry sector                |
| ContactEmail  | varchar   | Unique contact email           |
| CompanyLogo   | varchar   | Logo path                      |

### `user`
| Column        | Type      | Description                    |
|---------------|-----------|--------------------------------|
| UserId        | int       | Primary key                    |
| ClerkId       | varchar   | Nullable (for OAuth providers) |
| AccountId     | int       | FK → account                   |
| FirstName     | varchar   | First name                     |
| LastName      | varchar   | Last name                      |
| Eamail        | varchar   | **Note: typo in schema** – email field |
| HashedPassword| varchar   | Must store bcrypt hash (60 chars) |
| Verified      | tinyint   | 0 or 1                            |

**Important:**
- The `user` table uses `Eamail` (typo) for the email column. Use this exact column name in queries.
- `HashedPassword` is `varchar(45)` in the dump—bcrypt hashes are 60 characters. Run: `ALTER TABLE user MODIFY HashedPassword VARCHAR(255);` before using bcrypt.

---

## 3. Installation

Install NextAuth and bcrypt:

```bash
npm install next-auth bcrypt
npm install -D @types/bcrypt
```

**Next.js 16 compatibility:** If you see peer dependency warnings, use:

```bash
npm install next-auth bcrypt --legacy-peer-deps
```

---

## 4. Environment Variables

Add to `.env.local`:

```env
# Database (existing)
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=sponsor_match
DB_PORT=3306

# NextAuth
AUTH_SECRET=your-random-secret-at-least-32-chars
AUTH_URL=http://localhost:3000
```

Generate a secure secret:

```bash
npx auth secret
```

Copy the output into `AUTH_SECRET`.

---

## 5. Auth Configuration

Create `auth.config.ts` in the project root (`sponsor_match/`):

```typescript
// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/vcse") || nextUrl.pathname.startsWith("/business");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accountType = (user as { accountType?: number }).accountType;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { accountType?: number }).accountType = token.accountType as number;
      }
      return session;
    },
  },
  providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
```

---

## 6. API Route Handler

Create `src/auth.ts`:

```typescript
// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { pool } from "@/lib/db";
import { authConfig } from "../auth.config";

interface UserRow {
  UserId: number;
  AccountId: number;
  FirstName: string;
  LastName: string;
  Eamail: string;
  HashedPassword: string;
  AccountType?: number;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        const [rows] = await pool.execute(
            `SELECT u.UserId, u.AccountId, u.FirstName, u.LastName, u.Eamail, u.HashedPassword, a.AccountType
             FROM sponsor_match.user u
             JOIN sponsor_match.account a ON u.AccountId = a.AccountId
             WHERE u.Eamail = ?`,
            [email.toLowerCase()]
          ) as [UserRow[], unknown];

        const user = rows[0];
        if (!user || !user.HashedPassword) return null;

        const isValid = await bcrypt.compare(password, user.HashedPassword);
        if (!isValid) return null;

        return {
          id: String(user.UserId),
          email: user.Eamail,
          name: `${user.FirstName} ${user.LastName}`,
          accountType: user.AccountType ?? user.AccountId,
        };
      },
    }),
  ],
});
```

Create the API route at `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

---

## 7. Session Provider

Wrap the app with `SessionProvider`. Update `src/app/layout.tsx`:

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { SessionProvider } from "next-auth/react";

config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Sponsor Match",
  description: "Sponsor Match is the perfect platform to match you with the right sponsors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

---

## 8. Registration API

Create `src/app/api/auth/register/route.ts`:

```typescript
// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      organisationName,
      role,
    } = body;

    if (!email || !password || !firstName || !lastName || !organisationName || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const accountTypeId = role === "vcse" ? 2 : 1;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create account first (mysql2 returns [ResultSetHeader, FieldPacket[]] for INSERT)
    const [accountRows] = await pool.execute(
      `INSERT INTO sponsor_match.account (Name, AccountType, Registration, IndustrySector, ContactEmail, CompanyLogo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [organisationName, accountTypeId, "PENDING", "General", email.toLowerCase(), "/placeholder"]
    );
    const accountId = (accountRows as { insertId?: number })?.insertId;
    if (!accountId) {
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }

    // Create user
    await pool.execute(
      `INSERT INTO sponsor_match.user (AccountId, FirstName, LastName, Eamail, HashedPassword, Verified)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [accountId, firstName, lastName, email.toLowerCase(), hashedPassword]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
```

**Note:** With mysql2, `pool.execute()` returns `[ResultSetHeader, FieldPacket[]]` for INSERT. The first element has `insertId`. Adjust the type cast if your mysql2 version differs.

---

## 9. Update Login Page

Replace the `handleSubmit` in `src/app/login/page.tsx` to use NextAuth:

```typescript
// Add import
import { signIn } from "next-auth/react";

// Replace handleSubmit
const handleSubmit = async (e: React.FormEvent) => 
  e.preventDefault();
  setError("");

  if (!validateEmail(email)) {
    setError("Please enter a valid email address");
    return;
  }

  if (password.trim().length === 0) {
    setError("Please enter your password.");
    return;
  }

  const result = await signIn("credentials", {
    email: email.toLowerCase(),
    password,
    redirect: false,
  });

  if (result?.error) {
    setError("Invalid email or password.");
    return;
  }

  if (result?.ok) {
    // Redirect based on account type from session (set in auth callbacks)
    router.push("/vcse/dashboard"); // or /business/dashboard based on session
    router.refresh();
  }
};
```

To redirect by account type, fetch the session after sign-in and redirect accordingly:

```typescript
const result = await signIn("credentials", {
  email: email.toLowerCase(),
  password,
  redirect: false,
});

if (result?.ok) {
  const session = await fetch("/api/auth/session").then((r) => r.json());
  const accountType = session?.user?.accountType;
  if (accountType === 2) {
    router.push("/vcse/dashboard");
  } else {
    router.push("/business/dashboard");
  }
  router.refresh();
}
```

---

## 10. Update Register Page

Add state for `firstName`, `lastName`, and `organisationName`, and wire the form. Replace `handleSubmit`:

```typescript
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [organisationName, setOrganisationName] = useState("");
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (!validateEmail(email)) {
    setError("Please enter a valid email address.");
    return;
  }

  if (!validatePassword(password)) {
    setError(
      "Password must be at least 8 characters and include a symbol and number."
    );
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  if (!firstName.trim() || !lastName.trim() || !organisationName.trim()) {
    setError("Please fill in all required fields.");
    return;
  }

  setIsLoading(true);

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        organisationName: organisationName.trim(),
        role,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed.");
      return;
    }

    // Auto sign-in after registration
    const signInResult = await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });

    if (signInResult?.ok) {
      router.push(role === "vcse" ? "/vcse/dashboard" : "/business/dashboard");
      router.refresh();
    } else {
      router.push("/login");
    }
  } catch {
    setError("Registration failed. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
```

Update the form fields in the register form:

1. **First Name** – add before the email field:
```tsx
<label className="reg-label">First Name <span className="reg-required">*</span></label>
<input className="reg-input" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
```

2. **Last Name** – add after First Name:
```tsx
<label className="reg-label">Last Name <span className="reg-required">*</span></label>
<input className="reg-input" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
```

3. **Organisation/Business Name** – the existing field; add state and wire it:
```tsx
<input className="reg-input" type="text" value={organisationName} onChange={(e) => setOrganisationName(e.target.value)} />
```

4. Add `import { useRouter } from "next/navigation"` and `import { signIn } from "next-auth/react"` at the top, and `const router = useRouter();` inside the component.

---

## 11. Middleware (Optional)

Create `src/middleware.ts` to protect dashboard routes:

```typescript
// src/middleware.ts
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard =
    req.nextUrl.pathname.startsWith("/vcse") ||
    req.nextUrl.pathname.startsWith("/business");

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.url));
  }

  return undefined;
});

export const config = {
  matcher: ["/vcse/:path*", "/business/:path*"],
};
```

---

## 12. Testing

1. **Hash existing passwords:** Current `user` rows have plain text `"password"`. Hash them:

```sql
-- Run a one-off script or use bcrypt in Node:
-- const hash = await bcrypt.hash('password', 10);
-- Then UPDATE user SET HashedPassword = ? WHERE UserId = 1;
```

2. **Register a new user** via the register page.
3. **Log in** with the new credentials.
4. **Verify** redirect to `/vcse/dashboard` or `/business/dashboard` based on role.

---

## Quick Reference: File Structure

```
sponsor_match/
├── auth.config.ts
├── src/
│   ├── auth.ts
│   ├── middleware.ts
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── [...nextauth]/route.ts
│   │   │       └── register/route.ts
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   └── lib/
│       └── db.ts
└── .env.local
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `AUTH_SECRET` missing | Run `npx auth secret` and add to `.env.local` |
| Peer dependency conflict | Use `npm install --legacy-peer-deps` |
| `pool.execute` type error | Cast pool: `(pool as { execute: ... })` |
| Wrong redirect after login | Ensure `accountType` is passed in JWT/session callbacks |
| Registration fails | Check DB connection, column names (`Eamail`), and required fields |
| bcrypt hash too long | Run `ALTER TABLE user MODIFY HashedPassword VARCHAR(255);` |
