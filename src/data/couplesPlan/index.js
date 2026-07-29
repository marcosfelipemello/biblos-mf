import { FASE_1 } from "./fase1.js";

// Acrescentar uma fase é uma linha aqui + o arquivo dela. Nenhum código de
// tela muda: as fases são encadeadas e a numeração dos dias é contínua.
export const PHASES = [FASE_1];

export const COUPLES_PLAN = {
  id: "casais",
  title: "Plano para Casais",
  desc: "Leitura, devocional e oração para crescerem juntos.",
  color: "bg-rose-100 text-rose-600",
};

/** Todos os dias de todas as fases, renumerados de 1 em diante. */
export function allDays() {
  const days = [];
  for (const phase of PHASES) {
    for (const d of phase.days) {
      days.push({ ...d, day: days.length + 1, phaseId: phase.id, phaseTitle: phase.title });
    }
  }
  return days;
}

export const totalDays = () => PHASES.reduce((n, p) => n + p.days.length, 0);
