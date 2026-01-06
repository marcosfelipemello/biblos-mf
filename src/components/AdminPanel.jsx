import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  doc,
  writeBatch,
  collection,
  getDocs,
} from "firebase/firestore";
import {
  Database,
  UserPlus,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { KNOWLEDGE_BASE } from "../data/knowledgeBase";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCG8j-KgPOLIVdTTCmiGtQA7VVT_5ysFM8",
  authDomain: "banco-de-dados---dho.firebaseapp.com",
  projectId: "banco-de-dados---dho",
  storageBucket: "banco-de-dados---dho.firebasestorage.app",
  messagingSenderId: "688145715081",
  appId: "1:688145715081:web:e17c953b50424da5a41b58",
  measurementId: "G-N3SWSYDHM3",
};

export default function AdminPanel({ onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const secondaryApp = initializeApp(FIREBASE_CONFIG, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);
      await createUserWithEmailAndPassword(secondaryAuth, email, password);

      setMsg({ type: "success", text: "Usuário criado com sucesso!" });
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error);
      setMsg({ type: "error", text: "Erro: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (
      !window.confirm(
        "Isso APAGARÁ todos os dados atuais e importará a NOVA Base de Conhecimento (Sem duplicatas). Continuar?"
      )
    )
      return;
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const db = getFirestore();

      // 1. Limpar Coleções existentes para evitar duplicatas
      setMsg({ type: "", text: "Limpando banco de dados..." });

      const deleteCollection = async (coll) => {
        const batch = writeBatch(db); // Create a new batch for deletion
        const q = await getDocs(collection(db, coll));
        q.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      };

      await deleteCollection("entities");
      await deleteCollection("verses");

      // 2. Inserir Novos Dados
      setMsg({ type: "", text: "Inserindo novas entidades..." });
      const batch = writeBatch(db);

      KNOWLEDGE_BASE.entities.forEach((ent) => {
        const docRef = doc(db, "entities", ent.id);
        batch.set(docRef, ent);
      });

      // Não precisamos mais de 'verses' hardcoded se vamos usar a API,
      // mas se houver alguns 'curados' na KB, podemos manter.
      if (KNOWLEDGE_BASE.verses) {
        KNOWLEDGE_BASE.verses.forEach((ver) => {
          const docRef = doc(db, "verses", ver.id);
          batch.set(docRef, ver);
        });
      }

      await batch.commit();
      setMsg({
        type: "success",
        text: "Banco resetado e atualizado com sucesso!",
      });
    } catch (error) {
      console.error(error);
      setMsg({ type: "error", text: "Erro: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-enter-view px-4 pt-6">
      <button
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" /> Voltar
      </button>

      <div className="bg-white rounded-3xl p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-amber-500">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Painel Admin</h2>
        </div>

        <p className="text-sm text-slate-500 mb-6">
          Adicione novos membros à equipe de pesquisa.
        </p>

        {/* SEÇÃO DE DADOS */}
        <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="flex items-center gap-2 mb-3 text-amber-900 font-bold">
            <Database size={18} />
            <h3 className="text-sm uppercase tracking-wider">
              Base de Conhecimento
            </h3>
          </div>
          <p className="text-xs text-amber-800 mb-4 leading-relaxed">
            Importe a biblioteca completa de personagens, locais e artefatos
            bíblicos reais.
          </p>
          <button
            onClick={handleSeedData}
            disabled={loading}
            className="w-full py-2.5 bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <Database size={16} />
            )}
            Importar Dados Bíblicos
          </button>
        </div>

        <div className="h-px bg-slate-100 my-6"></div>

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Novo Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Senha Inicial
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {msg.text && (
            <div
              className={`text-xs p-3 rounded-lg border ${
                msg.type === "success"
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              "Criando..."
            ) : (
              <>
                <UserPlus size={18} /> Criar Usuário
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
