import React, { useState, useEffect } from "react";
import { useBibleApi } from "../hooks/useBibleApi";
import { BookOpen, AlertCircle } from "lucide-react";

export default function VerseDisplay({ reference, initialText }) {
  const { getVerseText, loading, error } = useBibleApi();
  const [text, setText] = useState(initialText || null);

  useEffect(() => {
    // Se não temos texto inicial (ou queremos garantir o texto completo da API)
    // Buscamos na API
    let active = true;

    const fetchText = async () => {
      if (!reference) return;

      const apiText = await getVerseText(reference);
      if (active && apiText) setText(apiText);
    };

    fetchText();
    return () => {
      active = false;
    };
  }, [reference, getVerseText]);

  if (loading && !text) {
    return (
      <div className="h-10 w-3/4 bg-slate-100 rounded animate-pulse my-2" />
    );
  }

  return (
    <div className="relative">
      <p className="text-slate-700 font-serif italic mb-4 leading-relaxed text-[16px]">
        "{text || "Carregando texto..."}"
      </p>
      {error && !text && (
        <span className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle size={10} /> Falha ao carregar texto
        </span>
      )}
    </div>
  );
}
