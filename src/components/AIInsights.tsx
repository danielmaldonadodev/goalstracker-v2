"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Download, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AIInsightsProps {
  onClose: () => void;
}

const prompts = [
  {
    title: "Análisis de Consistencia",
    description: "Identifica patrones y áreas de mejora",
    icon: "📊",
    prompt:
      "Analiza mis datos de tracking y proporciona insights sobre cumplimiento, patrones y sugerencias.",
  },
  {
    title: "Plan de Mejora",
    description: "Estrategias basadas en tu progreso",
    icon: "🎯",
    prompt: "Crea un plan de mejora con estrategias concretas.",
  },
  {
    title: "Insights Psicológicos",
    description: "Comprende tus motivaciones",
    icon: "🧠",
    prompt:
      "Analiza mi diario para revelar temas recurrentes y recomendaciones.",
  },
  {
    title: "Reporte Mensual",
    description: "Resumen ejecutivo",
    icon: "📈",
    prompt: "Genera un reporte mensual profesional.",
  },
  {
    title: "Comparativa Temporal",
    description: "Evolución en el tiempo",
    icon: "📅",
    prompt: "Compara mi progreso en diferentes períodos.",
  },
  {
    title: "Optimización de Objetivos",
    description: "Ajusta tus metas",
    icon: "⚡",
    prompt: "Evalúa mis objetivos y sugiere optimizaciones.",
  },
];

export default function AIInsights({ onClose }: AIInsightsProps) {
  const [step, setStep] = useState(1);
  const [selectedRange, setSelectedRange] = useState("last-month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  const ranges = [
    { value: "last-month", label: "Último mes" },
    { value: "last-3-months", label: "Últimos 3 meses" },
    { value: "this-year", label: "Este año" },
    { value: "all", label: "Todo el historial" },
    { value: "custom", label: "Rango personalizado" },
  ];

  const handleDownload = async () => {
    if (selectedPrompt === null) return;

    setDownloading(true);
    setStep(3);

    try {
      let url = `/api/export?range=${selectedRange}`;
      if (selectedRange === "custom" && customStart && customEnd) {
        url += `&start=${customStart}&end=${customEnd}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error");

      const data = await res.json();
      const prompt = prompts[selectedPrompt];

      const exportData = {
        INSTRUCCIONES: "Copia TODO (Ctrl+A) y pégalo en ChatGPT o Claude.ai",
        PROMPT: prompt.prompt,
        TIPO: prompt.title,
        DATOS: data,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = `myear-ia-${prompt.title
        .toLowerCase()
        .replace(/\s+/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(urlBlob);

      setTimeout(() => setDownloading(false), 1500);
    } catch (error) {
      console.error(error);
      toast.error("Error al preparar archivo");
      setDownloading(false);
      setStep(2);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="border-b border-border p-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-medium flex items-center gap-2">
              <Sparkles className="text-purple-500" size={24} />
              Análisis con IA
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Paso {step} de 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 px-6 pt-4 shrink-0">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-purple-500" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    ¿Qué período quieres analizar?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona el rango de datos
                  </p>
                </div>
                <div className="space-y-2">
                  {ranges.map((range) => (
                    <label
                      key={range.value}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedRange === range.value
                          ? "border-purple-500 bg-purple-500/5"
                          : "border-border hover:border-purple-500/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="range"
                        value={range.value}
                        checked={selectedRange === range.value}
                        onChange={(e) => setSelectedRange(e.target.value)}
                        className="w-5 h-5 accent-purple-500"
                      />
                      <span className="font-medium">{range.label}</span>
                    </label>
                  ))}
                </div>
                {selectedRange === "custom" && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Desde:
                      </label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Hasta:
                      </label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    ¿Qué tipo de análisis quieres?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Elige el tipo de insights
                  </p>
                </div>
                <div className="space-y-2">
                  {prompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPrompt(index)}
                      className={`w-full text-left p-4 border-2 rounded-xl transition-all ${
                        selectedPrompt === index
                          ? "border-purple-500 bg-purple-500/5"
                          : "border-border hover:border-purple-500/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl">{prompt.icon}</span>
                          <div>
                            <h4 className="font-medium mb-1">{prompt.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {prompt.description}
                            </p>
                          </div>
                        </div>
                        {selectedPrompt === index && (
                          <Check
                            className="text-purple-500 shrink-0"
                            size={20}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {downloading ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-16 h-16 mx-auto mb-4"
                    >
                      <Download className="text-purple-500" size={64} />
                    </motion.div>
                    <h3 className="text-lg font-medium mb-2">
                      Preparando tu análisis...
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
                        <Check className="text-green-500" size={32} />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        ¡Archivo descargado!
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Sigue estos pasos
                      </p>
                    </div>

                    <div className="border border-purple-500/30 bg-purple-500/5 rounded-xl p-6">
                      <h4 className="font-medium mb-3">Cómo usar:</h4>
                      <ol className="space-y-3 text-sm">
                        <li className="flex gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center shrink-0">
                            1
                          </span>
                          <span>Abre el archivo con un editor de texto</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center shrink-0">
                            2
                          </span>
                          <span>Selecciona TODO (Ctrl+A)</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center shrink-0">
                            3
                          </span>
                          <span>Copia (Ctrl+C)</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center shrink-0">
                            4
                          </span>
                          <span>Ve a ChatGPT o Claude.ai</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center shrink-0">
                            5
                          </span>
                          <span>Pega y envía</span>
                        </li>
                      </ol>
                      <div className="mt-4 pt-4 border-t border-purple-500/20">
                        <p className="text-xs text-muted-foreground">
                          💡 No necesitas saber qué es un JSON. Simplemente abre
                          con cualquier editor de texto.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium"
                    >
                      Entendido
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step < 3 && (
          <div className="border-t border-border p-6 flex gap-3 shrink-0">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors font-medium"
              >
                Atrás
              </button>
            )}
            <button
              onClick={() => {
                if (step === 1) {
                  if (
                    selectedRange === "custom" &&
                    (!customStart || !customEnd)
                  ) {
                    toast.error("Selecciona las fechas");
                    return;
                  }
                  setStep(2);
                } else if (step === 2) {
                  if (selectedPrompt === null) {
                    toast.error("Selecciona un análisis");
                    return;
                  }
                  handleDownload();
                }
              }}
              disabled={
                step === 1 &&
                selectedRange === "custom" &&
                (!customStart || !customEnd)
              }
              className="flex-1 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {step === 1 ? "Siguiente" : "Descargar"}
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
