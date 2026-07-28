import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Book,
  Highlighter,
  Grid3X3,
  ListOrdered,
} from "lucide-react";
import { useBibleApi, getVerseCount } from "../hooks/useBibleApi";
import { useAuth } from "../hooks/useAuth";
import { useHighlights } from "../hooks/useHighlights";
import SmartText from "./SmartText";
import { BOOK_NAMES } from "../data/bibleBookNames";
import { BIBLE_CHAPTER_COUNTS } from "../data/bibleStructure";

// Define OT and NT books for the selector
const OT_BOOKS = [
  "Gênesis",
  "Êxodo",
  "Levítico",
  "Números",
  "Deuteronômio",
  "Josué",
  "Juízes",
  "Rute",
  "1 Samuel",
  "2 Samuel",
  "1 Reis",
  "2 Reis",
  "1 Crônicas",
  "2 Crônicas",
  "Esdras",
  "Neemias",
  "Ester",
  "Jó",
  "Salmos",
  "Provérbios",
  "Eclesiastes",
  "Cânticos",
  "Isaías",
  "Jeremias",
  "Lamentações",
  "Ezequiel",
  "Daniel",
  "Oséias",
  "Joel",
  "Amós",
  "Obadias",
  "Jonas",
  "Miquéias",
  "Naum",
  "Habacuque",
  "Sofonias",
  "Ageu",
  "Zacarias",
  "Malaquias",
];

const NT_BOOKS = [
  "Mateus",
  "Marcos",
  "Lucas",
  "João",
  "Atos",
  "Romanos",
  "1 Coríntios",
  "2 Coríntios",
  "Gálatas",
  "Efésios",
  "Filipenses",
  "Colossenses",
  "1 Tessalonicenses",
  "2 Tessalonicenses",
  "1 Timóteo",
  "2 Timóteo",
  "Tito",
  "Filemom",
  "Hebreus",
  "Tiago",
  "1 Pedro",
  "2 Pedro",
  "1 João",
  "2 João",
  "3 João",
  "Judas",
  "Apocalipse",
];

