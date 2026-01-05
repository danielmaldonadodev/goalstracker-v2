"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Plus, Trash2, X } from "lucide-react";
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
      parts.push("Sí/No");
    } else {
      parts.push(`Meta: ${habit.target} ${habit.unit}`);
    }

    if (habit.startDate || habit.endDate) {
      const start = habit.startDate
        ? new Date(habit.startDate).toLocaleDateString("es")
        : "...";
      const end = habit.endDate
        ? new Date(habit.endDate).toLocaleDateString("es")
        : "...";
      parts.push(`${start} - ${end}`);
    }

    return parts.join(" • ");
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
                    Objetivos
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gestiona tus objetivos diarios
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
                    {/* Botón Nuevo Objetivo */}
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full py-3 border-2 border-dashed border-border rounded-xl hover:border-foreground/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Plus size={16} />
                      Nuevo Objetivo
                    </button>

                    {/* Lista de Objetivos */}
                    <div className="space-y-2">
                      {habits.map((habit) => (
                        <div
                          key={habit.id}
                          className="flex items-start justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
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
                        </div>
                      ))}
                      {habits.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          No hay objetivos configurados
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Título */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nombre del objetivo
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Hacer ejercicio, Leer, Caminar..."
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all text-base"
                        autoFocus
                      />
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Tipo de objetivo
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setType("boolean")}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                            type === "boolean"
                              ? "bg-foreground text-background border-foreground"
                              : "bg-background border-border hover:border-foreground/50"
                          }`}
                        >
                          Sí/No
                        </button>
                        <button
                          type="button"
                          onClick={() => setType("number")}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                            type === "number"
                              ? "bg-foreground text-background border-foreground"
                              : "bg-background border-border hover:border-foreground/50"
                          }`}
                        >
                          Cantidad
                        </button>
                        <button
                          type="button"
                          onClick={() => setType("time")}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                            type === "time"
                              ? "bg-foreground text-background border-foreground"
                              : "bg-background border-border hover:border-foreground/50"
                          }`}
                        >
                          Tiempo
                        </button>
                      </div>
                    </div>

                    {/* Meta y Unidad (solo para number y time) */}
                    {type !== "boolean" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Meta diaria
                          </label>
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
                            placeholder={type === "time" ? "30" : "10000"}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Unidad
                          </label>
                          <input
                            type="text"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            placeholder={
                              type === "time"
                                ? "minutos, horas..."
                                : "pasos, km, páginas, litros..."
                            }
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all text-base"
                          />
                        </div>
                      </div>
                    )}

                    {/* Fechas */}
                    <div>
                      <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                        <Calendar size={16} />
                        Duración (opcional)
                      </label>
                      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-2">
                            Desde
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-2">
                            Hasta
                          </label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all text-base"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Si no especificas fechas, el objetivo será permanente
                      </p>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 px-6 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors"
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
                  </form>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border p-6">
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
