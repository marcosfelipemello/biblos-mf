import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RotateCcw,
  Heart,
} from "lucide-react";
import { READING_PLANS, getPlan, buildSchedule } from "../data/readingPlans";
import { useReadingPlan } from "../hooks/useReadingPlan";
import CouplesPlan from "./CouplesPlan";
import SalvationPlan from "./SalvationPlan";
import { PLANO_SALVACAO } from "../data/planoSalvacao";

export default function ReadingPlans({ user, onBack, goToBibleReference }) {
  const [selectedId, setSelectedId] = useState(null);
  const plans = useReadingPlan(user);

  if (selectedId === "casais") {
    return (
      <CouplesPlan
        user={user}
        onBack={() => setSelectedId(null)}
        goToBibleReference={goToBibleReference}
      />
    );
  }

  if (selectedId === PLANO_SALVACAO.id) {
    return (
      <SalvationPlan
        user={user}
        state={plans.progress[PLANO_SALVACAO.id]}
        onBack={() => setSelectedId(null)}
        goToBibleReference={goToBibleReference}
        {...plans}
      />
    );
  }

  if (selectedId) {
    return (
      <PlanDetail
        plan={getPlan(selectedId)}
        state={plans.progress[selectedId]}
        onBack={() => setSelectedId(null)}
        goToBibleReference={goToBibleReference}
        {...plans}
      />
    );
  }

  return (
    <Catalog
      progress={plans.progress}
      onOpen={setSelectedId}
      onBack={onBack}
    />
  );
}

