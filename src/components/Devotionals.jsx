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
      title: "Meu Diário",
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
  const { entries, addEntry, deleteEntry } = useJournal(user);
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newTitle, setNewTitle] = useState("");

  // Toggle Nav Visibility when Editing
  React.useEffect(() => {
    if (setIsNavVisible) {
      setIsNavVisible(!isEditing);
    }
    return () => {
      if (setIsNavVisible) setIsNavVisible(true);
    };
  }, [isEditing, setIsNavVisible]);

  const handleSave = () => {
    if (!newContent.trim()) return;
    addEntry(newContent, newTitle);
    setNewContent("");
    setNewTitle("");
    setIsEditing(false);
  };

  // Helper to format date
  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // WRITING MODE (School Notebook Style)
  if (isEditing) {
    return (
      <div className="fixed inset-0 z-[110] bg-[#fdfbf7] flex flex-col animate-scale-up">
        {/* Notebook Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200/60 bg-[#fdfbf7] z-10">
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400"
          >
            <X size={24} />
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Nova Nota
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
            className="w-full min-h-full p-8 pt-10"
            style={{
              backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px)",
              backgroundSize: "100% 2.5rem",
              backgroundColor: "#fdfbf7",
            }}
          >
            {/* Margin Line */}
            <div className="absolute top-0 bottom-0 left-12 w-px bg-red-200/50 pointer-events-none h-full"></div>

            <input
              type="text"
              placeholder="Título..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full text-2xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-slate-300 mb-2 px-6 text-slate-800 leading-[2.5rem]"
              style={{ lineHeight: "2.5rem" }}
            />
            <textarea
              placeholder="Escreva aqui..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full h-[calc(100vh-200px)] bg-transparent border-none focus:ring-0 resize-none text-slate-600 font-serif text-lg px-6 placeholder:text-slate-300"
              style={{ lineHeight: "2.5rem" }}
              autoFocus
            />
          </div>
        </div>
      </div>
    );
  }

  // TIMELINE MODE (List)
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
          <h2 className="text-xl font-bold text-slate-800">Meu Diário</h2>
        </div>
        <div className="text-xs font-medium text-slate-400">
          {entries.length} notas
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-[#f8f9fa] relative">
        <div className="p-4 pb-32 max-w-lg mx-auto space-y-6 pt-6">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <Edit3 size={64} className="mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-500">
                Seu diário está vazio.
              </p>
              <p className="text-sm text-slate-400 mb-6">
                Toque no + para começar.
              </p>

              <button
                onClick={() => setIsEditing(true)}
                className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              >
                <Plus size={32} />
              </button>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="relative pl-6 border-l-2 border-slate-200 ml-4 group"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-2 border-white group-hover:bg-amber-400 transition-colors"></div>

                {/* Date Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {formatDate(entry.createdAt)}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    <Clock size={10} />
                    {formatTime(entry.createdAt)}
                  </span>
                </div>

                {/* Card */}
                <div className="bg-white p-5 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
                  {/* Paper texture overlay hint */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400/20"></div>

                  <div className="flex justify-between items-start mb-2">
                    {entry.title ? (
                      <h3 className="font-bold text-slate-800">
                        {entry.title}
                      </h3>
                    ) : (
                      <span className="text-sm font-bold text-slate-300 italic">
                        Sem título
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEntry(entry.id);
                      }}
                      className="text-slate-200 hover:text-red-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <p className="text-slate-600 font-serif leading-relaxed whitespace-pre-wrap text-sm line-clamp-6">
                    {entry.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FAB - Floating Action Button - Positioned Centered Horizontally, Above Nav Bar */}
      {entries.length > 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setIsEditing(true)}
            className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-900/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white/20"
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
