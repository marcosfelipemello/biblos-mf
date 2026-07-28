import React, { useState, useMemo } from "react";
import { ChevronLeft, Search, Music, BookOpen } from "lucide-react";

// Os dois hinários somam ~880 KB. Ficam fora do bundle principal e são
// carregados quando o usuário abre um deles. Contagens fixas porque a tela
// de escolha precisa mostrá-las antes de carregar os dados.
const HYMNBOOKS = {
  harpa: {
    name: "Harpa Cristã",
    count: 640,
    load: () => import("../data/harpaCristaData").then((m) => m.HARPA_CRISTA),
  },
  cantor: {
    name: "Cantor Cristão",
    count: 581,
    load: () =>
      import("../data/cantorCristaoData").then((m) => m.CANTOR_CRISTAO),
  },
};

export default function Hymnal({ isHeaderVisible = true }) {
  // 'grid' | 'index' | 'reading'
  const [screen, setScreen] = useState("grid");
  const [selectedHymnbook, setSelectedHymnbook] = useState(null); // 'harpa' | 'cantor'
  const [selectedHymn, setSelectedHymn] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hymnData, setHymnData] = useState(null);
  const [loadingHymns, setLoadingHymns] = useState(false);

  const hymnbookName = HYMNBOOKS[selectedHymnbook]?.name ?? "";

  const filteredHymns = useMemo(() => {
    if (!hymnData || screen !== "index") return [];
    if (!searchTerm.trim()) return hymnData;
    const term = searchTerm.toLowerCase();
    return hymnData.filter(
      (h) =>
        h.title.toLowerCase().includes(term) ||
        h.number.toString().includes(term)
    );
  }, [hymnData, searchTerm, screen]);

  const goToIndex = async (book) => {
    setSelectedHymnbook(book);
    setSearchTerm("");
    setScreen("index");
    setLoadingHymns(true);
    try {
      setHymnData(await HYMNBOOKS[book].load());
    } finally {
      setLoadingHymns(false);
    }
  };

  const goToHymn = (hymn) => {
    setSelectedHymn(hymn);
    setScreen("reading");
  };

  const goBack = () => {
    if (screen === "reading") {
      setSelectedHymn(null);
      setScreen("index");
    } else if (screen === "index") {
      setSelectedHymnbook(null);
      setSearchTerm("");
      setHymnData(null);
      setScreen("grid");
    }
  };

  // ======== GRID SCREEN ========
  if (screen === "grid") {
    return (
      <div className="pb-20 animate-enter-view">
        {/* Header */}
        <div
          className={`sticky top-0 z-30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center bg-white/95 backdrop-blur border-b border-slate-100 py-3 px-3 shadow-sm mb-4 ${
            isHeaderVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <h2 className="font-serif font-bold text-slate-800 text-lg flex items-center gap-2">
            <Music size={20} className="text-amber-500" />
            Hinário
          </h2>
        </div>

        {/* Cards */}
        <div className="px-4 max-w-2xl mx-auto grid grid-cols-1 gap-4 mt-4">
          {/* Cantor Cristão Card */}
          <button
            onClick={() => goToIndex("cantor")}
            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-200 active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/30 rounded-full blur-2xl -translate-y-8 translate-x-8 group-hover:bg-amber-200/40 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                <BookOpen size={24} className="text-amber-600" />
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-800 mb-1">
                Cantor Cristão
              </h3>
              <p className="text-sm text-slate-500">
                {HYMNBOOKS.cantor.count} hinos
              </p>
            </div>
          </button>

          {/* Harpa Cristã Card */}
          <button
            onClick={() => goToIndex("harpa")}
            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-200 active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full blur-2xl -translate-y-8 translate-x-8 group-hover:bg-blue-200/40 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Music size={24} className="text-blue-600" />
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-800 mb-1">
                Harpa Cristã
              </h3>
              <p className="text-sm text-slate-500">
                {HYMNBOOKS.harpa.count} hinos
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ======== INDEX SCREEN ========
  if (screen === "index") {
    return (
      <div className="pb-20 animate-enter-view">
        {/* Header */}
        <div
          className={`sticky top-0 z-30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm ${
            isHeaderVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-2 py-2 px-3">
            <button
              onClick={goBack}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-all"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <h2 className="font-serif font-bold text-slate-800 text-lg flex-1">
              {hymnbookName}
            </h2>
          </div>

          {/* Search */}
          <div className="px-3 pb-2">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search
                  size={16}
                  className="text-slate-400 group-focus-within:text-amber-500 transition-colors"
                />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                placeholder="Buscar por número ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Mini header when hidden */}
        <div
          className={`sticky top-0 z-30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center bg-white/95 backdrop-blur-sm border-b border-slate-100/50 h-8 ${
            !isHeaderVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <span className="font-serif font-bold text-slate-700 text-xs leading-none">
            {hymnbookName}
          </span>
        </div>

        {/* Hymn List */}
        <div className="px-4 max-w-2xl mx-auto mt-2">
          {loadingHymns ? (
            <div className="space-y-2 animate-pulse mt-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl" />
              ))}
            </div>
          ) : filteredHymns.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Nenhum hino encontrado
            </div>
          ) : (
            <div className="space-y-1">
              {filteredHymns.map((hymn) => (
                <button
                  key={hymn.number}
                  onClick={() => goToHymn(hymn)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all text-left group"
                >
                  <span className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-amber-50 flex items-center justify-center font-bold text-sm text-slate-500 group-hover:text-amber-600 transition-colors flex-shrink-0">
                    {hymn.number}
                  </span>
                  <span className="font-medium text-sm text-slate-700 group-hover:text-slate-900 truncate">
                    {hymn.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ======== READING SCREEN ========
  if (screen === "reading" && selectedHymn) {
    const isHarpa = selectedHymnbook === "harpa";

    return (
      <div className="pb-20 animate-enter-view">
        {/* Full Header */}
        <div
          className={`sticky top-0 z-30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] bg-white/95 backdrop-blur border-b border-slate-100 py-2 px-3 shadow-sm ${
            isHeaderVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={goBack}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-all"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="font-serif font-bold text-slate-800 text-base truncate">
                {selectedHymn.title}
              </h2>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                {hymnbookName} • Nº {selectedHymn.number}
              </span>
            </div>
          </div>
        </div>

        {/* Mini Header */}
        <div
          className={`sticky top-0 z-30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center bg-white/95 backdrop-blur-sm border-b border-slate-100/50 h-8 ${
            !isHeaderVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <span className="font-serif font-bold text-slate-700 text-xs leading-none truncate max-w-[80%]">
            {selectedHymn.number} - {selectedHymn.title}
          </span>
        </div>

        {/* Hymn Content */}
        <div className="px-6 max-w-2xl mx-auto mt-6">
          {/* Title Block */}
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold mb-3">
              Nº {selectedHymn.number}
            </span>
            <h1 className="font-serif font-bold text-2xl text-slate-800 leading-tight">
              {selectedHymn.title}
            </h1>
            <div className="w-12 h-0.5 bg-amber-300 mx-auto mt-3 rounded-full" />
          </div>

          {isHarpa ? (
            // HARPA CRISTÃ: structured with chorus + verses
            <div className="space-y-6">
              {selectedHymn.verses.map((verse) => (
                <div key={verse.number} className="relative pl-6">
                  <span className="absolute left-0 top-1 text-[10px] font-bold text-slate-300 select-none">
                    {verse.number}
                  </span>
                  <p className="text-[17px] leading-relaxed text-slate-700 font-serif whitespace-pre-line">
                    {verse.text}
                  </p>
                </div>
              ))}

              {selectedHymn.chorus && (
                <div className="relative pl-6 py-4 bg-amber-50/50 rounded-xl -mx-2 px-4 border-l-4 border-amber-300">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 block">
                    Coro
                  </span>
                  <p className="text-[17px] leading-relaxed text-slate-700 font-serif italic whitespace-pre-line">
                    {selectedHymn.chorus}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // CANTOR CRISTÃO: plain lyrics
            <div className="relative">
              <p className="text-[17px] leading-relaxed text-slate-700 font-serif whitespace-pre-line">
                {selectedHymn.lyrics}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="pt-8 pb-4 flex justify-center gap-3">
            <button
              onClick={goBack}
              className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-600 font-bold text-sm hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
            >
              Voltar ao Índice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
