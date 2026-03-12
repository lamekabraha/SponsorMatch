# Dashboard API setup: steps and tutorial

How to design and implement a `dashboard` API route that feeds multiple dashboard cards with data from the database. No code here—only steps and decisions.

---

## 1. Choose the API shape: one route vs several

**Option A – Single dashboard route (recommended for “dashboard overview”)**

- One `GET /api/dashboard` (or `/api/dashboard/route`) that returns a **single JSON object** with all data needed for the dashboard (stats + list of campaigns, etc.).
- **Pros:** One request from the page, one place to enforce auth, simpler caching and rate-limiting.
- **Cons:** Response can get large if you add many sections later; you can’t refresh one card without refetching all.

**Option B – One route per “section” or card type**

- Separate routes, e.g. `/api/dashboard/stats`, `/api/dashboard/campaigns`, `/api/dashboard/connections`.
- **Pros:** Front end can fetch only what each section needs; smaller, focused responses; easier to cache per section.
- **Cons:** More requests, more routes to maintain and secure; dashboard load can feel slower if you fire many requests in parallel.

**Recommendation:** Start with **one dashboard route** that returns an object with clear keys (e.g. `stats`, `campaigns`). Add separate routes later only if you need different caching, permissions, or very large payloads per section.

---

## 2. Decide what “dashboard” means for the logged-in account

- The dashboard should show data **for the current user/account only** (e.g. “my” campaigns, “my” stats). So the route must know who is logged in.
- Use the same auth pattern as your other protected APIs (e.g. onboarding): get session (e.g. `getSession()` or `getServerSession(authConfig)`), read `accountId` (or equivalent) from the session, and **never** trust `accountId` from the request body or query.
- If there is no valid session (or no `accountId`), return **401 Unauthorized** and do not run any DB queries for dashboard data.

---

## 3. Define the response shape (contract)

Before implementing the route, write down the JSON structure the front end will receive. This is your “contract” between API and dashboard page.

- **Stats / summary cards:** List the exact keys and types (e.g. `totalRaised: number`, `activeCampaigns: number`, `connections: number`, `avgEngagement: number`). Prefer camelCase for JSON.
- **Campaigns list:** Define one “campaign” object (id, title, org, category, deadline, raised, goal, imageUrl, etc.) and state that the API returns an array of those.
- **Optional sections:** If you plan to add “recent activity”, “connections”, etc., add a short note and optional keys so the contract is stable (e.g. `connections?: Array<…>`).

Keep this in a short doc or comment so both API and front end stay aligned. The dashboard page will use this shape for TypeScript types and for mapping API response into state/props.

---

## 4. Implement the route in steps

**Step 4.1 – Route file and method**

- Use the existing dashboard route file (e.g. `src/app/api/dashboard/route.ts`).
- Implement **GET** only for the overview; use POST only if you later add actions that change data (e.g. “dismiss notification”).

**Step 4.2 – Auth first**

- At the top of the GET handler, get the session.
- If no session or no account identifier (e.g. `accountId`), return **401** with a clear JSON body (e.g. `{ success: false, error: "Unauthorized" }`).
- Do not run any DB logic until auth is confirmed.

**Step 4.3 – Database queries**

- Run one or more queries that:
  - Filter by the **account id** from the session (e.g. “my” campaigns, “my” donations/summaries).
  - Compute or fetch: total raised, count of active campaigns, connections count, average engagement, and the list of campaigns with the fields you defined in the contract.
- Use your existing DB client (e.g. `pool`) and parameterised queries (never concatenate user/session data into SQL).
- If your schema uses different table/column names, map the result rows into the exact keys you defined in the response contract (camelCase, correct types).

**Step 4.4 – Build the response body**

- Build one object that matches your contract: e.g. `{ stats: { totalRaised, activeCampaigns, connections, avgEngagement }, campaigns: [...] }`.
- Return **200** with this object as JSON.
- If something fails after auth (DB error, missing data), return **500** with a generic error message and log the real error server-side only.

**Step 4.5 – Error handling and edge cases**

- No campaigns for this account → return empty arrays and zeros for stats, not an error.
- DB down or query throws → catch, log, return 500 and a safe message so the front end can show “Unable to load dashboard” or retry.

---

# Tutorial: Creating a GET function (Next.js App Router API route)

Step-by-step guide to adding a `GET` handler in a Next.js App Router API route. Use this for read-only endpoints that return JSON (e.g. dashboard data, list of items, single resource).

---

## 1. Where the GET lives

- **Path:** `src/app/api/<your-path>/route.ts`
- **URL:** `GET /api/<your-path>` (e.g. `/api/dashboard`, `/api/users`).
- **Export:** The handler must be a named export: `export async function GET(...)`.

So one file = one route. To add `/api/reports`, create `src/app/api/reports/route.ts` and export `GET` there.

---

## 2. What a GET handler receives

- **Arguments:** `GET(request: NextRequest)` — you get the standard Web `Request`. Use it for:
  - **Query params:** `request.nextUrl.searchParams` (e.g. `?id=1`, `?page=2`).
  - **Headers:** if the client sends auth or other headers.
- For many routes you can define `GET()` with no args if you don’t need the request yet.

---

## 3. Steps to implement the GET function

**Step 3.1 – Imports**

- `NextResponse` from `'next/server'` (for `NextResponse.json()`, status codes).
- If the route is **protected:** your session helper (e.g. `getSession` from `@/auth`).
- If you need the **database:** your DB client (e.g. `pool` from `@/lib/db`).

**Step 3.2 – Auth (for protected routes)**

