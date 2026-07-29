// Confere o conteúdo do plano de casais. node test_couples_plan.js
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { BOOK_NAMES } from "./src/data/bibleBookNames.js";
import { PHASES, allDays, totalDays } from "./src/data/couplesPlan/index.js";

const BIBLE = JSON.parse(
  readFileSync("./src/data/bible.json", "utf8").replace(/^﻿/, "")
);
const byName = Object.fromEntries(BIBLE.map((b) => [BOOK_NAMES[b.abbrev], b]));

const dias = allDays();
assert.ok(PHASES.length >= 1, "nenhuma fase carregada");
assert.strictEqual(dias.length, totalDays(), "totalDays não bate com allDays");

// 1. Numeração contínua de 1 em diante, atravessando as fases.
assert.deepStrictEqual(
  dias.map((d) => d.day),
  Array.from({ length: dias.length }, (_, i) => i + 1),
  "numeração dos dias com furo"
);

const capitulosUsados = [];

for (const d of dias) {
  const onde = `dia ${d.day}`;

  // 2. Todo dia tem os três blocos preenchidos — é o contrato do plano.
  assert.ok(d.readings?.length > 0, `${onde}: sem leitura`);
  assert.ok(d.theme?.trim(), `${onde}: sem tema`);
  assert.ok(d.devotional?.trim(), `${onde}: sem devocional`);
  assert.ok(d.prayer?.trim(), `${onde}: sem motivo de oração`);

  // 3. Devocional com corpo de verdade, não placeholder.
  const palavras = d.devotional.trim().split(/\s+/).length;
  assert.ok(
    palavras >= 60,
    `${onde}: devocional curto demais (${palavras} palavras)`
  );

  // 4. Toda referência resolve num capítulo real do bible.json.
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

// 5. Nenhum capítulo repetido entre os dias.
assert.strictEqual(
  new Set(capitulosUsados).size,
  capitulosUsados.length,
  "há capítulo repetido em mais de um dia"
);

// 6. A Fase 1 cobre Gênesis inteiro, sem pular capítulo.
const genesis = capitulosUsados.filter((r) => r.startsWith("Gênesis "));
assert.deepStrictEqual(
  genesis,
  Array.from({ length: 50 }, (_, i) => `Gênesis ${i + 1}`),
  "Fase 1 não cobre Gênesis 1-50 na ordem"
);

console.log(
  `ok — ${PHASES.length} fase(s), ${dias.length} dias, ${capitulosUsados.length} capítulos, sem repetição nem furo`
);
