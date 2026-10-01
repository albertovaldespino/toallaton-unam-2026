import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Toallatón UNAM 2026 · Cada donación cuenta",
  description: "Sumando voluntades por la salud menstrual. Salud UNAM.",
  icons: { icon: "/logos/unam.webp" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
