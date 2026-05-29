import type { Metadata, Viewport } from "next";
import { withBasePath } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "kanoTrekk",
  description: "Trekk tilfeldig fordeling av deltakere til kanoer.",
  manifest: withBasePath("/manifest.webmanifest"),
};

export const viewport: Viewport = {
  themeColor: "#164a75",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>
        <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">{children}</main>
      </body>
    </html>
  );
}
