"use client";

import PreferencesForm from "@/app/register/onboarding/business/preferences/PrefForm";

/**
 * Test page for PrefForm - no auth required.
 * Visit /test/preferences to test the form without logging in.
 */
export default function TestPreferencesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center py-10 px-4 font-Body">
      <div className="text-center mb-[18px]">
        <h1 className="text-3xl font-Heading font-bold text-Black mt-10">
          Test: Preferences Form
        </h1>
        <p className="text-xs text-Black/65 mt-2 font-Body">
          No session required. Submit will fail with 401 if not logged in.
        </p>
      </div>
      <div className="w-[420px] max-w-[92vw] bg-White border border-Black/12 border-t-[5px] border-t-Yellow rounded-[10px] p-6 shadow-[0_8px_25px_rgba(0,0,0,0.05)]">
        <PreferencesForm
          onComplete={() => alert("Form completed (test mode)")}
        />
      </div>
    </div>
  );
}
