import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

import "./globals.css";

// Prevent FA from injecting its own CSS (we already imported it above).
config.autoAddCss = false;

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const SITE_URL = "https://codestar.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CodeStar — La plateforme e-learning souveraine, hébergée chez vous",
    template: "%s · CodeStar",
  },
  description:
    "CodeStar est une plateforme e-learning open source, sous licence GPL v3. Déployez votre instance via Docker. Vos données ne quittent jamais votre serveur.",
  applicationName: "CodeStar",
  keywords: [
    "e-learning open source",
    "LMS self-hosted",
    "plateforme apprentissage GPL v3",
    "alternative Moodle",
    "souveraineté numérique éducation",
    "Docker LMS",
    "éditeur de cours par blocs",
    "classement apprenants",
    "quiz pédagogique",
    "CodeStar",
  ],
  authors: [
    { name: "CodeStar Project", url: "https://github.com/CodeStar-Project" },
  ],
  creator: "CodeStar Project",
  publisher: "CodeStar Project",
  category: "education",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "CodeStar",
    title: "CodeStar — L'e-learning souverain, sur vos serveurs",
    description:
      "Plateforme e-learning open source, déployée chez vous via Docker. Sous licence GPL v3. Vos données restent chez vous.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeStar — L'e-learning souverain",
    description:
      "Plateforme e-learning open source, hébergée chez vous, sous licence GPL v3.",
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
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CodeStar",
  url: SITE_URL,
  description:
    "Plateforme e-learning open source, self-hosted, sous licence GPL v3.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Linux, macOS, Windows (WSL2)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  license: "https://www.gnu.org/licenses/gpl-3.0.html",
  codeRepository: "https://github.com/CodeStar-Project",
  inLanguage: "fr-FR",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-canvas text-ink font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
