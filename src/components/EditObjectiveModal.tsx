"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EditObjectiveModalProps {
  objective: {
    id: string;
    title: string;
    type: string;
    target: number | null;
    unit: string | null;
    startDate: Date | null;
    endDate: Date | null;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditObjectiveModal({
  objective,
  onClose,
  onUpdate,
}: EditObjectiveModalProps) {
  const [title, setTitle] = useState(objective.title);
  const [type, setType] = useState(objective.type);
  const [target, setTarget] = useState(objective.target?.toString() || "");
  const [unit, setUnit] = useState(objective.unit || "");
  const [startDate, setStartDate] = useState(
    objective.startDate
      ? new Date(objective.startDate).toISOString().split("T")[0]
      : ""
  );
  const [endDate, setEndDate] = useState(
    objective.endDate
      ? new Date(objective.endDate).toISOString().split("T")[0]
      : ""
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    if (type !== "boolean" && !target) {
      toast.error("La meta es obligatoria");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/objectives", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: objective.id,
          title: title.trim(),
          type,
          target: type === "boolean" ? null : parseInt(target),
          unit: type === "boolean" ? null : unit || null,
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      toast.success("Objetivo actualizado");
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar objetivo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que quieres eliminar este objetivo?")) return;

    setSaving(true);

    try {
      const res = await fetch(`/api/objectives?id=${objective.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar");

      toast.success("Objetivo eliminado");
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar objetivo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
      >
        <div className="border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-medium">Editar Objetivo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Título */}
          <div>
            <label className="text-sm font-medium mb-2 block">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl bg-background"
              placeholder="Ej: Hacer ejercicio"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl bg-background"
            >
              <option value="boolean">Sí/No</option>
              <option value="number">Numérico</option>
              <option value="time">Tiempo</option>
            </select>
          </div>

          {/* Meta (si no es boolean) */}
          {type !== "boolean" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Meta</label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Unidad</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background"
                  placeholder="km, vasos..."
                />
              </div>
            </div>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border p-6 flex gap-3 bg-muted/20">
          <button
            onClick={handleDelete}
            disabled={saving}
            className="px-6 py-3 border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors font-medium disabled:opacity-50"
          >
            Eliminar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-foreground text-background rounded-xl hover:opacity-90 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
