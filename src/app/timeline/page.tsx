"use client";

import BottomNav from "@/components/BottomNav";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TimelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scores, setScores] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  useEffect(() => {
    if (status === "authenticated") {
      loadMonthData();
    }
  }, [currentDate, status]);

  const loadMonthData = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const res = await fetch(`/api/scores?year=${year}&month=${month}`);
      if (res.ok) {
        const data = await res.json();
        setScores(data.scores || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    router.push(`/today?date=${dateStr}`);
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array.from(
    { length: firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 },
    (_, i) => i
  );
  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

  const getScoreForDay = (date: Date) => {
    const score = scores.find((s) => isSameDay(new Date(s.date), date));
    return score?.score || 0;
  };

  const getColorForScore = (score: number) => {
    if (score === 0) return "bg-muted/30 border-muted/50";
    if (score <= 40)
      return "bg-red-500/20 border-red-500/40 hover:bg-red-500/30";
    if (score <= 70)
      return "bg-orange-500/20 border-orange-500/40 hover:bg-orange-500/30";
    return "bg-green-500/20 border-green-500/40 hover:bg-green-500/30";
  };

  // Ordenar scores por fecha descendente para lista
  const sortedScores = [...scores].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
                <h1 className="text-2xl font-light tracking-tight">Timeline</h1>
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
        <div className="max-w-4xl mx-auto px-8 py-12 space-y-8">
          {/* Navegación de mes */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-light tracking-tight capitalize">
                {format(currentDate, "MMMM yyyy", { locale: es })}
              </h2>
              <button
                onClick={handleToday}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                Ir a hoy
              </button>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Toggle Vista */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Calendario
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Lista
            </button>
          </div>

          {/* Stats del mes */}
          {stats && !loading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="text-xs text-muted-foreground">Días</span>
                </div>
                <p className="text-2xl font-light">{stats.totalDays}</p>
              </div>

              <div className="border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-xs text-muted-foreground">
                    Promedio
                  </span>
                </div>
                <p className="text-2xl font-light">{stats.avgScore}</p>
              </div>

              <div className="border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={16} className="text-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    Perfectos
                  </span>
                </div>
                <p className="text-2xl font-light">{stats.perfectDays}</p>
              </div>

              {stats.bestDay && (
                <div className="border border-border rounded-xl p-4">
                  <span className="text-xs text-muted-foreground block mb-2">
                    Mejor
                  </span>
                  <p className="text-2xl font-light">{stats.bestDay.score}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(stats.bestDay.date), "d MMM", {
                      locale: es,
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Vista Calendario */}
          {viewMode === "calendar" && (
            <div className="border border-border rounded-2xl p-6 sm:p-8">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-1 w-32 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground animate-pulse"
                      style={{ width: "40%" }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Header días */}
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-muted-foreground"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Días */}
                  <div className="grid grid-cols-7 gap-2">
                    {emptyDays.map((i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {daysInMonth.map((day) => {
                      const score = getScoreForDay(day);
                      const colorClass = getColorForScore(score);
                      const today = isToday(day);
                      const hasScore = score > 0;

                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() =>
                            hasScore ? handleDayClick(day) : undefined
                          }
                          disabled={!hasScore}
                          className={`
                                      aspect-square rounded-xl border-2 transition-all
                                      flex flex-col items-center justify-center p-2
                                      ${
                                        today
                                          ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                                          : ""
                                      }
                                      ${colorClass}
                                      ${
                                        hasScore
                                          ? "cursor-pointer hover:scale-105"
                                          : "cursor-default"
                                      }
                                    `}
                        >
                          <span
                            className={`text-sm font-medium ${
                              hasScore ? "mb-0.5" : ""
                            }`}
                          >
                            {format(day, "d")}
                          </span>
                          {hasScore && (
                            <span className="text-[10px] font-bold opacity-80">
                              {score}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Leyenda */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-muted/30 border border-muted/50" />
                      <span className="text-xs text-muted-foreground">
                        Sin datos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/40" />
                      <span className="text-xs text-muted-foreground">
                        0-40
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/40" />
                      <span className="text-xs text-muted-foreground">
                        41-70
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/40" />
                      <span className="text-xs text-muted-foreground">
                        71-100
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vista Lista */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-1 w-32 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground animate-pulse"
                      style={{ width: "40%" }}
                    ></div>
                  </div>
                </div>
              ) : sortedScores.length > 0 ? (
                sortedScores.map((score) => {
                  const date = new Date(score.date);
                  const colorClass =
                    score.score >= 71
                      ? "border-green-500/50"
                      : score.score >= 41
                      ? "border-orange-500/50"
                      : "border-red-500/50";

                  return (
                    <button
                      key={score.id}
                      onClick={() => handleDayClick(date)}
                      className={`w-full border-2 ${colorClass} rounded-2xl p-6 hover:bg-muted/30 transition-all text-left`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-lg font-medium capitalize">
                            {format(date, "EEEE, d 'de' MMMM", { locale: es })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(date, "yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-light">{score.score}</p>
                          <p className="text-xs text-muted-foreground">
                            puntos
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Objetivos</p>
                          <p className="font-medium">{score.habitsScore}/60</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Diario</p>
                          <p className="font-medium">{score.diaryScore}/25</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Media</p>
                          <p className="font-medium">{score.mediaScore}/15</p>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="border border-dashed border-border rounded-2xl p-12 text-center">
                  <p className="text-muted-foreground">
                    No hay datos para este mes
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </>
  );
}
