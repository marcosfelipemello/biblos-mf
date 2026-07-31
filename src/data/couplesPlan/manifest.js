// Manifesto: só metadado, sem uma linha de devocional. É o que permite saber
// o total de dias e em qual fase cai o dia atual sem baixar o conteúdo de
// nenhuma fase. Com 29 fases, carregar tudo seriam ~670 KB para mostrar o
// dia 1 — o conteúdo entra sob demanda, uma fase por vez.
//
// Acrescentar uma fase: criar o arquivo e somar uma entrada aqui. O dayCount
// precisa bater com o número de dias do arquivo, senão a numeração global
// quebra em silêncio — o test_couples_plan.js confere isso.
//
// Trilhas: uma fase pode ter conteúdo diferente para noivos e para casados, e
// isso se expressa de dois jeitos. Quando quase todo dia diverge, o `load`
// recebe a trilha e devolve outro arquivo (é o caso da Fase 2). Quando só
// alguns dias divergem, a fase declara `overrides` e um arquivo à parte traz
// apenas esses dias, mesclados por cima da base — metade dos dias de Gênesis e
// de João já serve às duas trilhas, e reescrevê-los seria trabalho jogado fora.
//
// Variantes obrigatoriamente compartilham dayCount e as mesmas referências dia
// a dia — completions guarda o número global do dia, então trilhas
// desalinhadas fariam quem troca de trilha perder o lugar. Override nunca traz
// `readings`, o que garante isso de graça.

export const TRACKS = { casados: "Casados", noivos: "Noivos" };
export const DEFAULT_TRACK = "casados";

