import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { getMe } from "@/app/actions/auth";
import { getInstanceBranding } from "@/app/actions/instance";
import { AuthProvider } from "@/components/auth-provider";
import { BrandingProvider } from "@/components/branding-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
import { MeshBackground } from "@/components/ui/mesh-background";
import { SITE_URL } from "@/lib/site";
import { DEFAULT_THEME, isTheme, resolveTheme, THEME_COOKIE } from "@/lib/theme";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
  const [locale, messages, branding, me, cookieStore] = await Promise.all([
    getLocale(),
    getMessages(),
    getInstanceBranding(),
    getMe(),
    cookies(),
  ]);

  const themeCookie = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isTheme(themeCookie) ? themeCookie : DEFAULT_THEME;
  const resolvedTheme = resolveTheme(theme);

  return (
    <html
      lang={locale}
      data-theme={resolvedTheme}
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
      style={
        {
          "--color-accent-raw": branding.accent,
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col bg-bg-base text-text font-sans">
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <MeshBackground />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider initialTheme={theme} initialResolved={resolvedTheme}>
            <BrandingProvider branding={branding}>
              <AuthProvider initialUser={me}>{children}</AuthProvider>
            </BrandingProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
