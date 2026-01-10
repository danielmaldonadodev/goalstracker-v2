import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const objectives = await prisma.objective.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(objectives);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error al obtener objetivos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, target, unit } = body;

    const objective = await prisma.objective.create({
      data: {
        userId: session.user.id,
        title,
        type,
        target: target || null,
        unit: unit || null,
      },
    });

    return NextResponse.json(objective);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error al crear objetivo" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, type, target, unit } = body;

    // Verificar que el objetivo pertenece al usuario
    const existing = await prisma.objective.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Objetivo no encontrado" },
        { status: 404 }
      );
    }

    const objective = await prisma.objective.update({
      where: { id },
      data: {
        title,
        type,
        target: target || null,
        unit: unit || null,
      },
    });

    return NextResponse.json(objective);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error al actualizar objetivo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    // Verificar que el objetivo pertenece al usuario
    const existing = await prisma.objective.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Objetivo no encontrado" },
        { status: 404 }
      );
    }

    await prisma.objective.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error al eliminar objetivo" },
      { status: 500 }
    );
  }
}
