'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BasicInfoForm from './vcse/basic_info/BasicInfoForm';
import BusinessBasicInfoForm from './business/basic_info/BasicInfoForm';
import BrandingForm from './vcse/branding/BrandingForm';
import BusinessBrandingForm from './business/branding/BrandingForm'
import StepPlaceholder from './StepPlaceholder';
import Preferences from  './business/preferences/PrefForm'
import ContactForm from './vcse/contact/ContactForm';
import VerificationForm from './vcse/verification/VerificationForm';

type StepConfig = {
    id: number;
    title: string;
    component: React.ComponentType<{ onComplete: () => void }> | null;
};

const VCSE_STEPS: StepConfig[] = [
    { id: 1, title: 'Basic', component: BasicInfoForm },
    { id: 2, title: 'Branding', component: BrandingForm },
    { id: 3, title: 'Contact', component: ContactForm },
    { id: 4, title: 'Verification', component: VerificationForm },
];

const BUSINESS_STEPS: StepConfig[] = [
    { id: 1, title: 'Company Details', component: BusinessBasicInfoForm },
    { id: 2, title: 'Branding', component: BusinessBrandingForm },
    { id: 3, title: 'Preferences', component: Preferences },
];

interface OnboardingWizardProps {
    accountType: 1 | 2;
}

export default function OnboardingWizard({ accountType }: OnboardingWizardProps) {
    const router = useRouter();
    const steps = accountType === 2 ? VCSE_STEPS : BUSINESS_STEPS;
    const [currentStep, setCurrentStep] = useState(1);

    const handleStepComplete = () => {
        if (currentStep >= steps.length) {
            router.push('/dashboard');
            router.refresh();
        } else {
            setCurrentStep((s) => s + 1);
        }
    };

    const step = steps[currentStep - 1];
    const StepComponent = step?.component;

    return (
        <div>
            <p className="text-[13px] text-Black/75 font-Body mb-3">Step {currentStep} of {steps.length}</p>
            <div className="flex gap-2 mb-6">
                {steps.map((s, i) => (
                    <div key={s.id} className="flex items-center flex-1">
                        <div
                            className={`flex items-center gap-2 py-2 px-3 rounded-[10px] text-sm font-Body font-medium transition duration-200 ${
                                currentStep === s.id
                                    ? 'bg-Black/82 text-White border border-Black/82'
                                    : i + 1 < currentStep
                                    ? 'bg-Yellow/30 text-Black border border-Yellow/30'
                                    : 'bg-White text-Black/60 border border-Black/20'
                            }`}
                        >
                            <span>{s.id}</span>
                            <span className="hidden sm:inline">{s.title}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="flex-1 h-0.5 bg-Black/20 mx-1 min-w-[8px]" aria-hidden />
                        )}
                    </div>
                ))}
            </div>

            <h2 className="font-Heading text-2xl font-bold text-Black mb-6">
                {step?.title}
            </h2>

            {StepComponent ? (
                <StepComponent onComplete={handleStepComplete} />
            ) : (
                <StepPlaceholder stepName={step?.title ?? 'Step'} onComplete={handleStepComplete} />
            )}
        </div>
    );
}
