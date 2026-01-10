"use client";

import BottomNav from "@/components/BottomNav";
import { useTheme } from "@/components/ThemeProvider";
import { Download, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  const [exportRange, setExportRange] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustomDates, setShowCustomDates] = useState(false);

  const handleExport = async () => {
    try {
      toast.loading("Exportando datos...");

      // Construir URL con parámetros
      let url = `/api/export?range=${exportRange}`;
      if (exportRange === "custom" && customStart && customEnd) {
        url += `&start=${customStart}&end=${customEnd}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al exportar");

      const data = await res.json();

      // Crear nombre de archivo según el rango
      let filename = "myear-backup";
      switch (exportRange) {
        case "last-month":
          filename += "-ultimo-mes";
          break;
        case "last-3-months":
          filename += "-ultimos-3-meses";
          break;
        case "this-year":
          filename += "-este-año";
          break;
        case "last-year":
          filename += "-año-anterior";
          break;
        case "custom":
          filename += `-${customStart}-a-${customEnd}`;
          break;
        default:
          filename += "-completo";
      }
      filename += `-${new Date().toISOString().split("T")[0]}.json`;

      // Crear archivo JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      // Crear link de descarga
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(urlBlob);

      toast.dismiss();
      toast.success("Datos exportados correctamente", {
        description: `${data.stats.totalObjectives} objetivos, ${data.stats.totalEntries} registros`,
        duration: 3000,
      });
    } catch (error) {
      toast.dismiss();
      toast.error("Error al exportar datos");
      console.error(error);
    }
  };

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

          {/* Export/Backup */}
          <div className="border border-border rounded-2xl p-8">
            <h3 className="text-lg font-medium mb-4">Datos y Backup</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Exporta tus datos en formato JSON para análisis con IA
            </p>

            {/* Selector de rango */}
            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium">Período a exportar:</label>

              <div className="space-y-2">
                <label className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="exportRange"
                    value="all"
                    checked={exportRange === "all"}
                    onChange={(e) => {
                      setExportRange(e.target.value);
                      setShowCustomDates(false);
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Todo el historial</span>
                </label>

                <label className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="exportRange"
                    value="last-month"
                    checked={exportRange === "last-month"}
                    onChange={(e) => {
                      setExportRange(e.target.value);
                      setShowCustomDates(false);
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Último mes</span>
                </label>

                <label className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="exportRange"
                    value="last-3-months"
                    checked={exportRange === "last-3-months"}
                    onChange={(e) => {
                      setExportRange(e.target.value);
                      setShowCustomDates(false);
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Últimos 3 meses</span>
                </label>

                <label className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="exportRange"
                    value="this-year"
                    checked={exportRange === "this-year"}
                    onChange={(e) => {
                      setExportRange(e.target.value);
                      setShowCustomDates(false);
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Este año</span>
                </label>

                <label className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="exportRange"
                    value="last-year"
                    checked={exportRange === "last-year"}
                    onChange={(e) => {
                      setExportRange(e.target.value);
                      setShowCustomDates(false);
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Año anterior</span>
                </label>

                <label className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="exportRange"
                    value="custom"
                    checked={exportRange === "custom"}
                    onChange={(e) => {
                      setExportRange(e.target.value);
                      setShowCustomDates(true);
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Rango personalizado</span>
                </label>
              </div>

              {/* Campos de fecha personalizada */}
              {showCustomDates && (
                <div className="grid grid-cols-2 gap-3 mt-3 pl-6">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Desde:
                    </label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Hasta:
                    </label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleExport}
              disabled={
                exportRange === "custom" && (!customStart || !customEnd)
              }
              className="w-full flex items-center justify-center gap-2 py-3 border border-border hover:bg-muted/50 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} />
              Exportar datos seleccionados
            </button>

            <p className="text-xs text-muted-foreground mt-3 text-center">
              Incluye objetivos, registros, diario, media y scores
            </p>
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
