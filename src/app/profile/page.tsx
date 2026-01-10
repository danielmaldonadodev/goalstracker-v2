"use client";

import AIInsights from "@/components/AIInsights";
import BottomNav from "@/components/BottomNav";
import NotificationSettings from "@/components/NotificationSettings";
import ObjectiveTemplates from "@/components/ObjectiveTemplates";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import {
  Bell,
  LogOut,
  Monitor,
  Moon,
  Package,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  const [showTemplates, setShowTemplates] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);

  const handleTemplateSelect = async (objectives: any[]) => {
    try {
      toast.loading("Importando template...");

      for (const obj of objectives) {
        await fetch("/api/objectives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(obj),
        });
      }

      toast.dismiss();
      toast.success("Template importado", {
        description: `${objectives.length} objetivos añadidos`,
        duration: 3000,
      });
    } catch (error) {
      toast.dismiss();
      toast.error("Error al importar template");
      console.error(error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-1 w-32 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground animate-pulse"
            style={{ width: "40%" }}
          ></div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <div className="safe-top border-b border-border/30 bg-background/95 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
                  MyYear
                </div>
                <h1 className="text-2xl font-light tracking-tight">
                  Tu Perfil
                </h1>
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

        {/* Content */}
        <div className="max-w-4xl mx-auto px-8 py-12">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Usuario Info Card */}
            <motion.div
              variants={item}
              className="relative overflow-hidden border border-border rounded-2xl p-8 bg-gradient-to-br from-blue-500/5 to-transparent"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="text-white" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">
                      {session?.user?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Templates */}
              <motion.button
                variants={item}
                onClick={() => setShowTemplates(true)}
                className="group relative overflow-hidden border border-border rounded-2xl p-6 hover:bg-muted/30 transition-all text-left"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Package className="text-green-500" size={24} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Templates de Objetivos
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Packs predefinidos para comenzar rápido
                  </p>
                </div>
              </motion.button>

              {/* Notificaciones */}
              <motion.button
                variants={item}
                onClick={() => setShowNotifications(true)}
                className="group relative overflow-hidden border border-border rounded-2xl p-6 hover:bg-muted/30 transition-all text-left"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bell className="text-orange-500" size={24} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Recordatorios</h3>
                  <p className="text-sm text-muted-foreground">
                    Recordatorio diario para tus objetivos
                  </p>
                </div>
              </motion.button>
            </div>

            {/* AI Insights - Featured */}
            <motion.button
              variants={item}
              onClick={() => setShowAIInsights(true)}
              className="group relative overflow-hidden border-2 border-purple-500/30 rounded-2xl p-8 bg-gradient-to-br from-purple-500/10 to-transparent hover:from-purple-500/15 transition-all text-left w-full"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="text-white" size={28} />
                  </div>
                </div>
                <h3 className="text-2xl font-medium mb-2">Análisis con IA</h3>
                <p className="text-muted-foreground mb-4">
                  Obtén insights personalizados con ChatGPT o Claude sobre tu
                  progreso, patrones y áreas de mejora
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-500 font-medium">
                  Generar Análisis
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </motion.button>

            {/* Apariencia */}
            <motion.div
              variants={item}
              className="border border-border rounded-2xl p-8"
            >
              <h3 className="text-lg font-medium mb-4">Apariencia</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Personaliza cómo se ve la app
              </p>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    theme === "light"
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/50 hover:bg-muted/30"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      theme === "light"
                        ? "bg-foreground text-background"
                        : "bg-muted group-hover:bg-muted-foreground/20"
                    }`}
                  >
                    <Sun size={24} />
                  </div>
                  <span className="text-sm font-medium">Claro</span>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    theme === "dark"
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/50 hover:bg-muted/30"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      theme === "dark"
                        ? "bg-foreground text-background"
                        : "bg-muted group-hover:bg-muted-foreground/20"
                    }`}
                  >
                    <Moon size={24} />
                  </div>
                  <span className="text-sm font-medium">Oscuro</span>
                </button>

                <button
                  onClick={() => setTheme("system")}
                  className={`group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    theme === "system"
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/50 hover:bg-muted/30"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      theme === "system"
                        ? "bg-foreground text-background"
                        : "bg-muted group-hover:bg-muted-foreground/20"
                    }`}
                  >
                    <Monitor size={24} />
                  </div>
                  <span className="text-sm font-medium">Sistema</span>
                </button>
              </div>
            </motion.div>

            {/* Cerrar sesión */}
            <motion.button
              variants={item}
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full py-4 border-2 border-red-500/30 text-red-500 rounded-2xl hover:bg-red-500/10 transition-all font-medium"
            >
              Cerrar Sesión
            </motion.button>
          </motion.div>
        </div>

        <BottomNav />
      </div>

      {/* Modals */}
      {showTemplates && (
        <ObjectiveTemplates
          onClose={() => setShowTemplates(false)}
          onSelectTemplate={handleTemplateSelect}
        />
      )}

      {showNotifications && (
        <NotificationSettings onClose={() => setShowNotifications(false)} />
      )}

      {showAIInsights && (
        <AIInsights onClose={() => setShowAIInsights(false)} />
      )}
    </>
  );
}
