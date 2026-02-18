'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

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

export default function BasicInfoForm() {
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
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        console.log({ ...data, primaryFocusAreas });
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="font-Body text-base text-Black block">
                <span className="text-Black hidden sm:inline">Organisation Type *</span>
                <select
                    name="orgType"
                    className="w-full mt-2 px-4 py-3 border border-Black/20 rounded-md font-Body text-Black bg-White focus:outline-none focus:ring-2 focus:ring-Yellow focus:border-transparent"
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                >
                    <option value="">Select organisation type.</option>
                    <option value="business">Business</option>
                    <option value="vcse">VCSE / Charity</option>
                </select>
            </label>

            <label className="font-Body text-base text-Black block">
                <span className="text-Black hidden sm:inline">Organisation Address *</span>
                <input
                    name="orgAddress"
                    type="text"
                    className="w-full mt-2 px-4 py-3 border border-Black/20 rounded-md font-Body text-Black placeholder:text-Black/50 bg-White focus:outline-none focus:ring-2 focus:ring-Yellow focus:border-transparent"
                    placeholder="Enter your organisation's address"
                    value={orgAddress}
                    onChange={(e) => setOrgAddress(e.target.value)}
                />
            </label>

            <label className="font-Body text-base text-Black block">
                <span className="text-Black hidden sm:inline">Primary Focus Area *</span>
                <div ref={focusDropdownRef} className="relative mt-2">
                    <button
                        type="button"
                        onClick={() => setFocusDropdownOpen(!focusDropdownOpen)}
                        className="w-full px-4 py-3 border border-Black/20 rounded-md font-Body text-Black bg-White focus:outline-none focus:ring-2 focus:ring-Yellow focus:border-transparent text-left flex items-center justify-between"
                    >
                        <span className={primaryFocusAreas.length === 0 ? 'text-Black/50' : ''}>
                            {displayLabel}
                        </span>
                        {CHEVRON_ICON}
                    </button>
                    {focusDropdownOpen && (
                        <ul className="absolute z-10 w-full mt-1 py-2 bg-White border border-Black/20 rounded-md shadow-lg max-h-60 overflow-auto">
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
            </label>

            <label className="font-Body text-base text-Black block ">
                <span className="text-Black hidden sm:inline">Charity Registration Number *</span>
                <input
                    name="regNumber"
                    type="text"
                    className="w-full mt-2 px-4 py-3 border border-Black/20 rounded-md font-Body text-Black placeholder:text-Black/50 bg-White focus:outline-none focus:ring-2 focus:ring-Yellow focus:border-transparent"
                    value={regNumber}
                    placeholder="charity registration number"
                    onChange={(e) => setRegNumber(e.target.value)}
                />
            </label>

            <div className="flex justify-end pt-4">
                <Link
                    href="/register/onboarding/branding"
                    className="px-6 py-3 bg-[var(--color-Grey-dark)] text-White font-Body font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                    Next
                </Link>
            </div>
        </form>
    );
}
