"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

interface Template {
  name: string;
  category: string;
  objectives: {
    title: string;
    type: "boolean" | "number" | "time";
    target?: number;
    unit?: string;
  }[];
}

const templates: Template[] = [
  {
    name: "Fitness Pack",
    category: "Salud",
    objectives: [
      { title: "Hacer ejercicio", type: "boolean" },
      { title: "Pasos diarios", type: "number", target: 10000, unit: "pasos" },
      { title: "Agua", type: "number", target: 8, unit: "vasos" },
      { title: "Dormir 8 horas", type: "boolean" },
    ],
  },
  {
    name: "Productividad Pack",
    category: "Trabajo",
    objectives: [
      { title: "Deep Work", type: "time", target: 120, unit: "minutos" },
      { title: "Revisar emails", type: "boolean" },
      { title: "Planificar el día", type: "boolean" },
      { title: "Sin redes sociales", type: "boolean" },
    ],
  },
  {
    name: "Desarrollo Personal",
    category: "Crecimiento",
    objectives: [
      { title: "Leer", type: "time", target: 30, unit: "minutos" },
      { title: "Meditar", type: "time", target: 10, unit: "minutos" },
      { title: "Escribir diario", type: "boolean" },
      { title: "Aprender algo nuevo", type: "boolean" },
    ],
  },
  {
    name: "Vida Saludable",
    category: "Bienestar",
    objectives: [
      { title: "Desayuno saludable", type: "boolean" },
      { title: "No azúcar", type: "boolean" },
      { title: "Caminar", type: "time", target: 30, unit: "minutos" },
      { title: "Estiramiento", type: "boolean" },
    ],
  },
];

interface ObjectiveTemplatesProps {
  onClose: () => void;
  onSelectTemplate: (objectives: Template["objectives"]) => void;
}

export default function ObjectiveTemplates({
  onClose,
  onSelectTemplate,
}: ObjectiveTemplatesProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border border-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium">Templates de Objetivos</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Comienza rápido con packs predefinidos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {templates.map((template, index) => (
            <motion.button
              key={template.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                onSelectTemplate(template.objectives);
                onClose();
              }}
              className="w-full border border-border rounded-xl p-6 hover:bg-muted/50 transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-lg group-hover:text-foreground transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {template.category}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {template.objectives.length} objetivos
                </div>
              </div>

              <div className="space-y-2">
                {template.objectives.map((obj, i) => (
                  <div
                    key={i}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    <span>{obj.title}</span>
                    {obj.target && (
                      <span className="text-xs">
                        (Meta: {obj.target} {obj.unit})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="border-t border-border p-6">
          <p className="text-xs text-muted-foreground text-center">
            Puedes modificar los objetivos después de importarlos
          </p>
        </div>
      </motion.div>
    </div>
  );
}
