# Onboarding Flow — Breakdown Explanation

This document explains how the **SponsorMatch** onboarding flow works from entry to dashboard, and what each step does for each account type.

---

## 1. High-level flow

```
Registration (/register)
    → User picks role (Corporate Partner | Community Organisation)
    → Submits account details (name, email, password, etc.)
    → API creates account and returns session
    → Redirect to /register/onboarding

Onboarding (/register/onboarding)
    → Session checked (redirect to /login if not logged in)
    → Account type from session (1 = Business, 2 = VCSE)
    → OnboardingWizard shows the right step sequence
    → User completes each step (forms POST to APIs)
    → On last step completion → redirect to /dashboard
```

---

## 2. Entry points and guards

| Where | What happens |
|-------|----------------|
| **`/register`** (`register/page.tsx`) | User chooses **Corporate Partner** (`business`) or **Community Organisation** (`vcse`), fills form, submits. On success: `signIn('credentials', ...)` then `router.push('/register/onboarding')`. |
| **`/register/onboarding`** (`onboarding/page.tsx`) | **Server component**: `getServerSession(authConfig)`. If no session → `redirect('/login')`. Reads `accountTypeId` from session (default `2`), maps to `1 \| 2` and passes to `OnboardingWizard`. Renders Navbar, welcome copy, and the wizard in a card. |

**Account type mapping (from API/session):**

- `accountTypeId === 1` → **Business** (Corporate Partner)
- `accountTypeId === 2` (or anything else) → **VCSE** (Community Organisation)

---

## 3. OnboardingWizard — step selection and navigation

**File:** `register/onboarding/OnboardingWizard.tsx` (client component)

- **Input:** `accountType: 1 | 2`
- **Logic:**
  - `steps = accountType === 2 ? VCSE_STEPS : BUSINESS_STEPS`
  - `currentStep` state (1-based); advancing is done by the step form calling `onComplete`.
- **When a step completes:** `handleStepComplete()` either:
  - moves to the next step (`setCurrentStep(s => s + 1)`), or
  - if already on the last step, redirects to `/dashboard` and calls `router.refresh()`.

**UI:**

- Progress text: “Step X of Y”
- Step tabs: numbered steps with titles; current = dark, completed = yellow tint, upcoming = grey
- Step title and the current step’s component (or `StepPlaceholder` if no component)

Each step component receives `onComplete: () => void` and is responsible for validating, submitting (e.g. POST), then calling `onComplete()` to move on (or the wizard sends the user to dashboard on the last step).

---

## 4. VCSE onboarding (Community Organisation) — 4 steps

| Step | Title | Component | Purpose |
|------|--------|-----------|---------|
| 1 | **Basic** | `BasicInfoForm` (`vcse/basic_info/BasicInfoForm.tsx`) | Organisation type (from API), address, primary focus areas (multi-select), registration number. POST to `/api/auth/register/onboarding/vcse/basic_info`. |
| 2 | **Branding** | `BrandingForm` (`vcse/branding/BrandingForm.tsx`) | Logo (required) and optional cover image via drag-and-drop. POST to `/api/auth/register/onboarding/vcse/branding` (FormData). |
| 3 | **Contact** | `ContactForm` (`vcse/contact/ContactForm.tsx`) | Primary contact name, email, phone; optional additional admins. POST to `/api/auth/register/onboarding/vcse/contact`. |
| 4 | **Verification** | `VerificationForm` (`vcse/verification/VerificationForm.tsx`) | Upload verification document. POST to `/api/auth/register/onboarding/vcse/verification` (FormData). On success, wizard’s `onComplete` runs and user is sent to `/dashboard`. |

---

## 5. Business onboarding (Corporate Partner) — 3 steps

| Step | Title | Component | Purpose |
|------|--------|-----------|---------|
| 1 | **Company Details** | `BusinessBasicInfoForm` (`business/basic_info/BasicInfoForm.tsx`) | Company address, industry, company size, optional website. POST to `/api/auth/register/onboarding/business/basic_info`. |
| 2 | **Branding** | `BusinessBrandingForm` (`business/branding/BrandingForm.tsx`) | Logo (required), optional cover image and description. Currently POSTs to the same VCSE branding API; can be switched to a business-specific endpoint later. |
| 3 | **Preferences** | `Preferences` (`business/preferences/PrefForm.tsx`) | Organisation types they want to support (from `/api/auth/register/onboarding/OrgTypes`) and campaign benefit types (from `/api/campaign/BenefitTypes`). Multi-select; POST to business preferences API. On success, wizard sends user to `/dashboard`. |

---

## 6. Step components — common pattern

- Each step is a form that:
  1. Validates required fields (and shows alerts or inline errors).
  2. Submits to a dedicated onboarding API (POST).
  3. On success: calls `onComplete()` if provided (wizard flow), else some use `router.push(...)` and `router.refresh()` for standalone use.
- Shared UI patterns: labels, inputs, “Next” / “Submit” button, optional loading state.

---

## 7. StepPlaceholder

**File:** `register/onboarding/StepPlaceholder.tsx`

Used when a step is defined in the wizard config but has no component (e.g. a step that’s not implemented yet). It shows “Coming soon: [step name]” and a “Next” button that calls `onComplete()` so the user can skip and the wizard can still advance.

---

## 8. Flow diagram (simplified)

```
[Register page]
  → Choose: Business | VCSE
  → Submit credentials + account name
  → API register → signIn → redirect

[Onboarding page]
  → Auth check (session) → get accountType
  → OnboardingWizard(accountType)

  VCSE (accountType === 2):
    Step 1: Basic (org type, address, focus areas, reg number)
    Step 2: Branding (logo, cover)
    Step 3: Contact (name, email, phone, admins)
    Step 4: Verification (document upload)
    → Dashboard

  Business (accountType === 1):
    Step 1: Company Details (address, industry, size, website)
    Step 2: Branding (logo, cover, description)
    Step 3: Preferences (org types, benefit types)
    → Dashboard
```

---

## 9. File reference

| Path | Role |
|------|------|
| `register/page.tsx` | Registration form; redirects to onboarding after sign-in |
| `register/onboarding/page.tsx` | Onboarding route; auth guard; renders wizard |
| `register/onboarding/OnboardingWizard.tsx` | Step config (VCSE vs Business), progress UI, step rendering, `onComplete` → next or dashboard |
| `register/onboarding/StepPlaceholder.tsx` | “Coming soon” step with Next button |
| `register/onboarding/vcse/basic_info/BasicInfoForm.tsx` | VCSE basic info |
| `register/onboarding/vcse/branding/BrandingForm.tsx` | VCSE branding (logo/cover) |
| `register/onboarding/vcse/contact/ContactForm.tsx` | VCSE contact |
| `register/onboarding/vcse/verification/VerificationForm.tsx` | VCSE verification doc |
| `register/onboarding/business/basic_info/BasicInfoForm.tsx` | Business company details |
| `register/onboarding/business/branding/BrandingForm.tsx` | Business branding |
| `register/onboarding/business/preferences/PrefForm.tsx` | Business preferences |

Session and account type are provided by NextAuth (`auth.config.ts`, `auth.ts`) and the register API (`accountType` → `accountTypeId` 1 or 2).
