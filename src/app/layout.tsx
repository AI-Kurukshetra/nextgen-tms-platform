import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";

import { NavigationProgress } from "@/components/ui/NavigationProgress";

import "./globals.css";

export const metadata: Metadata = {
  title: "NextGen TMS Platform",
  description: "AI-powered transportation management system for modern logistics operations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
