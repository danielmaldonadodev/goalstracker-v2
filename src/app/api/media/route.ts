import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET - Obtener media de un día específico
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

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const entries = await prisma.mediaEntry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: date,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error al obtener media:", error);
    return NextResponse.json(
      { error: "Error al obtener media" },
      { status: 500 }
    );
  }
}

// POST - Crear entrada de media
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      date: dateParam,
      type,
      title,
      season,
      episode,
      pages,
      rating,
      notes,
      completed,
    } = body;

    if (!dateParam || !type || !title) {
      return NextResponse.json(
        { error: "Fecha, tipo y título son requeridos" },
        { status: 400 }
      );
    }

    // Normalizar fecha a medianoche UTC
    const date = new Date(dateParam + "T00:00:00.000Z");

    const entry = await prisma.mediaEntry.create({
      data: {
        userId: session.user.id,
        date,
        type,
        title,
        season: season || null,
        episode: episode || null,
        pages: pages || null,
        rating: rating || null,
        notes: notes || null,
        completed: completed || false,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Error al crear media:", error);
    return NextResponse.json(
      { error: "Error al crear media" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una entrada de media existente
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      type,
      title,
      season,
      episode,
      pages,
      rating,
      notes,
      completed,
    } = body as {
      id: string;
      type: string;
      title: string;
      season?: number;
      episode?: number;
      pages?: number;
      rating?: number;
      notes?: string;
      completed: boolean;
    };

    if (!id || !title?.trim()) {
      return NextResponse.json(
        { error: "ID y título requeridos" },
        { status: 400 }
      );
    }

    // Verificar que la entrada pertenece al usuario
    const existing = await prisma.mediaEntry.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Actualizar
    const entry = await prisma.mediaEntry.update({
      where: { id },
      data: {
        type: type as any,
        title: title.trim(),
        season: season || null,
        episode: episode || null,
        pages: pages || null,
        rating: rating || null,
        notes: notes?.trim() || null,
        completed,
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Error al actualizar media:", error);
    return NextResponse.json(
      { error: "Error al actualizar media" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar entrada de media
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    // Verificar que el media entry pertenece al usuario
    const entry = await prisma.mediaEntry.findUnique({
      where: { id },
    });

    if (!entry || entry.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.mediaEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar media:", error);
    return NextResponse.json(
      { error: "Error al eliminar media" },
      { status: 500 }
    );
  }
}
