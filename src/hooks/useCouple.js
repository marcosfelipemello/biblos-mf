import { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import { TRACKS, DEFAULT_TRACK } from "../data/couplesPlan";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  deleteField,
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

  // 3. Casal criado antes das posições por pessoa (ou parceiro que entrou
  // depois): fixa a posição no dia corrente do casal na primeira abertura.
  // Sem isso, quem ainda não navegou continua preso ao `currentDay`, que o
  // outro move ao concluir o dia.
  useEffect(() => {
    if (disabled || !couple || !couple.members?.includes(user.uid)) return;
    if (couple.positions?.[user.uid] != null) return;
    updateDoc(doc(db, "couples", couple.id), {
      [`positions.${user.uid}`]: Math.max(1, Number(couple.currentDay) || 1),
    }).catch((err) => console.error("Couple position error:", err));
  }, [disabled, couple, user?.uid]);

  const profile = () => ({
    name: user.displayName || user.email?.split("@")[0] || "Alguém",
  });

  const createCouple = async (track = DEFAULT_TRACK) => {
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
      track,
      currentDay: 1,
      positions: { [user.uid]: 1 },
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
    const diasComNota = Object.keys(couple.notes || {}).filter(
      (day) => couple.notes[day]?.[user.uid] != null
    );
    for (const day of diasComNota) {
      await updateDoc(doc(db, "couples", couple.id), {
        [`notes.${day}.${user.uid}`]: deleteField(),
      });
    }
    await updateDoc(doc(db, "couples", couple.id), {
      members: arrayRemove(user.uid),
      [`profiles.${user.uid}`]: deleteField(),
      [`completions.${user.uid}`]: deleteField(),
      [`positions.${user.uid}`]: deleteField(),
    });
    await setDoc(doc(db, "users", user.uid), { coupleId: null }, { merge: true });
  };

  /**
   * Marca o dia como concluído por mim. O dia corrente do casal avança
   * quando os dois marcaram — mas isso é só o progresso compartilhado: a
   * tela de cada um continua onde está, porque ninguém deve ser levado para
   * o dia seguinte no meio de uma leitura pelo toque do outro.
   */
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

    // Dispara aviso ao parceiro em segundo plano (sem travar a interface)
    try {
      auth.currentUser
        ?.getIdToken()
        .then((idToken) => {
          if (!idToken) return;
          fetch("/api/avisar-par", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ coupleId: couple.id, dia: day }),
          }).catch((err) => {
            console.warn("[useCouple] Falha na rede ao avisar par:", err);
          });
        })
        .catch((err) => {
          console.warn(
            "[useCouple] Não foi possível obter token para avisar par:",
            err
          );
        });
    } catch (err) {
      console.warn("[useCouple] Erro ao disparar aviso ao par:", err);
    }
  };

  /**
   * Desfaz a marcação do dia. Sem diálogo de confirmação: desfazer um toque
   * errado não pode custar mais um toque.
   *
   * Se o dia já tinha avançado porque os dois marcaram, volta para ele —
   * ninguém deve ficar adiante de um dia que não concluiu. Como só dá para
   * desfazer o dia que está na tela, isso na prática significa continuar
   * exatamente onde a pessoa está.
   */
  const uncompleteDay = async (day) => {
    if (!couple) return;
    await updateDoc(doc(db, "couples", couple.id), {
      [`completions.${user.uid}`]: arrayRemove(day),
      currentDay: Math.min(couple.currentDay || 1, day),
      [`positions.${user.uid}`]: day,
    });
  };

  /**
   * Reflexão do dia, uma por pessoa, visível para os dois.
   *
   * ponytail: notas no próprio documento do casal (teto de 1MB do Firestore).
   * Se apertar, virar subcoleção couples/{id}/notes/{dia}.
   */
  const saveNote = async (day, text) => {
    if (!couple) return;
    await updateDoc(doc(db, "couples", couple.id), {
      [`notes.${day}.${user.uid}`]: text.slice(0, 2000),
    });
  };

  /**
   * Move o dia que EU estou lendo, não o do casal.
   *
   * Antes isso gravava `currentDay`, que é compartilhado: quem voltasse para
   * o dia 4 arrastava o outro junto, e quem avançasse para o dia 5 empurrava
   * o outro no meio da leitura. Cada um tem a sua posição em
   * `positions.{uid}`; `currentDay` continua sendo o progresso do casal.
   */
  const goToDay = async (day) => {
    if (!couple) return;
    await updateDoc(doc(db, "couples", couple.id), {
      [`positions.${user.uid}`]: day,
    });
  };

  /**
   * Troca a leitura entre noivos e casados.
   *
   * Sem `restart`, o progresso não se mexe — as trilhas têm o mesmo número de
   * dias e as mesmas leituras, então dá para trocar no meio do plano. Com
   * `restart`, é uma volta nova: quem terminou como noivo e casou volta ao dia
   * 1 com a leitura de casados, e a volta anterior fica guardada em `laps`.
   */
  const setTrack = async (track, { restart = false } = {}) => {
    if (!couple) return;
    if (!TRACKS[track]) return;
    if (!restart) {
      await updateDoc(doc(db, "couples", couple.id), { track });
      return;
    }
    await updateDoc(doc(db, "couples", couple.id), {
      track,
      currentDay: 1,
      completions: Object.fromEntries(couple.members.map((uid) => [uid, []])),
      positions: Object.fromEntries(couple.members.map((uid) => [uid, 1])),
      // serverTimestamp() não é aceito dentro de elemento de array.
      laps: arrayUnion({
        track: couple.track || DEFAULT_TRACK,
        completions: couple.completions || {},
        at: new Date().toISOString(),
      }),
    });
  };

  const partnerUid = couple?.members.find((uid) => uid !== user?.uid) || null;

  /**
   * O dia que estou lendo. Casal criado antes das posições — ou parceiro que
   * entrou depois — cai no dia corrente do casal, que é onde ele estaria de
   * qualquer forma.
   */
  const myDay = couple
    ? Math.max(1, Number(couple.positions?.[user?.uid] ?? couple.currentDay) || 1)
    : 1;

  return {
    couple,
    myDay,
    // Casal criado antes das trilhas não tem o campo, e o documento é
    // gravável pelos membros: valor fora da lista cai no padrão.
    track: TRACKS[couple?.track] ? couple.track : DEFAULT_TRACK,
    partnerUid,
    partnerName: partnerUid ? couple?.profiles?.[partnerUid]?.name : null,
    isPaired: (couple?.members.length || 0) >= 2,
    loading: disabled ? false : loading,
    error,
    createCouple,
    joinCouple,
    leaveCouple,
    completeDay,
    uncompleteDay,
    saveNote,
    goToDay,
    setTrack,
  };
}
