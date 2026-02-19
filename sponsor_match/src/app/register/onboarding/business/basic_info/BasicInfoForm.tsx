'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CHEVRON_ICON = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 fill-Black inline ml-2" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M11.99997 18.1669a2.38 2.38 0 0 1-1.68266-.69733l-9.52-9.52a2.38 2.38 0 1 1 3.36532-3.36532l7.83734 7.83734 7.83734-7.83734a2.38 2.38 0 1 1 3.36532 3.36532l-9.52 9.52a2.38 2.38 0 0 1-1.68266.69734z" clipRule="evenodd" />
    </svg>
);

const FOCUS_AREAS = [
    { value: 'sports', label: 'Sports' },
    { value: 'education', label: 'Education' },
    { value: 'health', label: 'Health' },
    { value: 'arts-culture', label: 'Arts & Culture' },
    { value: 'environment', label: 'Environment' },
    { value: 'technology', label: 'Technology' },
    { value: 'community', label: 'Community Development' },
];

interface BasicInfoFormProps {
    onComplete?: () => void;
}

export default function BasicInfoForm({ onComplete }: BasicInfoFormProps) {
    const router = useRouter();
    const [companyAddress, setCompanyAddress] = useState('');
    const [industry, setIndustry] = useState('');
    const [companySize, setCompanySize] = useState(''); // 1-10, 11-50, 51-100, 101-500, 501-1000, 1001-5000, 5001-10000, 10001-50000, 50001-100000, 100001-500000, 500001-1000000
    const [website, setWebsite] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!companyAddress?.trim() || !industry?.trim() || !companySize?.trim()) {
            alert('Please fill in Company Address and Industry and Company Size.');
            return;
        }

        try {
            const res = await fetch('/api/auth/register/onboarding/business/basic_info', {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    companyAddress,
                    industry,
                    companySize,
                    website: website || undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Failed to save. Please try again.');
                return;
            }
            if (onComplete) {
                onComplete();
            } else {
                router.push('/register/onboarding/business/branding');
                router.refresh();
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred. Please try again.');

        }
    };

    const inputClass = "w-full h-[38px] px-3 rounded-lg border border-Black/45 font-Body text-Black bg-White placeholder:text-Black/50 focus:outline-none focus:border-Yellow focus:ring-[3px] focus:ring-Yellow/35 transition duration-200";
    const labelClass = "text-xs font-bold mt-1.5 font-Body text-Black block";
    const requiredSpan = <span className="text-Yellow font-black">*</span>;

    return (
        <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
            <label className={labelClass}>
                Company Address {requiredSpan}
            </label>
            <input
                name="companyAddress"
                type="text"
                className={inputClass}
                placeholder="Enter your company address"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
            />

            <label className={labelClass}>
                Industry {requiredSpan}
            </label>
            <select
                name="industry"
                className={inputClass}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
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

            <label className={labelClass}>
                Company Size {requiredSpan}
            </label>
            <select
                name="companySize"
                className={inputClass}
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
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
            <label className={labelClass}>Website {requiredSpan}</label>
            <input
                name="website"
                type="text"
                className={inputClass}
                placeholder="Enter your company website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
            />
            <button
                type="submit"
                className="mt-3.5 h-[42px] rounded-lg border-0 bg-Yellow text-Black font-Body font-bold text-sm hover:bg-Black/90 hover:text-White transition duration-200"
            >
                Next
            </button>
        </form>
    );
}
