import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET - Obtener todos los hábitos activos del usuario
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const habits = await prisma.objective.findMany({
      where: {
        userId: session.user.id,
        active: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ habits });
  } catch (error) {
    console.error("Error al obtener hábitos:", error);
    return NextResponse.json(
      { error: "Error al obtener hábitos" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo hábito
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { title, type, target, unit, startDate, endDate } = body as {
      title: string;
      type: string;
      target?: number;
      unit?: string;
      startDate?: string;
      endDate?: string;
    };

    if (!title?.trim() || !type) {
      return NextResponse.json(
        { error: "Título y tipo requeridos" },
        { status: 400 }
      );
    }

    const habit = await prisma.objective.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        type,
        target: target || null,
        unit: unit?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    console.error("Error al crear hábito:", error);
    return NextResponse.json(
      { error: "Error al crear hábito" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un objetivo
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, type, target, unit, startDate, endDate, active } =
      body as {
        id: string;
        title?: string;
        type?: string;
        target?: number;
        unit?: string;
        startDate?: string;
        endDate?: string;
        active?: boolean;
      };

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    // Verificar que el objetivo pertenece al usuario
    const existing = await prisma.objective.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (type !== undefined) updateData.type = type;
    if (target !== undefined) updateData.target = target || null;
    if (unit !== undefined) updateData.unit = unit?.trim() || null;
    if (startDate !== undefined)
      updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
      updateData.endDate = endDate ? new Date(endDate) : null;
    if (active !== undefined) updateData.active = active;

    const habit = await prisma.objective.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ habit });
  } catch (error) {
    console.error("Error al actualizar hábito:", error);
    return NextResponse.json(
      { error: "Error al actualizar hábito" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un hábito
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

    // Verificar que el hábito pertenece al usuario
    const habit = await prisma.objective.findUnique({
      where: { id },
    });

    if (!habit || habit.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.objective.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar hábito:", error);
    return NextResponse.json(
      { error: "Error al eliminar hábito" },
      { status: 500 }
    );
  }
}
