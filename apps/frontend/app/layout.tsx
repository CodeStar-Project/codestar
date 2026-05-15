import type { Metadata, Viewport } from "next";
import { Outfit, Instrument_Serif } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { getMe } from "@/app/actions/auth";
import { getInstanceBranding } from "@/app/actions/instance";
import { AuthProvider } from "@/components/auth-provider";
import { BrandingProvider } from "@/components/branding-provider";
import { MeshBackground } from "@/components/ui/mesh-background";
import { SITE_URL } from "@/lib/site";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Codestar — Open-source e-learning, hosted by you",
    template: "%s · Codestar",
  },
  description:
    "Codestar is an open-source e-learning platform under GPL v3. Self-host your instance via Docker. Your data never leaves your server.",
  applicationName: "Codestar",
  keywords: [
    "open-source e-learning",
    "self-hosted LMS",
    "GPL v3 learning platform",
    "Moodle alternative",
    "educational data sovereignty",
    "Docker LMS",
    "block course editor",
    "learner leaderboard",
    "Codestar",
  ],
  authors: [
    { name: "Codestar Project", url: "https://github.com/CodeStar-Project" },
  ],
  creator: "Codestar Project",
  publisher: "Codestar Project",
  category: "education",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Codestar",
    title: "Codestar — Sovereign e-learning, on your servers",
    description:
      "Open-source e-learning platform, self-hosted via Docker, under GPL v3. Your data stays with you.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Codestar — Sovereign e-learning",
    description:
      "Open-source e-learning platform, hosted by you, under GPL v3.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1422" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Codestar",
  url: SITE_URL,
  description: "Open-source self-hosted e-learning platform under GPL v3.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Linux, macOS, Windows (WSL2)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  license: "https://www.gnu.org/licenses/gpl-3.0.html",
  codeRepository: "https://github.com/CodeStar-Project",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [locale, messages, branding, me] = await Promise.all([
    getLocale(),
    getMessages(),
    getInstanceBranding(),
    getMe(),
  ]);

  return (
    <html
      lang={locale}
      className={`${outfit.variable} ${instrumentSerif.variable} h-full antialiased`}
      style={
        {
          "--color-accent-raw": branding.accent,
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col bg-bg-base text-text font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <MeshBackground />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <BrandingProvider branding={branding}>
            <AuthProvider initialUser={me}>{children}</AuthProvider>
          </BrandingProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