export const PHASES = [
  {
    id: "fase1-genesis",
    title: "Fase 1 — Fundamentos",
    subtitle: "Gênesis: onde o casamento começou",
    dayCount: 30,
    load: () => import("./fase1.js").then((m) => m.FASE_1),
    overrides: {
      noivos: () => import("./fase1-noivos.js").then((m) => m.FASE_1_NOIVOS),
    },
  },
  {
    id: "fase2-intimidade",
    title: "Fase 2 — Intimidade",
    subtitle: "Cânticos e Provérbios: desejo e sabedoria",
    dayCount: 23,
    load: (track) =>
      track === "noivos"
        ? import("./fase2-noivos.js").then((m) => m.FASE_2_NOIVOS)
        : import("./fase2.js").then((m) => m.FASE_2),
  },
  {
    id: "fase3-encontro",
    title: "Fase 3 — O Encontro",
    subtitle: "João: o Deus que se aproxima",
    dayCount: 12,
    load: () => import("./fase3.js").then((m) => m.FASE_3),
    overrides: {
      noivos: () => import("./fase3-noivos.js").then((m) => m.FASE_3_NOIVOS),
    },
  },
  {
    id: "fase4-dois",
    title: "Fase 4 — Dois são melhores",
    subtitle: "Eclesiastes e Rute: o vazio e a lealdade",
    dayCount: 9,
    load: (track) =>
      track === "noivos"
        ? import("./fase4-noivos.js").then((m) => m.FASE_4_NOIVOS)
        : import("./fase4.js").then((m) => m.FASE_4),
  },
  {
    id: "fase5-oracao-1",
    title: "Fase 5 — Oração I",
    subtitle: "Salmos 1—50: aprender a falar com Deus",
    dayCount: 29,
    load: () => import("./fase5.js").then((m) => m.FASE_5),
    overrides: {
      noivos: () => import("./fase5-noivos.js").then((m) => m.FASE_5_NOIVOS),
    },
  },
  {
    id: "fase6-libertacao",
    title: "Fase 6 — Libertação",
    subtitle: "Êxodo: sair do Egito e tirar o Egito de dentro",
    dayCount: 24,
    load: () => import("./fase6.js").then((m) => m.FASE_6),
    overrides: {
      noivos: () => import("./fase6-noivos.js").then((m) => m.FASE_6_NOIVOS),
    },
  },
  {
    id: "fase7-rei-serve",
    title: "Fase 7 — O Rei que serve",
    subtitle: "Marcos: o Deus que veio para servir",
    dayCount: 9,
    load: () => import("./fase7.js").then((m) => m.FASE_7),
    overrides: {
      noivos: () => import("./fase7-noivos.js").then((m) => m.FASE_7_NOIVOS),
    },
  },
  {
    id: "fase8-oracao-2",
    title: "Fase 8 — Oração II",
    subtitle: "Salmos 51—100: confissão, escuridão e volta",
    dayCount: 29,
    load: () => import("./fase8.js").then((m) => m.FASE_8),
    overrides: {
      noivos: () => import("./fase8-noivos.js").then((m) => m.FASE_8_NOIVOS),
    },
  },
  {
    id: "fase9-chamado-espera",
    title: "Fase 9 — Chamado e espera",
    subtitle: "1 Samuel: ser escolhido não encurta a espera",
    dayCount: 18,
    load: () => import("./fase9.js").then((m) => m.FASE_9),
    overrides: {
      noivos: () => import("./fase9-noivos.js").then((m) => m.FASE_9_NOIVOS),
    },
  },
  {
    id: "fase10-igreja-nasce",
    title: "Fase 10 — A Igreja nasce",
    subtitle: "Atos: a comunidade que cresceu doendo",
    dayCount: 16,
    load: () => import("./fase10.js").then((m) => m.FASE_10),
    overrides: {
      noivos: () => import("./fase10-noivos.js").then((m) => m.FASE_10_NOIVOS),
    },
  },
  {
    id: "fase11-poder-queda",
    title: "Fase 11 — Poder e queda",
    subtitle: "2 Samuel: o que o poder faz com quem Deus escolheu",
    dayCount: 14,
    load: () => import("./fase11.js").then((m) => m.FASE_11),
    overrides: {
      noivos: () => import("./fase11-noivos.js").then((m) => m.FASE_11_NOIVOS),
    },
  },
  {
    id: "fase12-oracao-3",
    title: "Fase 12 — Oração III",
    subtitle: "Salmos 101—150: a casa, a mesa e o louvor final",
    dayCount: 29,
    load: () => import("./fase12.js").then((m) => m.FASE_12),
    overrides: {
      noivos: () => import("./fase12-noivos.js").then((m) => m.FASE_12_NOIVOS),
    },
  },
  {
    id: "fase13-graca",
    title: "Fase 13 — Graça",
    subtitle: "Romanos e Gálatas: por que nada disso se compra",
    dayCount: 13,
    load: () => import("./fase13.js").then((m) => m.FASE_13),
    overrides: {
      noivos: () => import("./fase13-noivos.js").then((m) => m.FASE_13_NOIVOS),
    },
  },
  {
    id: "fase14-casa-crista",
    title: "Fase 14 — A casa cristã",
    subtitle: "Cartas de Paulo: como se vive dentro de casa",
    dayCount: 13,
    load: () => import("./fase14.js").then((m) => m.FASE_14),
    overrides: {
      noivos: () => import("./fase14-noivos.js").then((m) => m.FASE_14_NOIVOS),
    },
  },
  {
    id: "fase15-quando-doi",
    title: "Fase 15 — Quando dói",
    subtitle: "Jó: o sofrimento que não recebe explicação",
    dayCount: 25,
    load: () => import("./fase15.js").then((m) => m.FASE_15),
    overrides: {
      noivos: () => import("./fase15-noivos.js").then((m) => m.FASE_15_NOIVOS),
    },
  },
  {
    id: "fase16-compaixao",
    title: "Fase 16 — Compaixão",
    subtitle: "Lucas: o evangelho de quem está no chão",
    dayCount: 14,
    load: () => import("./fase16.js").then((m) => m.FASE_16),
    overrides: {
      noivos: () => import("./fase16-noivos.js").then((m) => m.FASE_16_NOIVOS),
    },
  },
  {
    id: "fase17-amor-pratica",
    title: "Fase 17 — Amor na prática",
    subtitle: "1 e 2 Coríntios: a igreja mais problemática do Novo Testamento",
    dayCount: 17,
    load: () => import("./fase17.js").then((m) => m.FASE_17),
    overrides: {
      noivos: () => import("./fase17-noivos.js").then((m) => m.FASE_17_NOIVOS),
    },
  },
  {
    id: "fase18-escolhas-herancas",
    title: "Fase 18 — Escolhas e heranças",
    subtitle: "1 e 2 Reis: o desmoronamento que levou trezentos anos",
    dayCount: 28,
    load: () => import("./fase18.js").then((m) => m.FASE_18),
    overrides: {
      noivos: () => import("./fase18-noivos.js").then((m) => m.FASE_18_NOIVOS),
    },
  },
  {
    id: "fase19-rei-reino",
    title: "Fase 19 — O Rei e o Reino",
    subtitle: "Mateus: o Rei que ensina como se vive",
    dayCount: 18,
    load: () => import("./fase19.js").then((m) => m.FASE_19),
    overrides: {
      noivos: () => import("./fase19-noivos.js").then((m) => m.FASE_19_NOIVOS),
    },
  },
  {
    id: "fase20-santo-israel",
    title: "Fase 20 — O Santo de Israel",
    subtitle: "Isaías 1—39: o profeta que via o Rei e a política ao mesmo tempo",
    dayCount: 20,
    load: () => import("./fase20.js").then((m) => m.FASE_20),
    overrides: {
      noivos: () => import("./fase20-noivos.js").then((m) => m.FASE_20_NOIVOS),
    },
  },
  {
    id: "fase21-fe-aguenta",
    title: "Fase 21 — Fé que aguenta",
    subtitle: "Hebreus e Tiago: não voltar atrás e não fingir",
    dayCount: 13,
    load: () => import("./fase21.js").then((m) => m.FASE_21),
    overrides: {
      noivos: () => import("./fase21-noivos.js").then((m) => m.FASE_21_NOIVOS),
    },
  },
  {
    id: "fase22-consolo",
    title: "Fase 22 — Consolo",
    subtitle: "Isaías 40—66: o Servo, o consolo e o nome novo",
    dayCount: 16,
    load: () => import("./fase22.js").then((m) => m.FASE_22),
    overrides: {
      noivos: () => import("./fase22-noivos.js").then((m) => m.FASE_22_NOIVOS),
    },
  },
  {
    id: "fase23-cartas-finais",
    title: "Fase 23 — Cartas finais",
    subtitle: "De 1 Timóteo a Judas: instruções de quem já estava se despedindo",
    dayCount: 20,
    load: () => import("./fase23.js").then((m) => m.FASE_23),
    overrides: {
      noivos: () => import("./fase23-noivos.js").then((m) => m.FASE_23_NOIVOS),
    },
  },
  {
    id: "fase24-terra-vazio",
    title: "Fase 24 — A terra e o vazio",
    subtitle: "Josué e Juízes: receber a promessa e esquecer de quem ela veio",
    dayCount: 28,
    load: () => import("./fase24.js").then((m) => m.FASE_24),
    overrides: {
      noivos: () => import("./fase24-noivos.js").then((m) => m.FASE_24_NOIVOS),
    },
  },
  {
    id: "fase25-a-lei",
    title: "Fase 25 — A Lei",
    subtitle:
      "Levítico, Números e Deuteronômio: como se aprende a viver perto de Deus",
    dayCount: 48,
    load: () => import("./fase25.js").then((m) => m.FASE_25),
    overrides: {
      noivos: () => import("./fase25-noivos.js").then((m) => m.FASE_25_NOIVOS),
    },
  },
  {
    id: "fase26-a-volta",
    title: "Fase 26 — A volta",
    subtitle:
      "Crônicas, Esdras, Neemias e Ester: recomeçar sobre ruína conhecida",
    dayCount: 48,
    load: () => import("./fase26.js").then((m) => m.FASE_26),
    overrides: {
      noivos: () => import("./fase26-noivos.js").then((m) => m.FASE_26_NOIVOS),
    },
  },
  {
    id: "fase27-profeta-chorou",
    title: "Fase 27 — O profeta que chorou",
    subtitle: "Jeremias e Lamentações: dizer a verdade sem ser ouvido",
    dayCount: 33,
    load: () => import("./fase27.js").then((m) => m.FASE_27),
    overrides: {
      noivos: () => import("./fase27-noivos.js").then((m) => m.FASE_27_NOIVOS),
    },
  },
  {
    id: "fase28-visoes-exilio",
    title: "Fase 28 — Visões no exílio",
    subtitle: "Ezequiel e Daniel: ver a glória longe de casa",
    dayCount: 35,
    load: () => import("./fase28.js").then((m) => m.FASE_28),
    overrides: {
      noivos: () => import("./fase28-noivos.js").then((m) => m.FASE_28_NOIVOS),
    },
  },
  {
    id: "fase29-ate-o-fim",
    title: "Fase 29 — Até o fim",
    subtitle: "Os doze profetas e Apocalipse: a última palavra é um convite",
    dayCount: 50,
    load: () => import("./fase29.js").then((m) => m.FASE_29),
    overrides: {
      noivos: () => import("./fase29-noivos.js").then((m) => m.FASE_29_NOIVOS),
    },
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

export function loadPhase(id, track = DEFAULT_TRACK) {
  const key = `${id}:${track}`;
  if (!cache.has(key)) {
    const phase = PHASES.find((p) => p.id === id);
    if (!phase) return Promise.reject(new Error(`Fase inexistente: ${id}`));
    cache.set(key, mesclar(phase, track));
  }
  return cache.get(key);
}

/** Base da fase com o override da trilha aplicado por cima, dia a dia. */
async function mesclar(phase, track) {
  const base = await phase.load(track);
  if (!phase.overrides?.[track]) return base;
  const patch = await phase.overrides[track]();
  return {
    ...base,
    days: base.days.map((d, i) => (patch[i + 1] ? { ...d, ...patch[i + 1] } : d)),
  };
}

/** Carrega só a fase que contém o dia pedido. */
export async function loadDay(day, track = DEFAULT_TRACK) {
  const { phase, dayInPhase, startDay, index } = phaseForDay(day);
  const content = await loadPhase(phase.id, track);
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
export async function loadAllDays(track = DEFAULT_TRACK) {
  const all = await Promise.all(PHASES.map((p) => loadPhase(p.id, track)));
  const days = [];
  all.forEach((content, i) => {
    for (const d of content.days) {
      days.push({ ...d, day: days.length + 1, phase: PHASES[i] });
    }
  });
  return days;
}
