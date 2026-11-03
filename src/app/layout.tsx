import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PwaManager } from "@/components/PwaManager";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#163826",
};

export const metadata: Metadata = {
  title: "SyndicCité — Gestion de Copropriété & Cotisations",
  description:
    "Application PWA moderne de gestion de syndic de copropriété connectée à Supabase. Gestion des résidents, secteurs, cotisations, dépenses par rubrique et bilans PDF.",
  keywords: [
    "syndic",
    "copropriété",
    "cotisations",
    "dépenses",
    "résidence",
    "PWA",
    "Next.js",
    "Supabase",
  ],
  authors: [{ name: "SyndicCité Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SyndicCité",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full antialiased text-slate-900 bg-[#f8faf9] overflow-x-hidden selection:bg-emerald-200 selection:text-forest-950">
        <AuthProvider>
          <PwaManager />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
