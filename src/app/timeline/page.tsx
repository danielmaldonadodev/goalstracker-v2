"use client";

import BottomNav from "@/components/BottomNav";
import MonthCalendar from "@/components/MonthCalendar";
import { addMonths, format, subMonths } from "date-fns";
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
    // Navegar a la página Today con la fecha seleccionada
    const dateStr = format(date, "yyyy-MM-dd");
    router.push(`/today?date=${dateStr}`);
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
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

          {/* Stats del mes */}
          {stats && !loading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="text-xs text-muted-foreground">
                    Días registrados
                  </span>
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
                    Días perfectos
                  </span>
                </div>
                <p className="text-2xl font-light">{stats.perfectDays}</p>
              </div>

              {stats.bestDay && (
                <div className="border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">
                      Mejor día
                    </span>
                  </div>
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

          {/* Calendario */}
          <div className="border border-border rounded-2xl p-8">
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
              <MonthCalendar
                currentDate={currentDate}
                scores={scores}
                onDayClick={handleDayClick}
              />
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    </>
  );
}
