import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET - Obtener entries de un día específico
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

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error al obtener entries:", error);
    return NextResponse.json(
      { error: "Error al obtener entries" },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar entry
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      date: dateParam,
      objectiveId,
      value,
    } = body as {
      date: string;
      objectiveId: string;
      value: number;
    };

    if (!dateParam || !objectiveId || value === undefined) {
      return NextResponse.json(
        { error: "Fecha, objectiveId y value requeridos" },
        { status: 400 }
      );
    }

    const date = new Date(dateParam + "T00:00:00.000Z");
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Si el valor es 0 o negativo, borrar el entry
    if (value <= 0) {
      await prisma.entry.deleteMany({
        where: {
          userId: session.user.id,
          objectiveId: objectiveId,
          date: {
            gte: date,
            lte: endDate,
          },
        },
      });
      return NextResponse.json({ success: true, deleted: true });
    }

    // Buscar si ya existe entry para este día
    const existing = await prisma.entry.findFirst({
      where: {
        userId: session.user.id,
        objectiveId: objectiveId,
        date: {
          gte: date,
          lte: endDate,
        },
      },
    });

    if (existing) {
      // Actualizar
      const entry = await prisma.entry.update({
        where: { id: existing.id },
        data: { value },
      });
      return NextResponse.json({ entry }, { status: 200 });
    } else {
      // Crear
      const entry = await prisma.entry.create({
        data: {
          userId: session.user.id,
          objectiveId: objectiveId,
          date: new Date(),
          value: value,
        },
      });
      return NextResponse.json({ entry }, { status: 201 });
    }
  } catch (error) {
    console.error("Error al trackear hábito:", error);
    return NextResponse.json(
      { error: "Error al trackear hábito" },
      { status: 500 }
    );
  }
}
