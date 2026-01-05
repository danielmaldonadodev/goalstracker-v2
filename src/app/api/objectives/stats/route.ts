import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const objectiveId = searchParams.get("id");

    if (!objectiveId) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    // Verificar que el objetivo pertenece al usuario
    const objective = await prisma.objective.findUnique({
      where: { id: objectiveId },
    });

    if (!objective || objective.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener todas las entries
    const entries = await prisma.entry.findMany({
      where: {
        objectiveId: objectiveId,
        userId: session.user.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calcular estadísticas
    const totalDays = entries.length;
    let completedDays = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalValue = 0;
    let bestDay = { date: null as Date | null, value: 0 };

    // Ordenar por fecha para calcular rachas
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedEntries.forEach((entry, index) => {
      totalValue += entry.value;

      // Determinar si está completado
      const isCompleted =
        objective.type === "boolean"
          ? entry.value > 0
          : objective.target
          ? entry.value >= objective.target
          : entry.value > 0;

      if (isCompleted) {
        completedDays++;
        tempStreak++;

        // Verificar si es consecutivo
        if (index > 0) {
          const prevDate = new Date(sortedEntries[index - 1].date);
          const currDate = new Date(entry.date);
          const diffDays = Math.floor(
            (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays > 1) {
            tempStreak = 1; // Resetear racha si no es consecutivo
          }
        }

        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }

      // Mejor día
      if (entry.value > bestDay.value) {
        bestDay = { date: entry.date, value: entry.value };
      }
    });

    // Racha actual (desde hoy hacia atrás)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = sortedEntries.length - 1; i >= 0; i--) {
      const entry = sortedEntries[i];
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);

      const isCompleted =
        objective.type === "boolean"
          ? entry.value > 0
          : objective.target
          ? entry.value >= objective.target
          : entry.value > 0;

      if (isCompleted) {
        currentStreak++;
      } else {
        break;
      }
    }

    const average = totalDays > 0 ? totalValue / totalDays : 0;

    return NextResponse.json({
      totalDays,
      completedDays,
      currentStreak,
      longestStreak,
      average: Math.round(average * 100) / 100,
      bestDay: bestDay.date
        ? {
            date: bestDay.date,
            value: bestDay.value,
          }
        : null,
      entries: entries.slice(0, 30), // Últimos 30 días
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
