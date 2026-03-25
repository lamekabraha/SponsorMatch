# Business User Dashboard – Wireframe

A wireframe for the **business/sponsor** view of SponsorMatch, aligned with the existing VCSE dashboard layout and design system.

---

## 1. Role difference at a glance

| VCSE (current) | Business (this wireframe) |
|----------------|---------------------------|
| "Your Campaigns Dashboard" | "Your Sponsorship Dashboard" |
| Create Campaign (primary CTA) | Discover Campaigns / Browse (primary CTA) |
| My campaigns, total raised, active campaigns | My sponsorships, total donated, VCSEs connected |
| Campaign cards = campaigns I run | Campaign cards = campaigns I support + recommended to support |

---

## 2. Layout (same structure as VCSE)

Use the same **header → mode banner → title row → metrics cards → filters → card grid** flow so one codebase can serve both roles (e.g. same page with role from session, or `/dashboard/business`).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]  SponsorMatch          Dashboard    Discover Campaigns    [🔔] [👤]  │  ← Yellow header
├─────────────────────────────────────────────────────────────────────────────┤
│  Prototype Mode: Currently viewing as Business              [Switch View]    │  ← Light yellow banner
├─────────────────────────────────────────────────────────────────────────────┤
│  Your Sponsorship Dashboard                    [+ Discover Campaigns]        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ £ Total      │ │ Campaigns    │ │ VCSE         │ │ Avg.         │        │
│  │ Sponsored    │ │ Supported    │ │ Connections  │ │ Engagement   │        │
│  │ £12,400      │ │ 5            │ │ 8            │ │ 92%          │        │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Search campaigns...]        [All Categories ▾]        [More Filters]      │
├─────────────────────────────────────────────────────────────────────────────┤
│  My sponsorships (or "Recommended for you" / tabs)                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                │
│  │ [Campaign img]  │ │ [Campaign img]  │ │ [Campaign img]  │                │
│  │ Environment     │ │ Education       │ │ Poverty Relief  │                │
│  │ Campaign title  │ │ Campaign title  │ │ Campaign title  │                │
│  │ Org name        │ │ Org name        │ │ Org name        │                │
│  │ £X of £Y • Z%   │ │ £X of £Y • Z%   │ │ £X of £Y • Z%   │                │
│  │ You gave: £500  │ │ You gave: £1k   │ │ Sponsor packages│                │
│  │ [View Campaign] │ │ [View Campaign] │ │ [Sponsor / View]│                │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Header & navigation

- **Same yellow bar**: Logo left, nav centre, notifications + profile right.
- **Primary nav for business:**
  - **Dashboard** (current page, underlined).
  - **Discover Campaigns** (replaces “Create Campaign” as main action; can link to `/search` or a business-focused browse).
- **Hamburger / dropdown** (if used): same as VCSE but swap “Create Campaign” for “Discover Campaigns” and optionally add “My Sponsorships” or “Favourites”.

---

## 4. Mode banner

- **Copy:** `Prototype Mode: Currently viewing as Business`
- **Action:** `Switch View` → toggles to VCSE view (or vice versa). Same as current implementation.

---

## 5. Title row

- **Title:** `Your Sponsorship Dashboard`
- **CTA button:** `Discover Campaigns` (plus icon optional). Links to search/browse. No “Create Campaign” here.

---

## 6. Summary cards (four, same visual style as VCSE)

| Card | Label | Example value | Data source (conceptual) |
|------|--------|----------------|---------------------------|
| 1 | **Total Sponsored** | £12,400 | Sum of business’s donations |
| 2 | **Campaigns Supported** | 5 | Count of distinct campaigns they’ve donated to |
| 3 | **VCSE Connections** | 8 | Count of VCSE accounts they’re connected to (e.g. follow or have sponsored) |
| 4 | **Avg. Engagement** | 92% | Engagement on campaigns they’ve supported (or leave blank / “—” until defined) |

- Same icon style: one icon per card (e.g. £, calendar/list, people, chart).
- Same layout: four equal-width cards in one row, responsive stack on small screens.

---

## 7. Search and filters

