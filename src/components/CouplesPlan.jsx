import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Copy,
  Users,
  Clock,
  HandHeart,
  Edit3,
  LogOut,
} from "lucide-react";
import { loadDays, COUPLES_PLAN } from "../data/couplesPlan";
import { useCouple } from "../hooks/useCouple";
import { usePrayers } from "../hooks/usePrayers";
import { useJournal } from "../hooks/useJournal";

export default function CouplesPlan({ user, onBack, goToBibleReference }) {
  const c = useCouple(user);
  const [dias, setDias] = useState(null);

  useEffect(() => {
    loadDays().then(setDias);
  }, []);

  if (c.loading || !dias) return <Splash />;
  if (!c.couple) return <Onboarding onBack={onBack} {...c} />;

  return (
    <DayView
      user={user}
      dias={dias}
      onBack={onBack}
      goToBibleReference={goToBibleReference}
      {...c}
    />
  );
}

function Splash() {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center" data-lenis-prevent>
      <div className="w-10 h-10 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin" />
    </div>
  );
}

// ======== CONVITE / PAREAMENTO ========
function Onboarding({ onBack, createCouple, joinCouple, error }) {
  const [mode, setMode] = useState(null); // 'criar' | 'entrar'
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    setBusy(true);
    const c = await createCouple();
    if (c) {
      setCode(c);
      setMode("criar");
    }
    setBusy(false);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setBusy(true);
    await joinCouple(input);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-slide-up" data-lenis-prevent>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center gap-3 z-10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="px-6 pb-32 text-center">
        <div className="w-20 h-20 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-6">
          <Heart size={36} fill="currentColor" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">
          {COUPLES_PLAN.title}
        </h2>
        <p className="text-slate-500 mb-8 leading-relaxed max-w-xs mx-auto">
          Cada dia traz a leitura, um devocional sobre ela e um motivo de oração
          para vocês dois.
        </p>

        {code ? (
          <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-3">
              Código do casal
            </p>
            <p className="text-3xl font-bold tracking-[0.2em] text-slate-800 font-mono mb-4">
              {code}
            </p>
            <button
              onClick={() => navigator.clipboard?.writeText(code)}
              className="text-xs font-bold text-rose-600 flex items-center gap-1.5 mx-auto hover:text-rose-700 py-2 px-4 rounded-full hover:bg-rose-100/50"
            >
              <Copy size={14} /> Copiar código
            </button>
            <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
              Envie este código para o seu cônjuge. Ele entra pelo mesmo botão
              e vocês passam a ver o mesmo progresso.
            </p>
          </div>
        ) : mode === "entrar" ? (
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="CÓDIGO"
              maxLength={8}
              className="w-full text-center text-2xl font-mono tracking-[0.2em] py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-200 uppercase"
            />
            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
            <button
              type="submit"
              disabled={input.length < 8 || busy}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold disabled:opacity-40 active:scale-95 transition-all"
            >
              {busy ? "Entrando..." : "Entrar no plano"}
            </button>
            <button
              type="button"
              onClick={() => setMode(null)}
              className="text-xs text-slate-400 font-medium py-2"
            >
              Voltar
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleCreate}
              disabled={busy}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/10 active:scale-95 transition-all disabled:opacity-50"
            >
              {busy ? "Criando..." : "Criar plano do casal"}
            </button>
            <button
              onClick={() => setMode("entrar")}
              className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 active:scale-95 transition-all"
            >
              Tenho um código
            </button>
            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
              Um de vocês cria e envia o código ao outro. Cada um usa a própria
              conta, e o progresso é compartilhado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ======== O DIA ========
function DayView({
  user,
  dias,
  couple,
  onBack,
  goToBibleReference,
  completeDay,
  goToDay,
  leaveCouple,
  isPaired,
  partnerUid,
  partnerName,
}) {
  const [sent, setSent] = useState(null);
  const { addPrayer } = usePrayers(user);
  const { addEntry } = useJournal(user);

  const [abertos, setAbertos] = useState(() => new Set());

  const total = dias.length;
  const day = Math.min(couple.currentDay || 1, dias.length);
  const hoje = dias[day - 1];

  // Devocional e oração começam fechados para não entregar a interpretação
  // antes da leitura. A chave inclui o dia, então virar o dia fecha tudo de
  // novo sem precisar de efeito.
  const estaAberto = (id) => abertos.has(`${day}-${id}`);
  const alternar = (id) =>
    setAbertos((prev) => {
      const next = new Set(prev);
      const key = `${day}-${id}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const minhas = couple.completions?.[user.uid] || [];
  const doParceiro = partnerUid ? couple.completions?.[partnerUid] || [] : [];
  const euMarquei = minhas.includes(day);
  const parceiroMarcou = doParceiro.includes(day);
  const pct = Math.round((minhas.length / total) * 100);

  const enviarOracao = async () => {
    await addPrayer(hoje.prayer);
    setSent("oracao");
    setTimeout(() => setSent(null), 2500);
  };

  const enviarDevocional = async () => {
    await addEntry(
      `${hoje.devotional}\n\n---\n\nNossa reflexão:\n`,
      `Dia ${day} — ${hoje.theme}`
    );
    setSent("devocional");
    setTimeout(() => setSent(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto animate-slide-up" data-lenis-prevent>
      {/* Cabeçalho */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-slate-200/50 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-800 truncate">
              Plano para Casais
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
              {hoje.phaseTitle}
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Sair do plano do casal?")) leaveCouple();
            }}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-300 hover:text-slate-500"
            title="Sair do plano"
          >
            <LogOut size={16} />
          </button>
        </div>

        <div className="mt-3">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {minhas.length} de {total} dias • {pct}%
          </p>
        </div>
      </div>

      <div className="p-6 pb-32">
        {/* Aguardando o par */}
        {!isPaired && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Users size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Aguardando seu cônjuge
              </p>
              <p className="text-xs text-amber-700/80 mt-0.5 leading-relaxed">
                Envie o código{" "}
                <span className="font-mono font-bold">{couple.id}</span> para
                ele. Você já pode começar a leitura.
              </p>
            </div>
          </div>
        )}

        {/* Navegação */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => goToDay(day - 1)}
            disabled={day === 1}
            className="p-2 rounded-full bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">
            Dia {day} de {total}
          </span>
          <button
            onClick={() => goToDay(day + 1)}
            disabled={day === dias.length}
            className="p-2 rounded-full bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
          >
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>

        <h1 className="text-2xl font-serif font-bold text-slate-800 text-center mb-8 leading-tight">
          {hoje.theme}
        </h1>

        {/* 1. LEITURA */}
        <Section
          icon={<BookOpen size={16} className="text-amber-500" />}
          label="Leitura"
        />
        <div className="space-y-2 mb-8">
          {hoje.readings.map((ref) => (
            <button
              key={ref}
              onClick={() => goToBibleReference(ref)}
              className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-amber-200 hover:shadow-md transition-all group text-left active:scale-[0.98]"
            >
              <span className="font-serif font-bold text-slate-700 flex-1">
                {ref}
              </span>
              <ChevronRight
                size={16}
                className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all"
              />
            </button>
          ))}
        </div>

        {/* 2. DEVOCIONAL */}
        <Collapsible
          icon={<Heart size={16} className="text-rose-500" />}
          label="Devocional"
          open={estaAberto("devocional")}
          onToggle={() => alternar("devocional")}
        >
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-3">
            <p className="text-[15px] leading-relaxed text-slate-700 font-serif whitespace-pre-line">
              {hoje.devotional}
            </p>
          </div>
          <button
            onClick={enviarDevocional}
            className="w-full py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Edit3 size={14} />
            {sent === "devocional"
              ? "Salvo no Meu Devocional"
              : "Escrever nossa reflexão"}
          </button>
        </Collapsible>

        {/* 3. ORAÇÃO */}
        <Collapsible
          icon={<HandHeart size={16} className="text-purple-500" />}
          label="Motivo de oração"
          open={estaAberto("oracao")}
          onToggle={() => alternar("oracao")}
        >
          <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100 mb-3">
            <p className="text-[15px] leading-relaxed text-purple-900 font-serif italic">
              {hoje.prayer}
            </p>
          </div>
          <button
            onClick={enviarOracao}
            className="w-full py-3 rounded-xl border border-purple-200 bg-white text-purple-600 text-xs font-bold flex items-center justify-center gap-2 hover:bg-purple-50 active:scale-95 transition-all"
          >
            <HandHeart size={14} />
            {sent === "oracao"
              ? "Adicionado aos Motivos de Oração"
              : "Adicionar aos meus motivos de oração"}
          </button>
        </Collapsible>

        {/* Conclusão */}
        <button
          onClick={() => completeDay(day, dias.length)}
          disabled={euMarquei}
          className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
            euMarquei
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10"
          }`}
        >
          {euMarquei ? (
            <>
              <Check size={20} /> Você concluiu
            </>
          ) : (
            "Marcar como concluído"
          )}
        </button>

        {isPaired && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium">
            {parceiroMarcou ? (
              <>
                <Check size={14} className="text-emerald-500" />
                <span className="text-emerald-600">
                  {partnerName} também concluiu
                </span>
              </>
            ) : (
              <>
                <Clock size={14} className="text-slate-400" />
                <span className="text-slate-400">
                  Aguardando {partnerName}
                </span>
              </>
            )}
          </div>
        )}

        {euMarquei && !parceiroMarcou && isPaired && (
          <button
            onClick={() => goToDay(day + 1)}
            disabled={day === dias.length}
            className="w-full mt-3 py-3 text-xs font-bold text-slate-400 hover:text-slate-600 disabled:opacity-40"
          >
            Avançar mesmo assim →
          </button>
        )}
      </div>
    </div>
  );
}

function Section({ icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </h3>
    </div>
  );
}

/** Fechado por padrão: a leitura vem primeiro, sem spoiler. */
function Collapsible({ icon, label, open, onToggle, children }) {
  return (
    <div className="mb-8">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 mb-3 group"
      >
        {icon}
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
          {label}
        </h3>
        <span className="flex-1 h-px bg-slate-200/70" />
        {open ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 group-hover:text-slate-500 transition-colors">
            abrir depois da leitura
            <ChevronDown size={16} className="text-slate-400" />
          </span>
        )}
      </button>
      {open && <div className="animate-enter-view">{children}</div>}
    </div>
  );
}
