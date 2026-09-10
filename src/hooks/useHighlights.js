import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export function useHighlights(user, book, chapter) {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);

  const disabled = !user || user.isAnonymous;

  // Subscribe to highlights
  useEffect(() => {
    if (disabled) return;

    let q;
    if (book && chapter) {
      // Fetch for specific chapter
      q = query(
        collection(db, "users", user.uid, "highlights"),
        where("book", "==", book),
        where("chapter", "==", chapter)
      );
    } else {
      // Fetch ALL (for Favorites)
      q = query(collection(db, "users", user.uid, "highlights"));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHighlights(data);
        setLoading(false);
      },
      (err) => {
        console.error("Highlights error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [disabled, user?.uid, book, chapter]);

  const toggleHighlight = async (verse, color = "amber") => {
    if (!user || user.isAnonymous) return;

    const highlightId = `${book}_${chapter}_${verse}`;
    const docRef = doc(db, "users", user.uid, "highlights", highlightId);

    // Check if already highlighted
    const existing = highlights.find((h) => h.verse === verse);

    if (existing) {
      // If same color, remove. If different, update color.
      if (existing.color === color) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          book,
          chapter,
          verse,
          color,
          updatedAt: serverTimestamp(),
        });
      }
    } else {
      // Create new
      await setDoc(docRef, {
        book,
        chapter,
        verse,
        color,
        createdAt: serverTimestamp(),
      });
    }
  };

  const isHighlighted = (verse) => {
    return highlights.find((h) => h.verse === verse);
  };

  return {
    highlights: disabled ? [] : highlights,
    toggleHighlight,
    isHighlighted,
    loading: disabled ? false : loading,
  };
}
