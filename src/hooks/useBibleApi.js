import { useState, useCallback } from "react";
import BIBLE_DATA from "../data/bible.json";
import { BOOK_NAMES } from "../data/bibleBookNames.js";

// Create a reverse mapping for name -> abbreviation lookup
const NAME_TO_ABBREV = Object.entries(BOOK_NAMES).reduce(
  (acc, [abbrev, name]) => {
    acc[name.toLowerCase()] = abbrev;
    // Handle simple normalized versions (no accents) if needed in future
    return acc;
  },
  {}
);

/**
 * Number of verses in a chapter. Async so it survives bible.json becoming
 * a dynamic import.
 */
export const getVerseCount = async (bookName, chapter) => {
  const abbrev = NAME_TO_ABBREV[bookName?.toLowerCase()];
  const bookData = abbrev && BIBLE_DATA.find((b) => b.abbrev === abbrev);
  return bookData?.chapters[chapter - 1]?.length || 0;
};

export const useBibleApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Searches for a term in the entire Bible (Local JSON).
   * @param {string} term - The term to search for (e.g., "Jesus").
   * @returns {Promise<Array>} - Array of found verses.
   */
  const searchVerses = useCallback(async (term) => {
    if (!term) return [];
    setLoading(true);
    setError(null);

    try {
      // Simulate async to not freeze UI immediately, though it's fast
      await new Promise((resolve) => setTimeout(resolve, 10));

      const results = [];
      // Helper to escape regex special characters
      const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      };

      let pattern;
      let regex;

      // Check for advanced regex mode
      if (term.startsWith("regex:")) {
        // Extract pattern, preserving raw regex
        const rawPattern = term.replace("regex:", "");
        // Use exactly as provided (case insensitive + unicode)
        regex = new RegExp(rawPattern, "iu");
      } else {
        // Original logic
        const createFlexibleRegex = (input) => {
          const charMap = {
            a: "[aáàâãäå]",
            e: "[eéèêë]",
            i: "[iíìîï]",
            o: "[oóòôõö]",
            u: "[uúùûü]",
            c: "[cç]",
            n: "[nñ]",
          };

          return input
            .toLowerCase()
            .split("")
            .map((char) => {
              if (charMap[char]) return charMap[char];
              return escapeRegExp(char);
            })
            .join("");
        };

        pattern = createFlexibleRegex(term);
        regex = new RegExp(`(?<!\\p{L})${pattern}(?!\\p{L})`, "iu");
      }

      // Iterate through the local Bible data
      BIBLE_DATA.forEach((book) => {
        const bookName = BOOK_NAMES[book.abbrev] || book.abbrev;

        book.chapters.forEach((chapter, chapterIndex) => {
          chapter.forEach((verseText, verseIndex) => {
            // Use regex.test() for smart matching
            if (regex.test(verseText)) {
              results.push({
                book: {
                  name: bookName,
                  id: book.abbrev,
                },
                chapter: chapterIndex + 1,
                number: verseIndex + 1,
                text: verseText,
              });
            }
          });
        });
      });

      return results;
    } catch (err) {
      console.error("Erro na busca local:", err);
      setError("Falha ao buscar versículos na base local.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Gets the text of a specific verse (e.g., "Mateus 1:16") from Local JSON.
   * @param {string} reference - The reference string.
   * @returns {Promise<string>} - The verse text.
   */
  const getVerseText = useCallback(async (reference) => {
    if (!reference) return null;
    setLoading(true);
    setError(null);

    try {
      // Parse reference: "Mateus 1:16" -> Book: "Mateus", Chapter: 1, Verse: 16
      // This regex handles standard formats like "1 João 1:9" or "Gênesis 1:1"
      // Also handles simple cases without accents if passed that way, but regex assumes Space Separator
      const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);

      if (!match) {
        // Try to handle cases without spaces if any? No, stick to standard.
        console.warn(
          `Formato de referência inválido ou não suportado: ${reference}`
        );
        return "Referência inválida.";
      }

      const [, bookName, chapterStr, verseStr] = match;
      const chapter = parseInt(chapterStr);
      const verse = parseInt(verseStr);

      // Find abbrev (case insensitive lookup)
      const abbrev = NAME_TO_ABBREV[bookName.toLowerCase()];

      if (!abbrev) {
        throw new Error(`Livro não encontrado na base: ${bookName}`);
      }

      const bookData = BIBLE_DATA.find((b) => b.abbrev === abbrev);

      if (!bookData) {
        throw new Error(`Dados do livro não encontrados para: ${abbrev}`);
      }

      const chapterData = bookData.chapters[chapter - 1];
      if (!chapterData) {
        throw new Error(`Capítulo ${chapter} não encontrado em ${bookName}`);
      }

      const text = chapterData[verse - 1];
      if (!text) {
        throw new Error(
          `Versículo ${verse} não encontrado em ${bookName} ${chapter}`
        );
      }

      return text;
    } catch (err) {
      console.error("Erro ao obter texto do versículo:", err);
      return "Texto não encontrado offline.";
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Gets all verses of a specific chapter.
   * @param {string} bookName - Name of the book (e.g., "Gênesis").
   * @param {number} chapter - Chapter number.
   * @returns {Promise<Array>} - Array of verse objects.
   */
  const getChapter = useCallback(async (bookName, chapter) => {
    if (!bookName || !chapter) return [];
    setLoading(true);
    setError(null);

    try {
      // Find abbrev
      const abbrev = NAME_TO_ABBREV[bookName.toLowerCase()];
      if (!abbrev) throw new Error(`Livro não encontrado: ${bookName}`);

      const bookData = BIBLE_DATA.find((b) => b.abbrev === abbrev);
      if (!bookData) throw new Error(`Dados não encontrados para: ${abbrev}`);

      const chapterData = bookData.chapters[chapter - 1];
      if (!chapterData) throw new Error(`Capítulo ${chapter} não encontrado.`);

      // Map to standard format
      const verses = chapterData.map((text, index) => ({
        book: { name: BOOK_NAMES[abbrev] || bookName, id: abbrev },
        chapter: chapter,
        number: index + 1,
        text: text,
      }));

      return verses;
    } catch (err) {
      console.error("Erro ao buscar capítulo:", err);
      setError("Erro ao carregar capítulo.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchVerses, getVerseText, getChapter, loading, error };
};
