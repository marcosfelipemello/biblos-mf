import React from "react";
import { RefreshCw, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function UpdatePrompt() {
  const {
    needRefresh: [showPrompt, setShowPrompt],
    updateServiceWorker,
  } = useRegisterSW();

  const handleUpdate = () => updateServiceWorker(true);
  const handleClose = () => setShowPrompt(false);

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
