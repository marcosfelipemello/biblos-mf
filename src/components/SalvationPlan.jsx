import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Cross,
  Crown,
  Flame,
  Infinity as InfinityIcon,
  Leaf,
  Library,
  Bell,
  Rainbow,
  RotateCcw,
  ScrollText,
  Sunrise,
  Feather,
} from "lucide-react";
import { PLANO_SALVACAO as P, parseReferencias } from "../data/planoSalvacao";
import { getPassage } from "../hooks/useBibleApi";
import "./salvation.css";

// Cada bloco (ato) tem a sua luz: da eternidade à nova criação.
const TEMAS = {
  A: { Icon: InfinityIcon, ceu: ["#0b1026", "#1e1b4b", "#312e81"], luz: "#a5b4fc", acento: "#818cf8" },
  B: { Icon: Sunrise, ceu: ["#0f2a24", "#14532d", "#b45309"], luz: "#fcd34d", acento: "#f59e0b" },
  C: { Icon: Leaf, ceu: ["#1a0b10", "#4c0519", "#7f1d1d"], luz: "#fb7185", acento: "#e11d48" },
  D: { Icon: Rainbow, ceu: ["#111827", "#1e3a8a", "#7c2d12"], luz: "#fdba74", acento: "#ea580c" },
  E: { Icon: Cross, ceu: ["#140a0a", "#450a0a", "#78350f"], luz: "#fde68a", acento: "#d97706" },
  F: { Icon: Flame, ceu: ["#042f2e", "#134e4a", "#0e7490"], luz: "#67e8f9", acento: "#0891b2" },
  G: { Icon: Crown, ceu: ["#1c1405", "#78350f", "#f59e0b"], luz: "#fffbeb", acento: "#d97706" },
};
const blocoDe = (id) => P.blocos.find((b) => b.id === id);

// Liga .is-in nos .ps-reveal quando aparecem na tela.
function useReveal(deps) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(".ps-reveal:not(.is-in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { root, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export default function SalvationPlan({
  user,
  state,
  onBack,
  goToBibleReference,
  startPlan,
  completeDay,
  uncompleteDay,
  goToDay,
  resetPlan,
}) {
  const [aberto, setAberto] = useState(null); // dia aberto (número) ou null
  const [intro, setIntro] = useState(false);
  const feitos = useMemo(() => new Set(state?.completedDays || []), [state]);
  const atual = state ? Math.min(state.currentDay || 1, P.days) : 1;
  const anonimo = !user || user.isAnonymous;

  const abrir = (dia) => {
    setAberto(dia);
    if (state && dia !== state.currentDay) goToDay(P.id, dia);
  };

  if (intro) return <Introducao onBack={() => setIntro(false)} />;
  if (aberto)
    return (
      <Dia
        n={aberto}
        feito={feitos.has(aberto)}
        anonimo={anonimo}
        onBack={() => setAberto(null)}
        onIr={abrir}
        goToBibleReference={goToBibleReference}
        onConcluir={async () => {
          if (!state) await startPlan(P.id);
          await completeDay(P.id, aberto, P.days);
        }}
        onDesfazer={() => uncompleteDay(P.id, aberto)}
      />
    );

  return (
    <Jornada
      state={state}
      feitos={feitos}
      atual={atual}
      anonimo={anonimo}
      onBack={onBack}
      onAbrir={abrir}
      onIntro={() => setIntro(true)}
      onComecar={async () => {
        if (!state) await startPlan(P.id);
        abrir(atual);
      }}
      onRecomecar={() => {
        if (window.confirm("Recomeçar o Plano da Salvação do dia 1?")) resetPlan(P.id);
      }}
    />
  );
}

