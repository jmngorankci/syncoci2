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
  title: "SYNCOCI 2 — Gestion des Copropriétaires de la Cité Ivoire 2",
  description:
    "SYNCOCI 2 : Plateforme PWA de Gestion des Copropriétaires de la Cité Ivoire 2. Gestion des résidents, secteurs, cotisations, dépenses par rubrique et bilans PDF.",
  keywords: [
    "SYNCOCI 2",
    "Cité Ivoire 2",
    "syndic",
    "copropriétaires",
    "cotisations",
    "dépenses",
    "PWA",
  ],
  authors: [{ name: "SYNCOCI 2" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SYNCOCI 2",
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
