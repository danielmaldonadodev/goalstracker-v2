import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
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
    const period = searchParams.get("period") || "week"; // week, month, year

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === "week") {
      startDate = startOfWeek(now, { weekStartsOn: 1 }); // Lunes
      endDate = endOfWeek(now, { weekStartsOn: 1 });
    } else if (period === "month") {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else {
      // year - últimos 365 días
      startDate = subDays(now, 365);
      endDate = now;
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

    // Obtener todos los objetivos del usuario
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
    const totalDays = scores.length;

    const bestDay =
      scores.length > 0
        ? scores.reduce((best, current) =>
            current.score > best.score ? current : best
          )
        : null;

    // Stats por día de la semana
    const dayStats: { [key: string]: { total: number; count: number } } = {};
    scores.forEach((score) => {
      const dayName = format(new Date(score.date), "EEEE", { locale: es });
      if (!dayStats[dayName]) {
        dayStats[dayName] = { total: 0, count: 0 };
      }
      dayStats[dayName].total += score.score;
      dayStats[dayName].count += 1;
    });

    const bestDayOfWeek =
      Object.entries(dayStats).length > 0
        ? Object.entries(dayStats).reduce(
            (best, [day, stats]) => {
              const avg = stats.total / stats.count;
              return avg > best.avg ? { day, avg } : best;
            },
            { day: "", avg: 0 }
          )
        : null;

    // Objetivos más y menos cumplidos (BASADO EN CONSISTENCIA)
    const objectiveStats: {
      [key: string]: {
        completed: number;
        daysActive: number;
        title: string;
      };
    } = {};

    // Calcular cuántos días cada objetivo estuvo activo en el período
    objectives.forEach((objective) => {
      const objStartDate = objective.startDate
        ? new Date(objective.startDate)
        : startDate;
      const objEndDate = objective.endDate
        ? new Date(objective.endDate)
        : endDate;

      // Calcular días que el objetivo estuvo activo dentro del período
      const activeStart = objStartDate > startDate ? objStartDate : startDate;
      const activeEnd = objEndDate < endDate ? objEndDate : endDate;

      if (activeStart <= activeEnd) {
        const daysActive =
          Math.ceil(
            (activeEnd.getTime() - activeStart.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1;

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
      .filter(([id, stats]) => stats.daysActive >= 3) // Solo mostrar objetivos con al menos 3 días activos
      .map(([id, stats]) => ({
        id,
        title: stats.title,
        completed: stats.completed,
        daysActive: stats.daysActive,
        percentage: Math.round((stats.completed / stats.daysActive) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const mostCompleted = objectiveStatsArray.slice(0, 5);
    const leastCompleted = objectiveStatsArray.slice(-5).reverse();

    // Preparar datos para gráfico de línea (últimos 30 días)
    const last30Days = eachDayOfInterval({
      start: subDays(now, 29),
      end: now,
    });

    const chartData = last30Days.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const score = scores.find(
        (s) => format(new Date(s.date), "yyyy-MM-dd") === dateStr
      );
      return {
        date: format(date, "dd MMM", { locale: es }),
        score: score?.score || 0,
        fullDate: dateStr,
      };
    });

    // Datos para gráfico de barras (día de la semana)
    const weekdayData = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ].map((day) => ({
      day: day.slice(0, 3),
      avg: dayStats[day]
        ? Math.round(dayStats[day].total / dayStats[day].count)
        : 0,
    }));

    return NextResponse.json({
      summary: {
        avgScore,
        perfectDays,
        totalDays,
        bestDay: bestDay
          ? {
              date: format(new Date(bestDay.date), "d 'de' MMMM", {
                locale: es,
              }),
              score: bestDay.score,
            }
          : null,
        bestDayOfWeek: bestDayOfWeek
          ? {
              day: bestDayOfWeek.day,
              avg: Math.round(bestDayOfWeek.avg),
            }
          : null,
      },
      objectives: {
        mostCompleted,
        leastCompleted,
      },
      charts: {
        scoreOverTime: chartData,
        weekdayAverage: weekdayData,
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
