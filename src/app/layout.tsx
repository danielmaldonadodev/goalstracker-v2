import ClientLayout from "@/components/ClientLayout";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyYear - Tu año, tu progreso",
  description: "Trackea tus objetivos, diario y media diariamente",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyYear",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
