"use client";

import BottomNav from "@/components/BottomNav";
import { useTheme } from "@/components/ThemeProvider";
import { LogOut, Monitor, Moon, Sun } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        <div className="safe-top border-b border-border/30 bg-background/95 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
                  MyYear
                </div>
                <h1 className="text-2xl font-light tracking-tight">Perfil</h1>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2.5 hover:bg-muted/50 rounded-full transition-all duration-200"
              >
                <LogOut
                  size={16}
                  className="text-muted-foreground"
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-12 space-y-6">
          {/* Información del usuario */}
          <div className="border border-border rounded-2xl p-8">
            <h3 className="text-lg font-medium mb-4">Información</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="text-base">{session?.user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-base">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Tema */}
          <div className="border border-border rounded-2xl p-8">
            <h3 className="text-lg font-medium mb-4">Apariencia</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Personaliza cómo se ve la app
            </p>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`
                  flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
                  ${
                    theme === "light"
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/50"
                  }
                `}
              >
                <Sun size={24} />
                <span className="text-sm font-medium">Claro</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`
                  flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
                  ${
                    theme === "dark"
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/50"
                  }
                `}
              >
                <Moon size={24} />
                <span className="text-sm font-medium">Oscuro</span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`
                  flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
                  ${
                    theme === "system"
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/50"
                  }
                `}
              >
                <Monitor size={24} />
                <span className="text-sm font-medium">Sistema</span>
              </button>
            </div>
          </div>

          {/* Cerrar sesión */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full py-3 border border-red-500 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors font-medium"
          >
            Cerrar Sesión
          </button>
        </div>

        <BottomNav />
      </div>
    </>
  );
}
