import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IA para Negocios",
  description: "Panel de gestión de asistentes IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      {/* Añadimos suppressHydrationWarning aquí */}
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}