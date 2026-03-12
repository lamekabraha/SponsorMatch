# Interaction table: SwipeType and Status columns

**Note:** The `interaction` table schema is not defined in this repo (no CREATE TABLE or Prisma model). The explanation below is based on common patterns in matching/swipe-style apps and on how your code uses “swipe” (e.g. `swipeStatus` in the dashboard contract). If your actual table differs, add your DDL or schema doc to the repo and we can align this.

---

## What the interaction table is likely for

In an app like SponsorMatch, an **interaction** usually records one user’s action toward another entity (e.g. a campaign or another account)—e.g. “Account A swiped on Campaign X” or “Account A swiped on Account B.” Each row is one such action.

---

## SwipeType (or swipe_type)

**Typical meaning:** The *kind* of swipe or action.

Common patterns:

| Value / enum   | Meaning |
|----------------|--------|
| **like** / **right** / **yes** | User expressed interest (e.g. “interested in this campaign” or “like”). |
| **pass** / **left** / **no**    | User declined or skipped. |
| **superlike** / **boost**       | (Optional) Stronger interest, if you support it. |

- **Storage:** Often a string/enum (`'like'`, `'pass'`) or a tinyint with a lookup (e.g. `1 = like`, `2 = pass`).
- **Use in app:** To show “favourites” or “interested” lists (only `like`), to hide “passed” items, and to drive matching (e.g. “match when both sides have liked”).

So **SwipeType** answers: *what did this user do?* (like vs pass, etc.)

---

## Status

**Typical meaning:** The *state* of that interaction or of the resulting relationship.

Common patterns:

| Value / enum   | Meaning |
|----------------|--------|
| **pending** / **active** | Interaction recorded, not yet acted on (e.g. no “match” yet). |
| **matched** / **accepted** | Both sides liked (or equivalent); treated as a connection/match. |
| **rejected** / **dismissed** | One side passed or later rejected. |
| **expired** | No longer valid (e.g. time-limited offer). |

- **Storage:** Often a string/enum or a small int with a lookup.
- **Use in app:** To decide what to show (e.g. “Connections” = status = matched), what to count in dashboard stats, and whether to allow further actions.

So **Status** answers: *where does this interaction stand in the workflow?* (pending vs matched vs rejected, etc.)

---

## How this fits your codebase

- The dashboard JSON contract has **`swipeStatus`** on campaign items (boolean). That likely means “has the current user liked/favourited this campaign?” and can be derived from the interaction table (e.g. “exists a row for this user + campaign with SwipeType = like”).
- **GetInteraction** in the dashboard route is intended to use the interaction table (e.g. count or aggregate by SwipeType/Status). To implement it correctly you need the real table and column names (e.g. `SwipeType`, `Status`, and whether they are enums, strings, or ints).

---

## What to add so this is definitive

1. **Table definition:** Add a SQL snippet or schema doc for `interaction`, for example:
   - Column names (e.g. `SwipeType`, `SwipeTypeId`, `Status`, `StatusId`).
   - Types and allowed values (enum, string, or int + meaning).
   - Foreign keys (e.g. AccountId, CampaignId or FollowId).
2. **Naming:** Confirm whether the DB uses `SwipeType` or `swipe_type` (and same for Status) so queries and docs match.

Once that’s in the repo, this doc can be updated to describe your exact **SwipeType** and **Status** columns and values.
