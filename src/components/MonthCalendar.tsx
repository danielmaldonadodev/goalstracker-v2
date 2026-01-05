"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isToday,
  startOfMonth,
} from "date-fns";

interface MonthCalendarProps {
  currentDate: Date;
  scores: any[];
  onDayClick: (date: Date) => void;
}

export default function MonthCalendar({
  currentDate,
  scores,
  onDayClick,
}: MonthCalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtener el primer día de la semana del mes
  const firstDayOfWeek = monthStart.getDay();

  // Días vacíos al inicio
  const emptyDays = Array.from(
    { length: firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 },
    (_, i) => i
  );

  const getScoreForDay = (date: Date) => {
    const score = scores.find((s) => isSameDay(new Date(s.date), date));
    return score?.score || 0;
  };

  const getColorForScore = (score: number) => {
    if (score === 0) return "bg-muted/30";
    if (score <= 25) return "bg-red-500/80";
    if (score <= 50) return "bg-orange-500/80";
    if (score <= 75) return "bg-yellow-500/80";
    return "bg-green-500/80";
  };

  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div className="space-y-4">
      {/* Header con días de la semana */}
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

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-2">
        {/* Días vacíos al inicio */}
        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Días del mes */}
        {daysInMonth.map((day) => {
          const score = getScoreForDay(day);
          const colorClass = getColorForScore(score);
          const today = isToday(day);
          const hasScore = score > 0;

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`
                aspect-square rounded-xl border-2 transition-all
                flex flex-col items-center justify-center p-1
                hover:scale-105 hover:shadow-lg
                ${today ? "border-foreground" : "border-transparent"}
                ${colorClass}
                ${hasScore ? "cursor-pointer" : "cursor-default opacity-50"}
              `}
            >
              <span className="text-xs font-medium text-white">
                {format(day, "d")}
              </span>
              {hasScore && (
                <span className="text-[10px] font-bold text-white/90">
                  {score}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted/30" />
          <span className="text-xs text-muted-foreground">Sin datos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/80" />
          <span className="text-xs text-muted-foreground">0-25</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500/80" />
          <span className="text-xs text-muted-foreground">26-50</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/80" />
          <span className="text-xs text-muted-foreground">51-75</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/80" />
          <span className="text-xs text-muted-foreground">76-100</span>
        </div>
      </div>
    </div>
  );
}