// ======== CATÁLOGO ========
function Catalog({ progress, onOpen, onBack }) {
  return (
    <div className="fixed inset-0 lg:left-72 z-[100] bg-slate-50 overflow-y-auto animate-slide-up" data-lenis-prevent>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center gap-3 border-b border-slate-200/50 z-10 lg:px-10 lg:py-5">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors lg:cursor-pointer"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Planos de Leitura</h2>
      </div>

      <div className="p-4 pb-32 space-y-3 lg:max-w-5xl lg:mx-auto lg:p-8 lg:pb-24 lg:space-y-6">
        {/* Destaques lado a lado no desktop */}
        <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-5">
          {/* Destaque: Plano da Salvação */}
          <button
            onClick={() => onOpen(PLANO_SALVACAO.id)}
            className="w-full relative overflow-hidden rounded-3xl p-5 lg:p-7 text-left text-white bg-gradient-to-br from-[#0b1026] via-[#312e81] to-[#92400e] shadow-[0_12px_40px_-12px_rgba(146,64,14,0.6)] active:scale-[0.98] transition-all duration-300 group lg:hover:shadow-2xl lg:hover:-translate-y-0.5 lg:cursor-pointer"
          >
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-amber-400/30 blur-3xl" />
            <div className="absolute inset-0 opacity-60 bg-[radial-gradient(1px_1px_at_20px_30px,#fff,transparent),radial-gradient(1px_1px_at_120px_70px,#fff,transparent),radial-gradient(1.5px_1.5px_at_220px_20px,#fde68a,transparent),radial-gradient(1px_1px_at_280px_90px,#fff,transparent)]" />
            <div className="relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                30 dias · especial
              </span>
              <h3 className="font-serif text-2xl lg:text-3xl font-bold leading-tight mt-2">Plano da Salvação</h3>
              <p className="font-serif italic text-amber-100/90 text-sm lg:text-base">{PLANO_SALVACAO.subtitulo}</p>
              <p className="text-indigo-100/70 text-xs lg:text-sm mt-1.5">{PLANO_SALVACAO.desc}</p>
              {progress[PLANO_SALVACAO.id] && (
                <div className="mt-3 h-1.5 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-200 to-amber-400 rounded-full"
                    style={{ width: `${Math.round(((progress[PLANO_SALVACAO.id].completedDays?.length || 0) / PLANO_SALVACAO.days) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </button>

          {/* Destaque: plano para casais */}
          <button
            onClick={() => onOpen("casais")}
            className="w-full relative overflow-hidden bg-gradient-to-br from-rose-50 to-orange-50 p-5 lg:p-7 rounded-3xl border border-rose-100 text-left active:scale-[0.98] hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300 group lg:hover:shadow-xl lg:hover:-translate-y-0.5 lg:cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100/40 rounded-full blur-2xl -translate-y-8 translate-x-8" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Heart size={22} fill="currentColor" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-widest bg-rose-500 text-white px-2 py-0.5 rounded-full">
                  A dois
                </span>
                <h3 className="font-bold text-slate-800 leading-tight mt-1.5 lg:text-xl">
                  Plano para Casais
                </h3>
                <p className="text-slate-500 text-xs lg:text-sm mt-0.5">
                  Leitura, devocional e oração para crescerem juntos.
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mt-1.5">
                  Contas separadas • progresso compartilhado
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Grade de 2 colunas para os planos regulares */}
        <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
          {READING_PLANS.map((plan) => {
            const state = progress[plan.id];
            const pct = state
              ? Math.round(((state.completedDays?.length || 0) / plan.days) * 100)
              : 0;

            return (
              <button
                key={plan.id}
                onClick={() => onOpen(plan.id)}
                className="w-full bg-white p-4 lg:p-5 rounded-3xl shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100 text-left active:scale-[0.98] hover:shadow-lg transition-all duration-300 group lg:hover:shadow-xl lg:hover:border-amber-200 lg:hover:-translate-y-0.5 lg:cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl ${plan.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <Calendar size={22} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800 leading-tight lg:text-base">
                        {plan.title}
                      </h3>
                      {state && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                          Em andamento
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs lg:text-sm mt-0.5">{plan.desc}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mt-1.5">
                      {plan.days} dias • {plan.level}
                    </p>

                    {state && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                          Dia {state.currentDay} de {plan.days} • {pct}% concluído
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ======== TELA DO PLANO ========
function PlanDetail({
  plan,
  state,
  onBack,
  goToBibleReference,
  startPlan,
  completeDay,
  uncompleteDay,
  goToDay,
  resetPlan,
}) {
  const schedule = useMemo(() => buildSchedule(plan), [plan]);

  if (!state) {
    return (
      <PlanIntro
        plan={plan}
        schedule={schedule}
        onBack={onBack}
        onStart={() => startPlan(plan.id)}
      />
    );
  }

  const day = Math.min(state.currentDay || 1, schedule.length);
  const today = schedule[day - 1];
  const completed = state.completedDays || [];
  const isDone = completed.includes(day);
  const pct = Math.round((completed.length / schedule.length) * 100);

  return (
    <div className="fixed inset-0 lg:left-72 z-[100] bg-slate-50 overflow-y-auto animate-slide-up" data-lenis-prevent>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-slate-200/50 z-10 lg:px-10 lg:py-5">
        <div className="flex items-center gap-3 lg:max-w-4xl lg:mx-auto">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors lg:cursor-pointer"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-base lg:text-xl font-bold text-slate-800 flex-1 truncate">
            {plan.title}
          </h2>
          <button
            onClick={() => {
              if (window.confirm("Recomeçar o plano do dia 1?"))
                resetPlan(plan.id);
            }}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors lg:cursor-pointer"
            title="Recomeçar"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="mt-3 lg:max-w-4xl lg:mx-auto">
          <div className="h-1.5 lg:h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] lg:text-xs text-slate-400 mt-1 font-medium">
            {completed.length} de {schedule.length} dias • {pct}%
          </p>
        </div>
      </div>

      <div className="p-6 pb-32 lg:max-w-4xl lg:mx-auto lg:p-10 lg:pb-24">
        {/* Navegação de dias */}
        <div className="flex items-center justify-between mb-6 lg:mb-8 lg:max-w-md lg:mx-auto">
          <button
            onClick={() => goToDay(plan.id, day - 1)}
            disabled={day === 1}
            className="p-2 lg:p-3 rounded-full bg-white border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all lg:cursor-pointer"
          >
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <div className="text-center">
            <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-amber-600">
              Dia {day} de {schedule.length}
            </span>
          </div>
          <button
            onClick={() => goToDay(plan.id, day + 1)}
            disabled={day === schedule.length}
            className="p-2 lg:p-3 rounded-full bg-white border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all lg:cursor-pointer"
          >
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>

        {/* Leituras do dia em grade no desktop */}
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
          Leitura de hoje
        </h3>
        <div className="space-y-2 mb-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
          {today.readings.map((ref) => (
            <button
              key={ref}
              onClick={() => goToBibleReference(ref)}
              className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-amber-200 hover:shadow-md transition-all group text-left active:scale-[0.98] lg:cursor-pointer"
            >
              <BookOpen
                size={18}
                className="text-amber-500 shrink-0 group-hover:scale-110 transition-transform"
              />
              <span className="font-serif font-bold text-slate-700 flex-1 lg:text-lg">
                {ref}
              </span>
              <ChevronRight
                size={16}
                className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all"
              />
            </button>
          ))}
        </div>

        <div className="lg:max-w-md lg:mx-auto">
          <button
            onClick={() => completeDay(plan.id, day, schedule.length)}
            disabled={isDone}
            className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 lg:cursor-pointer ${
              isDone
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10"
            }`}
          >
            {isDone ? (
              <>
                <Check size={20} /> Dia concluído
              </>
            ) : (
              "Marcar como lido"
            )}
          </button>

          {/* Marcar sem querer é fácil, e aqui o dia já avança junto. */}
          {isDone && (
            <button
              onClick={() => uncompleteDay(plan.id, day)}
              className="w-full mt-2 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 lg:cursor-pointer"
            >
              Desfazer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ======== INTRO (plano ainda não iniciado) ========
function PlanIntro({ plan, schedule, onBack, onStart }) {
  const porDia = schedule[0]?.readings.length || 0;
  const total = schedule.reduce((n, d) => n + d.readings.length, 0);

  return (
    <div className="fixed inset-0 lg:left-72 z-[100] bg-white overflow-y-auto animate-slide-up lg:bg-slate-50 lg:flex lg:items-center lg:justify-center" data-lenis-prevent>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center gap-3 z-10 lg:hidden">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="px-6 pb-32 text-center lg:bg-white lg:p-10 lg:rounded-3xl lg:border lg:border-slate-100 lg:shadow-xl lg:max-w-md lg:mx-auto lg:pb-10 relative">
        <button
          onClick={onBack}
          className="hidden lg:flex absolute top-6 left-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors lg:cursor-pointer"
          title="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <div
          className={`w-20 h-20 rounded-3xl ${plan.color} flex items-center justify-center mx-auto mb-6`}
        >
          <Calendar size={36} />
        </div>

        <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">
          {plan.title}
        </h2>
        <p className="text-slate-500 mb-8 leading-relaxed max-w-xs mx-auto">
          {plan.desc}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: "Dias", value: plan.days },
            { label: "Capítulos", value: total },
            { label: "Por dia", value: `~${porDia}` },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-slate-50 rounded-2xl p-4 border border-slate-100"
            >
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 active:scale-95 lg:cursor-pointer"
        >
          Começar agora
        </button>
        <p className="text-[11px] text-slate-400 mt-3">
          O dia 1 começa hoje, no seu ritmo.
        </p>
      </div>
    </div>
  );
}
