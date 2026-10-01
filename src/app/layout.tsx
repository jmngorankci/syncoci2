import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "SyndicCité — Gestion de Copropriété & Cotisations",
  description: "Application moderne de gestion de syndic de copropriété connectée à Supabase. Gestion des résidents, des secteurs, des activités et validation des paiements en temps réel.",
  keywords: ["syndic", "copropriété", "cotisations", "résidence", "Next.js", "Supabase", "paiements", "gestion immobilière"],
  authors: [{ name: "SyndicCité Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full antialiased text-slate-900 bg-[#f8faf9]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
