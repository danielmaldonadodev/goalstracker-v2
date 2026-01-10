"use client";

import BottomNav from "@/components/BottomNav";
import DateNavigator from "@/components/DateNavigator";
import DayScoreCircle from "@/components/DayScoreCircle";
import DiaryModal from "@/components/DiaryModal";
import HabitsModal from "@/components/HabitsModal";
import MediaModal from "@/components/MediaModal";
import StreakDisplay from "@/components/StreakDisplay";
import { fireConfetti, firePerfectDayConfetti } from "@/lib/confetti";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { LogOut, Plus, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Componente de explicación del sistema
function SystemExplanation({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-border rounded-2xl p-6 mb-6"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-medium">Cómo funciona MyYear</h3>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-muted rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Cada día puedes conseguir hasta <strong>100 puntos</strong>{" "}
          completando:
        </p>

        <div className="grid gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-background/50"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 font-bold text-blue-500">
              60
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm mb-1">Objetivos</div>
              <div className="text-xs text-muted-foreground">
                Completa todos tus objetivos diarios
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-background/50"
          >
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 font-bold text-purple-500">
              25
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm mb-1">Diario</div>
              <div className="text-xs text-muted-foreground">
                Escribe en tu diario personal
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-background/50"
          >
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0 font-bold text-pink-500">
              15
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm mb-1">Media</div>
              <div className="text-xs text-muted-foreground">
                Registra lo que ves, lees o consumes
              </div>
            </div>
          </motion.div>
        </div>

        <p className="text-xs text-muted-foreground pt-3 border-t border-border">
          Mantén rachas diarias para desbloquear celebraciones especiales
        </p>
      </div>
    </motion.div>
  );
}

// Componente para input de objetivo con estado local
function ObjectiveInput({ habit, currentValue, progress, onUpdate }: any) {
  const [localValue, setLocalValue] = useState(
    currentValue > 0 ? currentValue.toString() : ""
  );
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(currentValue > 0 ? currentValue.toString() : "");
    }
  }, [currentValue, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    const val = parseFloat(localValue.replace(",", ".")) || 0;
    if (val !== currentValue) {
      onUpdate(habit.id, val);
    }
  };

  const handleChange = (value: string) => {
    const val = value.replace(",", ".");
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setLocalValue(value);
    }
  };

  const isCompleted =
    habit.type === "boolean"
      ? currentValue > 0
      : habit.target && currentValue >= habit.target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
      rounded-2xl border-2 transition-all overflow-hidden
      ${
        isCompleted
          ? "border-green-500 bg-green-500/5"
          : "border-border bg-background"
      }
    `}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-lg font-medium">{habit.title}</h4>
              {isCompleted && <span className="text-green-500 text-xl">✓</span>}
            </div>
            {habit.type !== "boolean" && (
              <p className="text-sm text-muted-foreground">
                Meta: {habit.target} {habit.unit}
              </p>
            )}
          </div>

          {/* Badge del tipo */}
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {habit.type === "boolean"
              ? "Sí/No"
              : habit.type === "time"
              ? "Tiempo"
              : "Cantidad"}
          </span>
        </div>

        {/* Input Section */}
        {habit.type === "boolean" ? (
          // BOOLEAN: Toggle grande
          <div className="flex items-center justify-center py-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentValue > 0}
                onChange={(e) => onUpdate(habit.id, e.target.checked ? 1 : 0)}
                className="sr-only peer"
              />
              <div className="w-20 h-20 bg-muted rounded-2xl peer-checked:bg-green-500 transition-all flex items-center justify-center">
                {currentValue > 0 ? (
                  <span className="text-4xl text-white">✓</span>
                ) : (
                  <span className="text-4xl text-muted-foreground">○</span>
                )}
              </div>
            </label>
          </div>
        ) : (
          // NUMBER/TIME: Input grande + barra
          <div className="space-y-4">
            {/* Input super grande */}
            <div className="flex items-center justify-center gap-3">
              <input
                type="text"
                inputMode="decimal"
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                placeholder="0"
                className="w-32 px-6 py-4 text-3xl font-light text-center bg-muted/50 border-2 border-border rounded-2xl focus:outline-none focus:border-foreground transition-all"
              />
              <span className="text-xl text-muted-foreground font-light">
                {habit.unit}
              </span>
            </div>

            {/* Barra de progreso GRUESA */}
            {habit.target && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {currentValue} / {habit.target}
                  </span>
                  <span
                    className={`font-medium ${
                      isCompleted ? "text-green-500" : "text-foreground"
                    }`}
                  >
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${
                      isCompleted ? "bg-green-500" : "bg-foreground"
                    }`}
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function TodayPage() {
  const { data: session, status } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [score, setScore] = useState(0);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [streakData, setStreakData] = useState<any>(null);
  const [diaryEntry, setDiaryEntry] = useState<any>(null);
  const [mediaEntries, setMediaEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isHabitsModalOpen, setIsHabitsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  // Habits states
  const [habits, setHabits] = useState<any[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [entriesData, setEntriesData] = useState<any[]>([]);

  // System explanation
  const [showSystemExplanation, setShowSystemExplanation] = useState(false);

  // Check si es primera vez
  useEffect(() => {
    const hasSeenExplanation = localStorage.getItem("myear-seen-explanation");
    if (!hasSeenExplanation && status === "authenticated") {
      setShowSystemExplanation(true);
    }
  }, [status]);

  const dismissExplanation = () => {
    setShowSystemExplanation(false);
    localStorage.setItem("myear-seen-explanation", "true");
  };

  // Cargar datos cuando cambia la fecha
  useEffect(() => {
    if (status === "authenticated") {
      loadDayData();
    }
  }, [currentDate, status]);

  const loadDayData = async () => {
    setLoading(true);
    const dateStr = format(currentDate, "yyyy-MM-dd");
    let finalScore = 0;

    try {
      // OPTIMIZACIÓN: Cargar todo en paralelo
      const [scoreRes, diaryRes, mediaRes, habitsRes, entriesRes, streakRes] =
        await Promise.all([
          fetch(`/api/score?date=${dateStr}`),
          fetch(`/api/diary?date=${dateStr}`),
          fetch(`/api/media?date=${dateStr}`),
          fetch("/api/habits"),
          fetch(`/api/entries?date=${dateStr}`),
          fetch("/api/streak"),
        ]);

      // Procesar scores
      if (scoreRes.ok) {
        const scoreData = await scoreRes.json();
        finalScore = scoreData.score.score || 0;
        setScore(finalScore);
        setBreakdown(scoreData.breakdown || null);
      }

      // Procesar diario
      if (diaryRes.ok) {
        const diaryData = await diaryRes.json();
        setDiaryEntry(diaryData.entry);
      }

      // Procesar media
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setMediaEntries(mediaData.entries || []);
      }

      // Procesar hábitos
      if (habitsRes.ok) {
        const habitsData = await habitsRes.json();

        // Filtrar por fechas
        const activeHabits = habitsData.habits.filter((h: any) => {
          if (!h.startDate && !h.endDate) return true;

          const habitStart = h.startDate ? new Date(h.startDate) : null;
          const habitEnd = h.endDate ? new Date(h.endDate) : null;
          const checkDate = new Date(dateStr);

          if (habitStart && checkDate < habitStart) return false;
          if (habitEnd && checkDate > habitEnd) return false;

          return true;
        });

        setHabits(activeHabits);
      }

      // Procesar entries
      if (entriesRes.ok) {
        const entriesDataRes = await entriesRes.json();
        setEntriesData(entriesDataRes.entries || []);
        const completed = entriesDataRes.entries
          .filter((e: any) => e.value > 0)
          .map((e: any) => e.objectiveId);
        setCompletedHabits(completed);
      }

      // Procesar streak
      if (streakRes.ok) {
        const streakDataRes = await streakRes.json();
        setStreakData(streakDataRes);
      }

      // Celebrar si es día perfecto (solo si es hoy)
      const isToday = dateStr === format(new Date(), "yyyy-MM-dd");
      if (finalScore === 100 && isToday) {
        setTimeout(() => {
          firePerfectDayConfetti();
          toast.success("🏆 ¡Día perfecto! 100 puntos", {
            description: "Estás imparable",
            duration: 4000,
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiarySaved = () => {
    loadDayData();
  };

  const handleMediaSaved = () => {
    loadDayData();
  };

  const handleHabitUpdate = async (habitId: string, value: number) => {
    const dateStr = format(currentDate, "yyyy-MM-dd");

    try {
      await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateStr,
          objectiveId: habitId,
          value: value,
        }),
      });

      // Guardar estado previo
      const prevEntriesData = [...entriesData];

      // Recargar datos para actualizar score y estado
      await loadDayData();

      // Verificar si completamos el objetivo
      const habit = habits.find((h) => h.id === habitId);
      if (habit) {
        const isCompleted =
          habit.type === "boolean"
            ? value > 0
            : habit.target && value >= habit.target;

        if (isCompleted) {
          toast.success(`✓ ${habit.title} completado`, {
            description:
              habit.type !== "boolean" ? `${value} ${habit.unit}` : undefined,
            duration: 2000,
          });

          // Contar cuántos están completados ahora
          const completedCount = habits.filter((h) => {
            if (h.id === habitId) {
              return habit.type === "boolean"
                ? value > 0
                : habit.target && value >= habit.target;
            }

            const entry = prevEntriesData.find((e) => e.objectiveId === h.id);
            if (!entry) return false;

            if (h.type === "boolean") return entry.value > 0;
            return h.target && entry.value >= h.target;
          }).length;

          // Si completamos TODOS los objetivos
          if (completedCount === habits.length && habits.length > 0) {
            setTimeout(() => {
              fireConfetti();
              toast.success("🎉 ¡Todos los objetivos completados!", {
                description: "Increíble trabajo hoy",
                duration: 3000,
              });
            }, 500);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar objetivo");
    }
  };

  const handleHabitsSaved = () => {
    loadDayData();
  };

  const handleDeleteDiary = async () => {
    if (!confirm("¿Borrar esta entrada?")) return;

    try {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      await fetch(`/api/diary?date=${dateStr}`, { method: "DELETE" });
      loadDayData();
    } catch (error) {
      console.error("Error al borrar:", error);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("¿Borrar esta entrada?")) return;

    try {
      await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      loadDayData();
    } catch (error) {
      console.error("Error al borrar:", error);
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
          <div className="max-w-3xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
                  MyYear
                </div>
                <h1 className="text-2xl font-light tracking-tight">
                  {session?.user?.name?.split(" ")[0]}
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

        {/* Contenido principal */}
        <div className="max-w-3xl mx-auto px-8 py-12 space-y-16">
          {/* System Explanation */}
          {showSystemExplanation && !loading && (
            <SystemExplanation onDismiss={dismissExplanation} />
          )}

          {/* Date Navigator */}
          <div>
            <DateNavigator
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
          </div>

          {/* Score */}
          <div className="py-8">
            {loading ? (
              <div className="flex justify-center">
                <div className="h-64 w-64 rounded-full bg-muted/20 animate-pulse"></div>
              </div>
            ) : (
              <DayScoreCircle score={score} breakdown={breakdown} />
            )}
          </div>

          {/* Streak */}
          {!loading && streakData && (
            <div>
              <StreakDisplay
                currentStreak={streakData.currentStreak}
                maxStreak={streakData.maxStreak}
                totalDays={streakData.totalDays}
                isActive={streakData.isActive}
                hasToday={streakData.hasToday}
              />
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

          {/* Sections */}
          {loading ? (
            <div className="space-y-4">
              <div className="h-32 rounded-2xl bg-muted/20 animate-pulse"></div>
              <div className="h-32 rounded-2xl bg-muted/20 animate-pulse"></div>
              <div className="h-32 rounded-2xl bg-muted/20 animate-pulse"></div>
            </div>
          ) : (
            <div className="grid gap-6">
              {/* Diario */}
              <div className="border border-border/50 rounded-2xl p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium tracking-tight">
                      Diario
                    </h3>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full">
                      {diaryEntry ? "1" : "0"}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDiaryModalOpen(true)}
                    className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Plus size={16} strokeWidth={1.5} />
                  </button>
                </div>

                {diaryEntry ? (
                  <div className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                    <p
                      className="text-sm text-muted-foreground line-clamp-3 flex-1 cursor-pointer"
                      onClick={() => setIsDiaryModalOpen(true)}
                    >
                      {diaryEntry.content}
                    </p>
                    <button
                      onClick={handleDeleteDiary}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sin entradas hoy
                  </p>
                )}
              </div>

              {/* Media */}
              <div className="border border-border/50 rounded-2xl p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium tracking-tight">
                      Media
                    </h3>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full">
                      {mediaEntries.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMedia(null);
                      setIsMediaModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Plus size={16} strokeWidth={1.5} />
                  </button>
                </div>

                {mediaEntries.length > 0 ? (
                  <div className="space-y-2">
                    {mediaEntries.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => {
                          setSelectedMedia(entry);
                          setIsMediaModalOpen(true);
                        }}
                        className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">{entry.title}</p>
                            {entry.rating && (
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: entry.rating }).map(
                                  (_, i) => (
                                    <span
                                      key={i}
                                      className="text-yellow-500 text-xs"
                                    >
                                      ★
                                    </span>
                                  )
                                )}
                              </div>
                            )}
                            {entry.completed && (
                              <span className="text-xs text-green-500 font-medium">
                                ✓
                              </span>
                            )}
                          </div>
                          {entry.season && entry.episode && (
                            <p className="text-xs text-muted-foreground">
                              S{entry.season}E{entry.episode}
                            </p>
                          )}
                          {entry.pages && (
                            <p className="text-xs text-muted-foreground">
                              {entry.pages} páginas
                            </p>
                          )}
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedia(entry.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin registros</p>
                )}
              </div>

              {/* Objetivos */}
              <div className="border border-border/50 rounded-2xl p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium tracking-tight">
                      Objetivos
                    </h3>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full">
                      {completedHabits.length}/{habits.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsHabitsModalOpen(true)}
                    className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Plus size={16} strokeWidth={1.5} />
                  </button>
                </div>

                {habits.length > 0 ? (
                  <div className="space-y-3">
                    {habits.map((habit) => {
                      const entryData = entriesData.find(
                        (e: any) => e.objectiveId === habit.id
                      );
                      const currentValue = entryData?.value || 0;
                      const progress = habit.target
                        ? (currentValue / habit.target) * 100
                        : 0;

                      return (
                        <ObjectiveInput
                          key={habit.id}
                          habit={habit}
                          currentValue={currentValue}
                          progress={progress}
                          onUpdate={handleHabitUpdate}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Configura tus objetivos diarios
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Modals */}
      <DiaryModal
        isOpen={isDiaryModalOpen}
        onClose={() => setIsDiaryModalOpen(false)}
        date={currentDate}
        existingEntry={diaryEntry}
        onSave={handleDiarySaved}
      />

      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setSelectedMedia(null);
        }}
        date={currentDate}
        onSave={handleMediaSaved}
        existingEntry={selectedMedia}
      />

      <HabitsModal
        isOpen={isHabitsModalOpen}
        onClose={() => setIsHabitsModalOpen(false)}
        onSave={handleHabitsSaved}
      />
    </>
  );
}
