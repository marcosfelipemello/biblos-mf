// Checa a navegação do leitor contra os dados reais. node test_bible_nav.js
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { BOOK_NAMES } from "./src/data/bibleBookNames.js";
import { BIBLE_CHAPTER_COUNTS } from "./src/data/bibleStructure.js";

// bible.json tem BOM; o Vite lida com isso no import, o JSON.parse do Node não.
const BIBLE = JSON.parse(
  readFileSync("./src/data/bible.json", "utf8").replace(/^\uFEFF/, "")
);
const byName = Object.fromEntries(
  BIBLE.map((b) => [BOOK_NAMES[b.abbrev], b])
);

const verseCount = (book, chapter) =>
  byName[book]?.chapters[chapter - 1]?.length || 0;

// 1. O teto de capítulos precisa bater com os dados, senão o botão "próximo"
//    ou trava cedo demais ou leva pra tela em branco.
for (const [book, count] of Object.entries(BIBLE_CHAPTER_COUNTS)) {
  assert.ok(byName[book], `livro ausente no bible.json: ${book}`);
  assert.strictEqual(
    byName[book].chapters.length,
    count,
    `${book}: BIBLE_CHAPTER_COUNTS diz ${count}, bible.json tem ${byName[book].chapters.length}`
  );
}

// 2. Todo livro do bible.json precisa de um teto (senão handleNext fica infinito).
for (const b of BIBLE) {
  const name = BOOK_NAMES[b.abbrev];
  assert.ok(BIBLE_CHAPTER_COUNTS[name], `sem teto de capítulos: ${name}`);
}

// 3. Contagem de versículos: os casos que o código antigo errava.
assert.strictEqual(verseCount("Salmos", 119), 176, "Sl 119");
assert.strictEqual(verseCount("Salmos", 117), 2, "Sl 117 (o antigo mostrava 80)");
assert.strictEqual(verseCount("Judas", 1), 25, "Judas");
assert.strictEqual(verseCount("Obadias", 1), 21, "Obadias");

// 4. Nenhum capítulo pode devolver 0 versículos (grade do seletor vazia).
for (const b of BIBLE) {
  b.chapters.forEach((c, i) => {
    assert.ok(c.length > 0, `${BOOK_NAMES[b.abbrev]} ${i + 1} sem versículos`);
  });
}

console.log(
  `ok — ${BIBLE.length} livros, ${BIBLE.reduce((n, b) => n + b.chapters.length, 0)} capítulos conferidos`
);
