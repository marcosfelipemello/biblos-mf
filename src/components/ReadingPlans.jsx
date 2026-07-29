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
    <div className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto animate-slide-up" data-lenis-prevent>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center gap-3 border-b border-slate-200/50 z-10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-xl font-bold text-slate-800">Planos de Leitura</h2>
      </div>

      <div className="p-4 pb-32 space-y-3">
        {/* Destaque: plano para casais */}
        <button
          onClick={() => onOpen("casais")}
          className="w-full relative overflow-hidden bg-gradient-to-br from-rose-50 to-orange-50 p-5 rounded-3xl border border-rose-100 text-left active:scale-[0.98] hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300 group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100/40 rounded-full blur-2xl -translate-y-8 translate-x-8" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Heart size={22} fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-widest bg-rose-500 text-white px-2 py-0.5 rounded-full">
                A dois
              </span>
              <h3 className="font-bold text-slate-800 leading-tight mt-1.5">
                Plano para Casais
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Leitura, devocional e oração para crescerem juntos.
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mt-1.5">
                Contas separadas • progresso compartilhado
              </p>
            </div>
          </div>
        </button>

        {READING_PLANS.map((plan) => {
          const state = progress[plan.id];
          const pct = state
            ? Math.round(((state.completedDays?.length || 0) / plan.days) * 100)
            : 0;

          return (
            <button
              key={plan.id}
              onClick={() => onOpen(plan.id)}
              className="w-full bg-white p-4 rounded-3xl shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100 text-left active:scale-[0.98] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <Calendar size={22} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-800 leading-tight">
                      {plan.title}
                    </h3>
                    {state && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                        Em andamento
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{plan.desc}</p>
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
    <div className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto animate-slide-up" data-lenis-prevent>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-slate-200/50 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-base font-bold text-slate-800 flex-1 truncate">
            {plan.title}
          </h2>
          <button
            onClick={() => {
              if (window.confirm("Recomeçar o plano do dia 1?"))
                resetPlan(plan.id);
            }}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors"
            title="Recomeçar"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="mt-3">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {completed.length} de {schedule.length} dias • {pct}%
          </p>
        </div>
      </div>

      <div className="p-6 pb-32">
        {/* Navegação de dias */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => goToDay(plan.id, day - 1)}
            disabled={day === 1}
            className="p-2 rounded-full bg-white border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
              Dia {day} de {schedule.length}
            </span>
          </div>
          <button
            onClick={() => goToDay(plan.id, day + 1)}
            disabled={day === schedule.length}
            className="p-2 rounded-full bg-white border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
          >
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>

        {/* Leituras do dia */}
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
          Leitura de hoje
        </h3>
        <div className="space-y-2 mb-8">
          {today.readings.map((ref) => (
            <button
              key={ref}
              onClick={() => goToBibleReference(ref)}
              className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-amber-200 hover:shadow-md transition-all group text-left active:scale-[0.98]"
            >
              <BookOpen
                size={18}
                className="text-amber-500 shrink-0 group-hover:scale-110 transition-transform"
              />
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

        <button
          onClick={() => completeDay(plan.id, day, schedule.length)}
          disabled={isDone}
          className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
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
      </div>
    </div>
  );
}

// ======== INTRO (plano ainda não iniciado) ========
function PlanIntro({ plan, schedule, onBack, onStart }) {
  const porDia = schedule[0]?.readings.length || 0;
  const total = schedule.reduce((n, d) => n + d.readings.length, 0);

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-slide-up" data-lenis-prevent>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center gap-3 z-10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="px-6 pb-32 text-center">
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
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 active:scale-95"
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
