"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import CampaignPreviewTemplate from "../Components/CampaignPreviewTemplate";
import Navbar from "../Components/Navbar";
import "./newcampaign.css";
import { useRouter } from "next/navigation";
import NewCampaignTutorialModal from "./newCampaignTutorialModal";

type CampaignPackage = {
  packageType: string;
  title: string;
  price: number;
  benefitIds: number[];
};

type PackageTypeOption = {
  PackageTypeId: number;
  PackageType: string;
};

type BenefitOption = {
  BenefitId: number;
  Name: string;
  Description: string;
};

type CampaignForm = {
  orgName: string;
  location: string;
  name: string;
  type: string;
  goal: number;
  desc: string;
  summary: string;
  coverImageUrl: string;
  websiteUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  additionalImageUrls: string[];
  packages: CampaignPackage[];
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadName, setCoverUploadName] = useState<string | null>(null);
  const [isDragOverGallery, setIsDragOverGallery] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryUploadNames, setGalleryUploadNames] = useState<string[]>([]);
  const [packageTypeOptions, setPackageTypeOptions] = useState<PackageTypeOption[]>([]);
  const [benefitOptions, setBenefitOptions] = useState<BenefitOption[]>([]);
  const [accountDetails, setAccountDetails] = useState<any[]>([]);

  const [formData, setFormData] = useState<CampaignForm>({
    name: "",
    orgName: "",
    location: "",
    type: "",
    goal: 5000,
    desc: "",
    summary: "",
    coverImageUrl: "",
    websiteUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    facebookUrl: "",
    linkedinUrl: "",
    additionalImageUrls: [],
    packages: [{ packageType: "Bronze", title: "Bronze Supporter", price: 250, benefitIds: [] }],
  });

  const [submitState, setSubmitState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const [tutorialOpen, setTutorialOpen] = useState(false);

  useEffect(() => {
    const key = "nc_newcampaign_tutorial_seen_v1";
    try {
      const seen = window.localStorage.getItem(key);
      setTutorialOpen(!seen);
    } catch {
      // If storage is blocked, keep modal visible once.
      setTutorialOpen(true);
    }
  }, []);

  const closeTutorial = () => {
    setTutorialOpen(false);
    try {
      window.localStorage.setItem("nc_newcampaign_tutorial_seen_v1", "1");
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const loadPackageMetadata = async () => {
      try {
        const response = await fetch("/api/newCampaign");
        const payload = await response.json();
        if (!response.ok || !payload?.success) return;

        const pkgTypes = (payload?.data?.packageTypes ?? []) as PackageTypeOption[];
        const benefits = (payload?.data?.benefits ?? []) as BenefitOption[];
        setPackageTypeOptions(pkgTypes);
        setBenefitOptions(benefits);

        if (pkgTypes.length > 0) {
          setFormData((prev) => ({
            ...prev,
            packages: prev.packages.map((pkg) =>
              pkg.packageType ? pkg : { ...pkg, packageType: pkgTypes[0].PackageType }
            ),
          }));
        }
      } catch {
        // Keep form usable even if metadata fails.
      }
    };

    loadPackageMetadata();
  }, []);

  useEffect(() => {
    const fetchAccountData = async () => {
      try{
        const response = await fetch('/api/getAccountData');
  
        if (!response.ok) {
          throw new Error('Failed to load account data');
          console.log('Failed to load account data');
        }
  
        const result = await response.json();
  
        if (result.success) {
          setAccountDetails(result.data);
          const account = result.data?.[0] ?? null;
          const address = account?.Address ?? "";
          const website = String(account?.Website ?? "").trim();
          const instagram = String(account?.Instagram ?? "").trim();
          const twitter = String(account?.Twitter ?? "").trim();
          const facebook = String(account?.Facebook ?? "").trim();
          const linkedin = String(account?.LinkedIn ?? "").trim();

          setFormData((prev) => ({
            ...prev,
            location: prev.location.trim() ? prev.location : address,
            websiteUrl: prev.websiteUrl.trim() ? prev.websiteUrl : website,
            instagramUrl: prev.instagramUrl.trim() ? prev.instagramUrl : instagram,
            twitterUrl: prev.twitterUrl.trim() ? prev.twitterUrl : twitter,
            facebookUrl: prev.facebookUrl.trim() ? prev.facebookUrl : facebook,
            linkedinUrl: prev.linkedinUrl.trim() ? prev.linkedinUrl : linkedin,
          }));
          console.log(accountDetails);
        }else{
          throw new Error(result.error || 'Unknown error occurred');
        }
      }catch (error: any){
        setError(error.message)
      }
    };
    fetchAccountData();
    }, [])

  const wizardSteps = [
    { id: 1, title: "Basics" },
    { id: 2, title: "Funding & Packages" },
    { id: 3, title: "Story & Media" },
    { id: 4, title: "Review & Publish" },
  ];

  const categories = [
    { id: 1, title: "Tangible Asset Sponsorship" },
    { id: 2, title: "Operational Costs / Core Funding" },
    { id: 3, title: "Social Prescribing & Wellbeing" },
    { id: 4, title: "Employment & Green Skills" },
    { id: 5, title: "Capital Appeal / New Build" },
    { id: 6, title: "Crisis Intervention & Outreach" },
    { id: 7, title: "Youth Mentorship & Coaching" },
    { id: 8, title: "Community Event / Local Activations" },
    { id: 9, title: "Sports and Athletic Coaching" },
    { id: 10, title: "Community Recreation" },
  ];

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim().length > 2 &&
      formData.type.trim().length > 0 &&
      formData.goal > 0 &&
      formData.desc.trim().length > 20 &&
      formData.packages.length > 0 &&
      formData.packages.every((pkg) => pkg.title.trim().length > 0 && pkg.price > 0)
    );
  }, [formData]);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          formData.name.trim().length > 2 &&
          formData.type.trim().length > 0
        );
      case 2:
        return (
          formData.goal > 0
        );
      case 3:
        return (
          formData.desc.trim().length > 20
        );
      case 4:
      default:
        return canSubmit;
    }
  }, [currentStep, formData, canSubmit]);

  function updateField<K extends keyof CampaignForm>(key: K, value: CampaignForm[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function updatePackageField(
    index: number,
    key: keyof CampaignPackage,
    value: CampaignPackage[keyof CampaignPackage]
  ) {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg, pkgIndex) =>
        pkgIndex === index ? { ...pkg, [key]: value } : pkg
      ),
    }));
  }

  function addPackage() {
    setFormData((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          packageType: packageTypeOptions[0]?.PackageType ?? "Bronze",
          title: "",
          price: 0,
          benefitIds: [],
        },
      ],
    }));
  }

  function removePackage(index: number) {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, pkgIndex) => pkgIndex !== index),
    }));
  }

  function togglePackageBenefit(index: number, benefitId: number) {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg, pkgIndex) => {
        if (pkgIndex !== index) return pkg;
        const hasBenefit = pkg.benefitIds.includes(benefitId);
        return {
          ...pkg,
          benefitIds: hasBenefit
            ? pkg.benefitIds.filter((id) => id !== benefitId)
            : [...pkg.benefitIds, benefitId],
        };
      }),
    }));
  }

  async function uploadCover(file: File) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeMb = 5;

    if (!allowedTypes.includes(file.type)) {
      setError("Cover image must be JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Cover image must be smaller than ${maxSizeMb}MB.`);
      return;
    }

    try {
      setError(null);
      setIsUploadingCover(true);

      const fd = new FormData();
      fd.append("cover", file);

      const response = await fetch("/api/newCampaign/cover", {
        method: "POST",
        body: fd,
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "Failed to upload cover image");
      }

      // Store API-accessible URL in form state so preview works immediately.
      updateField("coverImageUrl", `/api/files/${payload.coverPath}`);
      setCoverUploadName(file.name);
    } catch (err: any) {
      setError(err?.message || "Unable to upload image. Please try again.");
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function uploadAdditionalImages(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeMb = 5;

    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        setError("Additional images must be JPG, PNG, or WEBP.");
        return;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`Each additional image must be smaller than ${maxSizeMb}MB.`);
        return;
      }
    }

    try {
      setError(null);
      setIsUploadingGallery(true);

      const fd = new FormData();
      fileArray.forEach((file) => fd.append("images", file));

      const response = await fetch("/api/newCampaign/gallery", {
        method: "POST",
        body: fd,
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "Failed to upload additional images");
      }

      const urls = (payload.imagePaths as string[]).map(
        (path) => `/api/files/${String(path).replace(/^\/+/, "")}`
      );

      setFormData((prev) => ({
        ...prev,
        additionalImageUrls: [...prev.additionalImageUrls, ...urls],
      }));
      setGalleryUploadNames((prev) => [...prev, ...fileArray.map((f) => f.name)]);
    } catch (err: any) {
      setError(err?.message || "Unable to upload additional images.");
    } finally {
      setIsUploadingGallery(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (submitState === "saving" || submitState === "saved") {
      return;
    }

    setError(null);

    if (!canSubmit) {
      setError("Please complete all required fields before publishing.");
      return;
    }

    try {
      setSubmitState("saving");

      const payload = {
        name: formData.name.trim(),
        orgLogo: accountDetails[0]?.Logo,
        orgName: formData.orgName.trim(),
        location: formData.location.trim(),
        type: formData.type.trim(),
        goal: Number(formData.goal),
        desc: formData.desc.trim(),
        summary: formData.summary.trim(),
        coverImageUrl: formData.coverImageUrl,
        additionalImageUrls: formData.additionalImageUrls,
        websiteUrl:
          formData.websiteUrl.trim() ||
          String(accountDetails[0]?.Website ?? "").trim(),
        instagramUrl:
          formData.instagramUrl.trim() ||
          String(accountDetails[0]?.InstagramUrl ?? accountDetails[0]?.Instagram ?? "").trim(),
        twitterUrl:
          formData.twitterUrl.trim() ||
          String(
            accountDetails[0]?.TwitterUrl ??
              accountDetails[0]?.Twitter ??
              accountDetails[0]?.X ??
              ""
          ).trim(),
        facebookUrl:
          formData.facebookUrl.trim() ||
          String(accountDetails[0]?.FacebookUrl ?? accountDetails[0]?.Facebook ?? "").trim(),
        linkedinUrl:
          formData.linkedinUrl.trim() ||
          String(accountDetails[0]?.LinkedInUrl ?? accountDetails[0]?.LinkedIn ?? "").trim(),
        packages: formData.packages.map((pkg) => ({
          packageType: pkg.packageType,
          title: pkg.title.trim(),
          price: Number(pkg.price),
          benefitIds: pkg.benefitIds,
        })),
      };

      const response = await fetch("/api/newCampaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || result?.error || "Failed to save campaign");
      }

      setSubmitState("saved");
      setError(null);
      router.push(`/VCSE/dashboard`);
      router.refresh();
    } catch (err: any) {
      setSubmitState("idle");
      setError(err?.message || "Unable to save campaign. Please try again.");
    }
  }

  function goNextStep() {
    // if (!canProceed) {
    //   setError("Please complete the required fields before continuing.");
    //   return;
    // }
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, wizardSteps.length));
  }

  function goPrevStep() {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  function setShowTutorialModal(arg0: boolean): void {
    if (!arg0) {
      closeTutorial();
      return;
    }
    setTutorialOpen(true);
  }

  return (
    <div className="nc-create-page">
      <NewCampaignTutorialModal open={tutorialOpen} onClose={closeTutorial} />
      <Navbar />

      <nav className="nc-create-toolbar">
        <h2 className="nc-create-toolbar-title">Your Campaign Creator</h2>
        <div className="flex items-center gap-2">
        <button
            type="button"
            className="nc-btn nc-btn-primary"
            onClick={() => setShowTutorialModal(true)}
          >
            Help Me
          </button>
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
        </div>
      </nav>

      {viewMode === "edit" ? (
        <main className="nc-create-main">
          <section className="nc-panel nc-create-hero">
            <h1 className="nc-create-hero-title">Create a New Campaign</h1>
            <p className="nc-create-hero-subtitle">
              Add the essential campaign details for your VCSE audience and sponsors.
            </p>
            <div className="nc-stepper-meta">
              Step {currentStep} of {wizardSteps.length}
            </div>
            <div className="nc-stepper">
              {wizardSteps.map((step) => (
                <button
                  type="button"
                  key={step.id}
                  className={`nc-step-chip ${
                    step.id === currentStep
                      ? "is-active"
                      : step.id < currentStep
                      ? "is-complete"
                      : ""
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <span className="nc-step-chip-index">{step.id}</span>
                  <span className="nc-step-chip-title">{step.title}</span>
                </button>
              ))}
            </div>
          </section>

          <form onSubmit={handleSubmit} className="nc-create-form">
            {currentStep === 1 && (
              <section className="nc-panel">
                <h2 className="nc-section-title">Basics</h2>
                <div className="nc-grid-2">
                  <div className="nc-col-span-2">
                    <label className="nc-label">
                      Campaign Name *
                    </label>
                    <input
                      className="nc-input"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
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
                      defaultValue=''
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.title}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </div><div className="nc-col-span-2">
                    <label className="nc-label">
                      Company Name
                    </label>
                    <input
                      className="nc-input"
                      value={accountDetails[0]?.Name}
                      disabled
                    />
                  </div><div className="nc-col-span-2">
                    <label className="nc-label">
                      Location
                    </label>
                    <input
                      className="nc-input"
                      value={accountDetails[0]?.Address}
                      onChange={(e) => updateField("location", e.target.value)}
                      disabled
                    />
                  </div>
                </div>
              </section>
            )}

            {currentStep === 2 && (
              <section className="nc-panel">
                <h2 className="nc-section-title">Funding Goal & Sponsorship Packages</h2>
                <div className="">
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
                  <div className="mt-4">
                    <label htmlFor="package-preview" className="nc-label">Sponsorship Packages</label>
                    <p className="nc-dropzone-meta">Create one or more tiers for sponsors.</p>
                    <div className="nc-package-stack">
                      {formData.packages.map((pkg, index) => (
                        <div key={`${pkg.packageType}-${index}`} className="nc-package">
                          <label className="nc-package-label">
                            <input type="radio" name="package-preview" disabled />
                            <span className="nc-package-head">
                              <select
                                className="nc-package-select"
                                value={pkg.packageType}
                                onChange={(e) => updatePackageField(index, "packageType", e.target.value)}
                              >
                                {(packageTypeOptions.length > 0
                                  ? packageTypeOptions
                                  : [
                                      { PackageTypeId: 5, PackageType: "Bronze" },
                                      { PackageTypeId: 6, PackageType: "Silver" },
                                      { PackageTypeId: 7, PackageType: "Gold" },
                                      { PackageTypeId: 8, PackageType: "Platinum" },
                                    ]
                                ).map((option) => (
                                  <option key={option.PackageTypeId} value={option.PackageType}>
                                    {option.PackageType}
                                  </option>
                                ))}
                              </select>
                              <span>—</span>
                              <input
                                type="number"
                                min={0}
                                className="nc-package-price"
                                value={pkg.price}
                                onChange={(e) => updatePackageField(index, "price", Number(e.target.value || 0))}
                              />
                            </span>
                          </label>
                          <ul className="nc-package-list">
                            <li>
                              <input
                                className="nc-input"
                                placeholder="Package title (e.g. Bronze Supporter)"
                                value={pkg.title}
                                onChange={(e) => updatePackageField(index, "title", e.target.value)}
                              />
                            </li>
                            {(benefitOptions.length > 0
                              ? benefitOptions
                              : [
                                  { BenefitId: 17, Name: "Logo placement at events/venues", Description: "" },
                                  { BenefitId: 21, Name: "Social media recognition", Description: "" },
                                  { BenefitId: 24, Name: "Impact reporting & measurement", Description: "" },
                                ]
                            ).map((benefit) => (
                              <li key={benefit.BenefitId}>
                                <label className="nc-package-benefit">
                                  <input
                                    type="checkbox"
                                    checked={pkg.benefitIds.includes(benefit.BenefitId)}
                                    onChange={() => togglePackageBenefit(index, benefit.BenefitId)}
                                  />
                                  <span>{benefit.Name}</span>
                                </label>
                              </li>
                            ))}
                          </ul>
                          <div className="nc-actions">
                            <button
                              type="button"
                              className={`nc-btn nc-btn-ghost ${formData.packages.length === 1 ? "is-disabled" : ""}`}
                              disabled={formData.packages.length === 1}
                              onClick={() => removePackage(index)}
                            >
                              Remove Package
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="nc-btn nc-btn-primary mt-2" onClick={addPackage}>
                      Add Package
                    </button>
                  </div>
                </div>
              </section>
            )}

            {currentStep === 3 && (
              <section className="nc-panel">
                <h2 className="nc-section-title">Story & Media</h2>
                <div className="nc-form-stack">
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
                    Cover Image
                    </label>
                  <div
                    className={`nc-dropzone ${isDragOver ? "is-drag-over" : ""} ${
                      isUploadingCover ? "is-uploading" : ""
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) await uploadCover(file);
                    }}
                  >
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="nc-file-input"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await uploadCover(file);
                      }}
                    />
                    <label htmlFor="cover-upload" className="nc-dropzone-label">
                      {isUploadingCover
                        ? "Uploading cover image..."
                        : "Drag and drop cover image here, or click to upload"}
                    </label>
                    <p className="nc-dropzone-meta">Accepted: JPG, PNG, WEBP (max 5MB)</p>
                    {coverUploadName && (
                      <p className="nc-dropzone-success">Uploaded: {coverUploadName}</p>
                    )}
                  </div>

                  <div>
                    <label className="nc-label">
                      Additional Campaign Images
                    </label>
                    <div
                      className={`nc-dropzone ${isDragOverGallery ? "is-drag-over" : ""} ${
                        isUploadingGallery ? "is-uploading" : ""
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOverGallery(true);
                      }}
                      onDragLeave={() => setIsDragOverGallery(false)}
                      onDrop={async (e) => {
                        e.preventDefault();
                        setIsDragOverGallery(false);
                        if (e.dataTransfer.files?.length) {
                          await uploadAdditionalImages(e.dataTransfer.files);
                        }
                      }}
                    >
                      <input
                        id="gallery-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        className="nc-file-input"
                        onChange={async (e) => {
                          if (e.target.files?.length) {
                            await uploadAdditionalImages(e.target.files);
                          }
                        }}
                      />
                      <label htmlFor="gallery-upload" className="nc-dropzone-label">
                        {isUploadingGallery
                          ? "Uploading additional images..."
                          : "Drag and drop additional images, or click to upload"}
                      </label>
                      <p className="nc-dropzone-meta">Accepted: JPG, PNG, WEBP (max 5MB each)</p>
                      {galleryUploadNames.length > 0 && (
                        <p className="nc-dropzone-success">
                          Uploaded: {galleryUploadNames.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  </div>

                  <div className="nc-col-span-2">
                    <h3 className="nc-subsection-title">Social Media Links (optional)</h3>
                  </div>

                  <div>
                    <label className="nc-label">Website</label>
                    <input
                      className="nc-input"
                      placeholder="https://your-org.org"
                      value={formData.websiteUrl}
                      onChange={(e) => updateField("websiteUrl", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="nc-label">Instagram</label>
                    <input
                      className="nc-input"
                      placeholder="https://instagram.com/yourorg"
                      value={formData.instagramUrl}
                      onChange={(e) => updateField("instagramUrl", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="nc-label">X / Twitter</label>
                    <input
                      className="nc-input"
                      placeholder="https://x.com/yourorg"
                      value={formData.twitterUrl}
                      onChange={(e) => updateField("twitterUrl", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="nc-label">Facebook</label>
                    <input
                      className="nc-input"
                      placeholder="https://facebook.com/yourorg"
                      value={formData.facebookUrl}
                      onChange={(e) => updateField("facebookUrl", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="nc-label">LinkedIn</label>
                    <input
                      className="nc-input"
                      placeholder="https://linkedin.com/company/yourorg"
                      value={formData.linkedinUrl}
                      onChange={(e) => updateField("linkedinUrl", e.target.value)}
                    />
                  </div>
                </div>
              </section>
            )}

            {currentStep === 4 && (
              <section className="nc-panel">
                <h2 className="nc-section-title">Review & Publish</h2>
                <div className="nc-review-list">
                  <p><strong>Name:</strong> {formData.name || "-"}</p>
                  <p><strong>Category:</strong> {formData.type || "-"}</p>
                  <p><strong>Goal:</strong> {formatMoney(formData.goal)}</p>
                  <p><strong>Website:</strong> {formData.websiteUrl || accountDetails[0]?.Website}</p>
                  <p><strong>Instagram:</strong> {formData.instagramUrl || accountDetails[0]?.Instagram}</p>
                  <p><strong>X / Twitter:</strong> {formData.twitterUrl || accountDetails[0]?.Twitter}</p>
                  <p><strong>Facebook:</strong> {formData.facebookUrl || accountDetails[0]?.Facebook}</p>
                  <p><strong>LinkedIn:</strong> {formData.linkedinUrl || accountDetails[0]?.LinkedIn}</p>
                  <p><strong>Additional Images:</strong> {formData.additionalImageUrls.length}</p>
                  <p><strong>Packages:</strong> {formData.packages.length}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className="nc-btn nc-btn-ghost"
                >
                  Open Full Preview
                </button>
              </section>
            )}

            {error && (
              <div className="nc-error">
                {error}
              </div>
            )}

            <div className="nc-actions">
              <button
                type="button"
                onClick={goPrevStep}
                disabled={currentStep === 1}
                className={`nc-btn nc-btn-ghost ${currentStep === 1 ? "is-disabled" : ""}`}
              >
                Back
              </button>

              {currentStep < wizardSteps.length ? (
                <button
                  type="button"
                  onClick={goNextStep}
                  className="nc-btn nc-btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSubmit || submitState === "saving" || submitState === "saved"}
                  className={`nc-btn nc-btn-primary ${!canSubmit || submitState === "saving" || submitState === "saved" ? "is-disabled" : ""}`}
                >
                  {submitState === "saving"
                    ? "Saving..."
                    : submitState === "saved"
                    ? "Saved"
                    : "Create Campaign"}
                </button>
              )}
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

