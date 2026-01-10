"use client";

import BottomNav from "@/components/BottomNav";
import { SkeletonStats } from "@/components/SkeletonLoader";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function StatsPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    if (status === "authenticated") {
      loadStats();
    }
  }, [status, period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stats?period=${period}`);
      if (res.ok) {
        const data = await res.json();

        // Transformar estructura del API a lo que espera el componente
        const transformedStats = {
          averageScore: data.summary.avgScore,
          perfectDays: data.summary.perfectDays,
          daysTracked: data.summary.totalDays,
          dateRange: data.summary.dateRange,
          bestDay: data.summary.bestDay
            ? {
                date: data.summary.bestDay.date,
                score: data.summary.bestDay.score,
              }
            : null,
          bestDayOfWeek: data.summary.bestDayOfWeek
            ? {
                dayOfWeek: data.summary.bestDayOfWeek.dayOfWeek,
                avgScore: data.summary.bestDayOfWeek.avgScore,
              }
            : null,
          objectives: {
            mostCompleted: data.objectives.mostCompleted.map((obj: any) => ({
              id: obj.id,
              title: obj.title,
              completedDays: obj.completed,
              activeDays: obj.daysActive,
              percentage: obj.percentage,
            })),
            leastCompleted: data.objectives.leastCompleted.map((obj: any) => ({
              id: obj.id,
              title: obj.title,
              completedDays: obj.completed,
              activeDays: obj.daysActive,
              percentage: obj.percentage,
            })),
          },
        };

        setStats(transformedStats);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
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

  const getDayName = (dayIndex: number) => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return days[dayIndex];
  };

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
                  Estadísticas
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
          {/* Selector de período */}
          {!loading && stats && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setPeriod("week")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    period === "week"
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Esta semana
                </button>
                <button
                  onClick={() => setPeriod("month")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    period === "month"
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Este mes
                </button>
                <button
                  onClick={() => setPeriod("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    period === "all"
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Todo
                </button>
              </div>

              {/* Rango de fechas */}
              {stats.dateRange && (
                <p className="text-center text-xs text-muted-foreground mt-3">
                  {stats.dateRange.start} — {stats.dateRange.end}
                </p>
              )}
            </motion.div>
          )}

          {loading ? (
            <SkeletonStats />
          ) : stats ? (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              {/* Overview del período */}
              <motion.div variants={item}>
                <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                  Resumen del período
                </h2>

                {/* Promedio destacado */}
                <div className="mb-4 border border-border rounded-2xl p-8 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Tu promedio
                      </div>
                      <div className="text-7xl font-light">
                        {stats.averageScore || 0}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground pb-2">
                      de 100 puntos
                    </div>
                  </div>
                </div>

                {/* Grid de métricas */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Días perfectos */}
                  <div
                    className={`border rounded-2xl p-6 ${
                      stats.perfectDays > 0
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-border"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground mb-2">
                      Días perfectos
                    </div>
                    <div className="text-4xl font-light mb-1">
                      {stats.perfectDays}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Con ≥90 puntos
                    </div>
                  </div>

                  {/* Mejor día */}
                  {stats.bestDay ? (
                    <div className="border border-border rounded-2xl p-6">
                      <div className="text-xs text-muted-foreground mb-2">
                        Mejor día
                      </div>
                      <div className="text-4xl font-light mb-1">
                        {stats.bestDay.score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stats.bestDay.date}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-border rounded-2xl p-6 opacity-40">
                      <div className="text-xs text-muted-foreground mb-2">
                        Mejor día
                      </div>
                      <div className="text-4xl font-light">—</div>
                    </div>
                  )}

                  {/* Mejor día de la semana */}
                  {stats.bestDayOfWeek ? (
                    <div className="border border-border rounded-2xl p-6 col-span-2 lg:col-span-1">
                      <div className="text-xs text-muted-foreground mb-2">
                        Tu día más fuerte
                      </div>
                      <div className="text-2xl font-light mb-1">
                        {getDayName(stats.bestDayOfWeek.dayOfWeek)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Promedio: {stats.bestDayOfWeek.avgScore} puntos
                      </div>
                    </div>
                  ) : (
                    <div className="border border-border rounded-2xl p-6 col-span-2 lg:col-span-1 opacity-40">
                      <div className="text-xs text-muted-foreground mb-2">
                        Día más fuerte
                      </div>
                      <div className="text-2xl font-light">—</div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Análisis de objetivos */}
              <motion.div variants={item}>
                <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                  Tus objetivos
                </h2>

                <div className="space-y-4">
                  {/* Top 3 objetivos */}
                  {stats.objectives.mostCompleted.length > 0 && (
                    <div className="border border-border rounded-2xl p-6">
                      <h3 className="text-sm font-medium mb-4">
                        Objetivos más cumplidos
                      </h3>
                      <div className="space-y-4">
                        {stats.objectives.mostCompleted
                          .slice(0, 3)
                          .map((obj: any, index: number) => (
                            <motion.div
                              key={obj.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  <span className="font-medium">
                                    {obj.title}
                                  </span>
                                </div>
                                <span className="text-lg font-light">
                                  {Math.round(obj.percentage)}%
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${obj.percentage}%` }}
                                  transition={{
                                    duration: 0.8,
                                    delay: index * 0.1,
                                  }}
                                  className="h-full bg-green-500"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {obj.completedDays} de {obj.activeDays} días
                              </p>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Objetivos que necesitan atención */}
                  {stats.objectives.leastCompleted.filter(
                    (obj: any) =>
                      obj.percentage < 50 &&
                      !stats.objectives.mostCompleted
                        .slice(0, 3)
                        .find((top: any) => top.id === obj.id)
                  ).length > 0 && (
                    <div className="border border-orange-500/30 bg-orange-500/5 rounded-2xl p-6">
                      <h3 className="text-sm font-medium mb-4">
                        Necesitan atención
                      </h3>
                      <div className="space-y-3">
                        {stats.objectives.leastCompleted
                          .filter(
                            (obj: any) =>
                              obj.percentage < 50 &&
                              !stats.objectives.mostCompleted
                                .slice(0, 3)
                                .find((top: any) => top.id === obj.id)
                          )
                          .map((obj: any, index: number) => (
                            <motion.div
                              key={obj.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <span className="font-medium">{obj.title}</span>
                                <p className="text-xs text-muted-foreground">
                                  {obj.completedDays} de {obj.activeDays} días
                                </p>
                              </div>
                              <span className="text-lg font-light text-orange-500">
                                {Math.round(obj.percentage)}%
                              </span>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {stats.objectives.mostCompleted.length === 0 && (
                    <div className="border border-dashed border-border rounded-2xl p-12 text-center">
                      <p className="text-muted-foreground">
                        Completa objetivos para ver estadísticas
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Insights adicionales */}
              {stats.daysTracked >= 7 && (
                <motion.div variants={item}>
                  <div className="border border-border rounded-2xl p-6 bg-muted/20">
                    <h3 className="text-sm font-medium mb-3">
                      Análisis del período
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        Tienes datos de <strong>{stats.daysTracked}</strong>{" "}
                        {stats.daysTracked === 1 ? "día" : "días"}.
                      </p>
                      {stats.perfectDays > 0 && (
                        <p>
                          Conseguiste días perfectos en{" "}
                          <strong>
                            {Math.round(
                              (stats.perfectDays / stats.daysTracked) * 100
                            )}
                            %
                          </strong>{" "}
                          de las ocasiones.
                        </p>
                      )}
                      {stats.averageScore >= 70 && (
                        <p className="text-green-500">
                          ✓ Tu promedio está por encima de 70 puntos. ¡Excelente
                          trabajo!
                        </p>
                      )}
                      {stats.averageScore < 70 && stats.averageScore >= 50 && (
                        <p className="text-orange-500">
                          Estás cerca de los 70 puntos. Un poco más de
                          consistencia y lo lograrás.
                        </p>
                      )}
                      {stats.objectives.mostCompleted.length > 0 &&
                        stats.objectives.mostCompleted[0].percentage >= 80 && (
                          <p>
                            Tu objetivo más fuerte es{" "}
                            <strong>
                              {stats.objectives.mostCompleted[0].title}
                            </strong>{" "}
                            con{" "}
                            {Math.round(
                              stats.objectives.mostCompleted[0].percentage
                            )}
                            % de cumplimiento.
                          </p>
                        )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="border border-dashed border-border rounded-2xl p-16 text-center">
              <p className="text-lg text-muted-foreground font-light">
                No hay datos suficientes para mostrar estadísticas
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Completa objetivos para ver tu progreso
              </p>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </>
  );
}
