import { getServerSession } from "next-auth";
import { authConfig } from "../../../../../../auth.config";
import BasicInfoForm from './BasicInfoForm';


export default async function BasicInfoPage() {
    const session = await getServerSession(authConfig);
    const accountType = (session?.user as { accountType?: number })?.accountType;
    return (
        <div className="min-h-screen bg-[var(--color-Grey)] font-Body">
            <div className="max-w-2xl mx-auto px-6 py-10">
                <h1 className="font-Heading text-3xl font-bold text-Black">
                    Welcome to SponsorMatch
                </h1>
                <p className="font-Body text-lg text-Black mt-2">
                    Set up your organisation profile
                </p>

                {/* Form card */}
                <div className="bg-White rounded-lg shadow-sm border border-Black/10 p-6">
                    <h2 className="font-Heading text-2xl font-bold text-Black mb-6">
                        Basic Information
                    </h2>
                    <BasicInfoForm/>
                </div>
            </div>
        </div>
    );
}