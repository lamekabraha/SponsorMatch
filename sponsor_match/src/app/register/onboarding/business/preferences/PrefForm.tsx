'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OrgPref {
    VcseTypeId: number;
    name?: string;
}

interface CampainBenefits {
    benefitId: number;
    benefitName: string;
}

interface PreferencesFormProps {
    onComplete?: () => void;
}

export default function PreferencesForm({ onComplete }: PreferencesFormProps) {
    const router = useRouter();
    const [orgPrefs, setOrgPrefs] = useState<OrgPref[]>([]);
    const [selectedOrgPref, setSelectedOrgPref] = useState<number[]>([]);
    const [benefits, setBenefits] = useState<CampaignBenefits[]>([]);
    const [selectedBenefits, setSelectedBenefits] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchOrgPrefData = async () => {
            try {
                const response = await fetch('/api/auth/register/onboarding/OrgTypes');
                if (!response.ok) {
                    throw new Error('Failed to fetch organisation types');
                }
                const data = await response.json();
                setOrgPrefs(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch organisation types', error);
            }
        };

        const fetchCampaignBenefitData = async () => {
            try {
                const response = await fetch('/api/campaign/BenefitTypes');
                if (!response.ok) {
                    throw new Error('Failed to fetch campain benefit types');
                }
                const data = await response.json();
                setBenefits(Array.isArray(data) ? data: []);
            }catch(error) {
                console.error('Failed to fetch campaign benefit types', error);
            }
        };

        fetchCampaignBenefitData();
        fetchOrgPrefData();
    }, []);

    const handleOrgPrefToggle = (id: number) => {
        setSelectedOrgPref((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleBenefitToggle = (id: number) => {
        setSelectedBenefits((prev) => 
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/auth/register/onboarding/business/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedOrgPref, selectedBenefits }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Failed to save. Please try again.');
                return;
            }
            if (onComplete) {
                onComplete();
            } else {
                router.push('/register/onboarding');
                router.refresh();
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
            <label className='font-Heading text-lg'>
                Types of organisations you'd like to support
            </label>
            {orgPrefs.map((orgPref) => (
                <div key={orgPref.VcseTypeId} className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id={`pref-${orgPref.VcseTypeId}`}
                        checked={selectedOrgPref.includes(orgPref.VcseTypeId)}
                        onChange={() => handleOrgPrefToggle(orgPref.VcseTypeId)}
                        className="w-5 h-5 border-2 border-Black/45 rounded cursor-pointer accent-Yellow"
                    />
                    <label
                        htmlFor={`pref-${orgPref.VcseTypeId}`}
                        className="font-Body text-Black cursor-pointer flex-1"
                    >
                        {orgPref.Name ?? orgPref.VcseType ?? `Type ${orgPref.VcseTypeId}`}
                    </label>
                </div>
            ))}

            <label>Annual CSR/Sponsorship Budget</label>
            <input type='text'className="border-Black border-2 rounded-md"/>


            <div className="gap-4">
                <label className="font-Heading text-lg">Partnership benefits you are intrested in: </label>
                {benefits.map((benefit) => (
                    <div key={benefit.benefitId} className="flex items-center gap-3 text-md">
                        <input
                            type="checkbox"
                            id={benefit.benefitId}
                            checked={selectedBenefits.includes(benefit.benefitId)}
                            onChange={() => handleBenefitToggle(benefit.benefitId)}
                            className="w-5 h-5 border-2 border-Black/45 rounded cursor-pointer accent-Yellow"
                        />
                        <label
                            htmlFor={benefit.benefitId}
                            className="font-Body text-Black cursor-pointer flex-1"
                        >
                            {benefit.benefitName}
                        </label>
                    </div>
                ))}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3.5 h-[42px] rounded-lg border-0 bg-Yellow text-Black font-Body font-bold text-sm hover:bg-Black/90 hover:text-White transition duration-200 disabled:opacity-50 disabled:hover:bg-Yellow disabled:hover:text-Black"
            >
                {isSubmitting ? 'Saving...' : 'Next'}
            </button>
        </form>
    );
}