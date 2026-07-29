import React, { useState } from "react";
import { doc, writeBatch, collection, getDocs } from "firebase/firestore";
import {
  Database,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  ShieldX,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../config/firebase";

export default function AdminPanel({ onBack }) {
  const { isAdmin, loading: checkingAdmin } = useAuth();
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  // Loading enquanto verifica permissões
  if (checkingAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Acesso negado se não for admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-700" />
            </button>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldX className="text-red-500" size={32} />
              Acesso Negado
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <div className="text-center">
              <ShieldX size={64} className="mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Área Restrita
              </h2>
              <p className="text-slate-600 mb-6">
                Apenas administradores podem acessar o Painel Administrativo.
              </p>
              <p className="text-sm text-slate-400">
                Se você deveria ter acesso, entre em contato com o administrador
                do sistema.
              </p>
              <button
                onClick={onBack}
                className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSeedData = async () => {
    if (
      !window.confirm(
        "ATENÇÃO: Isso vai executar uma LIMPEZA PROFUNDA no banco.\n\n1. Deletar TODAS as entidades antigas.\n2. Deletar TODOS os versículos antigos.\n3. Inserir a nova Base de Conhecimento.\n\nIsso pode levar alguns segundos. Continuar?"
      )
    )
      return;
    setLoading(true);
    setMsg({ type: "info", text: "Iniciando protocolo de limpeza..." });

    try {
      // ~208 KB que só o admin usa: carrega sob demanda.
      const { KNOWLEDGE_BASE } = await import("../data/knowledgeBase");

      // Funcao auxiliar para deletar em lotes e reportar progresso
      const deleteCollectionSafe = async (coll) => {
        setMsg({ type: "info", text: `Lendo coleção ${coll}...` });
        const q = await getDocs(collection(db, coll));
        const docs = q.docs;
        const total = docs.length;

        if (total === 0) {
          setMsg({ type: "info", text: `Coleção ${coll} já estava vazia.` });
          return;
        }

        setMsg({
          type: "info",
          text: `Encontrados ${total} itens em ${coll}. Exterminando... 🗑️`,
        });

        const chunk = 400;
        let deletedCount = 0;

        for (let i = 0; i < total; i += chunk) {
          const batch = writeBatch(db);
          const currentChunk = docs.slice(i, i + chunk);

          currentChunk.forEach((d) => batch.delete(d.ref));

          await batch.commit();
          deletedCount += currentChunk.length;
          setMsg({
            type: "info",
            text: `Deletados ${deletedCount}/${total} de ${coll}...`,
          });
        }
        setMsg({ type: "success", text: `Coleção ${coll} limpa com sucesso!` });
      };

      // 1. Limpeza
      await deleteCollectionSafe("entities");
      await deleteCollectionSafe("verses");

      // 2. Verificação de Segurança (Nuclear Check)
      // Garantir que não sobrou nada "zumbi"
      setMsg({ type: "info", text: "Verificando se sobrou algum zumbi... 🧟" });
      const checkQ = await getDocs(collection(db, "entities"));
      if (!checkQ.empty) {
        throw new Error(
          "A limpeza falhou! Ainda existem itens no banco. Tente novamente."
        );
      }

      // 3. Inserção
      setMsg({
        type: "info",
        text: "Banco limpo! Inserindo nova inteligência... 🧠",
      });

      const entities = KNOWLEDGE_BASE.entities;
      const totalEnt = entities.length;
      const chunk = 350; // Margem de segurança menor

      for (let i = 0; i < totalEnt; i += chunk) {
        const batch = writeBatch(db);
        const currentChunk = entities.slice(i, i + chunk);

        currentChunk.forEach((ent) => {
          const docRef = doc(db, "entities", ent.id);
          batch.set(docRef, ent);
        });

        await batch.commit();
        setMsg({
          type: "info",
          text: `Inserindo entidades: ${Math.min(
            i + chunk,
            totalEnt
          )}/${totalEnt}`,
        });
      }

      // Verses
      if (KNOWLEDGE_BASE.verses && KNOWLEDGE_BASE.verses.length > 0) {
        const verses = KNOWLEDGE_BASE.verses;
        const totalVer = verses.length;
        setMsg({ type: "info", text: "Inserindo versículos curados..." });

        for (let i = 0; i < totalVer; i += chunk) {
          const batch = writeBatch(db);
          const currentChunk = verses.slice(i, i + chunk);
          currentChunk.forEach((ver) => {
            const docRef = doc(db, "verses", ver.id);
            batch.set(docRef, ver);
          });
          await batch.commit();
          setMsg({
            type: "info",
            text: `Inserindo versículos: ${Math.min(
              i + chunk,
              totalVer
            )}/${totalVer}`,
          });
        }
      }

      setMsg({
        type: "success",
        text: "SUCESSO TOTA! 🎉 Banco de Dados 100% Sincronizado e Limpo.",
      });
    } catch (error) {
      console.error(error);
      setMsg({ type: "error", text: "Erro Crítico: " + error.message });
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
          <h2 className="text-xl font-bold text-slate-900">
            Painel Admin v2.0 (Limpeza Profunda)
          </h2>
        </div>

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

        {msg.text && (
          <div
            className={`text-xs p-3 rounded-lg border ${
              msg.type === "success"
                ? "bg-green-50 text-green-700 border-green-100"
                : msg.type === "error"
                ? "bg-red-50 text-red-700 border-red-100"
                : "bg-slate-50 text-slate-600 border-slate-100"
            }`}
          >
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
