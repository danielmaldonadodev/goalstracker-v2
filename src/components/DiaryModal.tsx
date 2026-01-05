"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  existingEntry?: any;
  onSave: () => void;
}

export default function DiaryModal({
  isOpen,
  onClose,
  date,
  existingEntry,
  onSave,
}: DiaryModalProps) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingEntry) {
      setContent(existingEntry.content || "");
      setMood(existingEntry.mood || "");
    } else {
      setContent("");
      setMood("");
    }
  }, [existingEntry, isOpen]);

  const handleSave = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(date, "yyyy-MM-dd"),
          content: content.trim(),
          mood: mood || null,
        }),
      });

      if (res.ok) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setLoading(false);
    }
  };

  const moods = [
    { value: "great", label: "Excelente", color: "bg-emerald-500" },
    { value: "good", label: "Bien", color: "bg-green-500" },
    { value: "neutral", label: "Normal", color: "bg-yellow-500" },
    { value: "bad", label: "Mal", color: "bg-orange-500" },
    { value: "terrible", label: "Terrible", color: "bg-red-500" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
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
                  <h2 className="text-2xl font-light tracking-tight">Diario</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(date, "EEEE, d 'de' MMMM", { locale: es })}
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
                {/* Mood selector */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    ¿Cómo te sientes?
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {moods.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setMood(m.value)}
                        className={`
                          px-4 py-2 rounded-xl text-sm font-medium transition-all
                          ${
                            mood === m.value
                              ? "bg-foreground text-background"
                              : "bg-muted hover:bg-muted/80"
                          }
                        `}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Escribe sobre tu día
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="¿Qué hiciste hoy? ¿Cómo te sentiste? ¿Qué aprendiste?"
                    className="w-full min-h-[300px] px-4 py-3 bg-background border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {content.length} caracteres
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border p-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!content.trim() || loading}
                  className="flex-1 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
