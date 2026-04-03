"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../Components/Navbar";
import "./myaccount.css";
import { toStorageRelativePath } from "@/lib/storagePaths";

type Tab = "profile" | "branding" | "preferences" | "security";

type MyAccountApiResponse = {
  success: boolean;
  data: {
    profile: {
      UserId?: number;
      FirstName?: string;
      LastName?: string;
      UserEmail?: string;
      UserPhone?: string;
      [k: string]: unknown;
    } | null;
    account: {
      AccountTypeId?: number;
      AccountType?: string;
      Description?: string | null;
      Address?: string | null;
      logo?: string | null;
      Website?: string | null;
      Instagram?: string | null;
      Twitter?: string | null;
      Facebook?: string | null;
      LinkedIn?: string | null;
      [k: string]: unknown;
    } | null;
    preferences?: {
      preferredCategories: number[];
      preferredBenefits: number[];
    };
  };
};

type VcseTypeOption = { VcseTypeId: number; Name: string };
type BenefitOption = { benefitId: number; benefitName: string };

export default function MyAccountPage() {
  const [api, setApi] = useState<MyAccountApiResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    description: "",
    address: "",
    website: "",
    instagram: "",
    twitter: "",
    facebook: "",
    linkedIn: "",
    preferredCategories: [] as number[],
    preferredBenefits: [] as number[],
    currentPassword: "",
    newPassword: "",
    repeatPassword: ""
  });

  const [vcseTypes, setVcseTypes] = useState<VcseTypeOption[]>([]);
  const [benefitTypes, setBenefitTypes] = useState<BenefitOption[]>([]);

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoCacheBust, setLogoCacheBust] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const res = await fetch("/api/myaccount");
        const json: MyAccountApiResponse = await res.json();
        if (!json?.success) {
          throw new Error("Failed to load");
        }
        setApi(json.data);
      } catch (e) {
        console.error("Error fetching account data:", e);
        setErrorMessage("Failed to load account data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!api) return;

    const prefs = api.preferences ?? {
      preferredCategories: [],
      preferredBenefits: [],
    };

    setFormData((prev) => ({
      ...prev,
      firstName: String(api.profile?.FirstName ?? ""),
      lastName: String(api.profile?.LastName ?? ""),
      email: String(api.profile?.UserEmail ?? ""),
      phone: String(api.profile?.UserPhone ?? ""),
      description: String(api.account?.Description ?? ""),
      address: String(api.account?.Address ?? ""),
      website: String(api.account?.Website ?? ""),
      instagram: String(api.account?.Instagram ?? ""),
      twitter: String(api.account?.Twitter ?? ""),
      facebook: String(api.account?.Facebook ?? ""),
      linkedIn: String(api.account?.LinkedIn ?? ""),
      preferredCategories: [...prefs.preferredCategories],
      preferredBenefits: [...prefs.preferredBenefits],
    }));
  }, [api]);

  const accountType = api?.account?.AccountType ?? "";
  const isBusiness = accountType === 'Business';
  const isVcse = !isBusiness;

  useEffect(() => {
    if (!isBusiness) return;

    const loadOptions = async () => {
      try {
        const [orgRes, benRes] = await Promise.all([
          fetch("/api/auth/register/onboarding/OrgTypes"),
          fetch("/api/campaign/BenefitTypes"),
        ]);

        if (orgRes.ok) {
          const raw = (await orgRes.json()) as Record<string, unknown>[];
          setVcseTypes(
            (Array.isArray(raw) ? raw : []).map((row) => ({
              VcseTypeId: Number(row.VcseTypeId ?? 0),
              Name: String(row.Name ?? row.VcseType ?? ""),
            })),
          );
        }

        if (benRes.ok) {
          const raw = (await benRes.json()) as Record<string, unknown>[];
          setBenefitTypes(
            (Array.isArray(raw) ? raw : []).map((row) => ({
              benefitId: Number(row.benefitId ?? row.BenefitId ?? 0),
              benefitName: String(row.benefitName ?? row.Benefit ?? row.Name ?? ""),
            })),
          );
        }
      } catch (e) {
        console.error("Failed to load preference options:", e);
      }
    };

    loadOptions();
  }, [isBusiness]);

  const logoPreviewSrc = useMemo(() => {
    const stored = api?.account?.logo;
    const rel = toStorageRelativePath(
      stored == null ? null : String(stored),
    );
    if (!rel) return null;
    const qs = logoCacheBust > 0 ? `?v=${logoCacheBust}` : "";
    return `/api/files/${rel}${qs}`;
  }, [api, logoCacheBust]);

  const resolvedVerification = false;

  const toggleCategory = useCallback((id: number) => {
    setFormData((prev) => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(id)
        ? prev.preferredCategories.filter((x) => x !== id)
        : [...prev.preferredCategories, id],
    }));
  }, []);

  const toggleBenefit = useCallback((id: number) => {
    setFormData((prev) => ({
      ...prev,
      preferredBenefits: prev.preferredBenefits.includes(id)
        ? prev.preferredBenefits.filter((x) => x !== id)
        : [...prev.preferredBenefits, id],
    }));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSavedMessage("");
    try{
      const res = await fetch('/api/myaccount/saveProfile', {
        method: 'PUT', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName:formData.lastName,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const result = await res.json();

      if (result.success){
        setSavedMessage("Profile changes saved.");
        setTimeout(() => setSavedMessage(""), 3000);
      } else {
        setErrorMessage(String(result.error ?? "Failed to save profile"));
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(String(err ?? "Failed to save profile"));
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  }

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSavedMessage('');
    try{
      const res = await fetch('/api/myaccount/saveBranding', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          address: formData.address,
          website: formData.website,
          instagram: formData.instagram,
          twitter: formData.twitter,
          facebook: formData.facebook,
          linkedIn: formData.linkedIn
        }),
      });

      const result = await res.json();

      if (result.success){
        setSavedMessage('Branding changes saved'); 
        setTimeout(() => setSavedMessage(''), 3000);
      }else {
        setErrorMessage(String(result.error ?? 'Failed to save branding information'));
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }catch(error) {
      console.error(error);
      setErrorMessage(String(error ?? 'Failed to save branding information'));
      setTimeout(() => setErrorMessage(''),3000);
    }finally {
      setSaving(false)
    }
  }


  const handleSavingPref = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSavedMessage('');

    try{
      const res = await fetch('/api/myaccount/savePref', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          preferredCategories: formData.preferredCategories,
          preferredBenefits: formData.preferredBenefits,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setSavedMessage('Matching Preferences updated!');
        setTimeout(() => setSavedMessage(''), 3000);
      }else{
        setErrorMessage(String(result.error?? 'Failed to update preferences.'))
        setTimeout(() => setErrorMessage(''), 3000)
      }
    }catch (error) {
      console.error(error)
      setErrorMessage(String(error ?? 'Failed to update preference.'))
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavedMessage('')
    setErrorMessage(null)
    setSaving(true)

    try {
      const res = await fetch("/api/myaccount/changePassword", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          repeatPassword: formData.repeatPassword,
        }),
      })

      const raw = await res.text()
      let result: { success?: boolean; error?: string }
      try {
        result = raw ? (JSON.parse(raw) as typeof result) : {}
      } catch {
        setErrorMessage(
          !res.ok
            ? `Request failed (${res.status}).`
            : "The server returned an unexpected response."
        )
        setTimeout(() => setErrorMessage(""), 5000)
        return
      }

      if (result.success) {
        setSavedMessage("Password updated.")
        setTimeout(() => setSavedMessage(""), 3000)
      } else {
        setErrorMessage(String(result.error ?? "Failed to change password."))
        setTimeout(() => setErrorMessage(""), 3000)
      }
    } catch (error) {
      console.error(error)
      setErrorMessage(String(error ?? "Failed to change password."))
      setTimeout(() => setErrorMessage(""), 3000)
    } finally {
      setSaving(false)
    }
  }
  
  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;
    setSavedMessage("");
    setErrorMessage(null);
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await fetch("/api/myaccount/logo", { method: "POST", body: formData });
      const raw = await res.text();
      let data: { success?: boolean; error?: string; logoUrl?: string };
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setErrorMessage(
          !res.ok
            ? `Upload failed (${res.status}).`
            : "The server returned an unexpected response.",
        );
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }
      if (!res.ok || !data.success) {
        setErrorMessage(String(data.error ?? "Failed to upload logo."));
        setTimeout(() => setErrorMessage(""), 4000);
        return;
      }
      if (data.logoUrl) {
        setApi((prev) =>
          prev?.account
            ? { ...prev, account: { ...prev.account, logo: data.logoUrl } }
            : prev,
        );
        setLogoCacheBust((n) => n + 1);
      }
      setSavedMessage("Logo updated.");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage(String(err ?? "Failed to upload logo."));
      setTimeout(() => setErrorMessage(""), 4000);
    } finally {
      setUploadingLogo(false);
    }
  };

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
            <div className="ma-headerBadge">{accountType}</div>
          </div>

          <div className="ma-tabs">
            <button
              type="button"
              className={`ma-tabButton ${activeTab === "profile" ? "is-active" : ""}`}
              onClick={() => setActiveTab("profile")}
              aria-pressed={activeTab === "profile"}
            >
              Profile
            </button>
            <button
              type="button"
              className={`ma-tabButton ${activeTab === "branding" ? "is-active" : ""}`}
              onClick={() => setActiveTab("branding")}
              aria-pressed={activeTab === "branding"}
            >
              Branding
            </button>
            {isBusiness ? (
              <button
                type="button"
                className={`ma-tabButton ${activeTab === "preferences" ? "is-active" : ""}`}
                onClick={() => setActiveTab("preferences")}
                aria-pressed={activeTab === "preferences"}
              >
                Matching preferences
              </button>
            ) : null}
            <button
              type="button"
              className={`ma-tabButton ${activeTab === "security" ? "is-active" : ""}`}
              onClick={() => setActiveTab("security")}
              aria-pressed={activeTab === "security"}
            >
              Security
            </button>
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
                        <label className="ma-label">First Name</label>
                        <input
                          className="ma-input"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, firstName: e.target.value }))
                          }
                        />
                      </div>

                      <div className="ma-field">
                        <label className="ma-label">Last Name</label>
                        <input
                          className="ma-input"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, lastName: e.target.value }))
                          }
                        />
                      </div>

                      <div className="ma-field">
                        <label className="ma-label">Email</label>
                        <input
                          className="ma-input"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, email: e.target.value }))
                          }
                        />
                      </div>

                      <div className="ma-field">
                        <label className="ma-label">Phone</label>
                        <input
                          className="ma-input"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, phone: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="ma-actions">
                      <button
                        type="submit"
                        className="ma-btn ma-btn-primary"
                        disabled={saving}
                      >
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
                      <p className="ma-helpText">
                        Upload a clear square logo for better recognition.
                      </p>
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
                    </div>
                  </div>

                  <form onSubmit={handleSaveBranding} className="ma-form">
                    <div className="ma-formGrid">
                      <div className="ma-field ma-fieldFull">
                        <label className="ma-label">Bio / Description</label>
                        <textarea
                          className="ma-textarea"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, description: e.target.value }))
                          }
                          placeholder="Enter your bio / description"
                        />
                      </div>
                      <div className="ma-field">
                        <label className="ma-label">Address</label>
                        <input
                          className="ma-input"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, address: e.target.value }))
                          }
                          placeholder="Enter your address"
                        />
                      </div>
                      <div className="ma-field">
                        <label className="ma-label">Website</label>
                        <input
                          className="ma-input"
                          value={formData.website}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, website: e.target.value }))
                          }
                          placeholder="https://your-org.org"
                        />
                      </div>

                      <div className="ma-field">
                        <label className="ma-label">Instagram</label>
                        <input
                          className="ma-input"
                          value={formData.instagram}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, instagram: e.target.value }))
                          }
                          placeholder="https://instagram.com/your-handle"
                        />
                      </div>

                      <div className="ma-field">
                        <label className="ma-label">Twitter / X</label>
                        <input
                          className="ma-input"
                          value={formData.twitter}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, twitter: e.target.value }))
                          }
                          placeholder="https://x.com/your-handle"
                        />
                      </div>

                      <div className="ma-field">
                        <label className="ma-label">Facebook</label>
                        <input
                          className="ma-input"
                          value={formData.facebook}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, facebook: e.target.value }))
                          }
                          placeholder="https://facebook.com/your-page"
                        />
                      </div>

                      <div className="ma-field">
                        <label className="ma-label">LinkedIn</label>
                        <input
                          className="ma-input"
                          value={formData.linkedIn}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, linkedIn: e.target.value }))
                          }
                          placeholder="https://linkedin.com/company/your-org"
                        />
                      </div>
                    </div>

                    <div className="ma-actions">
                      <button
                        type="submit"
                        className="ma-btn ma-btn-primary"
                        disabled={saving}
                      >
                        {saving ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {activeTab === "preferences" && isBusiness ? (
                <div className="ma-panel" style={{ marginTop: 16 }}>
                  <h2 className="ma-panelTitle">Matching preferences</h2>
                  <p className="ma-helpText" style={{ marginTop: 8, marginBottom: 0 }}>
                    Choose which cause areas and partnership benefits should influence your Match Score.
                  </p>

                  <form onSubmit={handleSavingPref} className="ma-form">
                    <div className="ma-prefSection">
                      <h3 className="ma-prefSectionTitle">Cause areas</h3>
                      <p className="ma-helpText ma-prefSectionHint">
                        Organisation types (VCSE categories) you care about.
                      </p>
                      <div className="ma-prefGrid">
                        {vcseTypes.map((row) => (
                          <label
                            key={row.VcseTypeId}
                            className={`ma-prefCheck ${formData.preferredCategories.includes(row.VcseTypeId) ? "is-checked" : ""}`}
                          >
                            <input
                              type="checkbox"
                              className="ma-prefCheckbox"
                              checked={formData.preferredCategories.includes(row.VcseTypeId)}
                              onChange={() => toggleCategory(row.VcseTypeId)}
                            />
                            <span className="ma-prefCheckLabel">
                              {row.Name || `Type ${row.VcseTypeId}`}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="ma-prefSection">
                      <h3 className="ma-prefSectionTitle">Desired benefits</h3>
                      <p className="ma-helpText ma-prefSectionHint">
                        Partnership benefits you want to prioritise.
                      </p>
                      <div className="ma-prefGrid">
                        {benefitTypes.map((b) => (
                          <label
                            key={b.benefitId}
                            className={`ma-prefCheck ${formData.preferredBenefits.includes(b.benefitId) ? "is-checked" : ""}`}
                          >
                            <input
                              type="checkbox"
                              className="ma-prefCheckbox"
                              checked={formData.preferredBenefits.includes(b.benefitId)}
                              onChange={() => toggleBenefit(b.benefitId)}
                            />
                            <span className="ma-prefCheckLabel">{b.benefitName}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="ma-actions">
                      <button
                        type="submit"
                        className="ma-btn ma-btn-primary"
                        disabled={saving}
                      >
                        {saving ? "Saving…" : "Save matching preferences"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {activeTab === "security" ? (
                <div className="ma-panel" style={{ marginTop: 16 }}>
                  <h2 className="ma-panelTitle">Security</h2>

                  <div className="ma-securityGrid">
                    <div className="ma-statusCard">
                      <h3 className="ma-subTitle2">Change Password</h3>
                      <form onSubmit={handleChangePassword} className="ma-form">
                        <label htmlFor="currentPassword" className="ma-label">Current Password</label>
                        <input
                          type="password"
                          className="ma-input"
                          id="currentPassword"
                          value={formData.currentPassword || ""}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              currentPassword: e.target.value
                            }))
                          }
                          autoComplete="current-password"
                        />
                        <label htmlFor="newPassword" className="ma-label">New Password</label>
                        <input
                          type="password"
                          className="ma-input"
                          id="newPassword"
                          value={formData.newPassword || ""}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              newPassword: e.target.value
                            }))
                          }
                        />
                        <label htmlFor="confirmNewPassword" className="ma-label">Confirm New Password</label>
                        <input
                          type="password"
                          className="ma-input"
                          id="repeatPassword"
                          value={formData.repeatPassword || ""}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              repeatPassword: e.target.value
                            }))
                          }
                        />
                        <div className="ma-actions">
                          <button type="submit" className="ma-btn ma-btn-primary" disabled={saving}>
                            {saving ? "Saving…" : "Save Changes"}
                          </button>
                        </div>
                      </form>
                    </div>
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
                          {isVcse
                            ? "Derived from your verification document (not available here)."
                            : "Available for VCSE accounts."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}
