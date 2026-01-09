import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useBiblosData } from "../hooks/useBiblosData";
import ErrorDisplay from "./ErrorDisplay";
import AdminPanel from "./AdminPanel";
import VerseDisplay from "./VerseDisplay";
import ExitConfirmation from "./ExitConfirmation";
import BibleReader from "./BibleReader";
import Atlas from "./Atlas";
import Devotionals from "./Devotionals";
import BiblosChat from "./BiblosChat"; // Import Added
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
  BookHeart, // Icon for Devotional
} from "lucide-react";
import Logo from "./Logo";
import Lenis from "lenis";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { entities, status, fetchVerses, errorMsg } = useBiblosData();

  // Refactored State for "Neutral Gear"
  // view can be: 'neutral', 'atlas', 'bible', 'devotionals', 'results', 'details', 'admin'
  const [view, setView] = useState("neutral");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);

  const [selectedEntity, setSelectedEntity] = useState(null);
  const [previousView, setPreviousView] = useState(null);

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
  const [targetVerse, setTargetVerse] = useState(null);

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [devotionalsKey, setDevotionalsKey] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isNavVisible, setIsNavVisible] = useState(true);

  // Lenis Refs
  const atlasRef = React.useRef(null);
  const bibleRef = React.useRef(null);
  const devotionalRef = React.useRef(null);

  const [atlasLenis, setAtlasLenis] = useState(null);
  const [bibleLenis, setBibleLenis] = useState(null);
  const [devotionalLenis, setDevotionalLenis] = useState(null);

  // Initialize Lenis for Atlas
  useEffect(() => {
    if (!atlasRef.current) return;
    const lenisInstance = new Lenis({
      wrapper: atlasRef.current,
      content: atlasRef.current.firstElementChild,
      duration: 1.5, // Smoother drift
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential out
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 2.5, // More responsive to touch
    });
    setAtlasLenis(lenisInstance);
    return () => lenisInstance.destroy();
  }, []);

  // Initialize Lenis for Bible
  useEffect(() => {
    if (!bibleRef.current) return;
    const lenisInstance = new Lenis({
      wrapper: bibleRef.current,
      content: bibleRef.current.firstElementChild,
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 2.5,
    });
    setBibleLenis(lenisInstance);
    return () => lenisInstance.destroy();
  }, []);

  // Initialize Lenis for Devotional
  useEffect(() => {
    if (!devotionalRef.current) return;
    const lenisInstance = new Lenis({
      wrapper: devotionalRef.current,
      content: devotionalRef.current.firstElementChild,
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 2.5,
    });
    setDevotionalLenis(lenisInstance);
    return () => lenisInstance.destroy();
  }, []);

  // Unified RAF
  useEffect(() => {
    function raf(time) {
      if (atlasLenis) atlasLenis.raf(time);
      if (bibleLenis) bibleLenis.raf(time);
      if (devotionalLenis) devotionalLenis.raf(time);
      requestAnimationFrame(raf);
    }
    const frameId = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(frameId);
  }, [atlasLenis, bibleLenis, devotionalLenis]);

  const selectEntity = async (entity) => {
    setPreviousView(view);
    setSelectedEntity(entity);
    setView("details");
  };

  useEffect(() => {
    localStorage.setItem("biblo_book", readerBook);
    localStorage.setItem("biblo_chapter", readerChapter.toString());
  }, [readerBook, readerChapter]);

  useEffect(() => {
    localStorage.setItem("biblo_scrollY", bibleScrollY.toString());
  }, [bibleScrollY]);

  // RESET HEADER & NAV when switching tabs
  // (Because Devotionals component stays mounted but hidden/inactive)
  useEffect(() => {
    if (view !== "devotionals") {
      setIsHeaderVisible(true);
      setIsNavVisible(true);
    }
  }, [view]);

  // EXIT CONFIRMATION LOGIC
  useEffect(() => {
    window.history.pushState(null, document.title, window.location.href);

    const handlePopState = (event) => {
      // If in neutral, confirm exit
      if (view === "neutral" && !showExitConfirm) {
        window.history.pushState(null, document.title, window.location.href);
        setShowExitConfirm(true);
      } else if (view !== "neutral") {
        // If inside app, handle navigation
        window.history.pushState(null, document.title, window.location.href);
        goBack();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [view, showExitConfirm]);

  // Scroll Detection for Bible (Immersive Mode)
  useEffect(() => {
    if (!bibleLenis) return;

    const onScroll = ({ velocity }) => {
      // Only active in Bible View
      if (view !== "bible") return;

      const threshold = 1.2;

      // Scrolling Down -> Hide UI
      if (velocity > threshold && isHeaderVisible) {
        setIsHeaderVisible(false);
        setIsNavVisible(false);
      }
      // Scrolling Up -> Show UI
      else if (velocity < -threshold && !isHeaderVisible) {
        setIsHeaderVisible(true);
        setIsNavVisible(true);
      }
    };

    bibleLenis.on("scroll", onScroll);
    return () => bibleLenis.off("scroll", onScroll);
  }, [bibleLenis, view, isHeaderVisible]);

  // --- RESTORED LOGIC ---

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

        setBibleScrollY(0);
        setView("bible");
      }
    } catch (e) {
      console.error("Failed to parse reference:", refString, e);
    }
  };

  const isAdmin = user?.email === "marcosfelipemellosantana@gmail.com";

  const results = useMemo(() => {
    if (searchTerm.length >= 2) {
      const term = searchTerm.toLowerCase();
      // Safe check for entities
      if (!entities) return [];

      return entities.filter(
        (e) =>
          e.name?.toLowerCase().includes(term) ||
          e.category?.toLowerCase().includes(term)
      );
    }
    if (categoryFilter) {
      if (!entities) return [];
      let filtered = [];
      if (categoryFilter === "person")
        filtered = entities.filter((e) => e.type === "person");
      else if (categoryFilter === "place")
        filtered = entities.filter((e) => e.type === "place");
      else if (categoryFilter === "artifact")
        filtered = entities.filter((e) => e.type === "artifact");
      else if (categoryFilter === "abstract")
        filtered = entities.filter(
          (e) => e.type === "abstract" || e.type === "symbol"
        );
      else if (categoryFilter === "parable")
        filtered = entities.filter((e) => e.type === "parable");

      return filtered.sort((a, b) => {
        if (categoryFilter === "parable") {
          return (a.orderIndex || 999) - (b.orderIndex || 999);
        }
        return a.name.localeCompare(b.name);
      });
    }
    return [];
  }, [searchTerm, categoryFilter, entities]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length > 0) {
      setCategoryFilter(null);
      if (view !== "details" && view !== "admin") setView("results");
    }
    if (
      term.length === 0 &&
      !categoryFilter &&
      view !== "details" &&
      view !== "admin"
    ) {
      // Return to Atlas Home if we were searching in Atlas
      setView("atlas");
    }
  };

  const { searchVerses, loading: apiLoading } = useBibleApi();

  const goBack = () => {
    if (view === "details") {
      if (previousView === "bible") {
        setView("bible");
      } else if (previousView === "devotionals") {
        setView("devotionals");
      } else if (searchTerm.length > 0 || categoryFilter) {
        setView("results");
      } else {
        setView("atlas");
      }

      setTimeout(() => {
        setSelectedEntity(null);
        setPreviousView(null);
      }, 300);
    } else if (view === "admin") {
      setView("neutral");
    } else if (view === "results") {
      setView("atlas");
      setSearchTerm("");
      setCategoryFilter(null);
    } else {
      setView("neutral");
    }
  };

  if (view === "admin") {
    return <AdminPanel onBack={goBack} />;
  }

  const isNeutral = view === "neutral";
  const isBibleView = view === "bible";
  const isDevotionalsView = view === "devotionals";
  const isAtlasView =
    view === "atlas" || view === "results" || view === "details";

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-white font-sans text-slate-900 shadow-2xl relative overflow-hidden transform-gpu">
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

      {/* HEADER - Always Visible for User Info, Contextual for others */}
      <header
        className={`relative z-20 px-4 pt-6 pb-2 backdrop-blur-sm bg-white/50 sticky top-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-between ${
          isHeaderVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 -mb-[72px] pointer-events-none"
        }`}
      >
        {/* Left Side: Back Button or Logo (Contextual) */}
        <div className="flex items-center gap-2">
          {!isNeutral && (
            <button
              onClick={goBack}
              className="p-2 rounded-full hover:bg-slate-100/80 active:bg-slate-200 transition-all duration-200 active:scale-90 text-slate-600 animate-pop-in"
            >
              <ArrowLeft size={22} />
            </button>
          )}

          {!isNeutral && (
            <h1
              className={`font-serif text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-1 transition-all duration-500 ${
                view === "details"
                  ? "opacity-0 scale-90 translate-y-2 hidden" // Hide on details to save space
                  : "opacity-100 scale-100 translate-y-0"
              }`}
            >
              Biblos
              <span className="text-amber-500 text-3xl animate-pulse">.</span>
            </h1>
          )}
        </div>

        {/* Right Side: User Menu (Always Visible if Logged In) */}
        <div className="flex items-center gap-3 justify-end">
          {user && !user.isAnonymous && (
            <div className="flex items-center gap-2 bg-slate-100/50 pl-3 pr-1 py-1 rounded-full border border-slate-200/50 animate-fade-in">
              <div className="text-[10px] font-bold text-slate-500 max-w-[80px] truncate leading-tight flex flex-col items-end">
                <span>{user.email?.split("@")[0]}</span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                title="Sair"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}

          {isAdmin && (
            <button
              onClick={() => setView("admin")}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors relative"
              title="Painel Admin"
            >
              <Shield size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
          )}
        </div>
      </header>

      {/* SEARCH BAR - Only relevant for Atlas View */}
      {view !== "neutral" && (
        <div
          className={`px-4 pb-2 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform-gpu ${
            isAtlasView && view !== "details" && isHeaderVisible
              ? "opacity-100 translate-y-0 relative"
              : "opacity-0 -translate-y-8 pointer-events-none absolute"
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
                  : "Nomes, lugares, símbolos, artefatos..."
              }
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={status === "error"}
            />
          </div>
        </div>
      )}

      {/* ERROR DISPLAY */}
      {status === "error" && !isNeutral && <ErrorDisplay message={errorMsg} />}

      {/* --- NEUTRAL GEAR (HOME) --- */}
      {isNeutral && (
        <main className="flex-1 flex flex-col items-center justify-center relative z-10 animate-fade-in text-center p-6 pb-32">
          <div className="mb-10 animate-float">
            <Logo size={180} />
          </div>
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4 tracking-tight">
            Biblos<span className="text-amber-500">.</span>
          </h2>
          <p className="text-slate-500 max-w-[200px] mx-auto leading-relaxed text-sm">
            Selecione uma seção abaixo para iniciar.
          </p>
        </main>
      )}

      {/* --- CONTAINER 1: ATLAS --- */}
      <main
        ref={atlasRef}
        className={`flex-1 overflow-y-auto no-scrollbar relative z-10 px-4 pb-6 ${
          !isAtlasView ? "hidden" : "block"
        }`}
      >
        <div className="pb-32">
          {/* We must map our 'view' state to what Atlas expects. 
              Atlas expects: 'home', 'results', 'details'.
              If view is 'atlas', pass 'home'.
          */}
          <Atlas
            view={view === "atlas" ? "home" : view}
            setView={setView}
            entities={entities}
            results={results}
            setResults={() => {}}
            setCategoryFilter={setCategoryFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedEntity={selectedEntity}
            selectEntity={selectEntity}
            user={user}
            status={status}
            searchVerses={searchVerses}
            goToBibleReference={goToBibleReference}
          />
        </div>
      </main>

      {/* --- CONTAINER 2: BIBLE --- */}
      <main
        ref={bibleRef}
        className={`flex-1 overflow-y-auto no-scrollbar relative z-10 px-4 pb-6 ${
          !isBibleView ? "hidden" : "block"
        }`}
      >
        <div className="pb-32">
          <BibleReader
            entities={entities}
            onEntityClick={selectEntity}
            currentBook={readerBook}
            setCurrentBook={setReaderBook}
            currentChapter={readerChapter}
            setCurrentChapter={setReaderChapter}
            scrollContainerRef={bibleRef}
            initialScroll={bibleScrollY}
            targetVerse={targetVerse}
            onScrollComplete={() => setTargetVerse(null)}
            lenis={bibleLenis}
            isHeaderVisible={isHeaderVisible}
          />
        </div>
      </main>

      {/* --- CONTAINER 3: DEVOTIONALS --- */}
      <main
        ref={devotionalRef}
        className={`flex-1 overflow-y-auto no-scrollbar relative z-10 px-4 pb-6 ${
          !isDevotionalsView ? "hidden" : "block"
        }`}
      >
        <div className="pb-32">
          <Devotionals
            user={user}
            key={devotionalsKey}
            setIsHeaderVisible={setIsHeaderVisible}
            setIsNavVisible={setIsNavVisible}
            isActive={isDevotionalsView}
          />
        </div>
      </main>

      {/* FADE INFERIOR */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-20 transition-opacity duration-500 ${
          isNavVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* BOTTOM NAVIGATION */}
      {view !== "admin" && (
        <div
          className={`absolute bottom-0 left-0 right-0 flex justify-around items-center p-2 pb-6 z-40 safe-area-pb bg-white/50 backdrop-blur-md border-t border-slate-100 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isNavVisible ? "translate-y-0" : "translate-y-[120%]"
          }`}
        >
          <button
            onClick={() => setView("bible")}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-20 active:scale-95 ${
              isBibleView
                ? "text-amber-600 bg-amber-50"
                : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <BookOpen size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              Bíblia
            </span>
          </button>

          <button
            onClick={() => {
              if (view !== "atlas" && view !== "results" && view !== "details")
                setView("atlas");
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-20 active:scale-95 ${
              isAtlasView
                ? "text-amber-600 bg-amber-50"
                : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              Atlas
            </span>
          </button>

          <button
            onClick={() => {
              if (view === "devotionals") {
                // Force reset if already on this tab
                setDevotionalsKey((prev) => prev + 1);
              }
              setView("devotionals");
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-20 active:scale-95 ${
              isDevotionalsView
                ? "text-amber-600 bg-amber-50"
                : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <BookHeart size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              Devocional
            </span>
          </button>
        </div>
      )}

      {/* CHATBOT - Only in Atlas View */}
      {isAtlasView && <BiblosChat />}
    </div>
  );
}
