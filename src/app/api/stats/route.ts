import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    // Obtener el primer score del usuario PRIMERO
    const firstScore = await prisma.dailyScore.findFirst({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
    });

    if (!firstScore) {
      // Si no hay scores, devolver datos vacíos
      return NextResponse.json({
        summary: {
          avgScore: 0,
          perfectDays: 0,
          totalDays: 0,
          dateRange: null,
          bestDay: null,
          bestDayOfWeek: null,
        },
        objectives: {
          mostCompleted: [],
          leastCompleted: [],
        },
      });
    }

    // Fecha de inicio del usuario (normalizada al inicio del día)
    const userStartDate = new Date(firstScore.date);
    userStartDate.setHours(0, 0, 0, 0);

    // Determinar rango de fechas
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case "week":
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        startDate.setHours(0, 0, 0, 0);
        // NUNCA antes del primer score del usuario
        if (startDate < userStartDate) {
          startDate = userStartDate;
        }
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        endDate.setHours(23, 59, 59, 999);
        break;
      case "month":
        startDate = startOfMonth(now);
        startDate.setHours(0, 0, 0, 0);
        // NUNCA antes del primer score del usuario
        if (startDate < userStartDate) {
          startDate = userStartDate;
        }
        endDate = endOfMonth(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "all":
      default:
        startDate = userStartDate;
        endDate = now;
        break;
    }

    // Obtener scores del período
    const scores = await prisma.dailyScore.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Obtener objetivos del usuario
    const objectives = await prisma.objective.findMany({
      where: {
        userId: session.user.id,
      },
    });

    // Obtener entries del período
    const entries = await prisma.entry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        objective: true,
      },
    });

    // Calcular stats
    const avgScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, s) => sum + s.score, 0) / scores.length
          )
        : 0;

    const perfectDays = scores.filter((s) => s.score >= 90).length;

    // Total de días = cantidad de scores que tenemos
    const totalDays = scores.length;

    const bestDay =
      scores.length > 0
        ? scores.reduce((best, current) =>
            current.score > best.score ? current : best
          )
        : null;

    // Stats por día de la semana
    const dayStats: { [key: number]: { total: number; count: number } } = {};
    scores.forEach((score) => {
      const dayOfWeek = new Date(score.date).getDay();
      if (!dayStats[dayOfWeek]) {
        dayStats[dayOfWeek] = { total: 0, count: 0 };
      }
      dayStats[dayOfWeek].total += score.score;
      dayStats[dayOfWeek].count += 1;
    });

    const bestDayOfWeek =
      Object.keys(dayStats).length > 0
        ? Object.entries(dayStats).reduce(
            (best, [day, stats]) => {
              const avg = stats.total / stats.count;
              return avg > best.avgScore
                ? { dayOfWeek: parseInt(day), avgScore: Math.round(avg) }
                : best;
            },
            { dayOfWeek: 0, avgScore: 0 }
          )
        : null;

    // Objetivos más y menos cumplidos
    const objectiveStats: {
      [key: string]: {
        completed: number;
        daysActive: number;
        title: string;
      };
    } = {};

    objectives.forEach((objective) => {
      // Inicio del objetivo: su startDate O el inicio del período
      const objStartDate = objective.startDate
        ? new Date(objective.startDate)
        : startDate;
      objStartDate.setHours(0, 0, 0, 0);

      // Fin del objetivo: su endDate O HOY (lo que sea menor)
      const objEndDate = objective.endDate ? new Date(objective.endDate) : now;
      objEndDate.setHours(23, 59, 59, 999);

      // CRÍTICO: El inicio real NUNCA puede ser antes del primer score del usuario
      const actualStart = new Date(
        Math.max(
          objStartDate.getTime(),
          startDate.getTime(),
          userStartDate.getTime()
        )
      );

      // El fin real es el más temprano entre objetivo, período y HOY
      const actualEnd = new Date(
        Math.min(
          objEndDate.getTime(),
          endDate.getTime(),
          now.getTime() // AÑADIR ESTO - NO CONTAR DÍAS FUTUROS
        )
      );

      if (actualStart <= actualEnd) {
        // Calcular días entre actualStart y actualEnd (inclusive)
        const diffTime = actualEnd.getTime() - actualStart.getTime();
        const daysActive = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        objectiveStats[objective.id] = {
          completed: 0,
          daysActive: daysActive,
          title: objective.title,
        };
      }
    });

    // Contar días completados
    entries.forEach((entry) => {
      if (objectiveStats[entry.objectiveId]) {
        const isCompleted =
          entry.objective.type === "boolean"
            ? entry.value > 0
            : entry.objective.target && entry.value >= entry.objective.target;

        if (isCompleted) {
          objectiveStats[entry.objectiveId].completed += 1;
        }
      }
    });

    const objectiveStatsArray = Object.entries(objectiveStats)
      .filter(([id, stats]) => stats.daysActive >= 3)
      .map(([id, stats]) => ({
        id,
        title: stats.title,
        completed: stats.completed,
        daysActive: stats.daysActive,
        percentage: (stats.completed / stats.daysActive) * 100,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const mostCompleted = objectiveStatsArray.slice(0, 5);
    const leastCompleted = objectiveStatsArray.slice(-5).reverse();

    return NextResponse.json({
      summary: {
        avgScore,
        perfectDays,
        totalDays,
        dateRange: {
          start: format(startDate, "d 'de' MMM", { locale: es }),
          end: format(endDate, "d 'de' MMM", { locale: es }),
        },
        bestDay: bestDay
          ? {
              date: format(new Date(bestDay.date), "d 'de' MMMM", {
                locale: es,
              }),
              score: bestDay.score,
            }
          : null,
        bestDayOfWeek:
          bestDayOfWeek && bestDayOfWeek.avgScore > 0 ? bestDayOfWeek : null,
      },
      objectives: {
        mostCompleted,
        leastCompleted,
      },
    });
  } catch (error) {
    console.error("Error al obtener stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
