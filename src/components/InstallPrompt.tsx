"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Solo mostrar si no se ha instalado y no se ha rechazado antes
      const hasDeclined = localStorage.getItem("pwa-install-declined");
      if (!hasDeclined) {
        setTimeout(() => setShowPrompt(true), 3000); // Mostrar después de 3s
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detectar si ya está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowPrompt(false);
    } else if (iOS) {
      // En iOS mostrar instrucciones si no está instalado
      const hasDeclined = localStorage.getItem("pwa-install-declined");
      if (!hasDeclined) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-declined", "true");
  };

  if (!showPrompt) return null;

  // UI para iOS con instrucciones
  if (isIOS) {
    return (
      <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-8 sm:max-w-sm z-50">
        <div className="bg-foreground text-background rounded-2xl p-6 shadow-2xl border border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-background/10 rounded-xl flex items-center justify-center">
                <Download size={24} />
              </div>
              <div>
                <h3 className="font-medium">Instalar MyYear</h3>
                <p className="text-sm opacity-80">Añade a pantalla de inicio</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-background/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-background/10 rounded-lg p-3 text-sm">
              <p className="mb-2 font-medium">En Safari:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs opacity-90">
                <li>
                  Toca el botón Compartir{" "}
                  <span className="inline-block">⬆️</span>
                </li>
                <li>Selecciona "Añadir a pantalla de inicio"</li>
                <li>Toca "Añadir"</li>
              </ol>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full px-4 py-2 bg-background text-foreground hover:opacity-90 rounded-lg transition-opacity text-sm font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  // UI normal para Android/Desktop con botón de instalación
  return (
    <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-8 sm:max-w-sm z-50">
      <div className="bg-foreground text-background rounded-2xl p-6 shadow-2xl border border-border">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-background/10 rounded-xl flex items-center justify-center">
              <Download size={24} />
            </div>
            <div>
              <h3 className="font-medium">Instalar MyYear</h3>
              <p className="text-sm opacity-80">
                Acceso rápido desde tu inicio
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-background/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 bg-background/10 hover:bg-background/20 rounded-lg transition-colors text-sm font-medium"
          >
            Ahora no
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-2 bg-background text-foreground hover:opacity-90 rounded-lg transition-opacity text-sm font-medium"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}
