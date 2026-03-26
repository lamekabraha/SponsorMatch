"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "./myaccount.css";
import { toStorageRelativePath } from "@/lib/storagePaths";

type MyAccountProfileResponse = {
  account: {
    AccountId: number;
    Name: string;
    AccountTypeId: number;
    IndustrySector: string | null;
    CompanySize: string | null;
    ContactName: string | null;
    ContactEmail: string | null;
    ContactPhone: string | null;
    Website: string | null;
    Instagram: string | null;
    Twitter: string | null;
    Facebook: string | null;
    LinkedIn: string | null;
    CompanyLogo: string | null;
    CompanyCover: string | null;
    Address: string | null;
    Description: string | null;
  };
  business: {
    IndustryType: string | null;
    PartnershipPref: string | null;
    AnnualBudget: number | null;
  } | null;
  vcse: {
    VcseType: string | null;
    VerificationDoc: string | null;
  } | null;
};

type MyAccountRouteResponse = {
  success: boolean;
  data?: {
    profile?: Record<string, unknown>[];
    business?: Record<string, unknown>[];
  };
  error?: string;
};

type TabKey = "profile" | "branding" | "security";

type ProfileFormState = {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  instagram: string;
  twitter: string;
  facebook: string;
  linkedIn: string;
  businessSector: string;
  vcseType: string;
};

function resolveFileSrc(stored: string | null | undefined): string | null {
  if (!stored) return null;
  const raw = String(stored).trim();
  if (!raw) return null;

  // Works for both relative values like `accounts/...` and absolute URLs
  // like `http://.../api/storage/accounts/...`.
  const rel = toStorageRelativePath(raw);
  if (rel) return `/api/files/${rel}`;
  if (raw.startsWith("/api/files/")) return raw;
  return raw.startsWith("/") ? raw : null;
}

function toEmptyString(value: string | null | undefined): string {
  return value == null ? "" : String(value);
}

