"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface HabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

type ObjectiveType = "boolean" | "number" | "time";

export default function HabitsModal({
  isOpen,
  onClose,
  onSave,
}: HabitsModalProps) {
  const [habits, setHabits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ObjectiveType>("boolean");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHabits();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setType("boolean");
    setTarget("");
    setUnit("");
    setStartDate("");
    setEndDate("");
    setShowForm(false);
  };

  const loadHabits = async () => {
    try {
      const res = await fetch("/api/habits");
      if (res.ok) {
        const data = await res.json();
        setHabits(data.habits || []);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (type !== "boolean" && (!target.trim() || !unit.trim())) return;

    setLoading(true);
    try {
      const payload: any = {
        title: title.trim(),
        type,
      };

      if (type !== "boolean") {
        payload.target = parseFloat(target.replace(",", "."));
        payload.unit = unit.trim();
      }

      if (startDate) payload.startDate = new Date(startDate).toISOString();
      if (endDate) payload.endDate = new Date(endDate).toISOString();

      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        loadHabits();
        onSave();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este objetivo? Se perderá todo el historial."))
      return;

    try {
      await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
      loadHabits();
      onSave();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getObjectiveDescription = (habit: any) => {
    const parts = [];

    if (habit.type === "boolean") {
      parts.push("Completar sí o no");
    } else {
      parts.push(`${habit.target} ${habit.unit} diarios`);
    }

    if (habit.startDate || habit.endDate) {
      const start = habit.startDate
        ? new Date(habit.startDate).toLocaleDateString("es")
        : "inicio";
      const end = habit.endDate
        ? new Date(habit.endDate).toLocaleDateString("es")
        : "indefinido";
      parts.push(`${start} - ${end}`);
    } else {
      parts.push("Permanente");
    }

    return parts.join(" · ");
  };

  const getTypeDescription = (t: ObjectiveType) => {
    switch (t) {
      case "boolean":
        return {
          title: "Sí o No",
          description: "Lo haces o no lo haces",
          example: "Ejemplo: Hacer ejercicio, Meditar",
        };
      case "number":
        return {
          title: "Cantidad",
          description: "Con meta numérica específica",
          example: "Ejemplo: 10,000 pasos, 8 vasos de agua",
        };
      case "time":
        return {
          title: "Duración",
          description: "Tiempo dedicado a la actividad",
          example: "Ejemplo: 30 minutos de lectura",
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-background border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="border-b border-border p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-light tracking-tight">
                    {showForm ? "Nuevo objetivo" : "Objetivos"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {showForm
                      ? "Configura un nuevo hábito diario"
                      : `${habits.length} ${
                          habits.length === 1
                            ? "objetivo activo"
                            : "objetivos activos"
                        }`}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {!showForm ? (
                  <>
                    {/* Botón Nuevo */}
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full py-4 border-2 border-dashed border-border rounded-xl hover:border-foreground/50 hover:bg-muted/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Plus size={18} />
                      Crear objetivo
                    </button>

                    {/* Lista */}
                    {habits.length > 0 ? (
                      <div className="space-y-2">
                        {habits.map((habit) => (
                          <motion.div
                            key={habit.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-all group"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">
                                {habit.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {getObjectiveDescription(habit)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDelete(habit.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all shrink-0 ml-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-2">
                          No hay objetivos configurados
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Crea tu primer objetivo para empezar
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        1. Nombre del objetivo
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Hacer ejercicio, Leer, Meditar..."
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-foreground transition-all text-base"
                        autoFocus
                      />
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        2. Tipo de medición
                      </label>
                      <div className="space-y-2">
                        {(["boolean", "number", "time"] as ObjectiveType[]).map(
                          (t) => {
                            const info = getTypeDescription(t);
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                                  type === t
                                    ? "border-foreground bg-foreground/5"
                                    : "border-border hover:border-foreground/30"
                                }`}
                              >
                                <div className="font-medium mb-1">
                                  {info.title}
                                </div>
                                <div className="text-xs text-muted-foreground mb-1">
                                  {info.description}
                                </div>
                                <div className="text-xs text-muted-foreground/70">
                                  {info.example}
                                </div>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    {type !== "boolean" && (
                      <div>
                        <label className="block text-sm font-medium mb-3">
                          3. Meta diaria
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={target}
                              onChange={(e) => {
                                const val = e.target.value.replace(",", ".");
                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                  setTarget(val);
                                }
                              }}
                              placeholder="Ej: 30"
                              className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-foreground transition-all text-base"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Cantidad
                            </p>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={unit}
                              onChange={(e) => setUnit(e.target.value)}
                              placeholder="Ej: minutos"
                              className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-foreground transition-all text-base"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Unidad
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Duración */}
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        {type === "boolean" ? "3" : "4"}. Duración (opcional)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-foreground transition-all text-base"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Desde
                          </p>
                        </div>
                        <div>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-foreground transition-all text-base"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Hasta
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Vacío = objetivo permanente
                      </p>
                    </div>

                    {/* Preview */}
                    {title && (
                      <motion.div
                        className="bg-muted/30 rounded-xl p-4 border border-border"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        <p className="text-xs text-muted-foreground mb-2">
                          Vista previa:
                        </p>
                        <div className="font-medium">{title}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {type === "boolean"
                            ? "Completar sí o no"
                            : target && unit
                            ? `${target} ${unit} diarios`
                            : "Configura tu meta"}
                        </p>
                      </motion.div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 px-6 py-3 border-2 border-border rounded-xl font-medium hover:bg-muted/30 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={
                          !title.trim() ||
                          (type !== "boolean" &&
                            (!target.trim() || !unit.trim())) ||
                          loading
                        }
                        className="flex-1 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Creando..." : "Crear"}
                      </button>
                    </div>
                  </motion.form>
                )}
              </div>

              {/* Footer */}
              {!showForm && (
                <div className="border-t border-border p-6">
                  <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-opacity"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
