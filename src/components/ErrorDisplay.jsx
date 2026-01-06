import React from "react";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

export default function ErrorDisplay({ message, onRetry, onDemo }) {
  return (
    <div className="mx-4 mt-4 bg-red-50 p-6 rounded-2xl border border-red-100 text-left animate-pop-in shadow-lg shadow-red-100/50">
      <h3 className="text-red-800 font-bold flex items-center gap-2 mb-2">
        <AlertTriangle size={20} />
        Problema de Conexão
      </h3>
      <p className="text-red-700 text-sm mb-4 leading-relaxed">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            <RefreshCw size={16} />
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
}
