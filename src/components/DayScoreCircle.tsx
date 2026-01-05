"use client";

import { motion } from "framer-motion";

interface DayScoreCircleProps {
  score: number; // 0-100
  className?: string;
}

export default function DayScoreCircle({
  score,
  className = "",
}: DayScoreCircleProps) {
  // Determinar color según score (sutil, profesional)
  const getScoreColor = () => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 50) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const scoreColor = getScoreColor();
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Título */}
      <div className="text-sm font-medium text-muted-foreground mb-8 tracking-wider uppercase">
        Progreso Diario
      </div>

      {/* Círculo minimalista */}
      <div className="relative">
        <svg width="220" height="220" className="transform -rotate-90">
          {/* Background circle (más sutil) */}
          <circle
            cx="110"
            cy="110"
            r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
            opacity="0.2"
          />

          {/* Progress circle */}
          <motion.circle
            cx="110"
            cy="110"
            r="90"
            fill="none"
            stroke={scoreColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: 1.5,
              ease: [0.65, 0, 0.35, 1],
            }}
          />
        </svg>

        {/* Score en el centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.3,
              duration: 0.6,
              ease: [0.65, 0, 0.35, 1],
            }}
            className="text-center"
          >
            <div
              className="text-7xl font-light tracking-tighter tabular-nums"
              style={{ color: scoreColor }}
            >
              {Math.round(score)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-medium tracking-wider">
              PORCENTAJE
            </div>
          </motion.div>
        </div>
      </div>

      {/* Status text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-sm text-muted-foreground"
      >
        {score >= 80 && "Día excelente"}
        {score >= 50 && score < 80 && "Buen progreso"}
        {score < 50 && "Sigue así"}
      </motion.div>
    </div>
  );
}
