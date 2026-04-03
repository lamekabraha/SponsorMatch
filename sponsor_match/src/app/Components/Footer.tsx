import { authConfig } from "@/lib/auth-config";
import Instagram from "next-auth/providers/instagram";
import Link from "next/link";

export default function Footer() {
    return (
        <div className="bg-Black w-full flex bottom-0 left-0">
            <div className="group">
                <img
                src = "/logo2.png"
                alt="FundingI Logo"
                width={175}
                height="auto"
                className="justify-start"
                />
            </div>
            <div className="bg-Black w-full flex sticky bottom-0 left-0 justify-end gap-4">
                <Link href = "https://www.instagram.com/fundingiukire/" target="_blank">
                    <img
                        src="/instagram.png"
                        alt= "instagram"
                        width={50}
                        height={50}
                    />
                </Link>
                <Link href = "https://www.tiktok.com/@fundingi?_t=8oqECv4W0X2&_r=1" target="_blank">
                    <img
                        src= "/tiktok.png"
                        alt = "TikTok"
                        width={50}
                        height={50}
                    />
                </Link>
            </div>
        </div>
    );
}