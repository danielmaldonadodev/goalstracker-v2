"use client";

import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function LandingPage() {
  const { status } = useSession();

  if (status === "authenticated") {
    redirect("/today");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-12"
        >
          {/* Logo/Brand */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-7xl md:text-8xl font-light tracking-tighter mb-4"
            >
              MyYear
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-muted-foreground font-light"
            >
              Construye la mejor versión de ti mismo
            </motion.p>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <div className="p-6 rounded-2xl border border-border bg-gradient-to-br from-blue-500/5 to-transparent">
              <div className="text-5xl font-light mb-3">60</div>
              <div className="text-sm font-medium mb-1">Objetivos</div>
              <div className="text-xs text-muted-foreground">
                Trackea tus hábitos diarios
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-gradient-to-br from-purple-500/5 to-transparent">
              <div className="text-5xl font-light mb-3">25</div>
              <div className="text-sm font-medium mb-1">Diario</div>
              <div className="text-xs text-muted-foreground">
                Reflexiona sobre tu día
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-gradient-to-br from-pink-500/5 to-transparent">
              <div className="text-5xl font-light mb-3">15</div>
              <div className="text-sm font-medium mb-1">Media</div>
              <div className="text-xs text-muted-foreground">
                Registra lo que consumes
              </div>
            </div>
          </motion.div>

          {/* Value Props */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="space-y-3 max-w-2xl mx-auto"
          >
            <p className="text-sm text-muted-foreground">
              Sistema de puntuación diario • Rachas adictivas • Estadísticas
              inteligentes
            </p>
            <p className="text-sm text-muted-foreground">
              PWA instalable • Dark mode • Export con análisis IA
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <button
              onClick={() => signIn("google", { callbackUrl: "/today" })}
              disabled={status === "loading"}
              className="px-12 py-4 bg-foreground text-background rounded-2xl text-lg font-medium hover:opacity-90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Cargando..." : "Comenzar ahora"}
            </button>
            <p className="text-xs text-muted-foreground mt-4">
              Gratis • Sin tarjeta • Listo en 10 segundos
            </p>
          </motion.div>

          {/* Social Proof / Trust */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="pt-8 border-t border-border max-w-2xl mx-auto"
          >
            <p className="text-xs text-muted-foreground">
              Desarrollado con Next.js 15 • React 19 • TypeScript • Prisma •
              PostgreSQL
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
