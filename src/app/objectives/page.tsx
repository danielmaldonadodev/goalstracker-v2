"use client";

import BottomNav from "@/components/BottomNav";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Archive,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Flame,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function ObjectivesPage() {
  const { data: session, status } = useSession();
  const [objectives, setObjectives] = useState<any[]>([]);
  const [archivedObjectives, setArchivedObjectives] = useState<any[]>([]);
  const [selectedObjective, setSelectedObjective] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      loadObjectives();
    }
  }, [status]);

  const loadObjectives = async () => {
    setLoading(true);
    try {
      // Cargar TODOS los objetivos (incluidos archivados)
      const res = await fetch("/api/habits?includeArchived=true");
      if (res.ok) {
        const data = await res.json();
        const all = data.habits || [];

        // Separar activos y archivados
        const active = all.filter((h: any) => h.active !== false);
        const archived = all.filter((h: any) => h.active === false);

        setObjectives(active);
        setArchivedObjectives(archived);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (objectiveId: string) => {
    try {
      const res = await fetch(`/api/objectives/stats?id=${objectiveId}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSelectObjective = (objective: any) => {
    setSelectedObjective(objective);
    loadStats(objective.id);
  };

  const handleArchive = async (id: string, archive: boolean) => {
    if (
      !confirm(
        archive ? "¿Archivar este objetivo?" : "¿Reactivar este objetivo?"
      )
    )
      return;

    try {
      await fetch("/api/habits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !archive }),
      });
      loadObjectives();
      if (selectedObjective?.id === id) {
        setSelectedObjective(null);
        setStats(null);
      }
    } catch (error) {
      console.error("Error:", error);
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
          <div className="max-w-6xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
                  MyYear
                </div>
                <h1 className="text-2xl font-light tracking-tight">
                  Objetivos
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

        {/* Contenido */}
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Lista de objetivos */}
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-border">
                <button
                  onClick={() => setShowArchived(false)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    !showArchived
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Activos ({objectives.length})
                </button>
                <button
                  onClick={() => setShowArchived(true)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    showArchived
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Archivados ({archivedObjectives.length})
                </button>
              </div>

              {/* Lista */}
              <div className="space-y-3">
                {(showArchived ? archivedObjectives : objectives).map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => handleSelectObjective(obj)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedObjective?.id === obj.id
                        ? "border-foreground bg-muted/50"
                        : "border-border hover:border-foreground/50 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{obj.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            {obj.type === "boolean"
                              ? "Sí/No"
                              : `${obj.target} ${obj.unit}`}
                          </span>
                          {obj.startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {format(new Date(obj.startDate), "dd MMM", {
                                locale: es,
                              })}
                              {obj.endDate &&
                                ` - ${format(new Date(obj.endDate), "dd MMM", {
                                  locale: es,
                                })}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-muted-foreground"
                      />
                    </div>
                  </button>
                ))}

                {(showArchived ? archivedObjectives : objectives).length ===
                  0 && (
                  <p className="text-center text-muted-foreground py-12">
                    {showArchived
                      ? "No hay objetivos archivados"
                      : "No hay objetivos activos"}
                  </p>
                )}
              </div>
            </div>

            {/* Detalles y estadísticas */}
            <div>
              {selectedObjective ? (
                <div className="space-y-6 sticky top-32">
                  {/* Header del objetivo */}
                  <div className="border border-border rounded-2xl p-6">
                    <h2 className="text-2xl font-light mb-2">
                      {selectedObjective.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedObjective.type === "boolean"
                        ? "Objetivo de tipo Sí/No"
                        : `Meta diaria: ${selectedObjective.target} ${selectedObjective.unit}`}
                    </p>

                    {selectedObjective.startDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Calendar size={16} />
                        <span>
                          {format(
                            new Date(selectedObjective.startDate),
                            "dd MMM yyyy",
                            { locale: es }
                          )}
                          {selectedObjective.endDate &&
                            ` - ${format(
                              new Date(selectedObjective.endDate),
                              "dd MMM yyyy",
                              { locale: es }
                            )}`}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        handleArchive(
                          selectedObjective.id,
                          selectedObjective.active !== false
                        )
                      }
                      className="w-full mt-4 py-2 px-4 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                    >
                      <Archive size={16} />
                      {selectedObjective.active !== false
                        ? "Archivar objetivo"
                        : "Reactivar objetivo"}
                    </button>
                  </div>

                  {/* Estadísticas */}
                  {stats && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border border-border rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Flame size={20} className="text-orange-500" />
                            <span className="text-sm text-muted-foreground">
                              Racha actual
                            </span>
                          </div>
                          <p className="text-3xl font-light">
                            {stats.currentStreak}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            días seguidos
                          </p>
                        </div>

                        <div className="border border-border rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={20} className="text-green-500" />
                            <span className="text-sm text-muted-foreground">
                              Mejor racha
                            </span>
                          </div>
                          <p className="text-3xl font-light">
                            {stats.longestStreak}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            días seguidos
                          </p>
                        </div>

                        <div className="border border-border rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 size={20} className="text-blue-500" />
                            <span className="text-sm text-muted-foreground">
                              Completado
                            </span>
                          </div>
                          <p className="text-3xl font-light">
                            {stats.completedDays}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            de {stats.totalDays} días
                          </p>
                        </div>

                        {selectedObjective.type !== "boolean" && (
                          <div className="border border-border rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-muted-foreground">
                                Promedio
                              </span>
                            </div>
                            <p className="text-3xl font-light">
                              {stats.average}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {selectedObjective.unit}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Mejor día */}
                      {stats.bestDay && (
                        <div className="border border-border rounded-xl p-4">
                          <h3 className="text-sm font-medium mb-2">
                            Mejor día
                          </h3>
                          <p className="text-lg">
                            {format(
                              new Date(stats.bestDay.date),
                              "EEEE, d 'de' MMMM",
                              {
                                locale: es,
                              }
                            )}
                          </p>
                          <p className="text-2xl font-light mt-1">
                            {stats.bestDay.value} {selectedObjective.unit || ""}
                          </p>
                        </div>
                      )}

                      {/* Historial reciente */}
                      <div className="border border-border rounded-xl p-6">
                        <h3 className="text-sm font-medium mb-4">
                          Últimos 30 días
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {stats.entries.map((entry: any) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between py-2 border-b border-border last:border-0"
                            >
                              <span className="text-sm">
                                {format(new Date(entry.date), "dd MMM", {
                                  locale: es,
                                })}
                              </span>
                              <span className="text-sm font-medium">
                                {entry.value} {selectedObjective.unit || ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="border border-dashed border-border rounded-2xl p-12 text-center">
                  <p className="text-muted-foreground">
                    Selecciona un objetivo para ver sus estadísticas
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </>
  );
}
