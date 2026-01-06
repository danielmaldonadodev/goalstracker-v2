"use client";

import { fireStreakConfetti } from "@/lib/confetti";
import { motion } from "framer-motion";
import { Calendar, Flame, Trophy } from "lucide-react";
import { useEffect } from "react";
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
  // Celebrar rachas especiales
  useEffect(() => {
    if (currentStreak === 7) {
      setTimeout(() => {
        toast.success("🔥 ¡7 días seguidos!", {
          description: "Una semana completa de consistencia",
          duration: 3000,
        });
      }, 500);
    } else if (currentStreak === 30) {
      setTimeout(() => {
        fireStreakConfetti();
        toast.success("🏆 ¡30 días seguidos!", {
          description: "¡Eres una leyenda!",
          duration: 4000,
        });
      }, 500);
    } else if (currentStreak === 100) {
      setTimeout(() => {
        fireStreakConfetti();
        toast.success("👑 ¡100 días seguidos!", {
          description: "Nivel maestro alcanzado",
          duration: 5000,
        });
      }, 500);
    }
  }, [currentStreak]);

  return (
    <div className="border border-border rounded-2xl p-6 space-y-6">
      {/* Título */}
      <div>
        <h3 className="text-lg font-medium tracking-tight mb-1">Racha</h3>
        <p className="text-sm text-muted-foreground">
          Mantén tu consistencia diaria
        </p>
      </div>

      {/* Racha Actual */}
      <div className="flex items-center justify-center">
        <motion.div
          key={currentStreak}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame
                size={48}
                className={`${
                  currentStreak > 0
                    ? "text-orange-500"
                    : "text-muted-foreground/30"
                }`}
                fill={currentStreak > 0 ? "currentColor" : "none"}
              />
            </div>
            <div>
              <p className="text-5xl font-light">{currentStreak}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStreak === 1 ? "día" : "días"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Warning si no has completado hoy */}
      {!hasToday && isActive && currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center"
        >
          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
            ⚠️ ¡No rompas tu racha! Completa tus objetivos hoy.
          </p>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Récord */}
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy size={20} className="text-yellow-500" />
          </div>
          <p className="text-2xl font-light">{maxStreak}</p>
          <p className="text-xs text-muted-foreground mt-1">Récord</p>
        </div>

        {/* Total */}
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar size={20} className="text-blue-500" />
          </div>
          <p className="text-2xl font-light">{totalDays}</p>
          <p className="text-xs text-muted-foreground mt-1">Total</p>
        </div>
      </div>

      {/* Mensaje motivacional */}
      {currentStreak === 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Completa tus objetivos hoy para empezar tu racha 🔥
        </div>
      )}

      {currentStreak >= 7 && (
        <div className="text-center">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            🎉 ¡Increíble! Llevas {currentStreak} días seguidos
          </p>
        </div>
      )}

      {currentStreak >= 30 && (
        <div className="text-center">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
            🏆 ¡Leyenda! Un mes completo de consistencia
          </p>
        </div>
      )}
    </div>
  );
}
