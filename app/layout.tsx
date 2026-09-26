import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resonance — AI Resume Builder",
  description:
    "Professional, editorial resumes worth remembering. Build with premium templates, live preview, and considered design.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} antialiased`}
    >
      <body className="bg-cream text-charcoal font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
