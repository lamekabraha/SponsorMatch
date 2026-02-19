'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageDropzone from '@/app/Components/DragandDrop';

interface VerificationFormProps {
    onComplete?: () => void;
}

export default function VerificationForm({ onComplete }: VerificationFormProps) {
    const router = useRouter();
    const [verificationFile, setVerificationFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!verificationFile) {
            alert('Please upload a verification document.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('verificationDoc', verificationFile);

            const res = await fetch('/api/auth/register/onboarding/vcse/verification', {
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
            console.error('Error uploading verification:', error);
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
                Verification Documents {requiredSpan}
            </label>
            <ImageDropzone
                multiple={false}
                accept=".jpg,.jpeg,.png,.pdf"
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                onFilesChange={(files) => setVerificationFile(files[0] ?? null)}
            />
            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3.5 h-[42px] rounded-lg border-0 bg-Yellow text-Black font-Body font-bold text-sm hover:bg-Black/90 hover:text-White transition duration-200 disabled:opacity-50 disabled:hover:bg-Yellow disabled:hover:text-Black"
            >
                {isSubmitting ? 'Uploading...' : 'Complete'}
            </button>
        </form>
    );
}
