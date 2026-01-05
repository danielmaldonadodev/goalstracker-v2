import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET - Obtener entrada de diario de un día específico
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

    // Normalizar fecha a medianoche UTC
    const date = new Date(dateParam + "T00:00:00.000Z");

    const entry = await prisma.diaryEntry.findFirst({
      where: {
        userId: session.user.id,
        date: date,
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Error al obtener entrada:", error);
    return NextResponse.json(
      { error: "Error al obtener entrada" },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar entrada de diario
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { date: dateParam, content, mood, tags } = body;

    if (!dateParam || !content) {
      return NextResponse.json(
        { error: "Fecha y contenido son requeridos" },
        { status: 400 }
      );
    }

    // Normalizar fecha a medianoche UTC
    const date = new Date(dateParam + "T00:00:00.000Z");

    // Primero buscar si existe
    const existing = await prisma.diaryEntry.findFirst({
      where: {
        userId: session.user.id,
        date: date,
      },
    });

    let entry;
    if (existing) {
      // Actualizar
      entry = await prisma.diaryEntry.update({
        where: { id: existing.id },
        data: {
          content,
          mood: mood || null,
          tags: tags || [],
        },
      });
    } else {
      // Crear
      entry = await prisma.diaryEntry.create({
        data: {
          userId: session.user.id,
          date,
          content,
          mood: mood || null,
          tags: tags || [],
        },
      });
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Error al guardar entrada:", error);
    return NextResponse.json(
      { error: "Error al guardar entrada" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar entrada de diario
export async function DELETE(req: Request) {
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

    // Normalizar fecha a medianoche UTC
    const date = new Date(dateParam + "T00:00:00.000Z");

    const entry = await prisma.diaryEntry.findFirst({
      where: {
        userId: session.user.id,
        date: date,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Entrada no encontrada" },
        { status: 404 }
      );
    }

    await prisma.diaryEntry.delete({
      where: { id: entry.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar entrada:", error);
    return NextResponse.json(
      { error: "Error al eliminar entrada" },
      { status: 500 }
    );
  }
}
