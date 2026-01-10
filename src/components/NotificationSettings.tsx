"use client";

import { motion } from "framer-motion";
import { Bell, BellOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NotificationSettingsProps {
  onClose: () => void;
}

export default function NotificationSettings({
  onClose,
}: NotificationSettingsProps) {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("20:00");

  useEffect(() => {
    // Cargar configuración actual
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    const savedEnabled =
      localStorage.getItem("notifications-enabled") === "true";
    const savedTime = localStorage.getItem("notifications-time") || "20:00";

    setEnabled(savedEnabled);
    setTime(savedTime);
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Tu navegador no soporta notificaciones");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        toast.success("¡Notificaciones activadas!");
        setEnabled(true);
        localStorage.setItem("notifications-enabled", "true");

        // Programar notificación de prueba
        scheduleNotification();
      } else {
        toast.error("Necesitamos permiso para enviarte recordatorios");
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast.error("Error al solicitar permisos");
    }
  };

  const scheduleNotification = () => {
    // En producción, esto sería manejado por el backend
    // Aquí creamos una notificación local de prueba
    if ("serviceWorker" in navigator && permission === "granted") {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification("MyYear", {
          body: "¡Recordatorios configurados correctamente!",
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          tag: "test-notification",
        });
      });
    }
  };

  const toggleNotifications = () => {
    if (!enabled && permission !== "granted") {
      requestPermission();
    } else {
      const newEnabled = !enabled;
      setEnabled(newEnabled);
      localStorage.setItem("notifications-enabled", String(newEnabled));

      if (newEnabled) {
        toast.success("Recordatorios activados");
        scheduleNotification();
      } else {
        toast.success("Recordatorios desactivados");
      }
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    localStorage.setItem("notifications-time", newTime);

    if (enabled) {
      toast.success(`Recordatorio actualizado a las ${newTime}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border border-border rounded-2xl max-w-md w-full"
      >
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium">Recordatorios</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Recibe un recordatorio diario
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado actual */}
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div className="flex items-center gap-3">
              {enabled ? (
                <Bell className="text-green-500" size={24} />
              ) : (
                <BellOff className="text-muted-foreground" size={24} />
              )}
              <div>
                <p className="font-medium">
                  {enabled ? "Activado" : "Desactivado"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {permission === "granted"
                    ? "Con permisos"
                    : permission === "denied"
                    ? "Permisos denegados"
                    : "Sin permisos"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleNotifications}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                enabled
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground"
              }`}
            >
              {enabled ? "Desactivar" : "Activar"}
            </button>
          </div>

          {/* Configuración de hora */}
          {enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <label className="text-sm font-medium">
                Hora del recordatorio:
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Te recordaremos completar tus objetivos cada día a esta hora
              </p>
            </motion.div>
          )}

          {/* Info sobre permisos */}
          {permission === "denied" && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-500">
                Has bloqueado las notificaciones. Para activarlas, ve a la
                configuración de tu navegador.
              </p>
            </div>
          )}

          {/* Preview */}
          {enabled && (
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground mb-2">
                Vista previa:
              </p>
              <div className="flex items-start gap-3 p-3 bg-background border border-border rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                  <span className="text-background text-sm font-bold">MY</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">MyYear</p>
                  <p className="text-sm text-muted-foreground">
                    ¿Ya completaste tus objetivos de hoy?
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
