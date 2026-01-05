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

    // Obtener objetivos activos para esta fecha
    const objectives = await prisma.objective.findMany({
      where: {
        userId: session.user.id,
        active: true,
        OR: [
          { startDate: null, endDate: null }, // Sin fechas = siempre activo
          {
            AND: [
              { startDate: { lte: date } },
              { OR: [{ endDate: null }, { endDate: { gte: date } }] },
            ],
          },
        ],
      },
    });

    // Obtener entries del día
    const entries = await prisma.entry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: date,
          lte: endDate,
        },
      },
      include: {
        objective: true,
      },
    });

    // Calcular score de objetivos (40 puntos máx)
    let habitsScore = 0;
    if (objectives.length > 0) {
      let completedCount = 0;

      entries.forEach((entry) => {
        const objective = objectives.find((o) => o.id === entry.objectiveId);
        if (!objective) return;

        if (objective.type === "boolean") {
          // Boolean: solo cuenta si value > 0
          if (entry.value > 0) completedCount++;
        } else {
          // Number/Time: cuenta como completado si alcanza el target
          if (objective.target && entry.value >= objective.target) {
            completedCount++;
          } else if (!objective.target && entry.value > 0) {
            // Si no hay target, cualquier valor > 0 cuenta
            completedCount++;
          }
        }
      });

      habitsScore = Math.round((completedCount / objectives.length) * 40);
    }

    // Verificar diario (30 puntos)
    const diaryEntry = await prisma.diaryEntry.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: date,
          lte: endDate,
        },
      },
    });
    const diaryScore = diaryEntry ? 30 : 0;

    // Verificar media (20 puntos)
    const mediaEntries = await prisma.mediaEntry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: date,
          lte: endDate,
        },
      },
    });
    const mediaScore = mediaEntries.length > 0 ? 20 : 0;

    // Score total
    const totalScore = habitsScore + diaryScore + mediaScore;

    // Buscar si ya existe DailyScore
    const existingScore = await prisma.dailyScore.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: date,
          lte: endDate,
        },
      },
    });

    let scoreRecord;
    if (existingScore) {
      // Actualizar
      scoreRecord = await prisma.dailyScore.update({
        where: { id: existingScore.id },
        data: {
          score: totalScore,
          habitsScore,
          diaryScore,
          mediaScore,
        },
      });
    } else {
      // Crear
      scoreRecord = await prisma.dailyScore.create({
        data: {
          userId: session.user.id,
          date: date,
          score: totalScore,
          habitsScore,
          diaryScore,
          mediaScore,
        },
      });
    }

    return NextResponse.json({
      score: scoreRecord,
      breakdown: {
        habits: `${
          entries.filter((e) => {
            const obj = objectives.find((o) => o.id === e.objectiveId);
            if (!obj) return false;
            if (obj.type === "boolean") return e.value > 0;
            return obj.target ? e.value >= obj.target : e.value > 0;
          }).length
        }/${objectives.length}`,
        diary: diaryEntry ? "Sí" : "No",
        media: `${mediaEntries.length} entradas`,
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
