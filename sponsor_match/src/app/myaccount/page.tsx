"use client";

import { useState } from "react";
import Navbar from "../Components/Navbar";
import "./myaccount.css";

export default function MyAccountPage() {
  const [form, setForm] = useState({
    firstName: "Bob",
    lastName: "Smith",
    username: "bob123",
    phone: "+44 7123 456789",
    email: "bob23@example.com",
    bio: "Content creator focused on gaming, lifestyle and brand partnerships.",
  });

  const [savedMessage, setSavedMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage("Your account details have been updated.");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleDeleteAccount = () => {
    alert("Delete account logic goes here.");
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
                Manage your personal details, email, and account preferences.
              </span>
            </div>
          </div>

          <div className="accountTitleRow">
            <div>
              <h1 className="accountTitle">My Account</h1>
              <p className="accountSubtitle">
                Keep your profile information up to date for better
                matches.
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
                    data such as your email address and account details. This
                    action can't be undone.
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
    </>
  );
}