# Tutorial: Implementing the Dashboard Search

This tutorial explains how to implement the search function for the dashboard “Search campaigns…” input. It does not contain code—only steps and decisions.

---

## 1. Decide: client-side vs server-side search

**Client-side search**

- The dashboard already fetches all campaigns for the user in one request (`/api/dashboard`). You filter that list in the browser using the search text (and optionally the category dropdown).
- **Pros:** Instant feedback, no extra API calls, works offline once data is loaded, simple to add.
- **Cons:** Only searches the campaigns already returned (e.g. current user’s campaigns). If the list grows very large (hundreds of items), filtering in the browser is still usually fast.

**Server-side search**

- The user’s search term (and filters) are sent to the API; the database returns only matching campaigns.
- **Pros:** Scales to large datasets; you can search across more fields or full text in the DB.
- **Cons:** Requires API changes, more requests, and handling loading/empty states per request.

**Recommendation for your current dashboard:** Start with **client-side search**. You already have `dashboardData.campaigns` in state; search can filter that array. Add server-side search later if the list grows or you need to search across more data.

---

## 2. Add state for the search term

Right now the search input is uncontrolled (no React state). To drive both the input and the filtered list:

- Add a state variable for the **search query** (e.g. a string, initially empty).
- **Controlled input:** Bind the input’s value to this state and update the state in an `onChange` handler so that typing updates the query.
- Optionally add state for the **category filter** (the select’s value) so you can combine “search text” and “category” when filtering. If the select is already controlled and you store its value in state, reuse that.

---

## 3. Decide which fields to search

Your campaign objects have at least: `CampaignName`, `Type` (category), and possibly `Description` or organisation name depending on what the API returns.

- **Minimum:** Search by **campaign title** (`CampaignName`). Normalise by trimming and lowercasing both the query and the title so “Sports” matches “sports”.
- **Better:** Also match against **category** (`Type`) and, if present, **description** or **organisation** so “Education” or “Tech” finds relevant campaigns even if the title doesn’t contain that word.
- **Matching:** Use a simple “includes” check on the normalised string, or split the query by spaces and require every word to appear in at least one of the chosen fields.

---

## 4. Derive the filtered list

Do not replace `dashboardData.campaigns` in state with the filtered list. Keep the full list as the source of truth and **derive** the list that the grid shows:

- **Inputs:** `dashboardData.campaigns`, the search query string, and (if you use it) the selected category from the dropdown.
- **Logic:** From the full campaigns array, keep only items that:
  - match the search query (title and/or other fields as above), and
  - match the selected category (if a category is selected; “All” means no category filter).
- **Output:** A single filtered array used only for rendering the campaign cards.

That way, when the user clears the search or changes the category, the list updates without refetching.

---

## 5. Where to put the filtering logic

- **Option A – In the render:** Compute the filtered array in the component body (e.g. filter `dashboardData.campaigns` with the current query and category). Simple, but the array is recreated on every render.
- **Option B – useMemo:** Compute the filtered array inside `useMemo`, with dependencies `[dashboardData?.campaigns, searchQuery, selectedCategoryId]`. React recalculates only when one of these changes. Prefer this so filtering doesn’t run on every keystroke more than necessary and keeps the component easy to read.

Use the filtered array (not `dashboardData.campaigns`) when you map over campaigns to render the cards. The stats (Total Raised, Active Campaigns, etc.) can stay based on the full list so they don’t change when the user searches.

---

## 6. Wire the UI to the filtered list

- **Search input:** Value = search state, `onChange` = update search state (and optionally trim on submit if you add a “Search” button).
- **Category select:** If you want it to participate in filtering, its value should be stored in state and used in the same filtering step as the search query (e.g. when “All” is selected, don’t filter by category; otherwise keep only campaigns whose `CampaignTypeId` or `Type` matches the selection).
- **Campaign grid:** Map over the **derived filtered list** (from step 4), not `dashboardData.campaigns`. Each card still receives the same props as now; only the list you iterate over changes.

---

## 7. Empty state and trimming

- **Empty result:** When the filtered list has length 0, show a short message (e.g. “No campaigns match your search”) so the user knows the list is intentionally empty rather than still loading.
- **Trim query:** When comparing, trim the search string and treat empty string as “no search” (show all campaigns, subject to category filter). You can trim on every change or only when applying the filter; trimming when comparing is enough.

---

## 8. Optional: debouncing (if you add server-side search later)

If you later move search to the server:

- Don’t send a request on every keystroke. Keep a **debounced** value: update the “effective” search term only after the user has stopped typing for a short period (e.g. 300 ms). Use that debounced value for the API call. For client-side-only search, debouncing is optional and often unnecessary.

---

## 9. Summary checklist

1. Add state for the search query (and optionally for the category select).
2. Make the search input controlled (value + onChange).
3. Choose which fields to search (at least `CampaignName`; consider `Type`, description, org).
4. Implement one place that, given the full campaigns list, search query, and category, returns a filtered array (normalise strings for case/trim).
5. Use `useMemo` to compute that filtered array from `campaigns`, `searchQuery`, and `selectedCategory`.
6. Render the campaign cards from the filtered array; keep stats based on the full list.
7. Show an empty state when the filtered list is empty.
8. (Later) If you move to server-side search, add debouncing and call the API with the debounced query.

After this, the existing “Search campaigns…” input will drive a live filter over the dashboard campaigns without any new API or backend changes.
