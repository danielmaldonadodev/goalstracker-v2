"use client";

interface DayScoreCircleProps {
  score: number;
  breakdown?: {
    objectives?: {
      completed: number;
      total: number;
      score: number;
      maxScore: number;
    };
    diary?: { hasEntry: boolean; score: number; maxScore: number };
    media?: { count: number; score: number; maxScore: number };
  };
}

export default function DayScoreCircle({
  score,
  breakdown,
}: DayScoreCircleProps) {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return "#22c55e"; // green
    if (score >= 60) return "#eab308"; // yellow
    if (score >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Circle */}
      <div className="relative">
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="currentColor"
            strokeWidth="16"
            fill="none"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke={getColor()}
            strokeWidth="16"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-6xl font-light tracking-tight"
            style={{ color: getColor() }}
          >
            {score}
          </div>
          <div className="text-sm text-muted-foreground mt-2">puntos</div>
        </div>
      </div>

      {/* Breakdown */}
      {breakdown && (
        <div className="w-full max-w-md space-y-3">
          {/* Objetivos */}
          {breakdown.objectives && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium">Objetivos</p>
                <p className="text-xs text-muted-foreground">
                  {breakdown.objectives.completed}/{breakdown.objectives.total}{" "}
                  completados
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-light">
                  {breakdown.objectives.score}
                </p>
                <p className="text-xs text-muted-foreground">
                  de {breakdown.objectives.maxScore}
                </p>
              </div>
            </div>
          )}

          {/* Diario */}
          {breakdown.diary && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium">Diario</p>
                <p className="text-xs text-muted-foreground">
                  {breakdown.diary.hasEntry ? "Escrito" : "Sin escribir"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-light">{breakdown.diary.score}</p>
                <p className="text-xs text-muted-foreground">
                  de {breakdown.diary.maxScore}
                </p>
              </div>
            </div>
          )}

          {/* Media */}
          {breakdown.media && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium">Media</p>
                <p className="text-xs text-muted-foreground">
                  {breakdown.media.count}{" "}
                  {breakdown.media.count === 1 ? "entrada" : "entradas"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-light">{breakdown.media.score}</p>
                <p className="text-xs text-muted-foreground">
                  de {breakdown.media.maxScore}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
