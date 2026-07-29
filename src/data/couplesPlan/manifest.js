// Manifesto: só metadado, sem uma linha de devocional. É o que permite saber
// o total de dias e em qual fase cai o dia atual sem baixar o conteúdo de
// nenhuma fase. Com 29 fases, carregar tudo seriam ~670 KB para mostrar o
// dia 1 — o conteúdo entra sob demanda, uma fase por vez.
//
// Acrescentar uma fase: criar o arquivo e somar uma entrada aqui. O dayCount
// precisa bater com o número de dias do arquivo, senão a numeração global
// quebra em silêncio — o test_couples_plan.js confere isso.

export const PHASES = [
  {
    id: "fase1-genesis",
    title: "Fase 1 — Fundamentos",
    subtitle: "Gênesis: onde o casamento começou",
    dayCount: 30,
    load: () => import("./fase1.js").then((m) => m.FASE_1),
  },
  {
    id: "fase2-intimidade",
    title: "Fase 2 — Intimidade",
    subtitle: "Cânticos e Provérbios: desejo e sabedoria",
    dayCount: 23,
    load: () => import("./fase2.js").then((m) => m.FASE_2),
  },
];

export const totalDays = () =>
  PHASES.reduce((n, p) => n + p.dayCount, 0);

/** Em qual fase cai o dia global, e que dia é dentro dela. */
export function phaseForDay(day) {
  let startDay = 1;
  for (let i = 0; i < PHASES.length; i++) {
    const phase = PHASES[i];
    if (day < startDay + phase.dayCount) {
      return { phase, index: i, startDay, dayInPhase: day - startDay + 1 };
    }
    startDay += phase.dayCount;
  }
  // Passou do fim: devolve o último dia da última fase.
  const phase = PHASES[PHASES.length - 1];
  return {
    phase,
    index: PHASES.length - 1,
    startDay: startDay - phase.dayCount,
    dayInPhase: phase.dayCount,
  };
}

const cache = new Map();

export function loadPhase(id) {
  if (!cache.has(id)) {
    const phase = PHASES.find((p) => p.id === id);
    if (!phase) return Promise.reject(new Error(`Fase inexistente: ${id}`));
    cache.set(id, phase.load());
  }
  return cache.get(id);
}

/** Carrega só a fase que contém o dia pedido. */
export async function loadDay(day) {
  const { phase, dayInPhase, startDay, index } = phaseForDay(day);
  const content = await loadPhase(phase.id);
  return {
    ...content.days[dayInPhase - 1],
    day,
    dayInPhase,
    startDay,
    phase,
    phaseIndex: index,
  };
}

/** Todos os dias de todas as fases. Usado só por teste e conferência. */
export async function loadAllDays() {
  const all = await Promise.all(PHASES.map((p) => loadPhase(p.id)));
  const days = [];
  all.forEach((content, i) => {
    for (const d of content.days) {
      days.push({ ...d, day: days.length + 1, phase: PHASES[i] });
    }
  });
  return days;
}
