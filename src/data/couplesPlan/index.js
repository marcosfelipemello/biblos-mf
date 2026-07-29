// Metadado do plano fica leve e estático; o conteúdo das fases entra por
// import dinâmico, como os hinários e o knowledgeBase. Com muitas fases o
// texto passa de meio mega, e ele não pode pesar no bundle principal.

export const COUPLES_PLAN = {
  id: "casais",
  title: "Plano para Casais",
  desc: "Leitura, devocional e oração para crescerem juntos.",
  color: "bg-rose-100 text-rose-600",
};

// Acrescentar uma fase é uma linha aqui + o arquivo dela.
const PHASE_LOADERS = [
  () => import("./fase1.js").then((m) => m.FASE_1),
];

let cache;

/** Todos os dias de todas as fases, renumerados de 1 em diante. */
export async function loadDays() {
  if (cache) return cache;

  const phases = await Promise.all(PHASE_LOADERS.map((load) => load()));
  const days = [];
  for (const phase of phases) {
    for (const d of phase.days) {
      days.push({
        ...d,
        day: days.length + 1,
        phaseId: phase.id,
        phaseTitle: phase.title,
      });
    }
  }

  cache = days;
  return days;
}
