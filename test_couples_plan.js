// Confere o conteúdo do plano de casais. node test_couples_plan.js
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { BOOK_NAMES } from "./src/data/bibleBookNames.js";
import {
  PHASES,
  loadPhase,
  loadAllDays,
  loadDay,
  totalDays,
  phaseForDay,
} from "./src/data/couplesPlan/index.js";

const BIBLE = JSON.parse(
  readFileSync("./src/data/bible.json", "utf8").replace(/^\uFEFF/, "")
);
const byName = Object.fromEntries(BIBLE.map((b) => [BOOK_NAMES[b.abbrev], b]));

const dias = await loadAllDays();
assert.ok(dias.length > 0, "nenhuma fase carregada");

// 1. Manifesto x conteúdo: se o dayCount mentir, a numeração global quebra
//    em silêncio e o dia N passa a mostrar o conteúdo errado.
for (const p of PHASES) {
  const content = await loadPhase(p.id);
  assert.strictEqual(
    content.days.length,
    p.dayCount,
    `${p.id}: manifesto diz ${p.dayCount} dias, arquivo tem ${content.days.length}`
  );
}
assert.strictEqual(dias.length, totalDays(), "totalDays não bate com o conteúdo");

// 2. Numeração contínua de 1 em diante, atravessando as fases.
assert.deepStrictEqual(
  dias.map((d) => d.day),
  Array.from({ length: dias.length }, (_, i) => i + 1),
  "numeração dos dias com furo"
);

// 3. phaseForDay e loadDay batem com a lista completa, nas bordas das fases.
for (const day of [1, ...PHASES.map((_, i) =>
  PHASES.slice(0, i + 1).reduce((n, p) => n + p.dayCount, 0)
), totalDays()]) {
  const { phase, dayInPhase } = phaseForDay(day);
  const carregado = await loadDay(day);
  assert.strictEqual(carregado.phase.id, phase.id, `dia ${day}: fase errada`);
  assert.strictEqual(
    carregado.theme,
    dias[day - 1].theme,
    `dia ${day}: loadDay devolveu conteúdo diferente de loadAllDays`
  );
  assert.ok(dayInPhase >= 1, `dia ${day}: dayInPhase inválido`);
}

const capitulosUsados = [];
const temas = new Set();
const oracoes = new Set();

for (const d of dias) {
  const onde = `dia ${d.day}`;

  // 4. Os três blocos obrigatórios preenchidos.
  assert.ok(d.readings?.length > 0, `${onde}: sem leitura`);
  assert.ok(d.theme?.trim(), `${onde}: sem tema`);
  assert.ok(d.devotional?.trim(), `${onde}: sem devocional`);
  assert.ok(d.prayer?.trim(), `${onde}: sem motivo de oração`);

  // 5. Devocional dentro da faixa do contrato (110-140, com folga).
  const palavras = d.devotional.trim().split(/\s+/).length;
  assert.ok(
    palavras >= 90 && palavras <= 170,
    `${onde}: devocional com ${palavras} palavras, fora da faixa`
  );

  // 6. Tema e oração não se repetem — 700 dias de conteúdo repetido é o
  //    risco real deste plano.
  assert.ok(!temas.has(d.theme), `${onde}: tema repetido "${d.theme}"`);
  temas.add(d.theme);
  assert.ok(!oracoes.has(d.prayer), `${onde}: oração repetida`);
  oracoes.add(d.prayer);

  // 7. Toda referência resolve num capítulo real do bible.json.
  for (const ref of d.readings) {
    const i = ref.lastIndexOf(" ");
    const livro = ref.slice(0, i);
    const cap = Number(ref.slice(i + 1));
    assert.ok(byName[livro], `${onde}: livro inexistente em "${ref}"`);
    assert.ok(
      byName[livro].chapters[cap - 1],
      `${onde}: ${livro} não tem capítulo ${cap}`
    );
    capitulosUsados.push(ref);
  }
}

// 8. Nenhum capítulo repetido entre os dias.
assert.strictEqual(
  new Set(capitulosUsados).size,
  capitulosUsados.length,
  "há capítulo repetido em mais de um dia"
);

// 9. Cada livro tocado é coberto por inteiro, na ordem — sem pular capítulo.
const porLivro = {};
for (const ref of capitulosUsados) {
  const i = ref.lastIndexOf(" ");
  (porLivro[ref.slice(0, i)] ||= []).push(Number(ref.slice(i + 1)));
}
for (const [livro, caps] of Object.entries(porLivro)) {
  const total = byName[livro].chapters.length;
  assert.deepStrictEqual(
    caps,
    Array.from({ length: total }, (_, i) => i + 1),
    `${livro}: cobertura incompleta ou fora de ordem`
  );
}

console.log(
  `ok — ${PHASES.length} fases, ${dias.length} dias, ${capitulosUsados.length} capítulos`
);
console.log(
  `     livros completos: ${Object.keys(porLivro).join(", ")}`
);
