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
  Sparkles,
} from "lucide-react";
import {
  loadDay,
  totalDays,
  PHASES,
  TRACKS,
  DEFAULT_TRACK,
  COUPLES_PLAN,
} from "../data/couplesPlan";
import { useCouple } from "../hooks/useCouple";
import { usePrayers } from "../hooks/usePrayers";
import { useJournal } from "../hooks/useJournal";

/** Como chamar a outra pessoa: o plano roda para noivos e para casados. */
const par = (track) => (track === "noivos" ? "noivo(a)" : "cônjuge");

export default function CouplesPlan({ user, onBack, goToBibleReference }) {
  const c = useCouple(user);
  const total = totalDays();
  const day = Math.min(c.couple?.currentDay || 1, total);
  const [hoje, setHoje] = useState(null);

  // Carrega só a fase que contém este dia, na trilha do casal — não o plano
  // inteiro. Trocar de trilha recarrega o mesmo dia com o outro devocional.
  useEffect(() => {
    if (!c.couple) return;
    let atual = true;
    loadDay(day, c.track).then((d) => atual && setHoje(d));
    return () => {
      atual = false;
    };
  }, [day, c.track, c.couple]);

  if (c.loading) return <Splash />;
  if (!c.couple) return <Onboarding onBack={onBack} {...c} />;
  if (!hoje) return <Splash />;

  return (
    <DayView
      user={user}
      hoje={hoje}
      day={day}
      total={total}
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
  const [track, setTrackLocal] = useState(DEFAULT_TRACK);

  const handleCreate = async (escolhida) => {
    setBusy(true);
    setTrackLocal(escolhida);
    const c = await createCouple(escolhida);
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
              Envie este código para o seu {par(track)}. É pelo mesmo botão que
              se entra, e vocês passam a ver o mesmo progresso.
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
            {/* A escolha da trilha é o próprio botão de criar: um toque em vez
                de escolher e depois confirmar. */}
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Vocês são
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCreate("noivos")}
                disabled={busy}
                className="py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/10 active:scale-95 transition-all disabled:opacity-50"
              >
                {busy ? "..." : "Noivos"}
              </button>
              <button
                onClick={() => handleCreate("casados")}
                disabled={busy}
                className="py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/10 active:scale-95 transition-all disabled:opacity-50"
              >
                {busy ? "..." : "Casados"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              As leituras são as mesmas; o devocional é escrito para a fase de
              vocês. Depois do casamento vocês trocam, sem perder o progresso.
            </p>
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
  hoje,
  day,
  total,
  couple,
  onBack,
  goToBibleReference,
  completeDay,
  goToDay,
  leaveCouple,
  isPaired,
  partnerUid,
  partnerName,
  track,
  setTrack,
}) {
  const [sent, setSent] = useState(null);
  const [abertos, setAbertos] = useState(() => new Set());
  const [verRoteiro, setVerRoteiro] = useState(false);
  const { addPrayer } = usePrayers(user);
  const { addEntry } = useJournal(user);

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

  const fimDaFase = hoje.startDay + hoje.phase.dayCount - 1;
  const concluidosNaFase = minhas.filter(
    (d) => d >= hoje.startDay && d <= fimDaFase
  ).length;
  const pctFase = Math.round((concluidosNaFase / hoje.phase.dayCount) * 100);

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
          <button
            onClick={() => setVerRoteiro(true)}
            className="flex-1 min-w-0 text-left group"
          >
            <h2 className="text-base font-bold text-slate-800 truncate group-hover:text-rose-600 transition-colors">
              {hoje.phase.title}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
              Dia {hoje.dayInPhase} de {hoje.phase.dayCount} • ver roteiro
            </p>
          </button>
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

        {/* Progresso da fase em destaque; o geral fica discreto, senão
            "dia 3 de 695" desanima antes de começar. */}
        <div className="mt-3">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${pctFase}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {concluidosNaFase} de {hoje.phase.dayCount} dias nesta fase
            <span className="text-slate-300">
              {" "}
              • {minhas.length}/{total} no total
            </span>
          </p>
        </div>
      </div>

      {verRoteiro && (
        <Roteiro
          atual={hoje.phaseIndex}
          concluidos={minhas}
          track={track}
          setTrack={setTrack}
          onClose={() => setVerRoteiro(false)}
        />
      )}

      <div className="p-6 pb-32">
        {/* Aguardando o par */}
        {!isPaired && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Users size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Aguardando seu {par(track)}
              </p>
              <p className="text-xs text-amber-700/80 mt-0.5 leading-relaxed">
                Envie o código{" "}
                <span className="font-mono font-bold">{couple.id}</span>. Você
                já pode começar a leitura.
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
            disabled={day === total}
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

        {/* 4. AÇÃO — opcional, só nos dias que trazem uma proposta concreta */}
        {hoje.action && (
          <Collapsible
            icon={<Sparkles size={16} className="text-emerald-500" />}
            label="Ação de hoje"
            open={estaAberto("acao")}
            onToggle={() => alternar("acao")}
          >
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <p className="text-[15px] leading-relaxed text-emerald-900">
                {hoje.action}
              </p>
            </div>
          </Collapsible>
        )}

        {/* Conclusão */}
        <button
          onClick={() => completeDay(day, total)}
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
            disabled={day === total}
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

/** Roteiro das fases: onde o casal está e o que vem pela frente. */
function Roteiro({ atual, concluidos, track, setTrack, onClose }) {
  const outra = track === "noivos" ? "casados" : "noivos";
  const linhas = PHASES.map((p, i) => {
    const de = PHASES.slice(0, i).reduce((n, x) => n + x.dayCount, 1);
    const ate = de + p.dayCount - 1;
    const feitos = concluidos.filter((d) => d >= de && d <= ate).length;
    return { p, i, de, ate, feitos };
  });

  return (
    <div
      className="fixed inset-0 z-[110] bg-white overflow-y-auto animate-slide-up"
      data-lenis-prevent
    >
      <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center gap-3 border-b border-slate-200/50">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-xl font-bold text-slate-800">A jornada</h2>
      </div>

      <div className="p-6 pb-32 space-y-3">
        {linhas.map(({ p, i, de, ate, feitos }) => {
          const pct = Math.round((feitos / p.dayCount) * 100);
          const eAtual = i === atual;
          return (
            <div
              key={p.id}
              className={`rounded-2xl p-4 border transition-all ${
                eAtual
                  ? "bg-rose-50 border-rose-200 shadow-sm"
                  : "bg-white border-slate-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    pct === 100
                      ? "bg-emerald-100 text-emerald-600"
                      : eAtual
                      ? "bg-rose-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {pct === 100 ? <Check size={16} /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{p.subtitle}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mt-1">
                    dias {de}–{ate}
                  </p>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct === 100 ? "bg-emerald-500" : "bg-rose-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Dois caminhos porque são duas situações diferentes: quem casa no
            meio do plano continua de onde parou; quem terminou a volta
            recomeça do dia 1 com a outra leitura. */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 mt-6">
          <p className="text-xs font-bold text-slate-700">
            Leitura de {TRACKS[track].toLowerCase()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            O devocional de cada dia é escrito para a fase de vocês. As leituras
            não mudam.
          </p>
          <div className="mt-3 space-y-1">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Recomeçar do dia 1 com a leitura de ${TRACKS[
                      outra
                    ].toLowerCase()}? O progresso desta volta fica guardado.`
                  )
                )
                  setTrack(outra, { restart: true });
              }}
              className="block w-full text-left text-xs font-bold text-rose-600 hover:text-rose-700 py-2 px-3 -mx-1 rounded-xl hover:bg-rose-50"
            >
              Mudar para {TRACKS[outra].toLowerCase()} e recomeçar do dia 1
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Passar a ler a versão para ${TRACKS[
                      outra
                    ].toLowerCase()} a partir do dia atual? O progresso continua o mesmo.`
                  )
                )
                  setTrack(outra);
              }}
              className="block w-full text-left text-xs font-bold text-slate-500 hover:text-slate-700 py-2 px-3 -mx-1 rounded-xl hover:bg-slate-50"
            >
              Mudar e continuar no dia atual
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center pt-6 leading-relaxed">
          Novas fases são acrescentadas conforme o plano avança, até cobrir a
          Bíblia inteira.
        </p>
      </div>
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
