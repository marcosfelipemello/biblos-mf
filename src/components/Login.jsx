import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  ArrowRight,
  Sparkles,
  Download,
  Share,
  Smartphone,
  X,
  Menu,
  Mail, // Assuming Mail icon for email/google if no specific Google icon
  Globe, // fallback
} from "lucide-react";
import Logo from "./Logo";

// Simple Google Icon SVG component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function Login() {
  const { loginAnonymously, loginWithGoogle, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLocalError("");
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Google Login failed:", err);
      setLocalError("Erro ao entrar com Google. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setLocalError("");
    try {
      await loginAnonymously();
    } catch (err) {
      console.error("Login failed:", err);
      setLocalError("Erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-white p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-br from-amber-100/40 via-purple-50/20 to-transparent blur-3xl pointer-events-none z-0" />

      <div className="w-full max-w-sm relative z-10 animate-pop-in">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6 animate-[bounce_3s_infinite]">
            <Logo size={140} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight mb-3">
            Bem-vindo ao Biblos<span className="text-amber-500">.</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xs mx-auto leading-relaxed">
            Sua enciclopédia visual da Bíblia.
          </p>
        </div>

        <div className="space-y-4">
          {(localError || error) && (
            <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100 animate-enter-view">
              {localError || error?.message}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? (
              "Iniciando..."
            ) : (
              <>
                <GoogleIcon /> Entrar com Google
              </>
            )}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase font-bold">
              ou
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            onClick={handleAnonymousLogin}
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
          >
            Continuar como Visitante
          </button>

          <p className="text-[10px] text-center font-bold tracking-widest mt-6 animate-shine bg-gradient-to-r from-amber-500 via-zinc-300 to-amber-600 bg-clip-text text-transparent uppercase opacity-80">
            Criado por: Marcos Felipe Mello
          </p>
        </div>

        {/* INSTALL BUTTON */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setShowInstallModal(true)}
            className="text-slate-400 font-medium text-sm flex items-center justify-center gap-2 mx-auto hover:text-amber-600 transition-colors py-2 px-4 rounded-full hover:bg-slate-50"
          >
            <Download size={16} />
            Instalar Aplicativo
          </button>
        </div>
      </div>

      {/* INSTALL MODAL */}
      {showInstallModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowInstallModal(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-slide-up relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Smartphone className="text-amber-500" />
              Instalar Biblos MF
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Tenha acesso offline e experiência completa.
            </p>

            <div className="space-y-6">
              {/* ANDROID */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-700 text-sm mb-2 flex items-center gap-2">
                  🤖 Android (Chrome)
                </h4>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                  <li>
                    Toque no menu{" "}
                    <span className="font-bold">⋮ (Três pontos)</span>
                  </li>
                  <li>
                    Selecione{" "}
                    <span className="font-bold">Instalar aplicativo</span> ou{" "}
                    <span className="font-bold">Adicionar à tela inicial</span>
                  </li>
                </ol>
              </div>

              {/* iOS */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-700 text-sm mb-2 flex items-center gap-2">
                  🍎 iPhone (Safari)
                </h4>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                  <li>
                    Toque no botão{" "}
                    <span className="font-bold">
                      <Share size={12} className="inline mx-1" /> Compartilhar
                    </span>
                  </li>
                  <li>
                    Role para baixo e toque em{" "}
                    <span className="font-bold">
                      Adicionar à Tela de Início
                    </span>
                  </li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
