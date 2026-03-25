"use client";

import { useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "./myaccount.css";

export default function MyAccountPage() {
  const [form, setForm] = useState({
    firstName: "Bob",
    lastName: "Smith",
    username: "bob123",
    phone: "+44 7123 456789",
    email: "bob23@example.com",
    bio: "Content creator focused on gaming, lifestyle and brand partnerships.",

    // onboarding / business preferences
    companyAddress: "123 Oxford Street, London",
    industry: "technology",
    companySize: "11-50",
    website: "https://bobmedia.co.uk",
    
  });
  const [form1, setForm1] = useState({
    socialmedia: ""
  })

  const [savedMessage, setSavedMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleChange1 = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm1({...form1,[e.target.name]:e.target.value})
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // personal info save
      // onboarding preferences save
      // connect these to your real backend routes when ready

      // Example:
      // await fetch("/api/account/update", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // });

      setSavedMessage("Your account details and onboarding preferences have been updated.");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    }
  };

  const handleDeleteAccount = () => {
    alert("delete account logic goes here");
  };

  return (
    <>
      <Navbar />

      <div className="accountPage">
        <div className="accountContainer">
          <div className="accountBanner">
            <div className="accountBannerLeft">
              <span className="accountBannerLabel">Account Settings</span>
              <span className="accountBannerValue">
                Manage your personal details, email, and onboarding preferences.
              </span>
            </div>
          </div>

          <div className="accountTitleRow">
            <div>
              <h1 className="accountTitle">My Account</h1>
              <p className="accountSubtitle">
                Keep your profile information and business preferences up to date for better matches.
              </p>
            </div>
          </div>

          <div className="accountGrid">
            <section className="accountCard">
              <div className="sectionHeader">
                <h2>Personal Information</h2>
                <p>Edit your contact details and public information.</p>
              </div>

              <form onSubmit={handleSave} className="accountForm">
                <div className="formGrid">
                  <div className="formGroup">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={form.firstName}
                      onChange={handleChange}
                      className="accountInput"
                    />
                  </div>

                  <div className="formGroup">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={form.lastName}
                      onChange={handleChange}
                      className="accountInput"
                    />
                  </div>

                  <div className="formGroup">
                    <label htmlFor="username">Username</label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={form.username}
                      onChange={handleChange}
                      className="accountInput"
                    />
                  </div>

                  <div className="formGroup">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      value={form.phone}
                      onChange={handleChange}
                      className="accountInput"
                    />
                  </div>
                </div>

                <div className="formGroup">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={5}
                    value={form.bio}
                    onChange={handleChange}
                    className="accountTextarea"
                  />
                </div>

                <div className="sectionDivider" />

                <div className="sectionHeader smallHeader">
                  <h2>Email Address</h2>
                  <p>Update the email linked to your SponsorMatch account.</p>
                </div>

                <div className="formGroup">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="accountInput"
                  />
                </div>

                <div className="sectionDivider" />

                <div className="sectionHeader smallHeader">
                  <h2>Onboarding Preferences</h2>
                  <p>Update the business details you originally added during onboarding.</p>
                </div>

                <div className="formGroup">
                  <label htmlFor="companyAddress">Company Address</label>
                  <input
                    id="companyAddress"
                    name="companyAddress"
                    type="text"
                    value={form.companyAddress}
                    onChange={handleChange}
                    className="accountInput"
                    placeholder="Enter your company address"
                  />
                </div>

                <div className="formGrid">
                  <div className="formGroup">
                    <label htmlFor="industry">Industry</label>
                    <select
                      id="industry"
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                      className="accountSelect"
                    >
                      <option value="">Select industry</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="construction">Construction</option>
                      <option value="education">Education</option>
                      <option value="finance">Finance</option>
                      <option value="health">Health</option>
                      <option value="technology">Technology</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="formGroup">
                    <label htmlFor="companySize">Company Size</label>
                    <select
                      id="companySize"
                      name="companySize"
                      value={form.companySize}
                      onChange={handleChange}
                      className="accountSelect"
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-100">51-100</option>
                      <option value="101-500">101-500</option>
                      <option value="501-1000">501-1000</option>
                      <option value="1001-5000">1001-5000</option>
                      <option value="5001-10000">5001-10000</option>
                      <option value="10001-50000">10001-50000</option>
                      <option value="50001-100000">50001-100000</option>
                      <option value="100001-500000">100001-500000</option>
                      <option value="500001-1000000">500001-1000000</option>
                    </select>
                  </div>
                </div>

                <div className="formGroup">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    value={form.website}
                    onChange={handleChange}
                    className="accountInput"
                    placeholder="Enter your company website"
                  />
                </div>

                {savedMessage && (
                  <div className="successMessage">{savedMessage}</div>
                )}

                <div className="actionRow">
                  <button type="submit" className="btn btnPrimary">
                    Save Changes
                  </button>
                </div>
              </form>
            </section>

            <aside className="accountSide">
              <div className="accountCard">
                <div className="sectionHeader">
                  <h2>Account Overview</h2>
                  <p>Your current account details at a glance.</p>
                </div>

                <div className="overviewList">
                  <div className="overviewItem">
                    <span className="overviewLabel">Full Name</span>
                    <span className="overviewValue">
                      {form.firstName} {form.lastName}
                    </span>
                  </div>

                  <div className="overviewItem">
                    <span className="overviewLabel">Username</span>
                    <span className="overviewValue">@{form.username}</span>
                  </div>

                  <div className="overviewItem">
                    <span className="overviewLabel">Email</span>
                    <span className="overviewValue">{form.email}</span>
                  </div>

                  <div className="overviewItem">
                    <span className="overviewLabel">Phone</span>
                    <span className="overviewValue">{form.phone}</span>
                  </div>

                  <div className="overviewItem">
                    <span className="overviewLabel">Industry</span>
                    <span className="overviewValue">{form.industry || "Not set"}</span>
                  </div>

                  <div className="overviewItem">
                    <span className="overviewLabel">Company Size</span>
                    <span className="overviewValue">{form.companySize || "Not set"}</span>
                  </div>

                  <div className="overviewItem">
                    <span className="overviewLabel">Website</span>
                    <span className="overviewValue">{form.website || "Not set"}</span>
                  </div>
                </div>
              </div>
              <div className="accountCard">
                <div className="sectionHeader">
                  <h2>Social media</h2>
                  <p>add your social media links</p>
                </div>
                <div className="formGroup">
                  <label htmlFor="socialmedia">Social Media Link</label>
                  <input
                    id = "socialmedia"
                    name = "socialmedia"
                    type="text"
                    value={form1.socialmedia}
                    onChange={handleChange1}
                    className="accountInput"
                    placeholder="Enter your social media link"
                    />
                    <label htmlFor="socialmedia1">Social Media Link</label>
                  <input
                    id = "socialmedia1"
                    name = "socialmedia1"
                    type="text"
                    value={form1.socialmedia}
                    onChange={handleChange1}
                    className="accountInput"
                    placeholder="Enter your social media link"
                    />
                    <label htmlFor="socialmedia2">Social Media Link</label>
                  <input
                    id = "socialmedia2"
                    name = "socialmedia2"
                    type="text"
                    value={form1.socialmedia}
                    onChange={handleChange1}
                    className="accountInput"
                    placeholder="Enter your social media link"
                    />
                    {savedMessage && (
                  <div className="successMessage">{savedMessage}</div>
                )}

                <div className="actionRow">
                  <button type="submit" className="btn btnPrimary">
                    Save Changes
                  </button>
                </div>
                </div>
              </div>

              <div className="accountCard dangerCard">
                <div className="sectionHeader">
                  <h2>Delete your account</h2>
                  <p>Permanently remove your SponsorMatch account.</p>
                </div>

                <div className="dangerBox">
                  <p>
                    Deleting your profile will permanently remove all of your
                    data such as your email address, onboarding preferences, and
                    account details. This action can't be undone.
                  </p>

                  {!deleteConfirm ? (
                    <button
                      type="button"
                      className="btn btnDanger"
                      onClick={() => setDeleteConfirm(true)}
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div className="deleteConfirmBox">
                      <p className="deleteWarning">
                        Are you sure you want to delete your account?
                      </p>
                      <div className="deleteActions">
                        <button
                          type="button"
                          className="btn btnDanger"
                          onClick={handleDeleteAccount}
                        >
                          Yes, Delete
                        </button>
                        <button
                          type="button"
                          className="btn btnGhost"
                          onClick={() => setDeleteConfirm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer/>         
    </>
  );
}