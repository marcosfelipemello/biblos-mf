import React, { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";

export default function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Only run in production or if SW is supported
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register Service Worker
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        setRegistration(reg);

        // Check if there's already a SW waiting
        if (reg.waiting) {
          setShowPrompt(true);
        }

        // Listen for new updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          newWorker.addEventListener("statechange", () => {
            // Once the new worker is installed (waiting), show prompt
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setShowPrompt(true);
            }
          });
        });
      });

      // Reload page when the new SW takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Send message to SW to skip waiting
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      // The controllerchange event will trigger reload
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-slate-700 flex items-center justify-between gap-4 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-lg text-slate-900 animate-pulse">
            <RefreshCw size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Nova Versão Disponível</h4>
            <p className="text-xs text-slate-400">
              Clique para atualizar o app.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          <button
            onClick={handleUpdate}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors shadow-lg shadow-amber-500/20"
          >
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
}
