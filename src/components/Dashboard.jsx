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
  ExternalLink,
} from "lucide-react";
import Logo from "./Logo";
import Lenis from "lenis"; // Import Lenis

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

  const [activeTab, setActiveTab] = useState("origin"); // origin, mentions
  const [showExitConfirm, setShowExitConfirm] = useState(false); // State for exit modal
  // Dual Lenis Refs
  const atlasRef = React.useRef(null);
  const bibleRef = React.useRef(null);

  const [atlasLenis, setAtlasLenis] = useState(null);
  const [bibleLenis, setBibleLenis] = useState(null);

  // Initialize Lenis for Atlas
  useEffect(() => {
    if (!atlasRef.current) return;
    const lenisInstance = new Lenis({
      wrapper: atlasRef.current,
      content: atlasRef.current.firstElementChild,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    setAtlasLenis(lenisInstance);
    return () => lenisInstance.destroy(); // Cleanup
  }, []); // Run once

  // Initialize Lenis for Bible
  useEffect(() => {
    if (!bibleRef.current) return;
    const lenisInstance = new Lenis({
      wrapper: bibleRef.current,
      content: bibleRef.current.firstElementChild,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    setBibleLenis(lenisInstance);
    return () => lenisInstance.destroy(); // Cleanup
  }, []); // Run once

  // Unified RAF
  useEffect(() => {
    function raf(time) {
      if (atlasLenis) atlasLenis.raf(time);
      if (bibleLenis) bibleLenis.raf(time);
      requestAnimationFrame(raf);
    }
    const frameId = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(frameId);
  }, [atlasLenis, bibleLenis]);

  const selectEntity = async (entity) => {
    // Scroll saving is now native because we don't unmount!
    // Just switch view.
    setPreviousView(view);
    setSelectedEntity(entity);
    setView("details");
    setActiveTab("origin");
    setVerses([]);
  };

  // Persist Reader State
  useEffect(() => {
    localStorage.setItem("biblo_book", readerBook);
    localStorage.setItem("biblo_chapter", readerChapter.toString());
  }, [readerBook, readerChapter]);

  // Persist Scroll State (only when it updates)
  useEffect(() => {
    localStorage.setItem("biblo_scrollY", bibleScrollY.toString());
  }, [bibleScrollY]);

  // EXIT CONFIRMATION LOGIC (Back Button Trap)
  useEffect(() => {
    // 1. Push a state on mount so we have something to pop
    window.history.pushState(null, document.title, window.location.href);

    const handlePopState = (event) => {
      if (view === "home" && !showExitConfirm) {
        // Prevent default exit behavior
        window.history.pushState(null, document.title, window.location.href);
        setShowExitConfirm(true);
      } else if (view !== "home") {
        window.history.pushState(null, document.title, window.location.href); // Trap it
        goBack(); // Use our internal router
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [view, showExitConfirm]);

  // Function to handle "Go To Reference"
  const goToBibleReference = (refString) => {
    if (!refString) return;
    try {
      const lastSpaceIndex = refString.lastIndexOf(" ");
      if (lastSpaceIndex === -1) return;

      const bookPart = refString.substring(0, lastSpaceIndex).trim();
      const numberPart = refString.substring(lastSpaceIndex + 1).trim();

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

  // Determine which view container is visible
  const isBibleView = view === "bible";

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans text-slate-900 shadow-2xl relative overflow-hidden transform-gpu">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-br from-amber-100/40 via-purple-50/20 to-transparent blur-3xl pointer-events-none z-0" />

      {/* EXIT CONFIRMATION MODAL */}
      {showExitConfirm && (
        <ExitConfirmation
          onCancel={() => setShowExitConfirm(false)}
          onConfirm={() => {
            setShowExitConfirm(false);
            window.history.go(-3);
            window.close();
          }}
        />
      )}

      {/* HEADER - Shared but adapts */}
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

        {/* SEARCH BAR - Only relevant for Atlas View context visually, but keep in header */}
        <div
          className={`transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform-gpu ${
            view === "details" || view === "bible"
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

      {/* --- CONTAINER 1: ATLAS (Home, Results, Details) --- */}
      <main
        ref={atlasRef}
        className={`flex-1 overflow-y-auto no-scrollbar relative z-10 px-4 pb-6 ${
          isBibleView ? "hidden" : "block"
        }`}
      >
        <div className="pb-20">
          {/* Internal wrapper for Lenis content safety */}

          {view === "home" && status !== "error" && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-enter-view">
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

          {view === "results" && status !== "error" && (
            <div className="space-y-3 pt-2">
              {/* Same Results Code ... */}
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
                  className={`transition-all duration-500 ease-out mt-6 pt-6 border-t border-slate-100`}
                >
                  <button
                    onClick={async () => {
                      // ... Logic copied from before ...
                      const term = searchTerm;
                      try {
                        const dynamicEntity = {
                          id: `search-${Date.now()}`,
                          name: term,
                          description: "Resultado da busca na Bíblia Completa",
                          type: "place",
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
                        console.warn("Erro ao buscar origem dinâmica", e);
                      }
                    }}
                    className="w-full p-5 rounded-2xl bg-amber-500 text-white shadow-xl flex items-center"
                  >
                    <div className="mr-4">
                      <BookOpen size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Pesquisar na Bíblia</h3>
                    </div>
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          )}

          {view === "details" && selectedEntity && (
            <div className="animate-enter-view">
              {/* HERO CARD */}
              <div className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 mb-8 group">
                <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                  {selectedEntity.name}
                </h1>
                <p className="text-slate-600 text-sm leading-7 font-medium opacity-90">
                  {selectedEntity.description}
                </p>
              </div>
              {/* TABS */}
              <div className="flex gap-4 mb-6 border-b border-slate-100 pb-2">
                <button
                  className={`pb-2 text-sm font-bold uppercase ${
                    activeTab === "origin"
                      ? "text-amber-500 border-b-2 border-amber-500"
                      : "text-slate-400"
                  }`}
                  onClick={() => {
                    setActiveTab("origin");
                    setVerses([]);
                  }}
                >
                  História de Origem
                </button>
                <button
                  className={`pb-2 text-sm font-bold uppercase ${
                    activeTab === "mentions"
                      ? "text-amber-500 border-b-2 border-amber-500"
                      : "text-slate-400"
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

              {activeTab === "origin" && (
                <div className="space-y-4">
                  {selectedEntity.origin_ref ? (
                    <button
                      onClick={() =>
                        goToBibleReference(selectedEntity.origin_ref)
                      }
                      className="w-full text-left bg-amber-50 p-6 rounded-2xl border border-amber-100"
                    >
                      <div className="flex items-center gap-2 mb-3 text-amber-800">
                        <BookOpen size={20} />
                        <h3 className="font-bold text-lg">Ir para Leitura</h3>
                      </div>
                      <VerseDisplay reference={selectedEntity.origin_ref} />
                    </button>
                  ) : (
                    <p className="text-slate-400 italic">
                      Sem origem cadastrada.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "mentions" && (
                <div>
                  {loadingVerses ? (
                    <p>Carregando...</p>
                  ) : (
                    verses.map((verse) => (
                      <button
                        key={verse.id}
                        onClick={() =>
                          goToBibleReference(
                            `${verse.book.name} ${verse.chapter}:${verse.number}`
                          )
                        }
                        className="w-full text-left bg-white p-6 rounded-2xl border border-slate-100 mb-4"
                      >
                        <p className="text-slate-700 font-serif mb-2">
                          {verse.text}
                        </p>
                        <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                          {verse.book.name} {verse.chapter}:{verse.number}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* --- CONTAINER 2: BIBLE (Always rendered, toggled via CSS) --- */}
      <main
        ref={bibleRef}
        className={`flex-1 overflow-y-auto no-scrollbar relative z-10 px-4 pb-6 ${
          !isBibleView ? "hidden" : "block"
        }`}
      >
        <BibleReader
          entities={entities}
          onEntityClick={selectEntity}
          currentBook={readerBook}
          setCurrentBook={setReaderBook}
          currentChapter={readerChapter}
          setCurrentChapter={setReaderChapter}
          // scrollContainerRef={bibleRef} // BibleReader uses this to reset scroll
          // We pass the scroll container implicitly via context or just usage,
          // but actually BibleReader needs the ref to scroll to top on chapter change.
          scrollContainerRef={bibleRef}
          initialScroll={bibleScrollY} // Ignored now mostly, essentially 0
          targetVerse={targetVerse}
          onScrollComplete={() => setTargetVerse(null)}
          lenis={bibleLenis}
        />
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