export default function BibleReader({
  entities,
  onEntityClick,
  currentBook,
  setCurrentBook,
  currentChapter,
  setCurrentChapter,
  scrollContainerRef,
  targetVerse,
  setTargetVerse,
  onScrollComplete,
  lenis,
  isHeaderVisible = true,
}) {
  const { user } = useAuth();
  const { getChapter, loading } = useBibleApi();
  const [verses, setVerses] = useState([]);
  const [showBookSelector, setShowBookSelector] = useState(false);

  // Chapter/Verse Selector State
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [selectionStep, setSelectionStep] = useState("chapter"); // 'chapter' | 'verse'
  const [tempSelectedChapter, setTempSelectedChapter] = useState(null);
  const [verseCount, setVerseCount] = useState(0);

  // Highlighting Hook
  const { isHighlighted, toggleHighlight } = useHighlights(
    user,
    currentBook,
    currentChapter
  );

  // Use props instead of local state
  const book = currentBook;
  const chapter = currentChapter;

  useEffect(() => {
    const loadChapter = async () => {
      setVerses([]); // Clear verses to avoid stale content
      const data = await getChapter(book, chapter);
      setVerses(data);
    };
    loadChapter();
  }, [book, chapter, getChapter]);

  // Track previous location
  const lastLocation = React.useRef({ book: null, chapter: null });
  const didRestore = React.useRef(false);

  React.useLayoutEffect(() => {
    if (loading || verses.length === 0) return;

    if (scrollContainerRef && scrollContainerRef.current) {
      // BRANCH 1: TARGET VERSE (High Priority)
      if (targetVerse) {
        let attempts = 0;
        const maxAttempts = 40;

        const tryScroll = () => {
          const verseEl = document.getElementById(`verse-${targetVerse}`);
          if (verseEl) {
            verseEl.scrollIntoView({ behavior: "smooth", block: "center" });

            // Visual indication for navigation (separate from highlight)
            verseEl.animate(
              [
                { backgroundColor: "rgba(251, 191, 36, 0.3)" },
                { backgroundColor: "transparent" },
              ],
              { duration: 2000 }
            );

            setTimeout(() => {
              if (onScrollComplete) onScrollComplete();
            }, 500);
            return true;
          }
          return false;
        };

        if (!tryScroll()) {
          const interval = setInterval(() => {
            attempts++;
            if (tryScroll() || attempts >= maxAttempts) {
              clearInterval(interval);
              if (attempts >= maxAttempts) {
                if (onScrollComplete) onScrollComplete();
              }
            }
          }, 50);
        }

        lastLocation.current = { book, chapter };
        return;
      }

      // BRANCH 2: CHAPTER CHANGE
      const isNewBookOrChapter =
        lastLocation.current.book !== book ||
        lastLocation.current.chapter !== chapter;

      if (isNewBookOrChapter) {
        if (lenis) {
          lenis.scrollTo(0, { immediate: true });
        } else {
          scrollContainerRef.current.scrollTop = 0;
        }
        lastLocation.current = { book, chapter };
      }
    }
  }, [loading, verses, targetVerse, onScrollComplete, book, chapter, lenis]);

  const lastChapter = BIBLE_CHAPTER_COUNTS[book] || Infinity;
  const isLastChapter = chapter >= lastChapter;

  // Load the real verse count when the selector reaches the verse step
  useEffect(() => {
    if (selectionStep !== "verse" || !tempSelectedChapter) return;
    let active = true;
    getVerseCount(book, tempSelectedChapter).then((n) => {
      if (active) setVerseCount(n);
    });
    return () => {
      active = false;
    };
  }, [selectionStep, tempSelectedChapter, book]);

  const handleNext = () => {
    if (isLastChapter) return;
    setCurrentChapter((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (chapter > 1) setCurrentChapter((prev) => prev - 1);
  };

  // Click Handler for Verse
  const handleVerseClick = (e, verseNum) => {
    // If clicking a specialized entity button, ignore
    if (e.target.closest("button") || e.target.closest("a")) return;

    toggleHighlight(verseNum, "amber");
  };

  return (
    <div className="pb-20 animate-enter-view">
      {/* READER HEADER - FULL (visible when scrolled up) */}
      <div
        className={`sticky top-0 z-30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-between bg-white/95 backdrop-blur border-b border-slate-100 py-2 px-3 shadow-sm mb-2 h-14 ${
          isHeaderVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* PREV BUTTON */}
        <button
          onClick={handlePrev}
          disabled={chapter === 1}
          className="rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500 p-1.5 w-8"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>

        {/* CENTER INFO */}
        <div className="flex items-center flex-col flex-1">
          <button
            onClick={() => setShowBookSelector(true)}
            className="flex items-center rounded-full transition-all group gap-1.5 px-3 py-1 hover:bg-slate-50 border border-transparent hover:border-slate-200"
          >
            <span className="font-serif font-bold text-slate-800 group-hover:text-amber-700 leading-none text-lg">
              {book}
            </span>
            <Book
              size={14}
              className="text-slate-400 group-hover:text-amber-500"
            />
          </button>

          <button
            onClick={() => {
              setSelectionStep("chapter");
              setShowChapterSelector(true);
            }}
            className="font-bold text-amber-600 uppercase tracking-widest leading-none rounded text-[10px] mt-0.5 hover:bg-amber-50 px-2 py-0.5"
          >
            CAPÍTULO {chapter}
          </button>
        </div>

        {/* NEXT BUTTON */}
        <button
          onClick={handleNext}
          disabled={isLastChapter}
          className="rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500 p-1.5 w-8"
        >
          <ChevronRight size={20} className="text-slate-600" />
        </button>
      </div>

      {/* MINI HEADER - Book name only (visible when scrolled down) */}
      <div
        className={`sticky top-0 z-30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center bg-white/95 backdrop-blur-sm border-b border-slate-100/50 h-8 ${
          !isHeaderVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => setShowBookSelector(true)}
          className="px-3 py-0.5 rounded-full hover:bg-slate-50 transition-all"
        >
          <span className="font-serif font-bold text-slate-700 text-xs leading-none">
            {book} {chapter}
          </span>
        </button>
      </div>

      {/* CHAPTER/VERSE SELECTOR MODAL */}
      {showChapterSelector &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-xl overflow-hidden animate-enter-view flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/80">
              <button
                onClick={() => {
                  if (selectionStep === "verse") setSelectionStep("chapter");
                  else setShowChapterSelector(false);
                }}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100"
              >
                <ChevronLeft size={24} className="text-slate-600" />
              </button>
              <div className="flex flex-col items-center">
                <span className="font-bold text-slate-800">{book}</span>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                  {selectionStep === "chapter"
                    ? "Escolha o Capítulo"
                    : `Capítulo ${tempSelectedChapter} • Escolha o Versículo`}
                </span>
              </div>
              <button
                onClick={() => setShowChapterSelector(false)}
                className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500"
              >
                Cancelar
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectionStep === "chapter" ? (
                <div className="grid grid-cols-5 gap-3">
                  {Array.from(
                    { length: BIBLE_CHAPTER_COUNTS[book] || 50 },
                    (_, i) => i + 1
                  ).map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setTempSelectedChapter(num);
                        setSelectionStep("verse");
                      }}
                      className={`aspect-square rounded-2xl flex items-center justify-center font-bold text-lg transition-all ${
                        chapter === num
                          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                          : "bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-600"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: verseCount }, (_, i) => i + 1).map(
                    (num) => (
                      <button
                        key={num}
                        onClick={() => {
                          setCurrentChapter(tempSelectedChapter);
                          setTargetVerse(num);
                          setShowChapterSelector(false);
                        }}
                        className="aspect-square rounded-xl flex items-center justify-center font-medium text-sm bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                      >
                        {num}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* BOOK SELECTION MODAL */}
      {showBookSelector &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-xl overflow-y-auto animate-enter-view">
            <div className="min-h-screen px-6 py-8 pb-20 max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/95 py-4 border-b border-slate-100 z-10">
                <h2 className="text-2xl font-bold text-slate-800 font-serif">
                  Livros
                </h2>
                <button
                  onClick={() => setShowBookSelector(false)}
                  className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500"
                >
                  <ChevronLeft size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-6 border-b border-amber-100 pb-2">
                    Antigo Testamento
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {OT_BOOKS.map((b) => (
                      <button
                        key={b}
                        onClick={() => {
                          setCurrentBook(b);
                          setCurrentChapter(1);
                          setShowBookSelector(false);
                          didRestore.current = false;
                        }}
                        className={`p-3 rounded-xl text-sm font-medium text-left transition-all ${
                          book === b
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                            : "bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-6 border-b border-blue-100 pb-2">
                    Novo Testamento
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {NT_BOOKS.map((b) => (
                      <button
                        key={b}
                        onClick={() => {
                          setCurrentBook(b);
                          setCurrentChapter(1);
                          setShowBookSelector(false);
                          didRestore.current = false;
                        }}
                        className={`p-3 rounded-xl text-sm font-medium text-left transition-all ${
                          book === b
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* TEXT CONTENT */}
      <div className="px-4 max-w-2xl mx-auto">
        {loading || verses.length === 0 ? (
          <div className="space-y-4 animate-pulse mt-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-slate-100 rounded w-full"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {verses.map((v) => {
              const highlighted = isHighlighted(v.number);
              return (
                <div
                  key={v.number}
                  id={`verse-${v.number}`}
                  onClick={(e) => handleVerseClick(e, v.number)}
                  className={`relative pl-3 group transition-all duration-300 cursor-pointer rounded-lg -mx-2 px-2 py-0.5 ${
                    highlighted
                      ? "bg-amber-100 border-l-4 border-amber-400"
                      : "hover:bg-slate-50 border-l-4 border-transparent"
                  }`}
                >
                  <span className="absolute left-0 top-1.5 text-[9px] font-bold text-slate-300 select-none">
                    {v.number}
                  </span>
                  <p className="text-[17px] leading-relaxed text-slate-700 font-serif">
                    <SmartText
                      text={v.text}
                      entities={entities}
                      onEntityClick={onEntityClick}
                    />
                  </p>
                </div>
              );
            })}

            {!isLastChapter && (
              <div className="pt-8 pb-4 flex justify-center">
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-600 font-bold text-sm hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
                >
                  Próximo Capítulo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
