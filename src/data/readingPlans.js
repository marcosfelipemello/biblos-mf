import { BIBLE_CHAPTER_COUNTS } from "./bibleStructure.js";

const OT = Object.keys(BIBLE_CHAPTER_COUNTS).slice(0, 39);
const NT = Object.keys(BIBLE_CHAPTER_COUNTS).slice(39);

const PAULO = [
  "Romanos",
  "1 Coríntios",
  "2 Coríntios",
  "Gálatas",
  "Efésios",
  "Filipenses",
  "Colossenses",
  "1 Tessalonicenses",
  "2 Tessalonicenses",
  "1 Timóteo",
  "2 Timóteo",
  "Tito",
  "Filemom",
];

// Planos gerados: só metadado + livros. O cronograma sai do
// BIBLE_CHAPTER_COUNTS, nenhuma lista de capítulos é escrita à mão.
export const READING_PLANS = [
  {
    id: "evangelhos-30",
    title: "Evangelhos em 30 dias",
    desc: "A vida de Jesus em um mês.",
    level: "Iniciante",
    days: 30,
    books: ["Mateus", "Marcos", "Lucas", "João"],
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: "proverbios-31",
    title: "Provérbios em 31 dias",
    desc: "Um capítulo por dia, do jeito que foi escrito.",
    level: "Iniciante",
    days: 31,
    books: ["Provérbios"],
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "salmos-30",
    title: "Salmos em 30 dias",
    desc: "Cinco salmos por dia, o mês inteiro.",
    level: "Iniciante",
    days: 30,
    books: ["Salmos"],
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "nt-90",
    title: "Novo Testamento em 90 dias",
    desc: "De Mateus a Apocalipse em três meses.",
    level: "Intermediário",
    days: 90,
    books: NT,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "paulo-30",
    title: "Cartas de Paulo",
    desc: "As treze cartas, de Romanos a Filemom.",
    level: "Intermediário",
    days: 30,
    books: PAULO,
    color: "bg-rose-100 text-rose-600",
  },
  {
    id: "pentateuco-60",
    title: "Pentateuco em 60 dias",
    desc: "Os cinco livros de Moisés.",
    level: "Intermediário",
    days: 60,
    books: ["Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio"],
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "biblia-2anos",
    title: "Bíblia em 2 anos",
    desc: "Um a dois capítulos por dia. O ritmo que se sustenta.",
    level: "Avançado",
    days: 730,
    books: [...OT, ...NT],
    color: "bg-teal-100 text-teal-600",
  },
  {
    id: "biblia-1ano",
    title: "Bíblia em 1 ano",
    desc: "Os 1189 capítulos, do Gênesis ao Apocalipse.",
    level: "Avançado",
    days: 365,
    books: [...OT, ...NT],
    color: "bg-slate-200 text-slate-700",
  },
];

export const getPlan = (id) => READING_PLANS.find((p) => p.id === id);

/** Todos os capítulos dos livros, em ordem: ["Gênesis 1", "Gênesis 2", ...] */
export function listChapters(books) {
  const refs = [];
  for (const book of books) {
    const total = BIBLE_CHAPTER_COUNTS[book];
    if (!total) throw new Error(`Livro desconhecido no plano: ${book}`);
    for (let c = 1; c <= total; c++) refs.push(`${book} ${c}`);
  }
  return refs;
}

/**
 * Distribui os capítulos pelos dias o mais uniformemente possível. Os dias
 * iniciais recebem o capítulo extra quando a divisão não é exata, então
 * nenhum dia fica vazio e o último dia nunca fica sobrecarregado.
 */
export function buildSchedule(plan) {
  const refs = listChapters(plan.books);
  const days = Math.min(plan.days, refs.length);
  const base = Math.floor(refs.length / days);
  const extra = refs.length % days;

  const schedule = [];
  let i = 0;
  for (let d = 0; d < days; d++) {
    const size = base + (d < extra ? 1 : 0);
    schedule.push({ day: d + 1, readings: refs.slice(i, i + size) });
    i += size;
  }
  return schedule;
}