- **Search:** `Search campaigns...` (search across campaigns they’ve supported and/or recommended).
- **Category:** `All Categories` dropdown (Environment, Education, Poverty Relief, Sports, etc.).
- **More Filters:** Funnel icon + “More Filters” (e.g. date range, amount range, VCSE, status). Same pattern as VCSE dashboard.

---

## 8. Main content: campaign cards

Two possible sections (can be tabs or two rows):

### Option A – Single list with mixed types

- One grid of cards.
- Each card can show a small “You sponsored: £X” badge when the business has donated to that campaign; otherwise show sponsorship packages and “Sponsor” or “View Campaign”.

### Option B – Tabs (recommended for clarity)

1. **My Sponsorships**
   - Campaigns the business has already supported.
   - Card content: same as VCSE (image, category, deadline, title, org, progress bar, packages).
   - Extra line: **You gave: £X** (and optionally tier name, e.g. “Gold”).
   - Button: **View Campaign** (to see impact/updates).

2. **Recommended for you**
   - Campaigns they haven’t (or have barely) supported, matched by category/interest.
   - Same card layout; no “You gave” line.
   - Button: **View Campaign** or **Sponsor** (primary).

Card layout (reuse VCSE card structure):

- Top: Category tag (left), Deadline (right).
- Image: campaign cover.
- Title, org name.
- Progress: “X% Funded”, bar, “£ raised of £ goal”.
- **Business-specific:** “You gave: £X” (for My Sponsorships) or list of sponsorship packages (for Recommended).
- Bottom: **View Campaign** / **Sponsor**.

---

## 9. Empty states

- **No sponsorships yet:** “You haven’t sponsored any campaigns yet. Discover campaigns that match your values.” + prominent “Discover Campaigns” button.
- **No recommendations:** “Check back later for new campaigns” or “Adjust your preferences in My Account”.

---

## 10. API / data needs (for implementation)

Business dashboard will need a **business-scoped** dashboard API (e.g. `GET /api/dashboard` with session indicating business account, or `GET /api/dashboard/business`):

- **Stats:** `totalSponsored`, `campaignsSupported`, `vcseConnections`, `averageEngagement` (or omit engagement until defined).
- **My sponsorships:** List of campaigns the business has donated to, with donation amount (and tier if applicable).
- **Recommended:** List of campaigns (e.g. by category, open status, not yet fully funded), optionally filtered by business preferences.

Reuse existing campaign card fields (id, title, description, image, raised, goal, deadline, category, org); add for business:

- `myDonationAmount`, `myTierName` (for sponsored campaigns).
- Optional: `isRecommended` or section key so the front end can render “My Sponsorships” vs “Recommended” from one list.

---

## 11. Navbar / menu (business variant)

When the user is in “Business” mode, the main nav and hamburger menu should show:

- Dashboard  
- Discover Campaigns (or Search)  
- My Sponsorships (optional; could be same as Dashboard with “My Sponsorships” tab active)  
- Favourites  
- My Account  
- Logout  

Hide or de-emphasise “Create Campaign” and “My Campaign” for business users (or show only after “Switch View” to VCSE).

---

## 12. Visual design (unchanged)

- Reuse VCSE design tokens: `--yellow`, `--bg`, `--text`, `--muted`, `--card`, `--border`.
- Same header, banner, title, button and card styles so the business dashboard feels like the same product, different role.

---

## 13. Next steps

1. **Backend:** Add business dashboard API (stats + “my sponsorships” + “recommended” campaigns) keyed by `accountId` and account type (business).
2. **Front end:** Add role/mode to dashboard page (or separate route); render title, metrics labels, and CTAs per role; reuse `DashboardCampaignCard` with optional “You gave” and “Sponsor” props.
3. **Navbar:** Swap “Create Campaign” for “Discover Campaigns” when in business mode; optionally add “My Sponsorships”.
4. **Switch View:** Ensure “Switch View” continues to toggle between Business and VCSE and updates dashboard content and nav accordingly.

This wireframe keeps the same layout and components as the VCSE dashboard while shifting copy, metrics, and primary actions to a business/sponsor perspective.
