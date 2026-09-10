import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export function useJournal(user) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const disabled = !user || user.isAnonymous;

  useEffect(() => {
    if (disabled) return;

    const q = query(
      collection(db, "users", user.uid, "journal"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(), // Handle Firestore Timestamp
          };
        });
        setEntries(data);
        setLoading(false);
      },
      (err) => {
        console.error("Journal error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [disabled, user?.uid]);

  const addEntry = async (content, title = "") => {
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "journal"), {
      content,
      title,
      createdAt: serverTimestamp(),
    });
  };

  const deleteEntry = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "journal", id));
  };

  const updateEntry = async (id, content, title) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "journal", id), {
      content,
      title,
      updatedAt: serverTimestamp(),
    });
  };

  return {
    entries: disabled ? [] : entries,
    loading: disabled ? false : loading,
    addEntry,
    deleteEntry,
    updateEntry,
  };
}
