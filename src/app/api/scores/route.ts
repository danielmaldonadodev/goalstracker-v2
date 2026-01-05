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
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString()
    );
    const month = parseInt(
      searchParams.get("month") || (new Date().getMonth() + 1).toString()
    );

    // Fecha de inicio y fin del mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Obtener todos los scores del mes
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

    // Calcular estadísticas del mes
    const totalDays = scores.length;
    const avgScore =
      totalDays > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalDays)
        : 0;

    const bestDay = scores.reduce(
      (best, current) => (current.score > best.score ? current : best),
      { score: 0, date: startDate }
    );

    const perfectDays = scores.filter((s) => s.score >= 90).length;

    return NextResponse.json({
      scores,
      stats: {
        totalDays,
        avgScore,
        bestDay: bestDay.score > 0 ? bestDay : null,
        perfectDays,
      },
    });
  } catch (error) {
    console.error("Error al obtener scores:", error);
    return NextResponse.json(
      { error: "Error al obtener scores" },
      { status: 500 }
    );
  }
}

