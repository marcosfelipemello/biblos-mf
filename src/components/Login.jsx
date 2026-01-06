import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import Logo from "./Logo";

export default function Login() {
  const { login, register, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

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
      </div>
    </div>
  );
}
