import OnboardingWizard from './OnboardingWizard';
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { getSession } from '@/auth';

export default async function OnboardingPage() {
    const session = await getSession();
    const accountTypeId = (session?.user as { accountTypeId?: number })?.accountTypeId ?? 2;
    const accountType = (accountTypeId === 1 ? 1 : 2) as 1 | 2;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center py-10 px-4 font-Body">
            <div className="text-center mb-[18px]">
                <h1 className="text-3xl font-Heading font-bold text-Black mt-10">
                    Welcome to SponsorMatch
                </h1>
                <p className="text-xs text-Black/65 mt-2 font-Body">
                    Set up your organisation profile
                </p>
            </div>
            <div className="bg-White border border-Black/12 border-t-[5px] border-t-Yellow rounded-[10px] p-6 shadow-[0_8px_25px_rgba(0,0,0,0.05)]">
                <OnboardingWizard accountType={accountType} />
            </div>
            </div>
        </>
    );
}