import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener todos los scores del usuario ordenados por fecha
    const scores = await prisma.dailyScore.findMany({
      where: {
        userId: session.user.id,
        score: { gt: 0 }, // Solo días con score > 0
      },
      orderBy: {
        date: "desc",
      },
    });

    if (scores.length === 0) {
      return NextResponse.json({
        currentStreak: 0,
        maxStreak: 0,
        totalDays: 0,
        lastActiveDate: null,
        isActive: false,
      });
    }

    // Calcular racha actual
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar si hoy tiene actividad
    const hasToday = scores.some((s) => {
      const scoreDate = new Date(s.date);
      scoreDate.setHours(0, 0, 0, 0);
      return scoreDate.getTime() === today.getTime();
    });

    // Calcular racha actual (desde hoy hacia atrás)
    let checkDate = new Date(today);
    if (!hasToday) {
      // Si hoy no tiene actividad, empezar desde ayer
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < scores.length; i++) {
      const scoreDate = new Date(scores[i].date);
      scoreDate.setHours(0, 0, 0, 0);

      if (scoreDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calcular racha máxima histórica
    tempStreak = 1;
    for (let i = 0; i < scores.length - 1; i++) {
      const currentDate = new Date(scores[i].date);
      const nextDate = new Date(scores[i + 1].date);
      currentDate.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    maxStreak = Math.max(maxStreak, currentStreak, 1);

    // Verificar si la racha está activa (hoy o ayer tiene actividad)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isActive = scores.some((s) => {
      const scoreDate = new Date(s.date);
      scoreDate.setHours(0, 0, 0, 0);
      return (
        scoreDate.getTime() === today.getTime() ||
        scoreDate.getTime() === yesterday.getTime()
      );
    });

    return NextResponse.json({
      currentStreak,
      maxStreak,
      totalDays: scores.length,
      lastActiveDate: scores[0].date,
      isActive,
      hasToday,
    });
  } catch (error) {
    console.error("Error al calcular streak:", error);
    return NextResponse.json(
      { error: "Error al calcular streak" },
      { status: 500 }
    );
  }
}
