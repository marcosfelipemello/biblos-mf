import React, { useState } from "react";
import {
  Search,
  BookOpen,
  ChevronRight,
  User,
  MapPin,
  Box,
  Sparkles,
  Scroll,
  ArrowLeft,
} from "lucide-react";
import { getTypeStyles } from "../utils/entityStyles";
import Logo from "./Logo";
import VerseDisplay from "./VerseDisplay";

export default function Atlas({
  view,
  setView,
  entities,
  results,
  setCategoryFilter, // New Prop
  searchTerm,
  setSearchTerm,
  selectedEntity,
  selectEntity,
  user,
  status,
  searchVerses,
  goToBibleReference,
}) {
  // Local state for Details View
  const [activeTab, setActiveTab] = useState("origin");
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [verses, setVerses] = useState([]);

  // RESET STATE when selectedEntity changes
  React.useEffect(() => {
    if (selectedEntity) {
      setActiveTab("origin");
      setVerses([]);
      setLoadingVerses(false);
    }
  }, [selectedEntity]);

  // Category Logic
  const categories = [
    {
      id: "person",
      label: "Personagens",
      icon: User,
      color: "text-blue-500",
      bg: "bg-blue-50",
      filter: (e) => e.type === "person",
    },
    {
      id: "place",
      label: "Lugares",
      icon: MapPin,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      filter: (e) => e.type === "place",
    },
    {
      id: "parable",
      label: "Parábolas",
      icon: Scroll,
      color: "text-rose-500",
      bg: "bg-rose-50",
      filter: (e) => e.type === "parable",
    },
    {
      id: "abstract",
      label: "Símbolos",
      icon: Sparkles,
      color: "text-purple-500",
      bg: "bg-purple-50",
      filter: (e) => e.type === "abstract" || e.type === "symbol",
    },
    {
      id: "artifact",
      label: "Artefatos",
      icon: Box,
      color: "text-amber-500",
      bg: "bg-amber-50",
      filter: (e) => e.type === "artifact",
    },
  ];

  const handleCategoryClick = (cat) => {
    setCategoryFilter(cat.id);
    setSearchTerm("");
    setView("results");
  };

  // --- VIEWS ---

  // 1. HOME: Category Grid
  if (view === "home") {
    return (
      <div className="flex flex-col items-center pt-6 pb-20 animate-enter-view">
        {/* Categories Grid - Compact */}

        {/* Categories Grid - Compact */}
        <div className="w-full grid grid-cols-2 gap-3 px-3">
          {categories.map((cat, index) => {
            const count = entities.filter(cat.filter).length;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={`flex flex-col items-center justify-center p-4 rounded-3xl border border-slate-100 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white group active:scale-95 active:bg-slate-50`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`p-3 rounded-2xl ${cat.bg} mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                >
                  <Icon size={22} className={cat.color} />
                </div>
                <span className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">
                  {cat.label}
                </span>
                <span className="text-slate-400 text-[10px] font-medium mt-0.5">
                  {count} {count === 1 ? "item" : "itens"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {status === "connected" && entities.length === 0 && (
          <p className="mt-8 text-xs text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-xs text-center">
            O banco de dados está vazio.
            <br />
            Adicione dados no Firestore.
          </p>
        )}
      </div>
    );
  }

  // 2. RESULTS: List
  if (view === "results") {
    return (
      <div className="space-y-3 pt-4 pb-20 animate-enter-view">
        {/* Shows header context if needed, or just list */}
        {results.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p>Nenhum resultado encontrado.</p>
          </div>
        )}

        {results.map((item, index) => {
          const style = getTypeStyles(item.type);
          const Icon = style.icon;
          return (
            <button
              key={item.id}
              onClick={async () => {
                let finalItem = { ...item };
                // Auto-fix origin if missing (legacy logic from Dashboard)
                if (!finalItem.origin_ref) {
                  try {
                    const term = finalItem.search_term || finalItem.name;
                    const found = await searchVerses(term);
                    if (found && found.length > 0) {
                      const first = found[0];
                      finalItem.origin_ref = `${first.book.name} ${first.chapter}:${first.number}`;
                    }
                  } catch (e) {
                    console.warn("Auto-detect origin failed", e);
                  }
                }
                selectEntity(finalItem);
              }}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-stagger-item w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-amber-200 hover:-translate-y-1 transition-all duration-300 ease-out flex items-center group text-left active:scale-[0.98] active:bg-slate-50"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center mr-4 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-inner`}
              >
                <Icon size={20} className={style.color} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate group-hover:text-amber-700 transition-colors duration-300">
                  {item.name}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 mt-1 border border-slate-100">
                  {item.category || style.label}
                </span>
              </div>
              <ChevronRight
                size={20}
                className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300"
              />
            </button>
          );
        })}

        {/* Dynamic Search Button (if typing) */}
        {searchTerm.length > 2 && (
          <div className="transition-all duration-500 ease-out mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={async () => {
                const term = searchTerm;
                // Dynamic logic wrapped
                try {
                  const dynamicEntity = {
                    id: `search-${Date.now()}`,
                    name: term,
                    description: "Resultado da busca na Bíblia Completa",
                    type: "place", // Default to place/other
                    origin_ref: null,
                    search_term: term,
                  };
                  const found = await searchVerses(term);
                  if (found && found.length > 0) {
                    const first = found[0];
                    dynamicEntity.origin_ref = `${first.book.name} ${first.chapter}:${first.number}`;
                  } else {
                    dynamicEntity.description =
                      "Termo não encontrado na Bíblia";
                    dynamicEntity.type = "other";
                  }
                  selectEntity(dynamicEntity);
                } catch (e) {
                  console.warn(e);
                }
              }}
              className="w-full p-5 rounded-2xl bg-amber-500 text-white shadow-xl flex items-center group"
            >
              <div className="mr-4 bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-lg">Pesquisar na Bíblia</h3>
                <p className="text-white/80 text-xs">
                  Buscar "{searchTerm}" em todo o texto
                </p>
              </div>
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. DETAILS
  if (view === "details" && selectedEntity) {
    return (
      <div className="animate-enter-view pb-20">
        {/* Back button logic is handled by Dashboard Header, but maybe we want one here too? 
            Currently Dashboard handles the "Back" arrow in header. 
            So we just render content. */}

        {/* HERO CARD */}
        <div className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 mb-8 group">
          <div className="absolute top-0 right-0 p-6 opacity-10 grayscale group-hover:grayscale-0 transition-all duration-500">
            {/* Background Icon */}
            {(() => {
              const style = getTypeStyles(selectedEntity.type);
              const Icon = style.icon;
              return <Icon size={120} className={style.color} />;
            })()}
          </div>

          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4 relative z-10">
            {selectedEntity.name}
          </h1>
          <p className="text-slate-600 text-sm leading-7 font-medium opacity-90 relative z-10">
            {selectedEntity.description}
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-6 border-b border-slate-100 pb-2">
          <button
            className={`pb-2 text-sm font-bold uppercase transition-colors ${
              activeTab === "origin"
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-slate-400 hover:text-slate-600"
            }`}
            onClick={() => {
              setActiveTab("origin");
              setVerses([]);
            }}
          >
            História de Origem
          </button>
          <button
            className={`pb-2 text-sm font-bold uppercase transition-colors ${
              activeTab === "mentions"
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-slate-400 hover:text-slate-600"
            }`}
            onClick={() => {
              setActiveTab("mentions");
              setLoadingVerses(true);
              const term =
                selectedEntity.search_term ||
                selectedEntity.name.split("(")[0].trim();
              searchVerses(term).then((res) => {
                setVerses(res);
                setLoadingVerses(false);
              });
            }}
          >
            Todas as Menções
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === "origin" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {selectedEntity.origin_ref ? (
              <button
                onClick={() => goToBibleReference(selectedEntity.origin_ref)}
                className="w-full text-left bg-amber-50 p-6 rounded-2xl border border-amber-100 hover:bg-amber-100/50 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-3 text-amber-800">
                  <BookOpen
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <h3 className="font-bold text-lg">Ir para Leitura</h3>
                </div>
                <VerseDisplay reference={selectedEntity.origin_ref} />
              </button>
            ) : (
              <p className="text-slate-400 italic bg-slate-50 p-6 rounded-2xl">
                Sem origem cadastrada para este item.
              </p>
            )}
          </div>
        )}

        {activeTab === "mentions" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {loadingVerses ? (
              <div className="flex justify-center p-10 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {verses.length === 0 && (
                  <p className="text-slate-400 italic text-center p-4">
                    Nenhuma menção encontrada.
                  </p>
                )}
                {verses.map((verse, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      goToBibleReference(
                        `${verse.book.name} ${verse.chapter}:${verse.number}`
                      )
                    }
                    className="w-full text-left bg-white p-5 rounded-2xl border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <p className="text-slate-700 font-serif mb-3 leading-relaxed">
                      {verse.text}
                    </p>
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-100 transition-colors">
                      {verse.book.name} {verse.chapter}:{verse.number}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
