"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateNavigatorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export default function DateNavigator({
  currentDate,
  onDateChange,
  className = "",
}: DateNavigatorProps) {
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const isToday = () => {
    const today = new Date();
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isFuture = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const current = new Date(currentDate);
    current.setHours(0, 0, 0, 0);
    return current > today;
  };

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* Botón anterior */}
      <button
        onClick={goToPreviousDay}
        className="btn-icon haptic-feedback"
        aria-label="Día anterior"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Fecha actual */}
      <div className="flex-1 text-center">
        <div className="text-sm text-muted-foreground capitalize">
          {format(currentDate, "EEEE", { locale: es })}
        </div>
        <div className="text-2xl font-bold">
          {format(currentDate, "d MMMM yyyy", { locale: es })}
        </div>
        {isToday() && (
          <div className="text-xs text-primary font-medium mt-1">Hoy</div>
        )}
      </div>

      {/* Botón siguiente */}
      <button
        onClick={goToNextDay}
        disabled={isFuture()}
        className={`btn-icon haptic-feedback ${
          isFuture() ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-label="Día siguiente"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
