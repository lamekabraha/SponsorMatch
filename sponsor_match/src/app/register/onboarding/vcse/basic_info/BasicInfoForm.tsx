'use client';

import { useState, useRef, useEffect } from 'react';
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
    const [orgType, setOrgType] = useState('');
    const [orgAddress, setOrgAddress] = useState('');
    const [primaryFocusAreas, setPrimaryFocusAreas] = useState<string[]>([]);
    const [focusDropdownOpen, setFocusDropdownOpen] = useState(false);
    const focusDropdownRef = useRef<HTMLDivElement>(null);
    const [regNumber, setRegNumber] = useState('');

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (focusDropdownRef.current && !focusDropdownRef.current.contains(event.target as Node)) {
                setFocusDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleFocusArea = (value: string) => {
        setPrimaryFocusAreas((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const displayLabel = primaryFocusAreas.length > 0
        ? FOCUS_AREAS.filter((a) => primaryFocusAreas.includes(a.value)).map((a) => a.label).join(', ')
        : 'Select primary focus';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!orgAddress?.trim() || primaryFocusAreas.length === 0) {
            alert('Please fill in Organisation Address and Primary Focus Area.');
            return;
        }

        try {
            const res = await fetch('/api/auth/register/onboarding/vcse/basic_info', {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    orgType,
                    orgAddress,
                    primaryFocusAreas,
                    regNumber,
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
                router.push('/register/onboarding/vcse/branding');
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
                Organisation Type {requiredSpan}
            </label>
            <select
                name="orgType"
                className={`${inputClass} py-0`}
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
            >
                <option value="">Select organisation type.</option>
                <option value="business">Business</option>
                <option value="vcse">VCSE / Charity</option>
            </select>

            <label className={labelClass}>
                Organisation Address {requiredSpan}
            </label>
            <input
                name="orgAddress"
                type="text"
                className={inputClass}
                placeholder="Enter your organisation's address"
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
            />

            <label className={labelClass}>
                Primary Focus Area {requiredSpan}
            </label>
            <div ref={focusDropdownRef} className="relative">
                <button
                    type="button"
                    onClick={() => setFocusDropdownOpen(!focusDropdownOpen)}
                    className={`w-full h-[38px] px-3 rounded-lg border font-Body text-left flex items-center justify-between ${inputClass}`}
                >
                    <span className={primaryFocusAreas.length === 0 ? 'text-Black/50' : 'text-Black'}>
                        {displayLabel}
                    </span>
                    {CHEVRON_ICON}
                </button>
                {focusDropdownOpen && (
                    <ul className="absolute z-10 w-full mt-1 py-2 bg-White border border-Black/20 rounded-lg shadow-lg max-h-60 overflow-auto font-Body">
                        {FOCUS_AREAS.map((area) => (
                            <li
                                key={area.value}
                                onClick={() => toggleFocusArea(area.value)}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-Yellow/20 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={primaryFocusAreas.includes(area.value)}
                                    readOnly
                                    className="w-4 h-4 rounded border-Black/30 text-Yellow focus:ring-Yellow"
                                />
                                {area.label}
                            </li>
                        ))}
                    </ul>
                )}
                {primaryFocusAreas.map((v) => (
                    <input key={v} type="hidden" name="primaryFocusAreas" value={v} />
                ))}
            </div>

            <label className={labelClass}>
                Charity Registration Number {requiredSpan}
            </label>
            <input
                name="regNumber"
                type="text"
                className={inputClass}
                value={regNumber}
                placeholder="charity registration number"
                onChange={(e) => setRegNumber(e.target.value)}
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
