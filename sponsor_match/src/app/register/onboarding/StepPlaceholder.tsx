'use client';

interface StepPlaceholderProps {
    stepName: string;
    onComplete: () => void;
}

export default function StepPlaceholder({ stepName, onComplete }: StepPlaceholderProps) {
    return (
        <div className="flex flex-col gap-2.5">
            <p className="font-Body text-Black/70">
                Coming soon: {stepName}
            </p>
            <button
                type="button"
                onClick={onComplete}
                className="mt-3.5 h-[42px] rounded-lg border-0 bg-Yellow text-Black font-Body font-bold text-sm hover:bg-Black/90 hover:text-White transition duration-200"
            >
                Next
            </button>
        </div>
    );
}
