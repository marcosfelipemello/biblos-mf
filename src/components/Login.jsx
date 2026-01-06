import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Download,
  Share,
  Smartphone,
  X,
  Menu,
} from "lucide-react";
import Logo from "./Logo";

export default function Login() {
  const { login, register, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");

    try {
      await login(email, password);
    } catch (err) {
      console.error("Login attempt failed:", err.code);

      // Auto-register admin if not found
      if (
        email === "marcosfelipemellosantana@gmail.com" &&
        (err.code === "auth/user-not-found" ||
          err.code === "auth/invalid-credential" ||
          err.code === "auth/invalid-login-credentials")
      ) {
        try {
          console.log("Tentando criar usuário admin...");
          await register(email, password);
          // If successful, auto-login happens via useAuth effect
        } catch (regErr) {
          if (regErr.code === "auth/email-already-in-use") {
            setLocalError("Senha incorreta.");
          } else {
            setLocalError("Falha ao criar admin: " + regErr.message);
          }
        }
      } else {
        setLocalError("Falha no login. Verifique suas credenciais.");
      }
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
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Biblos<span className="text-amber-500">.</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2">Acesso Restrito</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail
                size={18}
                className="text-slate-400 group-focus-within:text-amber-500 transition-colors duration-300"
              />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-300"
              placeholder="Email"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock
                size={18}
                className="text-slate-400 group-focus-within:text-amber-500 transition-colors duration-300"
              />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-300"
              placeholder="Senha"
            />
          </div>

          {(localError || error) && (
            <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100 animate-enter-view">
              {localError || error?.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              "Entrando..."
            ) : (
              <>
                Login <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* INSTALL BUTTON */}
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <button
            onClick={() => setShowInstallModal(true)}
            className="text-amber-600 font-medium text-sm flex items-center justify-center gap-2 mx-auto hover:text-amber-700 transition-colors py-2 px-4 rounded-full hover:bg-amber-50"
          >
            <Download size={18} />
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
