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
      const lowerTerm = term.toLowerCase();

      // Iterate through the local Bible data
      BIBLE_DATA.forEach((book) => {
        const bookName = BOOK_NAMES[book.abbrev] || book.abbrev;

        book.chapters.forEach((chapter, chapterIndex) => {
          chapter.forEach((verseText, verseIndex) => {
            if (verseText.toLowerCase().includes(lowerTerm)) {
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

  return { searchVerses, getVerseText, loading, error };
};
