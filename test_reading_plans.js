// Confere os cronogramas gerados. node test_reading_plans.js
import assert from "node:assert";
import { BIBLE_CHAPTER_COUNTS } from "./src/data/bibleStructure.js";
import {
  READING_PLANS,
  buildSchedule,
  listChapters,
} from "./src/data/readingPlans.js";

assert.ok(READING_PLANS.length >= 8, "esperado ao menos 8 planos");

const ids = READING_PLANS.map((p) => p.id);
assert.strictEqual(new Set(ids).size, ids.length, "id de plano duplicado");

for (const plan of READING_PLANS) {
  const esperado = listChapters(plan.books);
  const schedule = buildSchedule(plan);
  const lidos = schedule.flatMap((d) => d.readings);

  // 1. Cobre tudo, na ordem, sem pular e sem repetir.
  assert.deepStrictEqual(
    lidos,
    esperado,
    `${plan.id}: cronograma não bate com os capítulos dos livros`
  );

  // 2. A soma bate com a estrutura da Bíblia.
  const totalLivros = plan.books.reduce(
    (n, b) => n + BIBLE_CHAPTER_COUNTS[b],
    0
  );
  assert.strictEqual(
    lidos.length,
    totalLivros,
    `${plan.id}: ${lidos.length} capítulos no plano, ${totalLivros} nos livros`
  );

  // 3. Nenhum dia vazio.
  for (const d of schedule) {
    assert.ok(
      d.readings.length > 0,
      `${plan.id}: dia ${d.day} sem leitura`
    );
  }

  // 4. Numeração dos dias contínua a partir de 1.
  assert.deepStrictEqual(
    schedule.map((d) => d.day),
    Array.from({ length: schedule.length }, (_, i) => i + 1),
    `${plan.id}: numeração dos dias com furo`
  );

  // 5. Carga equilibrada: o dia mais cheio excede o mais vazio em no máximo 1.
  const tamanhos = schedule.map((d) => d.readings.length);
  assert.ok(
    Math.max(...tamanhos) - Math.min(...tamanhos) <= 1,
    `${plan.id}: distribuição desequilibrada (${Math.min(...tamanhos)}..${Math.max(...tamanhos)})`
  );

  console.log(
    `ok  ${plan.id.padEnd(16)} ${String(lidos.length).padStart(4)} cap. em ${String(schedule.length).padStart(3)} dias  (${Math.min(...tamanhos)}-${Math.max(...tamanhos)}/dia)`
  );
}

// Livro inexistente tem que explodir, não passar batido.
assert.throws(
  () => listChapters(["Livro Que Não Existe"]),
  /Livro desconhecido/,
  "livro inválido deveria lançar erro"
);

console.log(`\nok — ${READING_PLANS.length} planos conferidos`);
