'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageDropzone from '@/app/Components/DragandDrop';

interface BrandingFormProps {
    onComplete?: () => void;
}

export default function BrandingForm({ onComplete }: BrandingFormProps) {
    const router = useRouter();
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!logoFile) {
            alert('Please upload an organisation logo.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('logo', logoFile);
            if (coverFile && coverFile.size > 0) {
                formData.append('cover', coverFile);
            }

            const res = await fetch('/api/auth/register/onboarding/vcse/branding', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Failed to upload. Please try again.');
                return;
            }
            if (onComplete) {
                onComplete();
            } else {
                router.push('/register/onboarding');
                router.refresh();
            }
        } catch (error) {
            console.error('Error uploading branding:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const labelClass = "text-xs font-bold mt-1.5 font-Body text-Black block";
    const requiredSpan = <span className="text-Yellow font-black">*</span>;

    return (
        <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
            <label className={labelClass}>
                Organisation Logo {requiredSpan}
            </label>
            <ImageDropzone
                multiple={false}
                onFilesChange={(files) => setLogoFile(files[0] ?? null)}
            />
            <label className={labelClass}>
                Cover Image (Optional)
            </label>
            <ImageDropzone
                multiple={false}
                onFilesChange={(files) => setCoverFile(files[0] ?? null)}
            />
            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3.5 h-[42px] rounded-lg border-0 bg-Yellow text-Black font-Body font-bold text-sm hover:bg-Black/90 hover:text-White transition duration-200 disabled:opacity-50 disabled:hover:bg-Yellow disabled:hover:text-Black"
            >
                {isSubmitting ? 'Uploading...' : 'Next'}
            </button>
        </form>
    );
}
