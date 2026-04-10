import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  title: "Playrift",
  description: "AI-powered game recommendations based on your current Steam behavior."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = [manrope.variable, spaceGrotesk.variable].sort().join(" ");

  return (
    <html lang="en" className="dark">
      <body
        className={`${fontVars} font-body antialiased tracking-tight bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container`}
      >
        {children}
      </body>
    </html>
  );
}
