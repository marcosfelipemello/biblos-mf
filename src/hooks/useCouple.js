import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";

// Sem 0/O e 1/I/L: o código é ditado por WhatsApp ou em voz alta.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LEN = 8;

const newCode = () =>
  Array.from(
    crypto.getRandomValues(new Uint32Array(CODE_LEN)),
    (n) => ALPHABET[n % ALPHABET.length]
  ).join("");

/**
 * Casal em couples/{codigo}, onde o ID do documento É o código de convite.
 * Isso dispensa query, índice e servidor: quem recebe o código lê o
 * documento direto pelo caminho.
 */
export function useCouple(user) {
  const [coupleId, setCoupleId] = useState(null);
  const [couple, setCouple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const disabled = !user || user.isAnonymous;

  // 1. Descobre a qual casal o usuário pertence
  useEffect(() => {
    if (disabled) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        setCoupleId(snap.data()?.coupleId || null);
        setLoading(false);
      },
      (err) => {
        console.error("Couple profile error:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [disabled, user?.uid]);

  // 2. Acompanha o casal em si
  useEffect(() => {
    if (!coupleId) return;

    const unsubscribe = onSnapshot(
      doc(db, "couples", coupleId),
      (snap) => setCouple(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      (err) => console.error("Couple error:", err)
    );
    return () => unsubscribe();
  }, [coupleId]);

  const profile = () => ({
    name: user.displayName || user.email?.split("@")[0] || "Alguém",
  });

  const createCouple = async () => {
    setError(null);
    // Colisão é improvável (31^8), mas sobrescrever o casal de outra
    // pessoa seria grave demais para confiar só na estatística.
    let code;
    for (let i = 0; i < 5; i++) {
      const candidate = newCode();
      try {
        const existing = await getDoc(doc(db, "couples", candidate));
        if (!existing.exists()) {
          code = candidate;
          break;
        }
      } catch {
        // Leitura negada = já existe e está cheio. Tenta outro código.
        continue;
      }
    }
    if (!code) {
      setError("Não foi possível gerar um código. Tente de novo.");
      return null;
    }

    await setDoc(doc(db, "couples", code), {
      members: [user.uid],
      profiles: { [user.uid]: profile() },
      planId: "casais",
      currentDay: 1,
      completions: { [user.uid]: [] },
      createdAt: serverTimestamp(),
    });
    await setDoc(doc(db, "users", user.uid), { coupleId: code }, { merge: true });
    return code;
  };

  const joinCouple = async (rawCode) => {
    setError(null);
    const code = rawCode.trim().toUpperCase();

    let snap;
    try {
      snap = await getDoc(doc(db, "couples", code));
    } catch {
      // Regra nega em vez de dizer "não existe" — para quem digitou, é o mesmo.
      setError("Código não encontrado. Confira as letras.");
      return false;
    }
    if (!snap.exists()) {
      setError("Código não encontrado. Confira as letras.");
      return false;
    }
    const data = snap.data();
    if (data.members.includes(user.uid)) {
      await setDoc(doc(db, "users", user.uid), { coupleId: code }, { merge: true });
      return true;
    }
    if (data.members.length >= 2) {
      setError("Esse código já está em uso por outro casal.");
      return false;
    }

    await updateDoc(doc(db, "couples", code), {
      members: arrayUnion(user.uid),
      [`profiles.${user.uid}`]: profile(),
      [`completions.${user.uid}`]: [],
    });
    await setDoc(doc(db, "users", user.uid), { coupleId: code }, { merge: true });
    return true;
  };

  const leaveCouple = async () => {
    if (!couple) return;
    await updateDoc(doc(db, "couples", couple.id), {
      members: arrayRemove(user.uid),
    });
    await setDoc(doc(db, "users", user.uid), { coupleId: null }, { merge: true });
  };

  /** Marca o dia como concluído por mim. Avança quando todos marcaram. */
  const completeDay = async (day, totalDays) => {
    if (!couple) return;
    const mine = couple.completions?.[user.uid] || [];
    const updates = { [`completions.${user.uid}`]: arrayUnion(day) };

    const todosMarcaram = couple.members.every((uid) =>
      uid === user.uid
        ? true
        : (couple.completions?.[uid] || []).includes(day)
    );
    if (todosMarcaram && !mine.includes(day)) {
      updates.currentDay = Math.min(day + 1, totalDays);
    }

    await updateDoc(doc(db, "couples", couple.id), updates);
  };

  const goToDay = async (day) => {
    if (!couple) return;
    await updateDoc(doc(db, "couples", couple.id), { currentDay: day });
  };

  const partnerUid = couple?.members.find((uid) => uid !== user?.uid) || null;

  return {
    couple,
    partnerUid,
    partnerName: partnerUid ? couple?.profiles?.[partnerUid]?.name : null,
    isPaired: (couple?.members.length || 0) >= 2,
    loading: disabled ? false : loading,
    error,
    createCouple,
    joinCouple,
    leaveCouple,
    completeDay,
    goToDay,
  };
}