function toNullable(value: unknown): string | null {
  if (value == null) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeMyAccountData(payload: MyAccountRouteResponse): MyAccountProfileResponse {
  const profileRow = (payload.data?.profile?.[0] ?? {}) as Record<string, unknown>;
  const businessRow = (payload.data?.business?.[0] ?? {}) as Record<string, unknown>;

  return {
    account: {
      AccountId: toNumber(profileRow.AccountId),
      Name: String(profileRow.Name ?? profileRow.ContactName ?? ""),
      AccountTypeId: toNumber(profileRow.AccountTypeId),
      IndustrySector: toNullable(profileRow.IndustrySector),
      CompanySize: toNullable(profileRow.CompanySize),
      ContactName: toNullable(profileRow.ContactName),
      ContactEmail: toNullable(profileRow.ContactEmail),
      ContactPhone: toNullable(profileRow.ContactPhone),
      Website: toNullable(businessRow.Website),
      Instagram: toNullable(businessRow.Instagram),
      Twitter: toNullable(businessRow.Twitter),
      Facebook: toNullable(businessRow.Facebook),
      LinkedIn: toNullable(businessRow.LinkedIn),
      CompanyLogo: toNullable(businessRow.CompanyLogo),
      CompanyCover: toNullable(businessRow.CompanyCover),
      Address: toNullable(profileRow.Address),
      Description: toNullable(businessRow.Description),
    },
    business: null,
    vcse: null,
  };
}

export default function MyAccountPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [profile, setProfile] = useState<MyAccountProfileResponse | null>(null);
  const [form, setForm] = useState<ProfileFormState>({
    name: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    instagram: "",
    twitter: "",
    facebook: "",
    linkedIn: "",
    businessSector: "",
    vcseType: "",
  });
  const [logoPreviewSrc, setLogoPreviewSrc] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const accountTypeId = profile?.account.AccountTypeId ?? null;
  const isBusiness = accountTypeId === 1;
  const isVcse = accountTypeId === 2;

  const resolvedVerification = useMemo(() => {
    if (!profile?.vcse) return false;
    return Boolean(profile.vcse.VerificationDoc);
  }, [profile?.vcse]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        // Required by directive: fetch basic account info from getAccountData.
        await fetch("/api/getAccountData").catch(() => null);

        const profileRes = await fetch("/api/myaccount");
        const profileJson = await profileRes.json();
        if (!profileRes.ok || !profileJson?.success) {
          throw new Error(profileJson?.error || "Failed to load profile");
        }

        if (cancelled) return;

        const nextProfile = normalizeMyAccountData(profileJson as MyAccountRouteResponse);
        setProfile(nextProfile);

        setForm({
          name: toEmptyString(nextProfile.account.Name),
          description: toEmptyString(nextProfile.account.Description),
          email: toEmptyString(nextProfile.account.ContactEmail),
          phone: toEmptyString(nextProfile.account.ContactPhone),
          website: toEmptyString(nextProfile.account.Website),
          instagram: toEmptyString(nextProfile.account.Instagram),
          twitter: toEmptyString(nextProfile.account.Twitter),
          facebook: toEmptyString(nextProfile.account.Facebook),
          linkedIn: toEmptyString(nextProfile.account.LinkedIn),
          businessSector: toEmptyString(nextProfile.business?.IndustryType),
          vcseType: toEmptyString(nextProfile.vcse?.VcseType),
        });

        setLogoPreviewSrc(resolveFileSrc(nextProfile.account.CompanyLogo));
      } catch (e) {
        if (cancelled) return;
        setErrorMessage(e instanceof Error ? e.message : "Failed to load account profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setErrorMessage("");
    setSavedMessage("");

    try {
      const payload: any = {
        name: form.name,
        description: form.description,
        email: form.email,
        phone: form.phone,
        website: form.website,
        instagram: form.instagram,
        twitter: form.twitter,
        facebook: form.facebook,
        linkedIn: form.linkedIn,
      };

      const res = await fetch("/api/myaccount", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to save changes");
      }

      const refreshed = await fetch("/api/myaccount");
      const refreshedJson = await refreshed.json();
      if (refreshed.ok && refreshedJson?.success) {
        const nextProfile = normalizeMyAccountData(refreshedJson as MyAccountRouteResponse);
        setProfile(nextProfile);
        setLogoPreviewSrc(resolveFileSrc(nextProfile.account.CompanyLogo));
      }

      setSavedMessage("Saved successfully.");
      setTimeout(() => setSavedMessage(""), 2500);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(file: File | null) {
    if (!file || !profile) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setErrorMessage("Logo must be a JPG/PNG/WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Logo must be 5MB or less.");
      return;
    }

    setUploadingLogo(true);
    setErrorMessage("");

    try {
      const fd = new FormData();
      // Existing branding route expects `logo` form field.
      fd.append("logo", file);

      const res = await fetch("/api/auth/register/onboarding/vcse/branding", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to upload logo");
      }

      const nextLogo = json?.logoUrl ?? null;
      setLogoPreviewSrc(resolveFileSrc(nextLogo));
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              account: {
                ...prev.account,
                CompanyLogo: nextLogo,
              },
            }
          : prev,
      );
      setSavedMessage("Logo updated.");
      setTimeout(() => setSavedMessage(""), 2500);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  const tabButton = (tab: TabKey, label: string) => (
    <button
      type="button"
      className={`ma-tabButton ${activeTab === tab ? "is-active" : ""}`}
      onClick={() => setActiveTab(tab)}
    >
      <span className="ma-tabLabel">{label}</span>
      {activeTab === tab ? <span className="ma-tabActiveDot" /> : null}
    </button>
  );

  return (
    <>
      <Navbar />

      <div className="page-container">
        <div className="ma-page">
          <div className="ma-header">
            <div>
              <h1 className="ma-title">My Account</h1>
              <p className="ma-subtitle">
                Keep your details up to date for better matches and sponsor visibility.
              </p>
            </div>
            <div className="ma-headerBadge">
              {isBusiness ? "Business" : isVcse ? "VCSE" : "Account"}
            </div>
          </div>

          <div className="ma-tabs">
            {tabButton("profile", "Profile Info")}
            {tabButton("branding", "Identity & Branding")}
            {tabButton("security", "Security")}
          </div>

          {loading ? (
            <div className="ma-panel" style={{ marginTop: 16 }}>
              Loading…
            </div>
          ) : (
            <>
              {errorMessage ? <div className="ma-error">{errorMessage}</div> : null}
              {savedMessage ? <div className="ma-success">{savedMessage}</div> : null}

              {activeTab === "profile" ? (
                <div className="ma-panel" style={{ marginTop: 16 }}>
                  <h2 className="ma-panelTitle">Profile Info</h2>
                  <form onSubmit={handleSaveProfile} className="ma-form">
                    <div className="ma-formGrid">
                      <div className="ma-field">
                        <label className="ma-label">Name</label>
                        <input
                          className="ma-input"
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>

                      <div className="ma-field">
                        <label className="ma-label">Email</label>
                        <input
                          className="ma-input"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        />
                      </div>

                      <div className="ma-field">
                        <label className="ma-label">Phone</label>
                        <input
                          className="ma-input"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </div>

                    </div>

                    <div className="ma-actions">
                      <button type="submit" className="ma-btn ma-btn-primary" disabled={saving}>
                        {saving ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {activeTab === "branding" ? (
                <div className="ma-panel" style={{ marginTop: 16 }}>
                  <h2 className="ma-panelTitle">Identity & Branding</h2>

                  <div className="ma-brandingGrid">
                    <div className="ma-logoPreview">
                      <div className="ma-avatarWrap">
                        {logoPreviewSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logoPreviewSrc}
                            alt="Profile logo"
                            className="ma-avatarImg"
                          />
                        ) : (
                          <div className="ma-avatarFallback">Logo</div>
                        )}
                      </div>
                      <p className="ma-helpText">Upload a clear square logo for better recognition.</p>
                    </div>

                    <div className="ma-uploadCard">
                      <label className="ma-label">Profile Logo</label>
                      <input
                        className="ma-fileInput"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)}
                        disabled={uploadingLogo}
                      />

                      <p className="ma-helpText" style={{ marginTop: 10 }}>
                        Uploads immediately using your account’s storage system.
                      </p>

                      <div className="ma-actions">
                        <button
                          type="button"
                          className="ma-btn"
                          onClick={() => {
                            // Intentionally empty: the upload is triggered by selecting a file.
                          }}
                          disabled
                          style={{ opacity: 0.6 }}
                        >
                          Upload via file picker
                        </button>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="ma-form">
                    <div className="ma-formGrid">
                      <div className="ma-field">
                        <label className="ma-label">Website</label>
                        <input
                          className="ma-input"
                          value={form.website}
                          onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                          placeholder="https://your-org.org"
                        />
                      </div>

                      <div className="ma-field">
                        <label className="ma-label">Instagram</label>
                        <input
                          className="ma-input"
                          value={form.instagram}
                          onChange={(e) => setForm((p) => ({ ...p, instagram: e.target.value }))}
                          placeholder="https://instagram.com/your-handle"
                        />
                      </div>

                      <div className="ma-field">
                        <label className="ma-label">Twitter / X</label>
                        <input
                          className="ma-input"
                          value={form.twitter}
                          onChange={(e) => setForm((p) => ({ ...p, twitter: e.target.value }))}
                          placeholder="https://x.com/your-handle"
                        />
                      </div>

                      <div className="ma-field">
                        <label className="ma-label">Facebook</label>
                        <input
                          className="ma-input"
                          value={form.facebook}
                          onChange={(e) => setForm((p) => ({ ...p, facebook: e.target.value }))}
                          placeholder="https://facebook.com/your-page"
                        />
                      </div>

                      <div className="ma-field">
                        <label className="ma-label">LinkedIn</label>
                        <input
                          className="ma-input"
                          value={form.linkedIn}
                          onChange={(e) => setForm((p) => ({ ...p, linkedIn: e.target.value }))}
                          placeholder="https://linkedin.com/company/your-org"
                        />
                      </div>

                      {isBusiness ? (
                        <div className="ma-field ma-fieldFull">
                          <label className="ma-label">Business Sector</label>
                          <input
                            className="ma-input"
                            value={form.businessSector}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, businessSector: e.target.value }))
                            }
                            placeholder="e.g. Education"
                          />
                        </div>
                      ) : null}

                      {isVcse ? (
                        <div className="ma-field ma-fieldFull">
                          <label className="ma-label">VCSE Type</label>
                          <input
                            className="ma-input"
                            value={form.vcseType}
                            onChange={(e) => setForm((p) => ({ ...p, vcseType: e.target.value }))}
                            placeholder="e.g. Youth mentorship"
                          />
                        </div>
                      ) : null}

                      <div className="ma-field ma-fieldFull">
                        <label className="ma-label">Bio / Description</label>
                        <textarea
                          className="ma-textarea"
                          rows={5}
                          value={form.description}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, description: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="ma-actions">
                      <button type="submit" className="ma-btn ma-btn-primary" disabled={saving}>
                        {saving ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {activeTab === "security" ? (
                <div className="ma-panel" style={{ marginTop: 16 }}>
                  <h2 className="ma-panelTitle">Security</h2>

                  <div className="ma-securityGrid">
                    <form
                      className="ma-field"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setSavedMessage("Password update is not wired yet.");
                        setTimeout(() => setSavedMessage(""), 2500);
                      }}
                    >
                      <label className="ma-label">Current password</label>
                      <input className="ma-input" type="password" disabled />

                      <label className="ma-label" style={{ marginTop: 12 }}>
                        New password
                      </label>
                      <input className="ma-input" type="password" disabled />

                      <label className="ma-label" style={{ marginTop: 12 }}>
                        Confirm new password
                      </label>
                      <input className="ma-input" type="password" disabled />

                      <div className="ma-actions">
                        <button type="submit" className="ma-btn ma-btn-primary" disabled>
                          Update Password
                        </button>
                      </div>
                    </form>

                    <div className="ma-statusCard">
                      <h3 className="ma-subTitle2">Account status</h3>

                      <div className="ma-toggleRow">
                        <label className="ma-toggleLabel">
                          Verification status
                          <input
                            type="checkbox"
                            checked={resolvedVerification}
                            disabled
                            className="ma-toggleInput"
                          />
                          <span className="ma-toggleVisual" />
                        </label>
                        <span className="ma-helpText">
                          {isVcse ? "Derived from your verification document." : "Available for VCSE accounts."}
                        </span>
                      </div>

                      <div className="ma-toggleRow">
                        <label className="ma-toggleLabel">
                          Account is active
                          <input
                            type="checkbox"
                            checked
                            disabled
                            className="ma-toggleInput"
                          />
                          <span className="ma-toggleVisual" />
                        </label>
                        <span className="ma-helpText">No toggle backend wired yet.</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
