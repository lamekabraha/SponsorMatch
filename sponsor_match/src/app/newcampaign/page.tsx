"use client";
import { FormEvent, useMemo, useState } from "react";
import CampaignPreviewTemplate from "../Components/CampaignPreviewTemplate";
import Navbar from "../Components/Navbar";
import "./newcampaign.css";

type CampaignForm = {
  name: string;
  orgName: string;
  type: string;
  goal: number;
  raised: number;
  location: string;
  desc: string;
  summary: string;
  startDate: string;
  endDate: string;
  coverImageUrl: string;
};

export default function NewCampaignPage() {
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  const [formData, setFormData] = useState<CampaignForm>({
    name: "",
    orgName: "",
    type: "Sports",
    goal: 5000,
    raised: 0,
    location: "",
    desc: "",
    summary: "",
    startDate: "",
    endDate: "",
    coverImageUrl: "",
  });

  const [submitState, setSubmitState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "Sports",
    "Education",
    "Environment",
    "Health",
    "Community",
    "Poverty Relief",
    "Arts",
    "Technology",
  ];

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim().length > 2 &&
      formData.orgName.trim().length > 1 &&
      formData.type.trim().length > 0 &&
      formData.goal > 0 &&
      formData.location.trim().length > 1 &&
      formData.desc.trim().length > 20 &&
      formData.startDate.trim().length > 0 &&
      formData.endDate.trim().length > 0
    );
  }, [formData]);

  function updateField<K extends keyof CampaignForm>(key: K, value: CampaignForm[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Please complete all required fields before publishing.");
      return;
    }

    if (formData.startDate > formData.endDate) {
      setError("End date must be after start date.");
      return;
    }

    try {
      setSubmitState("saving");

      const payload = {
        ...formData,
        goal: Number(formData.goal),
        raised: Number(formData.raised),
      };

      const response = await fetch("/api/newCampaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save campaign");
      }

      setSubmitState("saved");
    } catch (err: any) {
      setSubmitState("idle");
      setError(err?.message || "Unable to save campaign. Please try again.");
    }
  }

  return (
    <div className="nc-create-page">
      <Navbar />

      <nav className="nc-create-toolbar">
        <h2 className="nc-create-toolbar-title">VCSE Campaign Creator</h2>
        <div className="nc-toolbar-actions">
          {viewMode === "preview" ? (
            <button
              onClick={() => setViewMode("edit")}
              className="nc-btn nc-btn-toggle"
            >
              Edit Campaign
            </button>
          ) : (
            <button
              onClick={() => setViewMode("preview")}
              className="nc-btn nc-btn-toggle"
            >
              Full Preview
            </button>
          )}
        </div>
      </nav>

      {viewMode === "edit" ? (
        <main className="nc-create-main">
          <section className="nc-panel nc-create-hero">
            <h1 className="nc-create-hero-title">Create a New Campaign</h1>
            <p className="nc-create-hero-subtitle">
              Add the essential campaign details for your VCSE audience and sponsors.
            </p>
          </section>

          <form onSubmit={handleSubmit} className="nc-create-form">
            <section className="nc-panel">
              <h2 className="nc-section-title">Basics</h2>
              <div className="nc-grid-2">
                <div className="nc-col-span-2">
                  <label className="nc-label">
                    Campaign Name *
                  </label>
                  <input
                    className="nc-input"
                    placeholder="e.g. Youth Coaching Programme"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </div>

                <div>
                  <label className="nc-label">
                    Organisation Name *
                  </label>
                  <input
                    className="nc-input"
                    placeholder="Your VCSE name"
                    value={formData.orgName}
                    onChange={(e) => updateField("orgName", e.target.value)}
                  />
                </div>

                <div>
                  <label className="nc-label">
                    Campaign Category *
                  </label>
                  <select
                    className="nc-input"
                    value={formData.type}
                    onChange={(e) => updateField("type", e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="nc-panel">
              <h2 className="nc-section-title">Funding & Timeline</h2>
              <div className="nc-grid-2">
                <div>
                  <label className="nc-label">
                    Funding Goal (GBP) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="nc-input"
                    value={formData.goal}
                    onChange={(e) => updateField("goal", Number(e.target.value || 0))}
                  />
                </div>

                <div>
                  <label className="nc-label">
                    Already Raised (GBP)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="nc-input"
                    value={formData.raised}
                    onChange={(e) => updateField("raised", Number(e.target.value || 0))}
                  />
                </div>

                <div>
                  <label className="nc-label">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    className="nc-input"
                    value={formData.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
                  />
                </div>

                <div>
                  <label className="nc-label">
                    End Date *
                  </label>
                  <input
                    type="date"
                    className="nc-input"
                    value={formData.endDate}
                    onChange={(e) => updateField("endDate", e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="nc-panel">
              <h2 className="nc-section-title">Story & Media</h2>
              <div className="nc-form-stack">
                <div>
                  <label className="nc-label">
                    Location *
                  </label>
                  <input
                    className="nc-input"
                    placeholder="e.g. Sheffield, UK"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </div>

                <div>
                  <label className="nc-label">
                    Short Summary
                  </label>
                  <input
                    className="nc-input"
                    placeholder="One-line value proposition"
                    value={formData.summary}
                    onChange={(e) => updateField("summary", e.target.value)}
                  />
                </div>

                <div>
                  <label className="nc-label">
                    Campaign Description *
                  </label>
                  <textarea
                    rows={6}
                    className="nc-textarea"
                    placeholder="Describe the need, beneficiaries, and impact."
                    value={formData.desc}
                    onChange={(e) => updateField("desc", e.target.value)}
                  />
                </div>

                <div>
                  <label className="nc-label">
                    Cover Image URL
                  </label>
                  <input
                    className="nc-input"
                    placeholder="https://..."
                    value={formData.coverImageUrl}
                    onChange={(e) => updateField("coverImageUrl", e.target.value)}
                  />
                </div>
              </div>
            </section>

            {error && (
              <div className="nc-error">
                {error}
              </div>
            )}

            <div className="nc-actions">
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className="nc-btn nc-btn-ghost"
              >
                Preview Campaign
              </button>
              <button
                type="submit"
                disabled={!canSubmit || submitState === "saving"}
                className={`nc-btn nc-btn-primary ${!canSubmit || submitState === "saving" ? "is-disabled" : ""}`}
              >
                {submitState === "saving"
                  ? "Saving..."
                  : submitState === "saved"
                  ? "Saved"
                  : "Create Campaign"}
              </button>
            </div>
          </form>
        </main>
      ) : (
        <div className="nc-preview-wrap">
          <CampaignPreviewTemplate prevData={formData} isLivePreview={true} />
        </div>
      )}
    </div>
  );
}