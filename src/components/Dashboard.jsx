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
import Hymnal from "./Hymnal";
import BiblosChat from "./BiblosChat"; // Import Added
import NotificationModal from "./NotificationModal";
import { useBibleApi } from "../hooks/useBibleApi";
import { usePush } from "../hooks/usePush";
import {
  Search,
  BookOpen,
  ArrowLeft,
  LayoutGrid,
  LogOut,
  Music,
  Shield,
  BookHeart, // Icon for Devotional
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Logo from "./Logo";
import Lenis from "lenis";

export default function Dashboard() {
  const { user, isAdmin, logout } = useAuth();
  const { entities, status, errorMsg } = useBiblosData();
  const push = usePush(user);
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Refactored State for "Neutral Gear"
  // view can be: 'neutral', 'atlas', 'bible', 'devotionals', 'hymnal', 'results', 'details', 'admin'
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
  const [targetVerse, setTargetVerse] = useState(null);

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [devotionalsKey, setDevotionalsKey] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isNavVisible, setIsNavVisible] = useState(true);
  // Barra lateral escondida (só computador), lembrada neste navegador
  const [barraEscondida, setBarraEscondida] = useState(() => {
    try { return localStorage.getItem("biblos_barra_escondida") === "1"; } catch { return false; }
  });
  const alternarBarra = () => {
    setBarraEscondida((v) => {
      try { localStorage.setItem("biblos_barra_escondida", v ? "0" : "1"); } catch { /* sem armazenamento */ }
      return !v;
    });
  };

  // Lenis Refs
  const atlasRef = React.useRef(null);
  const bibleRef = React.useRef(null);
  const devotionalRef = React.useRef(null);
  const hymnalRef = React.useRef(null);
  const historyDepthRef = React.useRef(0);

  const [atlasLenis, setAtlasLenis] = useState(null);
  const [bibleLenis, setBibleLenis] = useState(null);
  const [devotionalLenis, setDevotionalLenis] = useState(null);
  const [hymnalLenis, setHymnalLenis] = useState(null);

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
      // No computador a rolagem da Bíblia fica nas colunas internas (livros e leitura):
      // sem isso o Lenis segura a rodinha do mouse e a leitura não rola.
      prevent: () => window.matchMedia("(min-width: 1024px)").matches,
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

  // Initialize Lenis for Hymnal
  useEffect(() => {
    if (!hymnalRef.current) return;
    const lenisInstance = new Lenis({
      wrapper: hymnalRef.current,
      content: hymnalRef.current.firstElementChild,
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 2.5,
    });
    setHymnalLenis(lenisInstance);
    return () => lenisInstance.destroy();
  }, []);

  // Unified RAF
  useEffect(() => {
    function raf(time) {
      if (atlasLenis) atlasLenis.raf(time);
      if (bibleLenis) bibleLenis.raf(time);
      if (devotionalLenis) devotionalLenis.raf(time);
      if (hymnalLenis) hymnalLenis.raf(time);
      requestAnimationFrame(raf);
    }
    const frameId = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(frameId);
  }, [atlasLenis, bibleLenis, devotionalLenis, hymnalLenis]);

  const selectEntity = async (entity) => {
    setPreviousView(view);
    setSelectedEntity(entity);
    setView("details");
  };

  useEffect(() => {
    localStorage.setItem("biblo_book", readerBook);
    localStorage.setItem("biblo_chapter", readerChapter.toString());
  }, [readerBook, readerChapter]);

  // RESET HEADER & NAV when switching tabs
  // (Because Devotionals component stays mounted but hidden/inactive)
  const [viewAnterior, setViewAnterior] = useState(view);
  if (view !== viewAnterior) {
    setViewAnterior(view);
    if (view !== "devotionals") {
      setIsHeaderVisible(true);
      setIsNavVisible(true);
    }
  }

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

  // EXIT CONFIRMATION LOGIC
  useEffect(() => {
    const pushGuard = () => {
      window.history.pushState(null, document.title, window.location.href);
      historyDepthRef.current += 1;
    };

    pushGuard();

    const handlePopState = () => {
      // A volta consumiu a entrada que o guard tinha empilhado: sem descontar,
      // o contador cresce a cada toque em "voltar" e a saída passa direto pelo
      // histórico anterior ao app.
      historyDepthRef.current -= 1;
      // If in neutral, confirm exit
      if (view === "neutral" && !showExitConfirm) {
        pushGuard();
        setShowExitConfirm(true);
      } else if (view !== "neutral") {
        // If inside app, handle navigation
        pushGuard();
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

  // Scroll Detection for Hymnal (Immersive Mode)
  useEffect(() => {
    if (!hymnalLenis) return;

    const onScroll = ({ velocity }) => {
      if (view !== "hymnal") return;

      const threshold = 1.2;
      if (velocity > threshold && isHeaderVisible) {
        setIsHeaderVisible(false);
        setIsNavVisible(false);
      } else if (velocity < -threshold && !isHeaderVisible) {
        setIsHeaderVisible(true);
        setIsNavVisible(true);
      }
    };

    hymnalLenis.on("scroll", onScroll);
    return () => hymnalLenis.off("scroll", onScroll);
  }, [hymnalLenis, view, isHeaderVisible]);

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
        setView("bible");
      }
    } catch (e) {
      console.error("Failed to parse reference:", refString, e);
    }
  };

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

  const { searchVerses } = useBibleApi();

  if (view === "admin") {
    return <AdminPanel onBack={goBack} />;
  }

  const isNeutral = view === "neutral";
  const isBibleView = view === "bible";
  const isDevotionalsView = view === "devotionals";
  const isHymnalView = view === "hymnal";
  const isAtlasView =
    view === "atlas" || view === "results" || view === "details";

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] lg:h-screen max-w-md lg:max-w-none mx-auto bg-white font-sans text-slate-900 shadow-2xl lg:shadow-none relative overflow-hidden transform-gpu lg:w-full">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-br from-amber-100/40 via-purple-50/20 to-transparent blur-3xl pointer-events-none z-0" />

      {/* DESKTOP SIDEBAR - Only visible on lg: (>= 1024px) */}
      {barraEscondida && (
        <div data-barra-trilho className="hidden lg:flex lg:flex-col lg:items-center lg:w-16 lg:shrink-0 lg:border-r lg:border-slate-100 lg:bg-white/80 lg:h-full lg:z-30 lg:pt-6 select-none">
          <button
            onClick={alternarBarra}
            title="Mostrar barra lateral"
            aria-label="Mostrar barra lateral"
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:text-amber-600 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
          >
            <PanelLeftOpen size={20} />
          </button>
        </div>
      )}
      <aside data-barra-lateral data-escondida={barraEscondida || undefined} className="hidden lg:flex lg:relative lg:flex-col lg:w-72 lg:shrink-0 lg:border-r lg:border-slate-100 lg:bg-white/80 lg:backdrop-blur-md lg:h-full lg:z-30 lg:justify-between lg:p-6 select-none shadow-[2px_0_15px_-4px_rgba(0,0,0,0.03)]">
        <div>
          <button
            onClick={alternarBarra}
            title="Esconder barra lateral"
            aria-label="Esconder barra lateral"
            className="absolute top-7 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-amber-50 hover:text-amber-600 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
          >
            <PanelLeftClose size={18} />
          </button>
          {/* Brand Logo */}
          <button
            onClick={() => setView("neutral")}
            className="flex items-center gap-3 mb-8 px-2 group text-left w-full transition-transform active:scale-95 cursor-pointer"
            data-testid="nav-home-brand"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-slate-800 flex items-center">
                Biblos<span className="text-amber-500">.</span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Espaço de Fé e Estudo
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Navegação Principal">
            <button
              onClick={() => setView("neutral")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group text-left ${
                isNeutral
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 font-bold"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
              data-testid="nav-home"
            >
              <LayoutGrid size={20} className={isNeutral ? "text-white" : "text-slate-400 group-hover:text-amber-500 transition-colors"} />
              <span>Início</span>
            </button>

            <button
              onClick={() => setView("bible")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group text-left ${
                isBibleView
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 font-bold"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
              data-testid="nav-bible"
            >
              <BookOpen size={20} className={isBibleView ? "text-white" : "text-slate-400 group-hover:text-amber-500 transition-colors"} />
              <div className="flex-1 flex items-center justify-between">
                <span>Bíblia</span>
                {readerBook && (
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isBibleView ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {readerBook} {readerChapter}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setView("hymnal")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group text-left ${
                isHymnalView
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 font-bold"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
              data-testid="nav-hymnal"
            >
              <Music size={20} className={isHymnalView ? "text-white" : "text-slate-400 group-hover:text-amber-500 transition-colors"} />
              <span>Hinário</span>
            </button>

            <button
              onClick={() => {
                if (view !== "atlas" && view !== "results" && view !== "details")
                  setView("atlas");
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group text-left ${
                isAtlasView
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 font-bold"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
              data-testid="nav-atlas"
            >
              <Search size={20} className={isAtlasView ? "text-white" : "text-slate-400 group-hover:text-amber-500 transition-colors"} />
              <span>Atlas Bíblico</span>
            </button>

            <button
              onClick={() => {
                if (view === "devotionals") {
                  setDevotionalsKey((prev) => prev + 1);
                }
                setView("devotionals");
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group text-left ${
                isDevotionalsView
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 font-bold"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
              data-testid="nav-devotionals"
            >
              <BookHeart size={20} className={isDevotionalsView ? "text-white" : "text-slate-400 group-hover:text-amber-500 transition-colors"} />
              <span>Devocional & Planos</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: User Card, Notifications & Admin */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          {user && !user.isAnonymous && (
            <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                  {user.email?.charAt(0) || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                    {user.email?.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setShowNotifModal(true)}
                  className={`p-1.5 rounded-full transition-colors shadow-sm ${
                    push.isSubscribed
                      ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                      : "bg-white text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                  }`}
                  title="Notificações"
                  data-testid="sidebar-notif-btn"
                >
                  <Bell size={14} />
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                  title="Sair"
                  data-testid="sidebar-logout-btn"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          )}

          {isAdmin && (
            <button
              onClick={() => setView("admin")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-amber-500" />
                <span>Painel Admin</span>
              </div>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden">
      {/* EXIT CONFIRMATION MODAL */}
      {showExitConfirm && (
        <ExitConfirmation
          onCancel={() => setShowExitConfirm(false)}
          onConfirm={() => {
            setShowExitConfirm(false);
            window.history.go(-(historyDepthRef.current || 1));
            window.close();
          }}
        />
      )}

      {/* NOTIFICATION MODAL */}
      <NotificationModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        push={push}
      />

      {/* HEADER - Always Visible for User Info, Contextual for others */}
      <header
        className={`relative z-20 px-4 pt-6 pb-2 backdrop-blur-sm bg-white/50 sticky top-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-between ${
          view !== "details" ? "lg:hidden " : ""
        }${
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
              className={`p-2 rounded-full hover:bg-slate-100/80 active:bg-slate-200 transition-all duration-200 active:scale-90 text-slate-600 animate-pop-in ${
                view !== "details" ? "lg:hidden" : ""
              }`}
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

        {/* Right Side: User Menu (Always Visible if Logged In on mobile, hidden on lg where sidebar has it) */}
        <div className="flex items-center gap-3 justify-end lg:hidden">
          {user && !user.isAnonymous && (
            <div className="flex items-center gap-2 bg-slate-100/50 pl-3 pr-1 py-1 rounded-full border border-slate-200/50 animate-fade-in">
              <div className="text-[10px] font-bold text-slate-500 max-w-[80px] truncate leading-tight flex flex-col items-end">
                <span>{user.email?.split("@")[0]}</span>
              </div>
              <button
                onClick={() => setShowNotifModal(true)}
                className={`p-1.5 rounded-full transition-colors shadow-sm ${
                  push.isSubscribed
                    ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                    : "bg-white text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                }`}
                title="Notificações"
              >
                <Bell size={14} />
              </button>
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
          className={`px-4 pb-2 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform-gpu lg:max-w-4xl lg:mx-auto lg:w-full lg:px-8 ${
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
        <main className="flex-1 flex flex-col items-center justify-center relative z-10 animate-fade-in text-center p-6 pb-32 lg:pb-12 lg:max-w-4xl lg:mx-auto">
          <div className="mb-10 animate-float">
            <Logo size={180} />
          </div>
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4 tracking-tight">
            Biblos<span className="text-amber-500">.</span>
          </h2>
          <p className="text-slate-500 max-w-[200px] lg:max-w-md mx-auto leading-relaxed text-sm">
            Selecione uma seção abaixo para iniciar.
          </p>

          {/* Desktop Quick Actions Grid */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4 lg:w-full lg:max-w-2xl lg:mt-8 text-left">
            <button
              onClick={() => setView("bible")}
              className="p-5 rounded-3xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 hover:border-amber-200 transition-all duration-300 group flex items-start gap-4 active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Continuar Leitura
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-800 leading-snug">
                  Bíblia Sagrada
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {readerBook} {readerChapter} • Leitura sem distrações
                </p>
              </div>
            </button>

            <button
              onClick={() => setView("devotionals")}
              className="p-5 rounded-3xl bg-slate-50 hover:bg-rose-50/60 border border-slate-100 hover:border-rose-200 transition-all duration-300 group flex items-start gap-4 active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <BookHeart size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Planos & Reflexões
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-800 leading-snug">
                  Devocional
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Plano da Salvação, Casais e Pão Diário
                </p>
              </div>
            </button>

            <button
              onClick={() => setView("hymnal")}
              className="p-5 rounded-3xl bg-slate-50 hover:bg-purple-50/60 border border-slate-100 hover:border-purple-200 transition-all duration-300 group flex items-start gap-4 active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Music size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                  Louvor Tradicional
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-800 leading-snug">
                  Hinário
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cantor Cristão e Harpa Cristã
                </p>
              </div>
            </button>

            <button
              onClick={() => setView("atlas")}
              className="p-5 rounded-3xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all duration-300 group flex items-start gap-4 active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Search size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Estudo Profundo
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-800 leading-snug">
                  Atlas Bíblico
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Personagens, locais, mapas e genealogias
                </p>
              </div>
            </button>
          </div>

          {user && !user.isAnonymous && (
            <button
              onClick={() => setShowNotifModal(true)}
              className="mt-6 flex items-center gap-2.5 px-4 py-2 bg-amber-50/90 hover:bg-amber-100/90 active:scale-95 border border-amber-200/80 rounded-full text-amber-900 transition-all shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                {push.isSubscribed ? (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                ) : (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </>
                )}
              </span>
              <Bell size={15} className="text-amber-600" />
              <span className="text-xs font-semibold">
                {push.isSubscribed
                  ? "Notificações ativas"
                  : "Ativar notificações diárias"}
              </span>
            </button>
          )}
        </main>
      )}

      {/* ponytail: os 4 containers ficam montados o tempo todo para manter as
          instâncias do Lenis vivas, então o BibleReader pede o capítulo já no
          load e puxa o chunk do bible.json logo de cara. Montar sob demanda
          (React.lazy) exigiria refazer o setup do Lenis. */}

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
            status={status}
            searchVerses={searchVerses}
            goToBibleReference={goToBibleReference}
          />
        </div>
      </main>

      {/* --- CONTAINER 2: BIBLE --- */}
      <main
        ref={bibleRef}
        className={`flex-1 overflow-y-auto no-scrollbar relative z-10 px-4 pb-6 lg:px-0 lg:pb-0 ${
          !isBibleView ? "hidden" : "block"
        }`}
      >
        <div className="pb-32 lg:pb-0 lg:h-full">
          <BibleReader
            entities={entities}
            onEntityClick={selectEntity}
            currentBook={readerBook}
            setCurrentBook={setReaderBook}
            currentChapter={readerChapter}
            setCurrentChapter={setReaderChapter}
            scrollContainerRef={bibleRef}
            targetVerse={targetVerse}
            setTargetVerse={setTargetVerse}
            onScrollComplete={() => setTargetVerse(null)}
            lenis={bibleLenis}
            isHeaderVisible={isHeaderVisible}
          />
        </div>
      </main>

      {/* --- CONTAINER 3: DEVOTIONALS --- */}
      <main
        ref={devotionalRef}
        className={`flex-1 overflow-y-auto no-scrollbar relative z-10 px-4 pb-6 lg:px-8 lg:pb-8 ${
          !isDevotionalsView ? "hidden" : "block"
        }`}
      >
        <div className="pb-32 lg:pb-12">
          <Devotionals
            user={user}
            key={devotionalsKey}
            setIsHeaderVisible={setIsHeaderVisible}
            setIsNavVisible={setIsNavVisible}
            isActive={isDevotionalsView}
            goToBibleReference={goToBibleReference}
          />
        </div>
      </main>

      {/* --- CONTAINER 4: HYMNAL --- */}
      <main
        ref={hymnalRef}
        className={`flex-1 overflow-y-auto no-scrollbar relative z-10 px-4 pb-6 lg:px-8 lg:pb-8 ${
          !isHymnalView ? "hidden" : "block"
        }`}
      >
        <div className="pb-32 lg:pb-12">
          <Hymnal isHeaderVisible={isHeaderVisible} />
        </div>
      </main>

      {/* FADE INFERIOR - Hidden on Desktop (lg:) */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-20 transition-opacity duration-500 lg:hidden ${
          isNavVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* BOTTOM NAVIGATION - Hidden on Desktop (lg:) */}
      {view !== "admin" && (
        <div
          className={`absolute bottom-0 left-0 right-0 flex justify-around items-center p-2 pb-6 z-40 safe-area-pb bg-white/50 backdrop-blur-md border-t border-slate-100 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden ${
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
            onClick={() => setView("hymnal")}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-20 active:scale-95 ${
              isHymnalView
                ? "text-amber-600 bg-amber-50"
                : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <Music size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              Hinário
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
    </div>
  );
}
