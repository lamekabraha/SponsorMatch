'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ContactFormProps {
    onComplete?: () => void;
}

export default function ContactForm({ onComplete }: ContactFormProps) {
    const router = useRouter();
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [additionalAdmins, setAdditionalAdmins] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!contactName.trim()) {
            alert('Primary contact name is required.');
            return;
        }
        if (!contactEmail.trim()) {
            alert('Contact email is required.');
            return;
        }
        if (!contactPhone.trim()) {
            alert('Contact phone is required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/auth/register/onboarding/vcse/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contactName: contactName.trim(),
                    contactEmail: contactEmail.trim(),
                    contactPhone: contactPhone.trim(),
                    additionalAdmins: additionalAdmins.trim() || undefined,
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
                router.push('/register/onboarding');
                router.refresh();
            }
        } catch (error) {
            console.error('Error saving contact:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full h-[38px] px-3 rounded-lg border border-Black/45 font-Body text-Black bg-White placeholder:text-Black/50 focus:outline-none focus:border-Yellow focus:ring-[3px] focus:ring-Yellow/35 transition duration-200";
    const labelClass = "text-xs font-bold mt-1.5 font-Body text-Black block";
    const requiredSpan = <span className="text-Yellow font-black">*</span>;

    return (
        <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
            <label className={labelClass}>
                Primary Contact Name {requiredSpan}
            </label>
            <input
                type="text"
                className={inputClass}
                placeholder="Full name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
            />
            <label className={labelClass}>
                Contact Email {requiredSpan}
            </label>
            <input
                type="email"
                className={inputClass}
                placeholder="Email address"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
            />
            <label className={labelClass}>
                Contact Phone {requiredSpan}
            </label>
            <input
                type="tel"
                className={inputClass}
                placeholder="Phone number"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
            />
            <label className={labelClass}>
                Additional Admin Users (optional)
            </label>
            <textarea
                className="w-full min-h-[100px] px-3 py-3 rounded-lg border border-Black/45 font-Body text-Black bg-White placeholder:text-Black/50 focus:outline-none focus:border-Yellow focus:ring-[3px] focus:ring-Yellow/35 transition duration-200 resize-y"
                placeholder="Enter email addresses separated by commas"
                value={additionalAdmins}
                onChange={(e) => setAdditionalAdmins(e.target.value)}
                rows={3}
            />

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
