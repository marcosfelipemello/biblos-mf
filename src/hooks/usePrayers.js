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

export function usePrayers(user) {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const disabled = !user || user.isAnonymous;

  useEffect(() => {
    if (disabled) return;

    const q = query(
      collection(db, "users", user.uid, "prayers"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPrayers(data);
        setLoading(false);
      },
      (err) => {
        console.error("Prayers error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [disabled, user?.uid]);

  const addPrayer = async (text) => {
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "prayers"), {
      text,
      status: "active", // active, answered
      createdAt: serverTimestamp(),
    });
  };

  const toggleStatus = async (id, currentStatus) => {
    if (!user) return;
    const newStatus = currentStatus === "active" ? "answered" : "active";
    await updateDoc(doc(db, "users", user.uid, "prayers", id), {
      status: newStatus,
    });
  };

  const deletePrayer = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "prayers", id));
  };

  return {
    prayers: disabled ? [] : prayers,
    loading: disabled ? false : loading,
    addPrayer,
    toggleStatus,
    deletePrayer,
  };
}
