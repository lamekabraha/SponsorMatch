import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        {children}
      </body>
    </html>
  );
}