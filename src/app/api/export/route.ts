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

    // Obtener parámetros de fecha
    const { searchParams } = new URL(request.url);
    const rangeType = searchParams.get("range") || "all";

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    const now = new Date();

    switch (rangeType) {
      case "last-month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "last-3-months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        endDate = now;
        break;
      case "this-year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        break;
      case "last-year":
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case "custom":
        const customStart = searchParams.get("start");
        const customEnd = searchParams.get("end");
        if (customStart) startDate = new Date(customStart);
        if (customEnd) endDate = new Date(customEnd);
        break;
      case "all":
      default:
        // Sin filtro de fecha
        break;
    }

    // Construir filtro de fecha
    const dateFilter =
      startDate && endDate
        ? {
            gte: startDate,
            lte: endDate,
          }
        : undefined;

    // Obtener todos los datos del usuario con filtro de fecha
    const [objectives, entries, diaryEntries, mediaEntries, scores] =
      await Promise.all([
        prisma.objective.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "asc" },
        }),
        prisma.entry.findMany({
          where: {
            userId: session.user.id,
            ...(dateFilter && { date: dateFilter }),
          },
          orderBy: { date: "asc" },
        }),
        prisma.diaryEntry.findMany({
          where: {
            userId: session.user.id,
            ...(dateFilter && { date: dateFilter }),
          },
          orderBy: { date: "asc" },
        }),
        prisma.mediaEntry.findMany({
          where: {
            userId: session.user.id,
            ...(dateFilter && { date: dateFilter }),
          },
          orderBy: { date: "asc" },
        }),
        prisma.dailyScore.findMany({
          where: {
            userId: session.user.id,
            ...(dateFilter && { date: dateFilter }),
          },
          orderBy: { date: "asc" },
        }),
      ]);

    const exportData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      exportRange: {
        type: rangeType,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },

      // Instrucciones para IA
      aiInstructions: {
        purpose:
          "Este archivo contiene el historial completo de tracking personal del usuario de MyYear. Incluye 3 tipos de datos distintos que deben analizarse de forma independiente.",

        analysisTone: {
          critical:
            "Sé CRÍTICO y REALISTA. No endulces los datos. Si el usuario abandona objetivos, dilo claramente. Si hay inconsistencias, señálalas.",
          honest:
            "Prioriza la UTILIDAD sobre la amabilidad. El usuario quiere mejora real, no palmaditas en la espalda.",
          insightful:
            "Destaca patrones CURIOSOS y ESPECÍFICOS. No digas 'cumple bien sus objetivos', di 'cumple ejercicio 90% cuando lo hace por la mañana, pero solo 30% cuando lo deja para la noche'.",
          actionable:
            "Cada insight debe ser ACCIONABLE. No digas 'deberías ser más consistente', di 'elimina el objetivo X que nunca cumples y enfócate en Y que sí funciona'.",
          specific:
            "Usa DATOS CONCRETOS. No digas 'a veces', di 'en 23 de 30 días' o '76% del tiempo'.",
          surprising:
            "Busca correlaciones NO OBVIAS: ¿escribe más diario cuando falla objetivos? ¿consume más series cuando está en racha? ¿ciertos días siempre son mejores?",
          brutal:
            "Si hay autoengaño (ej: crea objetivos fáciles solo para sumar puntos, o abandona sistemáticamente objetivos difíciles), DILO DIRECTAMENTE.",
        },

        analysisMethodology: {
          deepThinking:
            "NO des respuestas inmediatas. PIENSA paso a paso. Reflexiona sobre los datos antes de concluir. Cuestiona tus propias conclusiones iniciales.",

          iterativeAnalysis: "Analiza los datos en múltiples pasadas:",
          steps: [
            "1. Primera lectura: Identifica patrones obvios",
            "2. Segunda lectura: Cuestiona esos patrones. ¿Son reales o casuales?",
            "3. Tercera lectura: Busca contraejemplos y excepciones",
            "4. Conclusión: Solo después de estas iteraciones, presenta tus hallazgos",
          ],

          externalResearch: {
            required:
              "BUSCA DATOS EXTERNOS para contextualizar. No analices en el vacío.",
            examples: [
              "Si el usuario duerme 6h promedio, busca: '¿cuántas horas duerme la persona promedio?' y '¿efectos de dormir 6h?'",
              "Si lee 2 libros al mes, busca: '¿cuántos libros lee la persona promedio al año?' para dar contexto",
              "Si hace ejercicio 3 veces/semana, busca: '¿qué recomienda la OMS?' para comparar",
              "Si ve 20 series al año, busca: '¿cuánto contenido consume la persona promedio?' para relativizar",
              "Si sus ratings de películas son 4.2/5 promedio, busca: '¿cuál es el rating promedio en IMDb/Letterboxd?' para ver si es crítico o generoso",
            ],
            sources:
              "Cita fuentes cuando uses datos externos (OMS, estudios, promedios poblacionales, etc)",
          },

          comparativeAnalysis: "Compara SIEMPRE con referencias:",
          comparisons: [
            "Datos del usuario vs promedios poblacionales",
            "Primer mes del usuario vs último mes (¿mejora o empeora?)",
            "Objetivos fáciles vs objetivos difíciles (¿cuál mantiene?)",
            "Días buenos vs días malos (¿qué los diferencia ESPECÍFICAMENTE?)",
            "Semana vs fin de semana (¿cambia el comportamiento?)",
          ],

          evidenceBased:
            "Cada afirmación debe tener EVIDENCIA numérica del dataset. No hagas suposiciones sin datos que las respalden.",

          reflexiveQuestions: "Antes de cada conclusión, pregúntate:",
          questions: [
            "¿Este patrón es estadísticamente significativo o es casualidad?",
            "¿Tengo suficientes datos para esta conclusión? (mínimo 10-15 días para patrones)",
            "¿Hay explicaciones alternativas que no estoy considerando?",
            "¿Esta correlación es causal o solo coincidencia?",
            "¿Qué contraevidencia existe en los datos?",
          ],
        },

        dataTypes: {
          objectives: {
            description:
              "Hábitos y objetivos diarios que el usuario trackea (ejercicio, agua, meditación, etc)",
            howToAnalyze: [
              "Identifica qué objetivos se cumplen consistentemente vs cuáles se abandonan",
              "Detecta patrones: ¿qué días de la semana cumple más objetivos?",
              "Encuentra correlaciones entre objetivos (ej: cuando hace ejercicio, ¿también medita?)",
              "Analiza rachas y períodos de consistencia",
              "Identifica objetivos que empezó y dejó vs los que mantiene",
              "Compara primer mes vs último mes de cada objetivo",
            ],
          },

          diary: {
            description:
              "Entradas de diario personal - reflexiones diarias del usuario",
            howToAnalyze: [
              "Analiza el tono emocional y temas recurrentes",
              "Identifica patrones: ¿escribe más cuando está motivado o cuando tiene problemas?",
              "Detecta si escribir en el diario correlaciona con mejor score en objetivos",
              "Busca cambios en el contenido a lo largo del tiempo",
              "Identifica períodos de mayor/menor actividad en el diario",
            ],
          },

          media: {
            description:
              "Películas, series, libros, manga, anime consumidos por el usuario",
            howToAnalyze: [
              "Identifica qué tipo de contenido prefiere (géneros, formatos)",
              "Analiza las calificaciones: ¿qué le gustó más y por qué? (mira las notas)",
              "Detecta patrones de consumo: ¿ve más series o películas? ¿Lee manga?",
              "Identifica autores, directores o franquicias favoritas",
              "Analiza si sus comentarios revelan preferencias o cambios de gusto",
              "Compara ratings: ¿es crítico o generoso con las puntuaciones?",
            ],
          },

          overall: {
            description: "Análisis global del usuario",
            howToAnalyze: [
              "¿Cómo se relacionan sus objetivos con su bienestar reflejado en el diario?",
              "¿Hay días perfectos (100 puntos)? ¿Qué tienen en común?",
              "¿Los días con buen score también tienen entries de diario más positivas?",
              "¿El consumo de media es constante o por rachas?",
              "Sugiere áreas de mejora basándote en los datos históricos",
            ],
          },
        },

        scoringSystem: {
          description:
            "El sistema de puntuación diaria (0-100 puntos) se calcula así:",
          breakdown: {
            objectives: "60 puntos - Por completar objetivos/hábitos del día",
            diary: "25 puntos - Por escribir una entrada en el diario",
            media: "15 puntos - Por registrar al menos 1 entrada de media",
          },
          note: "Un día perfecto (100 puntos) significa: todos los objetivos cumplidos + diario escrito + media registrada",
        },

        dataStructure: {
          objectives:
            "Array de objetivos con type (boolean/number/time), target, startDate, endDate",
          entries:
            "Array de registros diarios vinculados a objetivos (date, objectiveId, value)",
          diaryEntries: "Array de entradas de diario (date, content)",
          mediaEntries:
            "Array de consumo cultural (date, title, type, rating, notes, completed, season, episode, pages)",
          scores:
            "Array de puntuaciones diarias calculadas (date, score, habitsScore, diaryScore, mediaScore)",
        },
      },

      user: {
        name: session.user.name,
        email: session.user.email,
      },

      data: {
        objectives,
        entries,
        diaryEntries,
        mediaEntries,
        scores,
      },

      stats: {
        totalObjectives: objectives.length,
        totalEntries: entries.length,
        totalDiaryEntries: diaryEntries.length,
        totalMediaEntries: mediaEntries.length,
        totalScores: scores.length,
        dateRange: {
          firstEntry: scores.length > 0 ? scores[0].date : null,
          lastEntry: scores.length > 0 ? scores[scores.length - 1].date : null,
        },
      },
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Error al exportar datos:", error);
    return NextResponse.json(
      { error: "Error al exportar datos" },
      { status: 500 }
    );
  }
}
