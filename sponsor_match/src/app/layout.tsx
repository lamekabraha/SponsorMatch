import type { Metadata } from "next";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Providers from "./Components/Providers";
import Footer from "./Components/Footer";

config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Sponsor Match",
  description: "Sponsor Match is the perfect platform to match you with the right sponsors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Providers>
          <div className='grow'>
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}