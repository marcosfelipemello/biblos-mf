import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Book } from "lucide-react";
import { useBibleApi } from "../hooks/useBibleApi";
import SmartText from "./SmartText";
import { BOOK_NAMES } from "../data/bibleBookNames";

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
  initialScroll,
  targetVerse,
  onScrollComplete,
}) {
  const { getChapter, loading } = useBibleApi();
  const [verses, setVerses] = useState([]);
  const [showBookSelector, setShowBookSelector] = useState(false); // State for modal

  // Use props instead of local state
  const book = currentBook;
  const chapter = currentChapter;

  useEffect(() => {
    const loadChapter = async () => {
      const data = await getChapter(book, chapter);
      setVerses(data);
    };
    loadChapter();
  }, [book, chapter, getChapter]);

  // Let's use a Mutable Ref to track "didRestore".
  const didRestore = React.useRef(false);

  React.useLayoutEffect(() => {
    // Wait for content to load before adjusting scroll
    if (loading || verses.length === 0) return;

    if (scrollContainerRef && scrollContainerRef.current) {
      // 1. Check for Target Verse (Priority)
      if (targetVerse) {
        const verseEl = document.getElementById(`verse-${targetVerse}`);
        if (verseEl) {
          verseEl.scrollIntoView({ behavior: "smooth", block: "center" });
          if (onScrollComplete) onScrollComplete();
          didRestore.current = true; // Mark as handled
          return;
        }
      }

      // 2. Standard Scroll Restoration
      if (!didRestore.current) {
        // First load with content: Restore position or start at top
        if (initialScroll > 0) {
          scrollContainerRef.current.scrollTop = initialScroll;
        } else {
          scrollContainerRef.current.scrollTop = 0;
        }
        didRestore.current = true;
      } else {
        // Subsequent updates (e.g. Chapter change) -> Scroll to Top
        // Only if we aren't targeting a verse (handled above)
        if (!targetVerse) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }
    }
  }, [
    loading,
    verses,
    initialScroll,
    scrollContainerRef,
    targetVerse,
    onScrollComplete,
  ]);

  const handleNext = () => {
    setCurrentChapter((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (chapter > 1) setCurrentChapter((prev) => prev - 1);
  };

  return (
    <div className="pb-20 animate-enter-view">
      {/* READER HEADER */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100 p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={chapter === 1}
            className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={24} className="text-slate-600" />
          </button>

          <div className="flex-1 flex flex-col items-center">
            {/* BOOK SELECTOR BUTTON */}
            <button
              onClick={() => setShowBookSelector(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
            >
              <span className="text-xl font-serif font-bold text-slate-800 group-hover:text-amber-700">
                {book}
              </span>
              <Book
                size={16}
                className="text-slate-400 group-hover:text-amber-500"
              />
            </button>

            <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mt-1">
              CAPÍTULO {chapter}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ChevronRight size={24} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* BOOK SELECTION MODAL */}
      {showBookSelector && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl overflow-y-auto animate-enter-view">
          <div className="min-h-screen px-6 py-8 pb-20 max-w-2xl mx-auto">
            {/* Modal Header */}
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
              {/* ANTIGO TESTAMENTO */}
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
                        didRestore.current = false; // Reset restore capability on book change
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

              {/* NOVO TESTAMENTO */}
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
        </div>
      )}

      {/* TEXT CONTENT */}
      <div className="px-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="space-y-4 animate-pulse mt-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-slate-100 rounded w-full"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {verses.map((v) => (
              <div
                key={v.number}
                id={`verse-${v.number}`}
                className={`relative pl-4 group transition-colors duration-1000 ${
                  targetVerse === v.number
                    ? "bg-amber-100/50 -mx-4 px-8 py-2 rounded-lg"
                    : ""
                }`}
              >
                <span className="absolute left-0 top-0 text-[10px] font-bold text-slate-300 select-none pt-1">
                  {v.number}
                </span>
                <p className="text-lg leading-8 text-slate-700 font-serif">
                  <SmartText
                    text={v.text}
                    entities={entities}
                    onEntityClick={onEntityClick}
                  />
                </p>
              </div>
            ))}

            {/* End of Chapter Nav */}
            <div className="pt-8 pb-4 flex justify-center">
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-600 font-bold text-sm hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
              >
                Próximo Capítulo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
