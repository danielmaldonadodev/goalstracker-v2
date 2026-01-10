"use client";

import PageTransition from "@/components/PageTransition";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <PageTransition>{children}</PageTransition>
      </ThemeProvider>
    </SessionProvider>
  );
}
