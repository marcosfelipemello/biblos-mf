import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useBiblosData } from "../hooks/useBiblosData";
import ErrorDisplay from "./ErrorDisplay";
import AdminPanel from "./AdminPanel";
import VerseDisplay from "./VerseDisplay";
import ExitConfirmation from "./ExitConfirmation";
import BibleReader from "./BibleReader"; // Import added
import { useBibleApi } from "../hooks/useBibleApi";
import {
  Search,
  BookOpen,
  User,
  Tag,
  ArrowLeft,
  ChevronRight,
  Bookmark,
  LayoutGrid,
  Sparkles,
  LogOut,
  Shield,
} from "lucide-react";
import Logo from "./Logo";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { entities, status, fetchVerses, errorMsg } = useBiblosData();

  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("home"); // home, results, details, admin
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [previousView, setPreviousView] = useState(null); // Track where we came from

  // READER STATE (Persisted in LocalStorage)
  const [readerBook, setReaderBook] = useState(() => {
    return localStorage.getItem("biblo_book") || "Gênesis";
  });
  const [readerChapter, setReaderChapter] = useState(() => {
    return parseInt(localStorage.getItem("biblo_chapter")) || 1;
  });
  const [bibleScrollY, setBibleScrollY] = useState(() => {
    return parseInt(localStorage.getItem("biblo_scrollY")) || 0;
  });
  // New state for targeted verse navigation
  const [targetVerse, setTargetVerse] = useState(null);

  const mainRef = React.useRef(null);

  // Persist Reader State
  useEffect(() => {
    localStorage.setItem("biblo_book", readerBook);
    localStorage.setItem("biblo_chapter", readerChapter.toString());
  }, [readerBook, readerChapter]);

  // Persist Scroll State (only when it updates)
  useEffect(() => {
    localStorage.setItem("biblo_scrollY", bibleScrollY.toString());
  }, [bibleScrollY]);

  const [activeTab, setActiveTab] = useState("origin"); // origin, mentions
  const [showExitConfirm, setShowExitConfirm] = useState(false); // State for exit modal

  // EXIT CONFIRMATION LOGIC (Back Button Trap)
  useEffect(() => {
    // 1. Push a state on mount so we have something to pop
    window.history.pushState(null, document.title, window.location.href);

    const handlePopState = (event) => {
      // If we are showing the modal, close it or exit?
      // Simplified: If user hits back, we show modal.

      // If we are NOT at home (e.g. details/results), let the internal logic handle it?
      // Actually, standard PWA behavior: System Back should trigger internal Back.
      // But implementing fully synced history is complex.
      // Let's focus on the user's request: "Prevent accidental exit".
      // This usually implies preventing exit from the ROOT (Home).

      if (view === "home" && !showExitConfirm) {
        // Prevent default exit behavior
        // We push state AGAIN to stay on the page effectively
        window.history.pushState(null, document.title, window.location.href);
        setShowExitConfirm(true);
      } else if (view !== "home") {
        // If deep in app, we probably want to just go back internally.
        // The popstate event implies the URL changed (back), but SPA didn't reload.
        // Ideally we sync this.
        window.history.pushState(null, document.title, window.location.href); // Trap it
        goBack(); // Use our internal router
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [view, showExitConfirm]); // Dependencies ensure we capture current view state

  // Function to handle "Go To Reference"
  const goToBibleReference = (refString) => {
    if (!refString) return;
    try {
      // Expected format: "1 Reis 12:1" or "Mateus 5:1"
      // Split by last space to separate Book from Chapter:Verse
      const lastSpaceIndex = refString.lastIndexOf(" ");
      if (lastSpaceIndex === -1) return;

      const bookPart = refString.substring(0, lastSpaceIndex).trim(); // "1 Reis"
      const numberPart = refString.substring(lastSpaceIndex + 1).trim(); // "12:1"

      const [chapterStr, verseStr] = numberPart.split(":");
      const chapter = parseInt(chapterStr);
      const verse = verseStr ? parseInt(verseStr) : null;

      if (bookPart && chapter) {
        setReaderBook(bookPart);
        setReaderChapter(chapter);
        if (verse) setTargetVerse(verse);

        // Reset scroll so it doesn't just restore old position
        setBibleScrollY(0);
        setView("bible");
      }
    } catch (e) {
      console.error("Failed to parse reference:", refString, e);
    }
  };

  // Check if current user is the specific admin.
  const isAdmin = user?.email === "marcosfelipemellosantana@gmail.com";

  const results = useMemo(() => {
    if (searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    return entities.filter(
      (e) =>
        e.name?.toLowerCase().includes(term) ||
        e.category?.toLowerCase().includes(term)
    );
  }, [searchTerm, entities]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length > 0 && view !== "details" && view !== "admin")
      setView("results");
    if (term.length === 0 && view !== "details" && view !== "admin")
      setView("home");
  };

  // Import searchVerses
  const { searchVerses, loading: apiLoading } = useBibleApi();

  const selectEntity = async (entity) => {
    // Save scroll position if we are leaving bible view
    if (view === "bible" && mainRef.current) {
      setBibleScrollY(mainRef.current.scrollTop);
    }

    setPreviousView(view); // Save current view key (e.g. 'bible')
    setSelectedEntity(entity);
    setView("details");
    setActiveTab("origin");
    // Do NOT clear search term, so we can go back to results
    setVerses([]);
  };

  const goBack = () => {
    if (view === "details") {
      // Improved back logic with memory
      if (previousView === "bible") {
        setView("bible");
      } else if (searchTerm.length > 0) {
        setView("results");
      } else {
        setView("home");
      }

      setTimeout(() => {
        setSelectedEntity(null);
        setVerses([]);
        setActiveTab("origin");
        setPreviousView(null); // Reset
      }, 300);
    } else if (view === "admin") {
      setView("home");
    } else {
      setView("home");
      setSearchTerm("");
    }
  };

  const getTypeStyles = (type) => {
    const styles = {
      person: {
        icon: User,
        color: "text-blue-600",
        bg: "bg-blue-50",
        gradient: "from-blue-50 to-white",
      },
      object: {
        icon: LayoutGrid,
        color: "text-amber-600",
        bg: "bg-amber-50",
        gradient: "from-amber-50 to-white",
      },
      abstract: {
        icon: Sparkles,
        color: "text-purple-600",
        bg: "bg-purple-50",
        gradient: "from-purple-50 to-white",
      },
      default: {
        icon: Tag,
        color: "text-slate-600",
        bg: "bg-slate-50",
        gradient: "from-slate-50 to-white",
      },
    };
    return styles[type] || styles.default;
  };

  if (view === "admin") {
    return <AdminPanel onBack={goBack} />;
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans text-slate-900 shadow-2xl relative overflow-hidden transform-gpu">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-br from-amber-100/40 via-purple-50/20 to-transparent blur-3xl pointer-events-none z-0" />

      {/* EXIT CONFIRMATION MODAL */}
      {showExitConfirm && (
        <ExitConfirmation
          onCancel={() => setShowExitConfirm(false)}
          onConfirm={() => {
            // Force exit
            // We pushed state repeatedly, so standard history.back() might just pop one of our dummy states.
            // window.close() is blocked.
            // Best bet for PWA/Web: Navigate to about:blank or similar, or close tab if possible.
            // OR: We intentionally let the *next* back action succeed?
            // Actually, simply calling history.go(-2) might work.
            // For now, let's try history.back() multiple times or window.close.
            setShowExitConfirm(false); // Hide modal
            window.history.go(-3); // Try to go back far enough to exit our trap
            // Fallback
            window.close();
          }}
        />
      )}

      {/* HEADER */}
      <header className="relative z-20 px-4 pt-6 pb-2 backdrop-blur-sm bg-white/50 sticky top-0 transition-colors duration-500">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 flex items-center justify-center">
            {view !== "home" ? (
              <button
                onClick={goBack}
                className="p-2 rounded-full hover:bg-slate-100/80 active:bg-slate-200 transition-all duration-200 active:scale-90 text-slate-600 animate-pop-in"
              >
                <ArrowLeft size={22} />
              </button>
            ) : (
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>

          <h1
            className={`font-serif text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-1 transition-all duration-500 ${
              view === "details"
                ? "opacity-0 scale-90 translate-y-2"
                : "opacity-100 scale-100 translate-y-0"
            }`}
          >
            Biblos
            <span className="text-amber-500 text-3xl animate-pulse">.</span>
          </h1>

          <div className="w-10 flex justify-end">
            {isAdmin && view === "home" && (
              <button
                onClick={() => setView("admin")}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                title="Painel Admin"
              >
                <Shield size={20} />
              </button>
            )}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div
          className={`transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform-gpu ${
            view === "details"
              ? "opacity-0 -translate-y-8 pointer-events-none absolute"
              : "opacity-100 translate-y-0 relative"
          }`}
        >
          <div className="relative group shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search
                size={18}
                className="text-slate-400 group-focus-within:text-amber-500 transition-colors duration-300"
              />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-3.5 bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-300 disabled:opacity-50"
              placeholder={
                status === "error"
                  ? "Conexão interrompida..."
                  : "Nomes, lugares, símbolos, artefatos, objetos etc..."
              }
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={status === "error"}
            />
          </div>
        </div>
      </header>

      {/* ERROR DISPLAY */}
      {status === "error" && <ErrorDisplay message={errorMsg} />}

      {/* MAIN CONTENT */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto no-scrollbar relative z-10 px-4 pb-6 scroll-smooth"
      >
        {view === "home" && status !== "error" && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-20 animate-enter-view">
            <div className="mb-6 hover:scale-105 transition-transform duration-500 ease-out animate-[bounce_3s_infinite]">
              <Logo size={180} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">
              Concordância Inteligente
            </h2>
            <p className="text-slate-500 max-w-[260px] leading-relaxed text-sm">
              Bem-vindo, {user?.email?.split("@")[0]}.<br />
              Sua bíblia de estudo pessoal.
            </p>
            {status === "connected" && entities.length === 0 && (
              <p className="mt-6 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100 max-w-xs">
                Banco conectado mas vazio.
                <br />
                Adicione dados no Firestore.
              </p>
            )}
          </div>
        )}

        {/* VIEW: RESULTS */}
        {view === "results" && status !== "error" && (
          <div className="space-y-3 pt-2">
            {/* KB RESULTS */}
            {results.map((item, index) => {
              const style = getTypeStyles(item.type);
              const Icon = style.icon;
              return (
                <button
                  key={item.id}
                  onClick={async () => {
                    let finalItem = { ...item };
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
                      {item.category}
                    </span>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300"
                  />
                </button>
              );
            })}

            {/* DYNAMIC SEARCH OPTION */}
            {searchTerm.length > 2 && (
              <div
                className={`transition-all duration-500 ease-out ${
                  results.length === 0
                    ? "mt-12 animate-enter-view"
                    : "mt-6 pt-6 border-t border-slate-100"
                }`}
              >
                {results.length === 0 && (
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4">
                      <Search size={32} />
                    </div>
                    <p className="text-slate-600 font-medium text-lg">
                      Não encontrado no Atlas.
                    </p>
                    <p className="text-slate-400 text-sm mt-1 max-w-[200px] mx-auto leading-relaxed">
                      Mas não se preocupe, você pode buscar em todo o texto
                      sagrado.
                    </p>
                  </div>
                )}

                <button
                  onClick={async () => {
                    const term = searchTerm;
                    try {
                      // Trigger loading visually if needed, but primarily select the dynamic entity
                      const dynamicEntity = {
                        id: `search-${Date.now()}`,
                        name: term,
                        description: "Resultado da busca na Bíblia Completa",
                        type: "place", // Use 'place' to get a nice icon, or specific type
                        origin_ref: null, // Will be fetched in details view if needed, or we just rely on "Mentions" tab
                        search_term: term,
                      };

                      // Pre-fetch if we want origin populated (optional, keep existing logic logic inside main flow if preferred)
                      // Existing logic did: fetch -> if found -> populate origin -> select.
                      // Let's keep it consistent with previous logic to ensure "Origin" tab isn't empty if possible.

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
                      console.warn("Erro ao buscar origem dinâmica", e);
                    }
                  }}
                  className={`w-full p-5 rounded-2xl transition-all duration-300 flex items-center group text-left relative overflow-hidden ${
                    results.length === 0
                      ? "bg-amber-500 text-white shadow-xl shadow-amber-500/30 hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-slate-50 border border-slate-200 hover:bg-white hover:border-amber-200 hover:shadow-md"
                  }`}
                >
                  {/* Decorative background for primary button */}
                  {results.length === 0 && (
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  )}

                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                      results.length === 0
                        ? "bg-white/20 text-white"
                        : "bg-white text-slate-400 border border-slate-100 group-hover:text-amber-500"
                    }`}
                  >
                    <BookOpen size={24} />
                  </div>

                  <div className="flex-1">
                    <h3
                      className={`font-bold text-lg ${
                        results.length === 0
                          ? "text-white"
                          : "text-slate-700 group-hover:text-amber-700"
                      }`}
                    >
                      Pesquisar na Bíblia
                    </h3>
                    <p
                      className={`text-xs ${
                        results.length === 0
                          ? "text-amber-100"
                          : "text-slate-400"
                      }`}
                    >
                      Buscar "{searchTerm}" nas escrituras
                    </p>
                  </div>

                  <div
                    className={`p-2 rounded-full ${
                      results.length === 0
                        ? "bg-white/20 text-white"
                        : "text-slate-300 group-hover:text-amber-500"
                    }`}
                  >
                    <ChevronRight size={20} />
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: DETAILS */}
        {view === "details" && selectedEntity && (
          <div className="animate-enter-view pb-10">
            {/* HERO CARD */}
            <div className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 mb-8 group transform-gpu transition-transform hover:scale-[1.01] duration-500">
              <div
                className={`absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${
                  getTypeStyles(selectedEntity.type).gradient
                } opacity-50 blur-2xl group-hover:opacity-70 transition-opacity duration-700`}
              />

              <div className="relative z-10">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border shadow-sm backdrop-blur-md bg-white/80 ${
                    getTypeStyles(selectedEntity.type).color
                  } ${getTypeStyles(selectedEntity.type).border}`}
                >
                  {React.createElement(
                    getTypeStyles(selectedEntity.type).icon,
                    { size: 12 }
                  )}
                  {selectedEntity.category}
                </span>

                <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4 leading-tight tracking-tight">
                  {selectedEntity.name}
                </h1>

                <p className="text-slate-600 text-sm leading-7 font-medium opacity-90">
                  {selectedEntity.description}
                </p>
              </div>
            </div>

            {/* TABS DE CONTEÚDO */}
            <div className="flex gap-4 mb-6 border-b border-slate-100 pb-2">
              <button
                className={`pb-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                  activeTab === "origin"
                    ? "text-amber-500 border-b-2 border-amber-500"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                onClick={() => {
                  setLoadingVerses(false);
                  setVerses([]); // Limpa para mostrar origem
                  setActiveTab("origin");
                }}
              >
                História de Origem
              </button>
              <button
                className={`pb-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                  activeTab === "mentions"
                    ? "text-amber-500 border-b-2 border-amber-500"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                onClick={() => {
                  setLoadingVerses(true);
                  setActiveTab("mentions"); // Switch tab immediately

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

            {/* TAB: HISTÓRIA DE ORIGEM */}
            {activeTab === "origin" && (
              <div className="space-y-4 animate-enter-view">
                {selectedEntity.origin_ref ? (
                  <button
                    onClick={() =>
                      goToBibleReference(selectedEntity.origin_ref)
                    }
                    className="w-full text-left bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden hover:bg-amber-100/50 hover:border-amber-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-3 text-amber-800">
                      <BookOpen size={20} />
                      <h3 className="font-bold text-lg group-hover:text-amber-900 transition-colors">
                        Primeira Aparição / Origem
                      </h3>
                      <ExternalLink
                        size={16}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-600"
                      />
                    </div>
                    <div className="relative z-10">
                      <VerseDisplay reference={selectedEntity.origin_ref} />
                      <div className="mt-2 text-xs font-bold text-amber-600 uppercase tracking-wider bg-white/50 px-2 py-1 rounded inline-block group-hover:bg-white transition-colors">
                        {selectedEntity.origin_ref}
                      </div>
                    </div>
                    {/* Decorative Icon */}
                    <div className="absolute -bottom-4 -right-4 text-amber-100 transform rotate-12 group-hover:rotate-6 transition-transform">
                      <LayoutGrid size={100} />
                    </div>
                  </button>
                ) : (
                  <p className="text-slate-400 italic">
                    História de origem não cadastrada.
                  </p>
                )}
              </div>
            )}

            {/* TAB: TODAS AS MENÇÕES */}
            {activeTab === "mentions" && (
              <div>
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 px-1 text-lg">
                  <Bookmark
                    size={20}
                    className="text-amber-500 drop-shadow-sm"
                  />
                  Ocorrências na Bíblia ({verses.length})
                </h3>

                {loadingVerses ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-28 bg-slate-100/50 rounded-2xl animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                ) : verses.length > 0 ? (
                  <div className="space-y-4">
                    {verses.map((verse, idx) => (
                      <div
                        key={verse.id}
                        style={{ animationDelay: `${idx * 100}ms` }}
                        className="animate-stagger-item bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-200/50 transition-all duration-500 group relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />

                        <p className="text-slate-700 leading-relaxed font-serif text-lg mb-2">
                          {verse.text}
                        </p>

                        <div className="flex justify-between items-center border-t border-slate-50 pt-3 mt-2">
                          <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-100 transition-colors duration-300">
                            {verse.book.name} {verse.chapter}:{verse.number}
                          </span>
                        </div>
                      </div>
                    ))}
                    {verses.length === 0 && !loadingVerses && (
                      <p className="text-slate-400 text-center py-10">
                        Nenhuma menção encontrada para este termo exato.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400 font-medium">
                      Carregando ou nenhuma referência encontrada...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW: BIBLE READER */}
        {view === "bible" && (
          <BibleReader
            entities={entities}
            onEntityClick={selectEntity}
            currentBook={readerBook}
            setCurrentBook={setReaderBook}
            currentChapter={readerChapter}
            setCurrentChapter={setReaderChapter}
            scrollContainerRef={mainRef}
            initialScroll={bibleScrollY}
            targetVerse={targetVerse}
            onScrollComplete={() => setTargetVerse(null)}
          />
        )}
      </main>

      {/* FADE INFERIOR */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-20" />

      {/* BOTTOM NAVIGATION (Only show on main views, hide on Admin) */}
      {view !== "admin" && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center p-2 pb-4 z-40 safe-area-pb">
          <button
            onClick={() => {
              if (view === "bible") setView("home");
              // If already in details/results, stay there or go home?
              // Let's make it go Home to reset, or just setView('home') implies Atlas root.
              if (view === "home" && searchTerm.length > 0) return; // already there
              if (view !== "home" && view !== "results" && view !== "details")
                setView("home");
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 w-20 ${
              view !== "bible"
                ? "text-amber-600 bg-amber-50"
                : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              Atlas
            </span>
          </button>

          <div className="w-px h-8 bg-slate-100" />

          <button
            onClick={() => setView("bible")}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 w-20 ${
              view === "bible"
                ? "text-amber-600 bg-amber-50"
                : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <BookOpen size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              Bíblia
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
