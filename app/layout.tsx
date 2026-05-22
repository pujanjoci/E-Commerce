import type { Metadata } from "next";
import Script from 'next/script';
import LayoutRenderer from '@/components/layout/LayoutRenderer';
import { Toaster } from 'sonner';
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecommerce | Furniture, Lighting, Decor",
  description: "A clean retail experience for thoughtful furniture, lighting, and home objects.",
};

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', stored ? stored === 'dark' : prefersDark);
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <LayoutRenderer>{children}</LayoutRenderer>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