// ======== A JORNADA (tela inicial do plano) ========
function Jornada({ state, feitos, atual, anonimo, onBack, onAbrir, onIntro, onComecar, onRecomecar }) {
  const total = feitos.size;
  const pct = total / P.days;
  const scroller = useReveal([total]);
  const R = 52, C = 2 * Math.PI * R;

  return (
    <div ref={scroller} className="fixed inset-0 z-[100] overflow-y-auto bg-[#0b1026] text-white" data-lenis-prevent>
      {/* Céu */}
      <header className="relative overflow-hidden min-h-[92svh] flex flex-col" style={{ "--ps-glow": "#fbbf24" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#05071a] via-[#1e1b4b] to-[#78350f]" />
        <div className="ps-stars" />
        <div className="ps-aurora" />
        <div className="relative z-10 flex items-center justify-between px-5 pt-5">
          <button onClick={onBack} aria-label="Voltar" className="p-2 -ml-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition">
            <ArrowLeft size={22} />
          </button>
          {state && (
            <button onClick={onRecomecar} aria-label="Recomeçar" className="p-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition">
              <RotateCcw size={18} />
            </button>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-10">
          <p className="ps-reveal text-[11px] font-bold uppercase tracking-[0.35em] text-amber-200/80">Biblos · 30 dias</p>
          <h1 className="ps-reveal ps-display text-5xl sm:text-6xl font-semibold leading-[0.95] mt-4" style={{ transitionDelay: ".1s" }}>
            O Plano
            <br />
            da Salvação
          </h1>
          <p className="ps-reveal ps-display italic text-2xl text-amber-100/90 mt-3" style={{ transitionDelay: ".2s" }}>
            {P.subtitulo}
          </p>
          <p className="ps-reveal text-sm text-indigo-100/70 mt-3 max-w-xs" style={{ transitionDelay: ".3s" }}>
            {P.desc}
          </p>

          {/* Anel de progresso */}
          <div className="ps-reveal relative mt-8" style={{ transitionDelay: ".4s" }}>
            <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
              <circle cx="66" cy="66" r={R} fill="none" stroke="#ffffff1f" strokeWidth="6" />
              <circle
                cx="66" cy="66" r={R} fill="none" stroke="url(#psOuro)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
                style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(.2,.7,.2,1)" }}
              />
              <defs>
                <linearGradient id="psOuro" x1="0" x2="1">
                  <stop offset="0" stopColor="#fde68a" />
                  <stop offset="1" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="ps-display text-4xl font-bold">{total}</span>
              <span className="text-[10px] uppercase tracking-widest text-white/60">de {P.days} dias</span>
            </div>
          </div>

          <button
            onClick={onComecar}
            className="ps-reveal mt-8 px-8 py-4 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 text-slate-900 font-bold shadow-[0_0_40px_-6px_#f59e0b] active:scale-95 transition"
            style={{ transitionDelay: ".5s" }}
          >
            {!state ? "Começar a jornada" : total >= P.days ? "Rever a jornada" : `Continuar · Dia ${atual}`}
          </button>
          <button onClick={onIntro} className="ps-reveal mt-4 text-sm text-amber-100/80 underline underline-offset-4 decoration-amber-200/40" style={{ transitionDelay: ".6s" }}>
            Antes de começar: a história inteira
          </button>
          {anonimo && (
            <p className="mt-4 text-xs text-white/60 max-w-xs">Entre na sua conta para o seu progresso ficar salvo.</p>
          )}
        </div>
      </header>

      {/* O caminho: 7 blocos, 30 dias */}
      <main className="relative bg-gradient-to-b from-[#78350f] via-[#1c1917] to-[#0c0a09] px-5 pb-16">
        <div className="max-w-2xl mx-auto">
        {P.blocos.map((b) => (
          <Bloco key={b.id} b={b} feitos={feitos} atual={state ? atual : null} onAbrir={onAbrir} />
        ))}

        <div className="ps-reveal mt-12 rounded-3xl bg-white/5 border border-white/10 p-5 flex gap-4">
          <Bell className="text-amber-300 shrink-0" size={22} />
          <p className="text-sm text-white/80">
            <b className="text-white">Lembrete às 19h.</b> Com as notificações do Biblos ativadas, você recebe um toque no dia em que ainda não leu.
          </p>
        </div>

        <Rodape />
        </div>
      </main>
    </div>
  );
}

function Bloco({ b, feitos, atual, onAbrir }) {
  const t = TEMAS[b.id];
  const dias = P.schedule.filter((d) => d.bloco === b.id);
  const lidos = dias.filter((d) => feitos.has(d.day)).length;
  return (
    <section className="pt-12" style={{ "--ps-accent": t.acento }}>
      <div className="ps-reveal relative overflow-hidden rounded-3xl p-5 border border-white/10" style={{ background: `linear-gradient(135deg, ${t.ceu[0]}, ${t.ceu[1]} 55%, ${t.ceu[2]})` }}>
        <div className="ps-rays" />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0" style={{ color: t.luz, boxShadow: `0 0 30px -4px ${t.luz}` }}>
            <t.Icon size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
              Bloco {b.id} · Dias {b.de}–{b.ate}
            </p>
            <h2 className="ps-display text-xl font-bold leading-tight mt-1 tracking-wide">{b.titulo}</h2>
            <p className="text-[11px] text-white/60 mt-1">{lidos} de {dias.length} lidos</p>
          </div>
        </div>
      </div>

      <ol className="relative mt-4 ml-6">
        <span className="absolute left-0 top-2 bottom-2 w-px bg-white/15" aria-hidden />
        {dias.map((d) => {
          const feito = feitos.has(d.day);
          const eAtual = atual === d.day && !feito;
          return (
            <li key={d.day} className="ps-reveal relative pl-8 py-2">
              <span
                className={`absolute -left-[13px] top-1/2 -translate-y-1/2 w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-bold border transition-all ${
                  feito ? "bg-amber-400 border-amber-200 text-slate-900 shadow-[0_0_16px_#f59e0b]" : eAtual ? "ps-halo bg-white text-slate-900 border-white" : "bg-[#1c1917] border-white/25 text-white/70"
                }`}
              >
                {feito ? <Check size={14} strokeWidth={3} /> : d.day}
              </span>
              <button
                onClick={() => onAbrir(d.day)}
                className={`w-full text-left rounded-2xl px-4 py-3 border transition active:scale-[0.98] ${
                  eAtual ? "bg-white/15 border-white/30" : "bg-white/[0.04] border-white/10 hover:bg-white/10"
                }`}
              >
                <p className="text-[10px] uppercase tracking-widest text-white/50">Dia {d.day} · {d.leituraPrincipal}</p>
                <p className={`ps-display text-lg leading-snug mt-0.5 ${feito ? "text-amber-100" : "text-white"}`}>{d.titulo}</p>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ======== O DIA ========
function Dia({ n, feito, anonimo, onBack, onIr, onConcluir, onDesfazer, goToBibleReference }) {
  const d = P.schedule[n - 1];
  const b = blocoDe(d.bloco);
  const t = TEMAS[d.bloco];
  const principais = useMemo(() => parseReferencias(d.leituraPrincipal), [d]);
  const apoios = useMemo(() => parseReferencias(d.apoios), [d]);
  const [burst, setBurst] = useState(false);
  const scroller = useReveal([n]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [n, scroller]);

  const concluir = async () => {
    setBurst(true);
    navigator.vibrate?.(30);
    setTimeout(() => setBurst(false), 1600);
    await onConcluir();
  };

  return (
    <div ref={scroller} key={n} className="ps-sheet fixed inset-0 z-[100] overflow-y-auto bg-[#faf7f2]" style={{ "--ps-accent": t.acento, "--ps-glow": t.luz }} data-lenis-prevent>
      {burst && <Explosao />}

      {/* Céu do ato */}
      <header className="relative overflow-hidden text-white" style={{ background: `linear-gradient(160deg, ${t.ceu[0]}, ${t.ceu[1]} 50%, ${t.ceu[2]})` }}>
        {d.bloco === "A" && <div className="ps-stars" />}
        <div className="ps-aurora" />
        <div className="ps-rays" />
        <div className="relative z-10 flex items-center justify-between px-5 pt-5">
          <button onClick={onBack} aria-label="Voltar à jornada" className="p-2 -ml-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition">
            <ArrowLeft size={22} />
          </button>
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">Dia {n} de {P.days}</span>
          <span className="w-9" />
        </div>
        <div className="relative z-10 px-6 pt-8 pb-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center" style={{ color: t.luz, boxShadow: `0 0 50px -6px ${t.luz}` }}>
            <t.Icon size={30} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 mt-5">Bloco {b.id} · {b.titulo}</p>
          <h1 className="ps-display text-[2.1rem] font-semibold leading-tight mt-3">{d.titulo}</h1>
        </div>
      </header>

      <main className="relative -mt-6 rounded-t-[2rem] bg-[#faf7f2] px-5 pt-7 pb-36 max-w-2xl mx-auto">
        {/* Leitura principal com o texto */}
        <section className="ps-reveal">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-400">Leitura principal</p>
          <h2 className="ps-display text-2xl font-bold text-stone-800 mt-1">{d.leituraPrincipal}</h2>
          <div className="mt-4 space-y-5">
            {principais.map((r, i) => (
              <Passagem key={i} r={r} varios={principais.length > 1} onAbrir={() => goToBibleReference(r.ref)} />
            ))}
          </div>
        </section>

        {/* Apoios */}
        <section className="ps-reveal mt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-400">Para aprofundar</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {apoios.map((r, i) => (
              <button
                key={i}
                onClick={() => goToBibleReference(r.ref)}
                className="px-3 py-1.5 rounded-full bg-white border border-stone-200 text-sm text-stone-700 hover:border-[var(--ps-accent)] hover:text-[var(--ps-accent)] transition active:scale-95"
              >
                {rotulo(r)}
              </button>
            ))}
          </div>
        </section>

        {/* Explicação */}
        <section className="ps-reveal mt-10">
          <p className="ps-dropcap font-serif text-[1.075rem] leading-[1.85] text-stone-700 text-pretty">{d.texto}</p>
        </section>

        {/* Fonte */}
        <section className="ps-reveal mt-8 flex gap-3 rounded-2xl bg-stone-100/80 p-4">
          <Library size={18} className="text-stone-400 shrink-0 mt-0.5" />
          <p className="text-[13px] leading-relaxed text-stone-500">
            <b className="text-stone-600">Fonte: </b>
            {d.fonte}
          </p>
        </section>

        {/* Para meditar */}
        <section className="ps-reveal ps-meditar mt-8 rounded-3xl">
          <div className="rounded-3xl bg-white p-6 text-center">
            <Feather size={22} className="mx-auto" style={{ color: t.acento }} />
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-400 mt-3">Para meditar</p>
            <p className="ps-display italic text-[1.35rem] leading-snug text-stone-800 mt-3">{d.meditar}</p>
          </div>
        </section>

        {/* Concluir e navegar */}
        <div className="mt-10">
          {feito ? (
            <button onClick={onDesfazer} className="w-full py-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-bold flex items-center justify-center gap-2">
              <Check size={18} /> Dia concluído · tocar para desfazer
            </button>
          ) : (
            <button
              onClick={concluir}
              disabled={anonimo}
              className="w-full py-4 rounded-2xl text-white font-bold shadow-lg active:scale-95 transition disabled:opacity-50"
              style={{ background: `linear-gradient(90deg, ${t.ceu[1]}, ${t.acento})` }}
            >
              {anonimo ? "Entre na sua conta para salvar" : "Concluir o dia · Amém"}
            </button>
          )}
          <div className="flex justify-between mt-4">
            <button onClick={() => onIr(n - 1)} disabled={n <= 1} className="flex items-center gap-1 px-3 py-2 text-sm text-stone-500 disabled:opacity-30">
              <ChevronLeft size={18} /> Dia {n - 1 || ""}
            </button>
            <button onClick={() => onIr(n + 1)} disabled={n >= P.days} className="flex items-center gap-1 px-3 py-2 text-sm text-stone-500 disabled:opacity-30">
              Dia {n < P.days ? n + 1 : ""} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const rotulo = (r) =>
  !r.de ? `${r.livro} ${r.cap}` : r.capFim !== r.cap ? `${r.livro} ${r.cap}.${r.de}–${r.capFim}.${r.ate}` : r.ate !== r.de ? `${r.livro} ${r.cap}.${r.de}-${r.ate}` : `${r.livro} ${r.cap}.${r.de}`;

function Passagem({ r, varios, onAbrir }) {
  const [versos, setVersos] = useState(null);
  const [inteiro, setInteiro] = useState(false);
  useEffect(() => {
    let vivo = true;
    getPassage(r)
      .then((v) => vivo && setVersos(v))
      .catch(() => vivo && setVersos([]));
    return () => {
      vivo = false;
    };
  }, [r]);
  const longo = versos && versos.length > 9;

  return (
    <article className="relative rounded-3xl bg-white border border-stone-200/70 shadow-[0_8px_30px_-12px_rgba(120,53,15,0.18)] p-5">
      {varios && <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ps-accent)] mb-2">{rotulo(r)}</p>}
      <div className={`relative overflow-hidden ${longo && !inteiro ? "max-h-[22rem]" : ""}`}>
        {!versos ? (
          <div className="space-y-2 animate-pulse">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-3 rounded bg-stone-100" style={{ width: `${90 - i * 12}%` }} />)}
          </div>
        ) : versos.length === 0 ? (
          <p className="text-sm text-stone-400">Não foi possível carregar o texto. Abra na Bíblia.</p>
        ) : (
          <p className="ps-display text-[1.28rem] leading-[1.65] text-stone-800">
            {versos.map((v, i) => (
              <span key={`${v.cap}-${v.v}`} className="ps-verse" style={{ animationDelay: `${Math.min(i, 12) * 60}ms` }}>
                <sup className="font-sans text-[10px] font-bold text-[var(--ps-accent)] mr-0.5">
                  {v.v === 1 || (i === 0 && r.capFim !== r.cap) ? `${v.cap}:${v.v}` : v.v}
                </sup>
                {v.texto}{" "}
              </span>
            ))}
          </p>
        )}
        {longo && !inteiro && <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />}
      </div>
      <div className="flex items-center justify-between mt-3">
        {longo ? (
          <button onClick={() => setInteiro((x) => !x)} className="text-sm font-bold text-[var(--ps-accent)]">
            {inteiro ? "Mostrar menos" : `Ler tudo (${versos.length} versículos)`}
          </button>
        ) : <span />}
        <button onClick={onAbrir} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800">
          <BookOpen size={16} /> Abrir na Bíblia
        </button>
      </div>
    </article>
  );
}

function Explosao() {
  return (
    <div className="ps-burst" aria-hidden>
      <div className="ps-flash" />
      <i />
      <i />
      <i />
      {Array.from({ length: 14 }, (_, k) => (
        <b key={k} style={{ "--r": `${(360 / 14) * k}deg`, animationDelay: `${(k % 3) * 60}ms` }} />
      ))}
    </div>
  );
}

// ======== INTRODUÇÃO (a história inteira) ========
function Introducao({ onBack }) {
  const scroller = useReveal([]);
  return (
    <div ref={scroller} className="ps-sheet fixed inset-0 z-[100] overflow-y-auto bg-[#faf7f2]" data-lenis-prevent>
      <header className="relative overflow-hidden text-white bg-gradient-to-b from-[#05071a] via-[#1e1b4b] to-[#78350f]" style={{ "--ps-glow": "#fbbf24" }}>
        <div className="ps-stars" />
        <div className="ps-aurora" />
        <div className="relative z-10 px-5 pt-5">
          <button onClick={onBack} aria-label="Voltar" className="p-2 -ml-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition">
            <ArrowLeft size={22} />
          </button>
        </div>
        <div className="relative z-10 px-6 pt-6 pb-12 text-center">
          <ScrollText className="mx-auto text-amber-200" size={30} />
          <h1 className="ps-display text-4xl font-semibold leading-tight mt-4">Uma só história</h1>
          <p className="ps-display italic text-xl text-amber-100/90 mt-2">do decreto eterno à nova criação</p>
        </div>
      </header>
      <main className="relative -mt-6 rounded-t-[2rem] bg-[#faf7f2] px-5 pt-8 pb-24 max-w-2xl mx-auto">
        {P.intro.map((s) => (
          <section key={s.secao} className="ps-reveal mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-700/70">{s.secao}</p>
            <h2 className="ps-display text-2xl font-bold text-stone-800 leading-tight mt-1">{s.titulo}</h2>
            {s.paragrafos.map((p, i) => (
              <p key={i} className="font-serif text-[1.04rem] leading-[1.8] text-stone-700 mt-4 text-pretty">{p}</p>
            ))}
          </section>
        ))}
        {P.comoUsar && (
          <section className="ps-reveal rounded-3xl bg-amber-50 border border-amber-200/70 p-5">
            <p className="font-serif text-[1rem] leading-[1.75] text-stone-700">{P.comoUsar}</p>
          </section>
        )}
        <button onClick={onBack} className="mt-10 w-full py-4 rounded-2xl bg-stone-900 text-amber-100 font-bold">
          Ir para a jornada
        </button>
      </main>
    </div>
  );
}

function Rodape() {
  const item = "ps-details rounded-2xl bg-white/5 border border-white/10";
  const resumo = "flex items-center justify-between px-5 py-4 text-sm font-bold text-white/85";
  return (
    <div className="mt-6 space-y-3">
      <details className={item}>
        <summary className={resumo}>Sobre as tradições evangélicas <ChevronRight size={16} className="ps-chev transition-transform" /></summary>
        <div className="px-5 pb-5 space-y-3 text-[13px] leading-relaxed text-white/70">
          {P.notaTradicoes.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </details>
      <details className={item}>
        <summary className={resumo}>Referências bibliográficas <ChevronRight size={16} className="ps-chev transition-transform" /></summary>
        <div className="px-5 pb-5 space-y-4 text-[13px] leading-relaxed text-white/70">
          {P.referencias.map((g) => (
            <div key={g.grupo}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-200/80 mb-2">{g.grupo}</p>
              <ul className="space-y-2">{g.obras.map((o, i) => <li key={i}>{o}</li>)}</ul>
            </div>
          ))}
        </div>
      </details>
      <details className={item}>
        <summary className={resumo}>Notas editoriais <ChevronRight size={16} className="ps-chev transition-transform" /></summary>
        <ul className="px-5 pb-5 space-y-3 text-[13px] leading-relaxed text-white/70 list-disc ml-4">
          {P.notasEditoriais.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </details>
    </div>
  );
}
