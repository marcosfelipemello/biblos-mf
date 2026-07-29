import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

const EMPTY = {};

/**
 * Progresso dos planos solo do usuário: users/{uid}/planProgress/{planId}.
 * São no máximo uma dezena de documentos minúsculos, então uma assinatura
 * única para a coleção inteira sai mais barata que uma por plano.
 */
export function useReadingPlan(user) {
  const [progress, setProgress] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const disabled = !user || user.isAnonymous;

  useEffect(() => {
    if (disabled) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "planProgress"),
      (snap) => {
        const byId = {};
        snap.docs.forEach((d) => (byId[d.id] = { id: d.id, ...d.data() }));
        setProgress(byId);
        setLoading(false);
      },
      (err) => {
        console.error("Reading plan progress error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [disabled, user?.uid]);

  const ref = (planId) => doc(db, "users", user.uid, "planProgress", planId);

  const startPlan = async (planId) => {
    if (disabled) return;
    await setDoc(ref(planId), {
      currentDay: 1,
      completedDays: [],
      startedAt: serverTimestamp(),
    });
  };

  const completeDay = async (planId, day, totalDays) => {
    if (disabled) return;
    await updateDoc(ref(planId), {
      completedDays: arrayUnion(day),
      currentDay: Math.min(day + 1, totalDays),
      updatedAt: serverTimestamp(),
    });
  };

  const goToDay = async (planId, day) => {
    if (disabled) return;
    await updateDoc(ref(planId), { currentDay: day });
  };

  const resetPlan = async (planId) => {
    if (disabled) return;
    await deleteDoc(ref(planId));
  };

  return {
    progress: disabled ? EMPTY : progress,
    loading: disabled ? false : loading,
    startPlan,
    completeDay,
    goToDay,
    resetPlan,
  };
}
