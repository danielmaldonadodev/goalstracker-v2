"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <ThemeProvider>
        {children}
        <Toaster position="top-center" expand={false} richColors closeButton />
      </ThemeProvider>
    </SessionProvider>
  );
}
