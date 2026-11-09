// Confere o Plano da Salvação (texto do PDF do Marcos). node test_plano_salvacao.js
import assert from "node:assert";
import { createRequire } from "node:module";
import { PLANO_SALVACAO as P, parseReferencias } from "./src/data/planoSalvacao.js";
import { BIBLE_CHAPTER_COUNTS } from "./src/data/bibleStructure.js";
import { getPlan, buildSchedule } from "./src/data/readingPlans.js";

const bible = createRequire(import.meta.url)("./src/data/bible.json");
const LIVROS = Object.keys(BIBLE_CHAPTER_COUNTS);

assert.strictEqual(getPlan(P.id), P, "getPlan precisa achar o plano (aviso de plano parado)");
assert.strictEqual(buildSchedule(P), P.schedule);
assert.deepStrictEqual(P.schedule.map((d) => d.day), Array.from({ length: 30 }, (_, i) => i + 1));
assert.deepStrictEqual(P.blocos.map((b) => b.id).join(""), "ABCDEFG");
for (const b of P.blocos)
  for (let d = b.de; d <= b.ate; d++) assert.strictEqual(P.schedule[d - 1].bloco, b.id, `dia ${d} fora do bloco ${b.id}`);

let n = 0;
for (const d of P.schedule) {
  for (const k of ["titulo", "leituraPrincipal", "apoios", "fonte", "texto", "meditar"])
    assert.ok(d[k] && d[k].length > 3, `dia ${d.day}: campo ${k} vazio`);
  for (const r of [...parseReferencias(d.leituraPrincipal), ...parseReferencias(d.apoios)]) {
    n++;
    const livro = bible[LIVROS.indexOf(r.livro)];
    assert.ok(livro, `dia ${d.day}: livro desconhecido ${r.livro}`);
    assert.ok(livro.chapters[r.cap - 1] && livro.chapters[r.capFim - 1], `dia ${d.day}: capítulo fora (${r.ref})`);
    if (r.de) assert.ok(r.de <= livro.chapters[r.cap - 1].length && r.ate <= livro.chapters[r.capFim - 1].length, `dia ${d.day}: versículo fora (${r.ref})`);
  }
}
// casos chatos do formato do PDF
assert.deepStrictEqual(parseReferencias("Romanos 3.28; 5.1; 8.1, 33-34").map((r) => r.ref), ["Romanos 3:28", "Romanos 5:1", "Romanos 8:1", "Romanos 8:33"]);
assert.deepStrictEqual(parseReferencias("Gênesis 1.1–2.3")[0], { livro: "Gênesis", cap: 1, de: 1, capFim: 2, ate: 3, ref: "Gênesis 1:1" });
assert.strictEqual(parseReferencias("Judas 24-25")[0].ref, "Judas 1:24");
assert.strictEqual(parseReferencias("Salmo 8")[0].ref, "Salmos 8");
assert.strictEqual(parseReferencias("Levítico 16 (o propiciatório)")[0].ref, "Levítico 16");
console.log(`ok — 30 dias, 7 blocos, ${n} referências conferidas na Bíblia do app`);
