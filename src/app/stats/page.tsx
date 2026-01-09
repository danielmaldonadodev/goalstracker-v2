"use client";

import BottomNav from "@/components/BottomNav";
import { Calendar, Flame, Target, TrendingUp, Trophy } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function StatsPage() {
  const { status } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats?period=month");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <div className="safe-top border-b border-border/30 bg-background/95 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-8 py-6">
            <h1 className="text-2xl font-light tracking-tight">Stats</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-8 py-12">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 rounded-2xl bg-muted/20 animate-pulse"></div>
            <div className="h-32 rounded-2xl bg-muted/20 animate-pulse"></div>
            <div className="h-32 rounded-2xl bg-muted/20 animate-pulse"></div>
            <div className="h-32 rounded-2xl bg-muted/20 animate-pulse"></div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!stats || stats.summary.totalDays === 0) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <div className="safe-top border-b border-border/30 bg-background/95 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-8 py-6">
            <div>
              <div className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
                MyYear
              </div>
              <h1 className="text-2xl font-light tracking-tight">Stats</h1>
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-8 py-12 text-center">
          <p className="text-muted-foreground">
            Completa algunos días para ver tus estadísticas
          </p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <div className="safe-top border-b border-border/30 bg-background/95 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-8 py-6">
            <div>
              <div className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
                MyYear
              </div>
              <h1 className="text-2xl font-light tracking-tight">Stats</h1>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-8 py-12 space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-2 gap-4">
            {/* Promedio este mes */}
            <div className="border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp size={24} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Promedio</p>
                  <p className="text-xs text-muted-foreground">Este mes</p>
                </div>
              </div>
              <p className="text-5xl font-light">{stats.summary.avgScore}</p>
              <p className="text-sm text-muted-foreground mt-2">puntos</p>
            </div>

            {/* Días perfectos */}
            <div className="border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                  <Trophy size={24} className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Días perfectos
                  </p>
                  <p className="text-xs text-muted-foreground">≥90 puntos</p>
                </div>
              </div>
              <p className="text-5xl font-light">{stats.summary.perfectDays}</p>
              <p className="text-sm text-muted-foreground mt-2">
                de {stats.summary.totalDays} días
              </p>
            </div>
          </div>

          {/* Mejor día */}
          {stats.summary.bestDay && (
            <div className="border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Calendar size={24} className="text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Tu mejor día</p>
                  <p className="text-lg font-medium">
                    {stats.summary.bestDay.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-light">
                    {stats.summary.bestDay.score}
                  </p>
                  <p className="text-xs text-muted-foreground">puntos</p>
                </div>
              </div>
            </div>
          )}

          {/* Mejor día de la semana */}
          {stats.summary.bestDayOfWeek && (
            <div className="border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Flame size={24} className="text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Tu día más fuerte
                  </p>
                  <p className="text-lg font-medium capitalize">
                    {stats.summary.bestDayOfWeek.day}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-light">
                    {stats.summary.bestDayOfWeek.avg}
                  </p>
                  <p className="text-xs text-muted-foreground">promedio</p>
                </div>
              </div>
            </div>
          )}

          {/* Top 3 objetivos más cumplidos */}
          {stats.objectives.mostCompleted.length > 0 && (
            <div className="border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Target size={24} className="text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-medium">Tus mejores objetivos</p>
                  <p className="text-sm text-muted-foreground">
                    Los que más cumples
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {stats.objectives.mostCompleted
                  .slice(0, 3)
                  .map((obj: any, index: number) => (
                    <div key={obj.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">{obj.title}</p>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${obj.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-green-500">
                          {obj.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Objetivos que necesitan atención */}
          {(() => {
            // Filtrar objetivos que NO están en top 3 y tienen <50%
            const topIds = stats.objectives.mostCompleted
              .slice(0, 3)
              .map((obj: any) => obj.id);
            const needAttention = stats.objectives.leastCompleted.filter(
              (obj: any) => obj.percentage < 50 && !topIds.includes(obj.id)
            );

            if (needAttention.length === 0) return null;

            return (
              <div className="border border-orange-500/20 bg-orange-500/5 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <Target size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Necesitan atención</p>
                    <p className="text-sm text-muted-foreground">
                      Enfócate en estos
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {needAttention.slice(0, 3).map((obj: any) => (
                    <div key={obj.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">{obj.title}</p>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 transition-all"
                            style={{ width: `${obj.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-orange-500">
                          {obj.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        <BottomNav />
      </div>
    </>
  );
}
