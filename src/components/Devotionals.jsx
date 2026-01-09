import React, { useState } from "react";
import {
  Sparkles,
  Calendar,
  BookHeart,
  User,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Edit3,
  X,
  Save,
  Quote,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useJournal } from "../hooks/useJournal";
import { usePrayers } from "../hooks/usePrayers";
import { useHighlights } from "../hooks/useHighlights";
import { getDailyManna } from "../data/dailyManna";

export default function Devotionals({
  user,
  setIsHeaderVisible,
  setIsNavVisible,
  isActive,
}) {
  const { loginWithGoogle } = useAuth();
  const [activeFeature, setActiveFeature] = useState(null); // 'journal', 'prayers', 'favorites', 'manna', 'plan'

  // Toggle Header Visibility based on active sub-view
  React.useEffect(() => {
    if (setIsHeaderVisible && isActive) {
      if (activeFeature) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
    }
  }, [activeFeature, setIsHeaderVisible, isActive]);

  if (user?.isAnonymous) {
    return <AnonymousState loginWithGoogle={loginWithGoogle} />;
  }

  // --- SUB-VIEWS RENDER ---
  if (activeFeature === "journal")
    return (
      <JournalView
        user={user}
        onBack={() => setActiveFeature(null)}
        setIsNavVisible={setIsNavVisible}
      />
    );
  if (activeFeature === "prayers")
    return <PrayersView user={user} onBack={() => setActiveFeature(null)} />;
  if (activeFeature === "favorites")
    return <FavoritesView user={user} onBack={() => setActiveFeature(null)} />;
  if (activeFeature === "manna")
    return <MannaView onBack={() => setActiveFeature(null)} />;
  if (activeFeature === "plan")
    return <ReadingPlanView onBack={() => setActiveFeature(null)} />;

  // --- MAIN GRID ---
  // Matched styling to Atlas.jsx: gap-3 px-3 and p-4 cards
  const features = [
    {
      id: "manna",
      title: "Pão Diário",
      desc: "Uma palavra para hoje.",
      icon: Quote,
      color: "bg-amber-100 text-amber-600",
    },
    {
      id: "plan",
      title: "Plano de Leitura",
      desc: "Sua meta anual.",
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "favorites",
      title: "Favoritos",
      desc: "Versículos salvos.",
      icon: Sparkles,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "prayers",
      title: "Motivos de Oração",
      desc: "Seus pedidos a Deus.",
      icon: BookHeart,
      color: "bg-rose-100 text-rose-600",
    },
    {
      id: "journal",
      title: "Meu Devocional",
      desc: "Escreva suas reflexões.",
      icon: Edit3,
      color: "bg-emerald-100 text-emerald-600",
      full: true, // Span full width
    },
  ];

  return (
    <div className="pt-4 pb-32 animate-enter-view">
      <div className="grid grid-cols-2 gap-3 px-3 mt-6">
        {features.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveFeature(item.id)}
            className={`bg-white p-4 rounded-3xl shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left active:scale-95 active:bg-slate-50 ${
              item.full ? "col-span-2 flex items-center gap-4" : ""
            }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl ${
                item.color
              } flex items-center justify-center mb-0 group-hover:scale-110 transition-transform duration-300 shadow-sm ${
                item.full ? "mb-0 shrink-0" : "mb-3"
              }`}
            >
              <item.icon size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 leading-tight mb-0.5 group-hover:text-amber-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-400 text-[10px] leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function Header({ title, onBack }) {
  return (
    <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white/50 backdrop-blur z-20 py-2">
      <button
        onClick={onBack}
        className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-2xl font-serif font-bold text-slate-800">{title}</h2>
    </div>
  );
}

// --- MANNA VIEW ---
function MannaView({ onBack }) {
  const manna = getDailyManna();

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-slide-up">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-6 mb-4 bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-serif font-bold text-slate-800">
          Pão Diário
        </h2>
      </div>

      <div className="px-6 pb-24">
        <div className="bg-amber-50 rounded-3xl p-8 shadow-sm border border-amber-100 flex flex-col items-center text-center relative overflow-hidden">
          <Quote
            className="text-amber-200 absolute top-4 left-4"
            size={64}
            fill="currentColor"
          />

          <div className="relative z-10 pt-4">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              {manna.theme}
            </span>

            <p className="text-xl md:text-2xl font-serif text-slate-800 leading-relaxed mb-6">
              "{manna.text}"
            </p>

            <p className="text-sm font-bold text-amber-600 opacity-80">
              {manna.ref}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
            Reflexão
          </h3>
          <p className="text-slate-600 leading-relaxed italic text-lg opacity-80">
            {manna.reflection ||
              "Tome um momento para meditar nesta palavra. Como ela se aplica ao seu dia hoje?"}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- READING PLAN VIEW ---
function ReadingPlanView({ onBack }) {
  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-slide-up">
      <div className="flex items-center gap-3 p-6 mb-4 sticky top-0 bg-white z-10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100"
        >
          <ArrowLeft />
        </button>
        <h2 className="text-2xl font-serif font-bold">Plano de Leitura</h2>
      </div>
      <div className="p-6 text-center text-slate-400 mt-20">
        <Calendar size={48} className="mx-auto mb-4 opacity-20" />
        <p>Em breve: Planos de leitura estruturados.</p>
      </div>
    </div>
  );
}

// --- JOURNAL VIEW ---
function JournalView({ user, onBack, setIsNavVisible }) {
  const { entries, addEntry, deleteEntry, updateEntry } = useJournal(user);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null); // New state for reading modal
  const [newContent, setNewContent] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const textareaRef = React.useRef(null);
  const readingTextareaRef = React.useRef(null);

  // Toggle Nav when Editing or Viewing
  React.useEffect(() => {
    if (setIsNavVisible) {
      setIsNavVisible(!isEditing && !viewingEntry);
    }
    return () => {
      if (setIsNavVisible) setIsNavVisible(true);
    };
  }, [isEditing, viewingEntry, setIsNavVisible]);

  // Auto-resize textarea to make page scroll (lines move with text)
  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [newContent, isEditing]);

  // Auto-resize READING textarea
  React.useEffect(() => {
    if (viewingEntry && readingTextareaRef.current) {
      readingTextareaRef.current.style.height = "auto";
      readingTextareaRef.current.style.height =
        readingTextareaRef.current.scrollHeight + "px";
    }
  }, [viewingEntry]);

  // Helper: Auto-Capitalize (Title, Content, Paragraphs)
  const capitalizeText = (text) => {
    if (!text) return "";
    return text.replace(/(?:^|\n)./g, (match) => match.toUpperCase());
  };

  // Helper: Group by Month
  const groupEntriesByMonth = (entriesList) => {
    const groups = {};
    entriesList.forEach((entry) => {
      const date = entry.createdAt ? new Date(entry.createdAt) : new Date();
      const monthYear = date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
      const formatted = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

      if (!groups[formatted]) groups[formatted] = [];
      groups[formatted].push(entry);
    });
    return groups;
  };

  const handleSave = () => {
    if (!newContent.trim()) return;

    const formattedTitle = capitalizeText(newTitle);
    const formattedContent = capitalizeText(newContent);

    if (editingId) {
      updateEntry(editingId, formattedContent, formattedTitle);
    } else {
      addEntry(formattedContent, formattedTitle);
    }

    setNewContent("");
    setNewTitle("");
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEdit = (entry, e) => {
    e.stopPropagation();
    setEditingId(entry.id);
    setNewTitle(entry.title || "");
    setNewContent(entry.content || "");
    setIsEditing(true);
    setViewingEntry(null); // Close reading modal if open
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir esta nota?")) {
      deleteEntry(id);
      if (viewingEntry?.id === id) setViewingEntry(null);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setNewTitle("");
    setNewContent("");
    setIsEditing(true);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    }).format(date);
  };

  // WRITING MODE (Handwriting Style)
  if (isEditing) {
    return (
      <div className="fixed inset-0 z-[110] bg-[#fdfbf7] flex flex-col animate-scale-up">
        {/* Notebook Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200/60 bg-[#fdfbf7] z-10 sticky top-0">
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400"
          >
            <X size={24} />
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {editingId ? "Editar Nota" : "Nova Nota"}
          </span>
          <button
            onClick={handleSave}
            disabled={!newContent.trim()}
            className="px-4 py-2 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-lg shadow-slate-200"
          >
            Salvar
          </button>
        </div>

        {/* Notebook Body */}
        <div className="flex-1 overflow-y-auto p-0 relative w-full h-full">
          {/* Lined Background */}
          <div
            className="w-full min-h-full px-0 pt-0"
            style={{
              backgroundImage:
                "linear-gradient(transparent calc(2.5rem - 1px), #cbd5e1 1px)",
              backgroundSize: "100% 2.5rem",
              backgroundColor: "#fdfbf7",
            }}
          >
            {/* Margin Line */}
            <div className="absolute top-0 bottom-0 left-12 w-px bg-red-200/50 pointer-events-none h-full"></div>

            {/* Pencil Indicator (Aligned to Title Line) */}
            <Edit3
              size={18}
              className="absolute left-6 top-[3.5rem] text-slate-400 animate-pulse pointer-events-none -rotate-90"
            />

            {/* Line 1: Date Header */}
            <div className="w-full h-[2.5rem] flex items-end justify-end px-6 pb-0 relative z-10">
              <span className="font-hand text-xl text-slate-500 leading-none translate-y-[4px]">
                {new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date())}
              </span>
            </div>

            {/* Line 2: Title */}
            <input
              type="text"
              placeholder="Título..."
              value={newTitle}
              onChange={(e) => setNewTitle(capitalizeText(e.target.value))}
              className="w-full h-[2.5rem] text-3xl font-hand bg-transparent border-none focus:ring-0 outline-none placeholder:text-slate-300 pl-16 pr-6 text-slate-800 leading-[2.5rem] p-0"
              style={{ paddingTop: "0.6rem", paddingLeft: "4rem" }}
            />

            {/* Line 3+: Content */}
            <textarea
              ref={textareaRef}
              placeholder="Escreva aqui..."
              value={newContent}
              onChange={(e) => setNewContent(capitalizeText(e.target.value))}
              className="w-full min-h-[calc(100vh-250px)] bg-transparent border-none focus:ring-0 outline-none resize-none text-slate-700 font-hand text-2xl pl-16 pr-6 placeholder:text-slate-300/50 leading-[2.5rem] p-0 overflow-hidden"
              style={{ paddingTop: "0.6rem", paddingLeft: "4rem" }}
              autoFocus
            />
          </div>
        </div>
      </div>
    );
  }

  // READING MODE (Full Screen Modal - now looks like Notebook)
  if (viewingEntry) {
    return (
      <div className="fixed inset-0 z-[110] bg-[#fdfbf7] flex flex-col animate-enter-view">
        <div className="flex items-center gap-3 p-6 mb-0 border-b border-slate-200/50 bg-[#fdfbf7] z-10 sticky top-0">
          <button
            onClick={() => setViewingEntry(null)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400">
              Leitura
            </h2>
          </div>
          <button
            onClick={(e) => handleEdit(viewingEntry, e)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors mr-2"
          >
            <Edit3 size={20} />
          </button>
          <button
            onClick={(e) => handleDelete(viewingEntry.id, e)}
            className="p-2 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-0 relative w-full h-full">
          {/* Lined Background MATCHING WRITE MODE */}
          <div
            className="w-full min-h-full px-0 pt-0"
            style={{
              backgroundImage:
                "linear-gradient(transparent calc(2.5rem - 1px), #cbd5e1 1px)",
              backgroundSize: "100% 2.5rem",
              backgroundColor: "#fdfbf7",
            }}
          >
            {/* Margin Line */}
            <div className="absolute top-0 bottom-0 left-12 w-px bg-red-200/50 pointer-events-none h-full"></div>

            {/* Line 1: Date Header */}
            <div className="w-full h-[2.5rem] flex items-end justify-end px-6 pb-0 relative z-10">
              <span className="font-hand text-xl text-slate-500 leading-none translate-y-[4px]">
                {new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(viewingEntry.createdAt)}
              </span>
            </div>

            {/* Line 2: Title - USING READONLY INPUT FOR STRICT ALIGNMENT */}
            <input
              type="text"
              value={viewingEntry.title || "Sem Título"}
              readOnly
              className="w-full h-[2.5rem] text-3xl font-hand bg-transparent border-none focus:ring-0 outline-none placeholder:text-slate-300 pl-16 pr-6 text-slate-800 leading-[2.5rem] p-0"
              style={{ paddingTop: "0.6rem", paddingLeft: "4rem" }}
            />

            {/* Line 3+: Content - USING READONLY TEXTAREA FOR ALIGNMENT */}
            <textarea
              ref={readingTextareaRef}
              value={viewingEntry.content}
              readOnly
              className="w-full min-h-[calc(100vh-250px)] bg-transparent border-none focus:ring-0 outline-none resize-none text-slate-700 font-hand text-2xl pl-16 pr-6 leading-[2.5rem] p-0 overflow-hidden"
              style={{
                paddingTop: "0.6rem",
                paddingLeft: "4rem",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // CARD GRID MODE (Main View)
  const groupedEntries = groupEntriesByMonth(entries);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 overflow-hidden flex flex-col animate-slide-up">
      {/* Sticky Header */}
      <div className="flex-none bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200/50 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-xl font-bold text-slate-800">Meu Devocional</h2>
        </div>
        <div className="text-xs font-medium text-slate-400">
          {entries.length} notas
        </div>
      </div>

      {/* Main Content Area - Grid */}
      <div className="flex-1 overflow-y-auto bg-[#f8f9fa] relative">
        <div className="p-4 pb-32 pt-6">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <Edit3 size={64} className="mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-500">
                Seu devocional está vazio.
              </p>
              <p className="text-sm text-slate-400 mb-6">
                Toque no + para começar.
              </p>

              <button
                onClick={handleCreate}
                className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              >
                <Plus size={32} />
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedEntries).map(([month, monthEntries]) => (
                <div key={month} className="animate-fade-in">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2 sticky top-0 bg-[#f8f9fa]/95 backdrop-blur py-2 z-10 w-fit px-3 rounded-r-lg">
                    {month}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {monthEntries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => setViewingEntry(entry)}
                        className="bg-white rounded-r-2xl rounded-l-md shadow-sm border-y border-r border-slate-100 hover:shadow-md active:scale-95 transition-all text-left flex h-40 relative group overflow-visible"
                      >
                        {/* Spiral Binding (Left Side) */}
                        <div className="w-6 h-full absolute left-0 top-0 bottom-0 bg-slate-100/50 rounded-l-md border-r border-slate-200/50 flex flex-col justify-evenly items-center py-2 z-10">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="relative w-full h-4">
                              {/* Hole */}
                              <div className="w-2 h-2 rounded-full bg-slate-800/10 mx-auto"></div>
                              {/* Wire Loop - Simulating the spiral going 'into' the paper */}
                              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-3 border-t-2 border-slate-400 rounded-[100%] rotate-3 opacity-80"></div>
                            </div>
                          ))}
                        </div>

                        {/* Card Content (Paper) */}
                        <div className="flex-1 px-3 pb-3 pl-8 pt-6 flex flex-col justify-between h-full bg-[#fffdf9] relative">
                          {/* Lines background decoration (Subtle) */}
                          <div
                            className="absolute inset-0 left-6 pointer-events-none opacity-50"
                            style={{
                              backgroundImage:
                                "linear-gradient(#e2e8f0 1px, transparent 1px)",
                              backgroundSize: "100% 1.5rem",
                            }}
                          />

                          <h3 className="font-hand text-xl font-bold text-slate-800 leading-[1.5rem] line-clamp-2 mb-2 relative z-10">
                            {entry.title || "Sem Título"}
                          </h3>

                          <div className="mt-auto relative z-10 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm">
                              {formatDate(entry.createdAt)}
                            </span>
                          </div>

                          {/* Action Buttons (Mobile Optimized) */}
                          <div className="absolute bottom-1 right-1 flex gap-1 z-20">
                            <div
                              onClick={(e) => handleEdit(entry, e)}
                              className="p-2 bg-white/90 rounded-full shadow-sm text-slate-400 hover:text-amber-500 hover:bg-amber-50 active:scale-90 transition-all border border-slate-100"
                            >
                              <Edit3 size={16} />
                            </div>
                            <div
                              onClick={(e) => handleDelete(entry.id, e)}
                              className="p-2 bg-white/90 rounded-full shadow-sm text-slate-400 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all border border-slate-100"
                            >
                              <Trash2 size={16} />
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB - Floating Action Button (Only show if list is not empty) */}
      {entries.length > 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleCreate}
            className="w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white/20"
          >
            <Plus size={32} />
          </button>
        </div>
      )}
    </div>
  );
}

