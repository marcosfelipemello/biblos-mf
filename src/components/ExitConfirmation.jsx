import React from "react";
import { LogOut, X } from "lucide-react";

export default function ExitConfirmation({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-xs rounded-2xl shadow-2xl border border-slate-100 p-6 transform transition-all scale-100 animate-scale-in">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <LogOut size={32} />
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Deseja sair do Biblos?
          </h3>

          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Você está prestes a fechar o aplicativo. Tem certeza?
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              Ficar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
