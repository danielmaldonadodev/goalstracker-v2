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
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json({ error: "Fecha requerida" }, { status: 400 });
    }

    const date = new Date(dateParam + "T00:00:00.000Z");
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // 1. OBJETIVOS (60 puntos)
    const objectives = await prisma.objective.findMany({
      where: {
        userId: session.user.id,
        active: true,
        OR: [
          { startDate: null, endDate: null },
          {
            AND: [
              { OR: [{ startDate: null }, { startDate: { lte: date } }] },
              { OR: [{ endDate: null }, { endDate: { gte: date } }] },
            ],
          },
        ],
      },
    });

    const entries = await prisma.entry.findMany({
      where: {
        userId: session.user.id,
        date: { gte: date, lte: endDate },
      },
      include: { objective: true },
    });

    // Calcular objetivos completados (solo 100% cuenta)
    let objectivesCompleted = 0;
    entries.forEach((entry) => {
      const objective = objectives.find((o) => o.id === entry.objectiveId);
      if (!objective) return;

      if (objective.type === "boolean") {
        // Boolean: cualquier valor > 0 es completado
        if (entry.value > 0) objectivesCompleted++;
      } else {
        // Number/Time: debe alcanzar o superar el target (100%)
        if (objective.target && entry.value >= objective.target) {
          objectivesCompleted++;
        }
      }
    });

    const objectivesScore =
      objectives.length > 0
        ? Math.round((objectivesCompleted / objectives.length) * 60)
        : 0;

    // 2. DIARIO (25 puntos)
    const diaryEntry = await prisma.diaryEntry.findFirst({
      where: {
        userId: session.user.id,
        date: { gte: date, lte: endDate },
      },
    });
    const diaryScore = diaryEntry ? 25 : 0;

    // 3. MEDIA (15 puntos)
    const mediaEntries = await prisma.mediaEntry.findMany({
      where: {
        userId: session.user.id,
        date: { gte: date, lte: endDate },
      },
    });
    const mediaScore = mediaEntries.length > 0 ? 15 : 0;

    // TOTAL
    const totalScore = objectivesScore + diaryScore + mediaScore;

    // Guardar o actualizar
    const existingScore = await prisma.dailyScore.findFirst({
      where: {
        userId: session.user.id,
        date: { gte: date, lte: endDate },
      },
    });

    let scoreRecord;
    if (existingScore) {
      scoreRecord = await prisma.dailyScore.update({
        where: { id: existingScore.id },
        data: {
          score: totalScore,
          habitsScore: objectivesScore,
          diaryScore,
          mediaScore,
        },
      });
    } else {
      scoreRecord = await prisma.dailyScore.create({
        data: {
          userId: session.user.id,
          date: date,
          score: totalScore,
          habitsScore: objectivesScore,
          diaryScore,
          mediaScore,
        },
      });
    }

    return NextResponse.json({
      score: scoreRecord,
      breakdown: {
        objectives: {
          completed: objectivesCompleted,
          total: objectives.length,
          score: objectivesScore,
          maxScore: 60,
        },
        diary: {
          hasEntry: !!diaryEntry,
          score: diaryScore,
          maxScore: 25,
        },
        media: {
          count: mediaEntries.length,
          score: mediaScore,
          maxScore: 15,
        },
      },
    });
  } catch (error) {
    console.error("Error al calcular score:", error);
    return NextResponse.json(
      { error: "Error al calcular score" },
      { status: 500 }
    );
  }
}
