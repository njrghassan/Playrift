import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Playrift",
  description: "AI-powered game recommendations based on your current Steam behavior."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.className} ${spaceGrotesk.className} bg-surface text-on-surface`}>
        {children}
      </body>
    </html>
  );
}
