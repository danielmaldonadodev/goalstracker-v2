"use client";

import { fireStreakConfetti } from "@/lib/confetti";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StreakDisplayProps {
  currentStreak: number;
  maxStreak: number;
  totalDays: number;
  isActive: boolean;
  hasToday: boolean;
}

export default function StreakDisplay({
  currentStreak,
  maxStreak,
  totalDays,
  isActive,
  hasToday,
}: StreakDisplayProps) {
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    if (hasShownToast) return;

    if (currentStreak === 7) {
      setTimeout(() => {
        toast.success("7 días seguidos", {
          description: "Una semana completa de consistencia",
          duration: 3000,
        });
        setHasShownToast(true);
      }, 500);
    } else if (currentStreak === 30) {
      setTimeout(() => {
        fireStreakConfetti();
        toast.success("30 días seguidos", {
          description: "¡Eres una leyenda!",
          duration: 4000,
        });
        setHasShownToast(true);
      }, 500);
    } else if (currentStreak === 100) {
      setTimeout(() => {
        fireStreakConfetti();
        toast.success("100 días seguidos", {
          description: "Nivel maestro desbloqueado",
          duration: 4000,
        });
        setHasShownToast(true);
      }, 500);
    }
  }, [currentStreak, hasShownToast]);

  const getMessage = () => {
    if (currentStreak === 0) {
      return "Completa tus objetivos hoy para empezar tu racha";
    }
    if (!hasToday && isActive) {
      return "Completa tus objetivos hoy para mantener tu racha";
    }
    if (currentStreak >= 30) {
      return "Consistencia excepcional";
    }
    if (currentStreak >= 7) {
      return "Excelente progreso";
    }
    return "Sigue así";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl p-8 transition-all ${
        !hasToday && currentStreak > 0
          ? "border-orange-500/30 bg-orange-500/5"
          : "border-border bg-background"
      }`}
    >
      <div className="text-center">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-1">Racha actual</h3>
          <p className="text-sm text-muted-foreground">{getMessage()}</p>
        </div>

        {/* Número principal */}
        <motion.div
          key={currentStreak}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="text-8xl font-light tracking-tighter mb-2">
            {currentStreak}
          </div>
          <div className="text-sm text-muted-foreground tracking-wide uppercase">
            {currentStreak === 1 ? "día" : "días"} consecutivos
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="text-3xl font-light mb-1">{maxStreak}</div>
            <div className="text-xs text-muted-foreground">Récord personal</div>
          </div>
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="text-3xl font-light mb-1">{totalDays}</div>
            <div className="text-xs text-muted-foreground">Días totales</div>
          </div>
        </div>

        {/* Barra de progreso hacia próximo hito */}
        {currentStreak > 0 && currentStreak < 30 && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Progreso hacia {currentStreak < 7 ? "7" : "30"} días</span>
              <span>
                {currentStreak < 7
                  ? `${7 - currentStreak} ${
                      7 - currentStreak === 1 ? "día" : "días"
                    } más`
                  : `${30 - currentStreak} ${
                      30 - currentStreak === 1 ? "día" : "días"
                    } más`}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    currentStreak < 7
                      ? (currentStreak / 7) * 100
                      : ((currentStreak - 7) / 23) * 100
                  }%`,
                }}
                className="h-full bg-foreground"
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
