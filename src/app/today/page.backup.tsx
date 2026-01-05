"use client";

import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onSave: () => void;
}

type MediaType =
  | "series"
  | "movie"
  | "book"
  | "manga"
  | "anime"
  | "podcast"
  | "videogame"
  | "documentary";

export default function MediaModal({
  isOpen,
  onClose,
  date,
  onSave,
}: MediaModalProps) {
  const [type, setType] = useState<MediaType>("series");
  const [title, setTitle] = useState("");
  const [season, setSeason] = useState("");
  const [episode, setEpisode] = useState("");
  const [pages, setPages] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const mediaTypes = [
    { value: "series", label: "Serie" },
    { value: "movie", label: "Película" },
    { value: "anime", label: "Anime" },
    { value: "documentary", label: "Documental" },
    { value: "book", label: "Libro" },
    { value: "manga", label: "Manga" },
    { value: "podcast", label: "Podcast" },
    { value: "videogame", label: "Videojuego" },
  ];

  const handleSave = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      const payload: any = {
        date: format(date, "yyyy-MM-dd"),
        type,
        title: title.trim(),
        notes: notes.trim() || null,
        rating: rating || null,
        completed,
      };

      // Campos específicos según tipo
      if (type === "series" || type === "anime") {
        if (season) payload.season = parseInt(season);
        if (episode) payload.episode = parseInt(episode);
      }

      if (type === "book" || type === "manga") {
        if (pages) payload.pages = parseInt(pages);
      }

      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Reset form
        setTitle("");
        setSeason("");
        setEpisode("");
        setPages("");
        setRating(0);
        setNotes("");
        setCompleted(false);

        onSave();
        onClose();
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setLoading(false);
    }
  };

  const showSeasonEpisode = type === "series" || type === "anime";
  const showPages = type === "book" || type === "manga";

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
                  <h2 className="text-2xl font-light tracking-tight">Media</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Añadir contenido consumido
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
                {/* Type selector */}
                <div>
                  <label className="block text-sm font-medium mb-3">Tipo</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {mediaTypes.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setType(m.value as MediaType)}
                        className={`
                          px-4 py-2.5 rounded-xl text-sm font-medium transition-all border
                          ${
                            type === m.value
                              ? "bg-foreground text-background border-foreground"
                              : "bg-background border-border hover:border-foreground/50"
                          }
                        `}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nombre del contenido"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                    autoFocus
                  />
                </div>

                {/* Season & Episode (solo para series/anime) */}
                {showSeasonEpisode && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Temporada
                      </label>
                      <input
                        type="number"
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        placeholder="1"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Episodio
                      </label>
                      <input
                        type="number"
                        value={episode}
                        onChange={(e) => setEpisode(e.target.value)}
                        placeholder="1"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Pages (solo para libros/manga) */}
                {showPages && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Páginas leídas
                    </label>
                    <input
                      type="number"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="50"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                    />
                  </div>
                )}

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Valoración
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`
                          w-12 h-12 rounded-lg border transition-all font-medium
                          ${
                            star <= rating
                              ? "bg-foreground text-background border-foreground"
                              : "bg-background border-border hover:border-foreground/50"
                          }
                        `}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Completed */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="completed"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    className="w-5 h-5 rounded border-border"
                  />
                  <label
                    htmlFor="completed"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Completado
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tus comentarios..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                    rows={3}
                  />
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
                  disabled={!title.trim() || loading}
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
