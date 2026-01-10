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
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TimelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scores, setScores] = useState<any[]>([]);
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
    if (score === 0) return "bg-muted/20 border-muted/30";
    if (score <= 40)
      return "bg-red-500/15 border-red-500/30 hover:bg-red-500/25";
    if (score <= 70)
      return "bg-orange-500/15 border-orange-500/30 hover:bg-orange-500/25";
    return "bg-green-500/15 border-green-500/30 hover:bg-green-500/25";
  };

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
        <div className="max-w-4xl mx-auto px-8 py-12 space-y-12">
          {/* Navegación de mes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <button
              onClick={handlePrevMonth}
              className="p-3 hover:bg-muted rounded-xl transition-all hover:scale-105"
            >
              <ChevronLeft size={24} strokeWidth={1.5} />
            </button>

            <div className="text-center">
              <h2 className="text-3xl font-light tracking-tight capitalize mb-1">
                {format(currentDate, "MMMM yyyy", { locale: es })}
              </h2>
              <button
                onClick={handleToday}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Ir a hoy
              </button>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-3 hover:bg-muted rounded-xl transition-all hover:scale-105"
            >
              <ChevronRight size={24} strokeWidth={1.5} />
            </button>
          </motion.div>

          {/* Toggle Vista */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-2"
          >
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                viewMode === "calendar"
                  ? "bg-foreground text-background"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              Calendario
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-foreground text-background"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              Lista
            </button>
          </motion.div>

          {/* Vista Calendario */}
          <AnimatePresence mode="wait">
            {viewMode === "calendar" && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="border border-border rounded-2xl p-8"
              >
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
                  <div className="space-y-6">
                    {/* Header días */}
                    <div className="grid grid-cols-7 gap-3">
                      {weekDays.map((day) => (
                        <div
                          key={day}
                          className="text-center text-sm font-medium text-muted-foreground"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Días */}
                    <div className="grid grid-cols-7 gap-3">
                      {emptyDays.map((i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}

                      {daysInMonth.map((day, index) => {
                        const score = getScoreForDay(day);
                        const colorClass = getColorForScore(score);
                        const today = isToday(day);
                        const hasScore = score > 0;

                        return (
                          <motion.button
                            key={day.toISOString()}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.01 }}
                            onClick={() =>
                              hasScore ? handleDayClick(day) : undefined
                            }
                            disabled={!hasScore}
                            className={`
                              aspect-square rounded-2xl border-2 transition-all
                              flex flex-col items-center justify-center
                              ${
                                today
                                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                                  : ""
                              }
                              ${colorClass}
                              ${
                                hasScore
                                  ? "cursor-pointer hover:scale-105 active:scale-95"
                                  : "cursor-default opacity-40"
                              }
                            `}
                          >
                            <span
                              className={`text-lg font-light ${
                                hasScore ? "mb-1" : ""
                              }`}
                            >
                              {format(day, "d")}
                            </span>
                            {hasScore && (
                              <span className="text-xs font-medium opacity-70">
                                {score}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Leyenda */}
                    <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-muted/20 border border-muted/30" />
                        <span className="text-xs text-muted-foreground">
                          Sin datos
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-red-500/15 border border-red-500/30" />
                        <span className="text-xs text-muted-foreground">
                          0-40
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-orange-500/15 border border-orange-500/30" />
                        <span className="text-xs text-muted-foreground">
                          41-70
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-green-500/15 border border-green-500/30" />
                        <span className="text-xs text-muted-foreground">
                          71-100
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Vista Lista */}
            {viewMode === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
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
                  sortedScores.map((score, index) => {
                    const date = new Date(score.date);
                    const colorClass =
                      score.score >= 71
                        ? "border-green-500/30 hover:border-green-500/50 hover:bg-green-500/5"
                        : score.score >= 41
                        ? "border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/5"
                        : "border-red-500/30 hover:border-red-500/50 hover:bg-red-500/5";

                    return (
                      <motion.button
                        key={score.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleDayClick(date)}
                        className={`w-full border-2 ${colorClass} rounded-2xl p-6 transition-all text-left hover:scale-[1.01] active:scale-[0.99]`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-xl font-light capitalize mb-1">
                              {format(date, "EEEE d", { locale: es })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(date, "MMMM yyyy", { locale: es })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-5xl font-light">{score.score}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Objetivos
                            </p>
                            <p className="text-lg font-light">
                              {score.habitsScore}
                              <span className="text-sm text-muted-foreground">
                                /60
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Diario
                            </p>
                            <p className="text-lg font-light">
                              {score.diaryScore}
                              <span className="text-sm text-muted-foreground">
                                /25
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Media
                            </p>
                            <p className="text-lg font-light">
                              {score.mediaScore}
                              <span className="text-sm text-muted-foreground">
                                /15
                              </span>
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })
                ) : (
                  <div className="border border-dashed border-border rounded-2xl p-16 text-center">
                    <p className="text-lg text-muted-foreground font-light">
                      No hay datos para este mes
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <BottomNav />
      </div>
    </>
  );
}
