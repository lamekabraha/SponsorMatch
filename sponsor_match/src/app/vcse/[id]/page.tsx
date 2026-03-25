'use client';

import Image from "next/image";
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar';

interface VCSEProfile {
  account: {
    id: number;
    name: string;
    industry: string;
    description: string;
    logo: string | null;
    cover: string | null;
    contact: {
      name: string;
      email: string;
      phone: string;
    };
  };
  verification: {
    isVerified: boolean;
    document: string;
  };
  locations: Array<{ address: string }>;
  impact: {
    totalRaised: number;
    activeCampaigns: number;
    totalCampaigns: number;
    donationsCount: number;
  };
  campaigns: Array<{
    id: number;
    name: string;
    coverImage: string | null;
    goal: number;
    raised: number;
    progress: number;
  }>;
  benefits: Array<{
    name: string;
    description: string;
  }>;
  isFollowed: boolean;
}

export default function VCSEPage() {
  const params = useParams();
  const id = (params as any).id as string;

  const [profile, setProfile] = useState<VCSEProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowed, setIsFollowed] = useState(false);

  useEffect(() => {
    const fetchVCSEProfile = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/vcse/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('VCSE organization not found');
          } else if (response.status === 401) {
            throw new Error('Please log in to view this profile');
          } else {
            throw new Error('Failed to load VCSE profile');
          }
        }

        const data: VCSEProfile = await response.json();
        setProfile(data);
        setIsFollowed(data.isFollowed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVCSEProfile();
  }, [id]);

  const handleFollowToggle = async () => {
    setIsFollowed(!isFollowed);
    alert(isFollowed ? 'Unfollowed!' : 'Followed!');
  };

  if (loading) {
    return (
      <div className="p-6 bg-[#f7f7f7] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading VCSE profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#f7f7f7] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-yellow-400 px-4 py-2 rounded-full font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <Navbar />

      <div className="p-6">

        {/* HERO / COVER */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border">
        <div className="relative h-[250px] w-full">
          <Image
            src={profile.account.cover || "/images/basketball-cover.jpg"}
            alt="cover"
            fill
            className="object-cover"
            unoptimized={profile.account.cover?.startsWith('http://localhost')}
          />

          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="absolute top-4 left-4 bg-yellow-400 px-4 py-2 rounded-full font-medium shadow"
          >
            ← Back
          </button>

          {/* Follow Button (business action) */}
          <button
            onClick={handleFollowToggle}
            className={`absolute top-4 right-4 px-4 py-2 rounded-full font-medium shadow ${
              isFollowed ? 'bg-gray-400' : 'bg-yellow-400'
            }`}
          >
            {isFollowed ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* TITLE SECTION */}
        <div className="p-6 flex items-center gap-4">
          {/* LOGO */}
          <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
            <Image
              src={profile.account.logo || "/images/logo.png"}
              alt="logo"
              width={64}
              height={64}
              className="object-cover"
              unoptimized={profile.account.logo?.startsWith('http://localhost')}
            />
          </div>

          <div>
            <h1 className="text-2xl font-semibold">
              {profile.account.name}
            </h1>

            <p className="text-gray-500">
              VCSE Organisation
            </p>

            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className="bg-yellow-100 text-black px-2 py-1 rounded-full">
                {profile.account.industry}
              </span>
              {profile.locations.length > 0 && (
                <span className="text-gray-500">
                  {profile.locations[0].address.split(',')[1]?.trim() || profile.locations[0].address}
                </span>
              )}
              {profile.verification.isVerified && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-3 gap-6 mt-6">

        {/* LEFT COLUMN */}
        <div className="col-span-2 space-y-6">

          {/* ABOUT */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="font-semibold mb-2">
              About this organisation
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {profile.account.description || "No description available."}
            </p>

            <div className="mt-4 text-sm text-gray-500">
              <p>Sector: {profile.account.industry}</p>
            </div>
          </div>

          {/* PARTNERSHIP BENEFITS */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="font-semibold mb-4">
              Why partner with us
            </h2>

            <ul className="space-y-2 text-gray-700">
              {profile.benefits.map((benefit, index) => (
                <li key={index}>✔ {benefit.name}: {benefit.description}</li>
              ))}
              {profile.benefits.length === 0 && (
                <li className="text-gray-500">No benefits listed</li>
              )}
            </ul>
          </div>

          {/* ACTIVE CAMPAIGNS */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="font-semibold mb-4">
              Active Campaigns ({profile.impact.activeCampaigns})
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {profile.campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg overflow-hidden">
                  <div className="h-32 bg-gray-200 relative">
                    <Image
                      src={campaign.coverImage || "/images/basketball-cover.jpg"}
                      alt="campaign"
                      fill
                      className="object-cover"
                      unoptimized={campaign.coverImage?.startsWith('http://localhost')}
                    />
                  </div>

                  <div className="p-3">
                    <h3 className="font-medium">
                      {campaign.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      £{campaign.raised.toLocaleString()} of £{campaign.goal.toLocaleString()}
                    </p>

                    <div className="w-full bg-gray-200 h-2 rounded mt-2">
                      <div
                        className="bg-black h-2 rounded"
                        style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                      />
                    </div>

                    <button className="mt-3 w-full bg-yellow-400 py-2 rounded-full">
                      View Campaign
                    </button>
                  </div>
                </div>
              ))}

              {profile.campaigns.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  No active campaigns
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* IMPACT / STATS */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="font-semibold mb-4">
              Organisation Impact
            </h2>

            <div className="space-y-3">
              <p className="text-lg font-semibold">£{profile.impact.totalRaised.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total raised</p>

              <p className="text-lg font-semibold">{profile.impact.activeCampaigns}</p>
              <p className="text-sm text-gray-500">Active campaigns</p>

              <p className="text-lg font-semibold">{profile.impact.totalCampaigns}</p>
              <p className="text-sm text-gray-500">Total campaigns</p>

              <p className="text-lg font-semibold">{profile.impact.donationsCount}</p>
              <p className="text-sm text-gray-500">Total donations</p>
            </div>
          </div>

          {/* CONTACT */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="font-semibold mb-4">
              Contact
            </h2>

            <p className="text-sm">{profile.account.contact.name}</p>
            <p className="text-sm text-gray-500">
              {profile.account.contact.email}
            </p>
            <p className="text-sm text-gray-500">
              {profile.account.contact.phone}
            </p>

            <button className="mt-4 w-full bg-yellow-400 py-2 rounded-full">
              Request Partnership
            </button>
          </div>

          {/* LOCATIONS */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="font-semibold mb-4">
              Locations ({profile.locations.length})
            </h2>

            {profile.locations.map((location, index) => (
              <p key={index} className="text-sm text-gray-600 mb-2">
                📍 {location.address}
              </p>
            ))}

            {profile.locations.length === 0 && (
              <p className="text-sm text-gray-500">No locations listed</p>
            )}
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}