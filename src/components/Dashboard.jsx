import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useBiblosData } from "../hooks/useBiblosData";
import ErrorDisplay from "./ErrorDisplay";
import AdminPanel from "./AdminPanel";
import VerseDisplay from "./VerseDisplay";
import ExitConfirmation from "./ExitConfirmation";
import BibleReader from "./BibleReader";
import Atlas from "./Atlas"; // Import added
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
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [view, setView] = useState("home"); // home, results, details, admin
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Removed internal Atlas states (verses, loadingVerses, activeTab) as they are now in Atlas.jsx

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
    setPreviousView(view);
    setSelectedEntity(entity);
    setView("details");
    // activeTab/verses reset handled by Atlas internally when selectedEntity changes?
    // Actually Atlas uses selectedEntity change to reset? Or we relying on mount?
    // Atlas is always mounted. We'll handle reset in Atlas via useEffect or key.
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
    // 1. Search Logic
    if (searchTerm.length >= 2) {
      const term = searchTerm.toLowerCase();
      return entities.filter(
        (e) =>
          e.name?.toLowerCase().includes(term) ||
          e.category?.toLowerCase().includes(term)
      );
    }
    // 2. Category Logic
    if (categoryFilter) {
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
        // Special sort for parables using orderIndex
        if (categoryFilter === "parable") {
          return (a.orderIndex || 999) - (b.orderIndex || 999);
        }
        // Default alphabetic sort
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
      setView("home");
    }
  };

  // Import searchVerses
  const { searchVerses, loading: apiLoading } = useBibleApi();

  const goBack = () => {
    if (view === "details") {
      // Improved back logic with memory
      if (previousView === "bible") {
        setView("bible");
      } else if (searchTerm.length > 0 || categoryFilter) {
        setView("results");
      } else {
        setView("home");
      }

      setTimeout(() => {
        setSelectedEntity(null);
        setPreviousView(null);
      }, 300);
    } else if (view === "admin") {
      setView("home");
    } else {
      setView("home");
      setSearchTerm("");
      setCategoryFilter(null);
    }
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
            <div className="ml-4">
              <Logo size={80} />
            </div>
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
          <Atlas
            view={view}
            setView={setView}
            entities={entities}
            results={results}
            // Atlas handles the filtering by calling setCategoryFilter
            setResults={(filtered) => {
              // This prop name in Atlas is 'setResults' but logically it's triggering the filter.
              // wait, in Atlas.jsx I called setResults(filtered).
              // But Dashboard owns results logic via useMemo.
              // Atlas should accept setCategoryFilter and setSearchTerm.
              // I need to update Atlas.jsx to use setCategoryFilter instead of setResults.
              // FIX REQUIREMENT: Updating Atlas.jsx concurrently or updating this prop signature.
              // Assuming I will fix Atlas.jsx next, I will pass setCategoryFilter here.
            }}
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
