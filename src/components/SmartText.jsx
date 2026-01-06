import React, { useMemo } from "react";

export default function SmartText({ text, entities, onEntityClick }) {
  const parts = useMemo(() => {
    if (!text || !Array.isArray(entities) || entities.length === 0)
      return [text];

    // 1. Filter valid entities and sort by length (descending)
    // Checks if e exists, has a name, and name is a string
    const sortedEntities = entities
      .filter((e) => e && typeof e.name === "string" && e.name.length > 0)
      .sort((a, b) => b.name.length - a.name.length);

    if (sortedEntities.length === 0) return [text];

    // Escape special chars in names

    // Filter out very short names or common words if needed to avoid noise,
    // but for now we trust the KB.
    // Escape special chars in names
    const escapeRegExp = (string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const pattern = sortedEntities.map((e) => escapeRegExp(e.name)).join("|");

    // Case-insensitive matching, look for whole words or boundaries if possible
    // Using word boundaries \b might fail for accents in JS regex depending on engine,
    // but standard names usually work better with explicit boundaries or just simple replacement.
    // Let's try simple global match first.
    // Filter out very short names or common words if needed to avoid noise,
    // but for now we trust the KB.
    // 3. Create a Unicode-aware regex with Lookarounds for word boundaries.
    // (?<!\p{L}) -> Negative Lookbehind: Ensure char before is NOT a letter
    // (?!\p{L})  -> Negative Lookahead: Ensure char after is NOT a letter
    // The 'u' flag is essential for \p{L} to work.
    // REMOVED 'i' flag to ensure Case Sensitivity (e.g. "Sem" != "sem")
    const regex = new RegExp(`(?<!\\p{L})(${pattern})(?!\\p{L})`, "gu");

    const splitText = text.split(regex);

    return splitText.map((part, index) => {
      // Check if this part matches an entity (Case Sensitive)
      const match = sortedEntities.find((e) => e.name === part);

      if (match) {
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onEntityClick(match);
            }}
            className="text-amber-700 font-semibold cursor-pointer border-b border-amber-300 hover:bg-amber-100 transition-colors"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  }, [text, entities, onEntityClick]);

  return <span className="leading-relaxed text-slate-800">{parts}</span>;
}