- Call your session helper (e.g. `await getSession()`).
- If there is no session (or no user/account id), return **401**:
  - `NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })`.
- Only continue to DB or business logic after the session check. Use the session’s user/account id to scope queries (e.g. “only this account’s data”).

**Step 3.3 – Read query params (optional)**

- If the URL has query params (e.g. `?id=5`), read them from `request.nextUrl.searchParams` (e.g. `searchParams.get('id')`).
- Validate or coerce types (e.g. parse id as number). Return **400** if required params are missing or invalid.

**Step 3.4 – Database / business logic**

- Run one or more queries using your DB client. Prefer **parameterised** queries (e.g. `pool.execute('SELECT ... WHERE id = ?', [id])`) so you never concatenate user input into SQL.
- If the route is scoped to the logged-in user, always filter by the account/user id from the session, not from the request.

**Step 3.5 – Shape the response**

- Build a plain object (or array) that matches what the front end expects (your “contract”).
- Return **200** with JSON: `NextResponse.json({ success: true, data: ... })` (or whatever shape you agreed on).
- Use consistent keys (e.g. camelCase) and types so the client can type the response.

**Step 3.6 – Error handling**

- Wrap DB/business logic in `try/catch`.
- On failure: **log** the error server-side (e.g. `console.error`), then return **500** with a generic message: `NextResponse.json({ success: false, error: '...' }, { status: 500 })`.
- Don’t send internal details (stack traces, DB errors) to the client. Return **400** for bad request (e.g. invalid id), **404** if a resource is not found, **401** for auth as above.

---

## 4. Response status codes (quick reference)

| Code | When to use |
|------|---------------------|
| 200  | Success; returning a body. |
| 400  | Bad request (invalid or missing query/params). |
| 401  | Not logged in or session invalid. |
| 404  | Resource not found (e.g. id doesn’t exist). |
| 500  | Server error (DB failure, unexpected error). |

---

## 5. Checklist for a new GET route

| # | Step |
|---|------|
| 1 | Create `src/app/api/<path>/route.ts`. |
| 2 | Import `NextResponse`; add session and DB imports if needed. |
| 3 | Export `export async function GET(request?) { ... }`. |
| 4 | If protected: get session → if no session, return 401. |
| 5 | If using query params: read and validate them; return 400 if invalid. |
| 6 | Run DB queries (parameterised, scoped by session if applicable). |
| 7 | Build response object; return `NextResponse.json(...)` with status 200. |
| 8 | In `catch`: log error, return 500 (or 404 if “not found” is explicit). |

---

## 6. Optional: document the contract

- At the top of the route file (or in a shared doc), write the **response shape** in a comment or type (e.g. `{ success: true, data: { ... } }`). Your dashboard route already does this with a JSON comment. That keeps the GET contract clear for both the API and the front end.

---

## 7. Testing the GET function

- **Browser:** Open `http://localhost:3000/api/<your-path>` (and add query params if needed). For protected routes you must be logged in (cookies) or the request will get 401.
- **Terminal:** `curl -i http://localhost:3000/api/<your-path>` (use `-b` to send cookies if the route is protected).
- **Front end:** Use `fetch('/api/<your-path>', { credentials: 'include' })` (or default same-origin) and parse the JSON; handle non-200 and `success: false` in your UI.

Once the GET function follows these steps, you can reuse the same pattern (auth → params → DB → response → errors) for other read-only API routes.


---

## 5. Wire the dashboard page to the API

- In the dashboard page (client component), on mount (or when a “refresh” is needed), **fetch** `GET /api/dashboard` (or the path you chose).
- Send credentials if your app uses cookies (e.g. `fetch(..., { credentials: 'include' })` or rely on default cookie behaviour for same-origin).
- Parse JSON and validate or cast to the TypeScript types you defined from the contract.
- Put stats into state (or context) and pass them into the stat cards; pass the campaigns array into the list/card component. Replace hardcoded stats and campaign lists with this data.
- Handle loading (show skeletons or “Loading…”) and errors (show a message and optionally a retry button). Do not assume the response is always 200.

---

## 6. Optional improvements (later)

- **Caching:** Add short-lived cache headers on the dashboard response (e.g. `Cache-Control: private, max-age=60`) so the browser doesn’t refetch every time, or use React Query / SWR with a short stale time.
- **Revalidation:** If the dashboard page is a Server Component, you could fetch in the server and pass data as props, and use route segment config or `revalidate` to refresh periodically; for a client dashboard, the fetch-on-mount + optional manual refresh is usually enough to start.
- **Separate routes later:** If one section (e.g. “connections”) becomes heavy or has different permissions, split it into e.g. `GET /api/dashboard/connections` and call it from the same page; keep auth and session checks consistent.

---

## 7. Checklist summary

| Step | Action |
|------|--------|
| 1 | Choose one dashboard route vs multiple; recommend one route to start. |
| 2 | Enforce auth: session + account id; 401 when not logged in. |
| 3 | Define response contract (stats + campaigns + any optional sections). |
| 4.1 | Implement GET in the dashboard route file. |
| 4.2 | Add session check; return 401 if unauthenticated. |
| 4.3 | Run DB queries scoped by account id; use parameterised queries. |
| 4.4 | Return 200 with JSON matching the contract; 500 on server errors. |
| 4.5 | Handle “no data” with empty arrays/zeros; log errors server-side only. |
| 5 | On the dashboard page, fetch the API, handle loading/error, replace hardcoded data. |
| 6 (optional) | Add caching or split routes later if needed. |

Following this keeps your dashboard API secure, consistent with your auth, and easy to extend when you add more cards or sections.