function FavoritesView({ user, onBack }) {
  const { highlights } = useHighlights(user); // Fetches ALL due to our hook update

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="min-h-full p-6 pb-24 max-w-md mx-auto">
        <Header title="Meus Favoritos" onBack={onBack} />

        {highlights.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <Sparkles size={48} className="mx-auto mb-4 text-slate-300" />
            <p>Nenhum destaque salvo.</p>
            <p className="text-xs mt-2">Clique nos versículos para salvar.</p>
          </div>
        )}

        <div className="space-y-3">
          {highlights.map((h) => (
            <div
              key={h.id}
              className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                  {h.verse}
                </div>
                <div>
                  <h4 className="font-bold text-amber-900">
                    {h.book} {h.chapter}:{h.verse}
                  </h4>
                  <span className="text-[10px] uppercase text-amber-700/60 font-bold tracking-wider">
                    Destaque
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrayersView({ user, onBack }) {
  const { prayers, addPrayer, toggleStatus, deletePrayer } = usePrayers(user);
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    addPrayer(input);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in slide-in-from-bottom duration-300">
      <div className="min-h-full p-6 pb-24 max-w-md mx-auto">
        <Header title="Motivos de Oração" onBack={onBack} />

        <form onSubmit={handleSubmit} className="mb-8 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Adicionar novo pedido..."
            className="w-full pl-5 pr-12 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all font-medium"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 w-10 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 transition-colors"
          >
            <Plus size={20} />
          </button>
        </form>

        <div className="space-y-3">
          {prayers.map((prayer) => (
            <div
              key={prayer.id}
              className={`flex items-start p-4 rounded-2xl border transition-all ${
                prayer.status === "answered"
                  ? "bg-green-50 border-green-100 opacity-70"
                  : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              <button
                onClick={() => toggleStatus(prayer.id, prayer.status)}
                className={`mt-1 mr-3 transition-colors ${
                  prayer.status === "answered"
                    ? "text-green-500"
                    : "text-slate-300 hover:text-rose-400"
                }`}
              >
                {prayer.status === "answered" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Circle size={20} />
                )}
              </button>
              <div className="flex-1">
                <p
                  className={`text-slate-700 leading-relaxed ${
                    prayer.status === "answered"
                      ? "line-through text-slate-400"
                      : ""
                  }`}
                >
                  {prayer.text}
                </p>
              </div>
              <button
                onClick={() => deletePrayer(prayer.id)}
                className="text-slate-200 hover:text-red-400 ml-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnonymousState({ loginWithGoogle }) {
  return (
    <div className="flex flex-col items-center justify-center h-full pt-20 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Sparkles className="text-slate-400" size={40} />
      </div>
      <h2 className="text-2xl font-serif font-bold text-slate-800 mb-3">
        Conteúdo Exclusivo
      </h2>
      <p className="text-slate-500 mb-8 leading-relaxed max-w-xs mx-auto">
        Esta área é reservada para membros. Faça login para acessar devocionais
        e diário.
      </p>
      <button
        onClick={loginWithGoogle}
        className="w-full max-w-xs py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
      >
        Entrar com Google
      </button>
    </div>
  );
}
