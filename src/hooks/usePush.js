import { useState, useEffect, useCallback } from "react";
import {
  getMessaging,
  getToken,
  deleteToken,
  isSupported,
} from "firebase/messaging";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { app, db, VAPID_KEY } from "../config/firebase";

const DEFAULT_PREFS = {
  manna: true,
  plan: true,
  couple: true,
};

/**
 * Hook para gerenciamento de notificações Web Push no Biblos MF.
 *
 * Regras:
 * 1. Pedir permissão SÓ no gesto explícito do usuário (nunca no carregamento).
 * 2. Gravar em users/{uid}/pushTokens/{token} (um documento por aparelho).
 * 3. Preferências em users/{uid}.notif = { manna: true, plan: true, couple: true }.
 */
export function usePush(user) {
  const [supported, setSupported] = useState(null);
  const [permission, setPermission] = useState(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("biblos_push_token") || null;
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState(DEFAULT_PREFS);

  // Estado de inscrição derivado do usuário ativo, permissão do navegador e token existente
  const isSubscribed = Boolean(
    user && !user.isAnonymous && permission === "granted" && token
  );

  // 1. Checa suporte do navegador/aparelho (sem pedir permissão)
  useEffect(() => {
    let mounted = true;

    async function checkSupport() {
      if (
        typeof window === "undefined" ||
        !("Notification" in window) ||
        !("serviceWorker" in navigator)
      ) {
        if (mounted) {
          setSupported(false);
          setPermission("unsupported");
        }
        return;
      }

      try {
        const sup = await isSupported();
        if (mounted) {
          setSupported(sup);
          setPermission(Notification.permission);
        }
      } catch (err) {
        console.warn("Push notifications not supported:", err);
        if (mounted) {
          setSupported(false);
          setPermission("unsupported");
        }
      }
    }

    checkSupport();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Acompanha preferências do usuário no Firestore (users/{uid}.notif)
  useEffect(() => {
    if (!user || user.isAnonymous) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        const data = snap.data();
        if (data?.notif) {
          setPreferences({
            manna: data.notif.manna !== false,
            plan: data.notif.plan !== false,
            couple: data.notif.couple !== false,
          });
        }
      },
      (err) => {
        console.error("Erro ao ler preferências de notificação:", err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 3. Solicitação de permissão e registro do token — EXCLUSIVAMENTE sob toque do usuário
  const subscribe = useCallback(async () => {
    if (!user || user.isAnonymous) {
      setError("Faça login com sua conta para ativar as notificações.");
      return null;
    }

    if (!supported) {
      setError("Este navegador ou aparelho não suporta notificações Web Push.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Passo A: Solicita permissão do navegador no gesto do usuário
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setError("Permissão de notificação não foi concedida.");
        setLoading(false);
        return null;
      }

      // Passo B: Valida chave VAPID pública
      if (!VAPID_KEY) {
        setError(
          "Chave VAPID pública ainda não foi configurada pelo administrador."
        );
        setLoading(false);
        return null;
      }

      // Passo C: Obtém o token FCM.
      // NÃO registrar o service worker à mão: o SDK registra o
      // /firebase-messaging-sw.js sozinho, no escopo isolado dele
      // (/firebase-cloud-messaging-push-scope). Registrar na raiz brigaria com o
      // service worker do vite-plugin-pwa, que já ocupa o escopo "/" — e dois
      // service workers não dividem o mesmo escopo: o último a registrar toma o
      // lugar do outro, derrubando o funcionamento offline do app instalado.
      const messaging = getMessaging(app);
      const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });

      if (!fcmToken) {
        setError("Não foi possível obter o token de notificação.");
        setLoading(false);
        return null;
      }

      // Passo E: Grava em users/{uid}/pushTokens/{token}
      const tokenRef = doc(db, "users", user.uid, "pushTokens", fcmToken);
      await setDoc(tokenRef, {
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent || "desconhecido",
      });

      // Passo F: Garante preferências iniciais em users/{uid}.notif
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists() || !userSnap.data()?.notif) {
        await setDoc(
          userRef,
          {
            notif: {
              manna: true,
              plan: true,
              couple: true,
            },
          },
          { merge: true }
        );
      }

      localStorage.setItem("biblos_push_token", fcmToken);
      setToken(fcmToken);
      setLoading(false);
      return fcmToken;
    } catch (err) {
      console.error("Erro ao ativar notificações:", err);
      setError(err.message || "Falha ao registrar notificações.");
      setLoading(false);
      return null;
    }
  }, [user, supported]);

  // 4. Descadastramento do aparelho (parar de receber neste dispositivo)
  const unsubscribe = useCallback(async () => {
    if (!user || user.isAnonymous) return false;

    setLoading(true);
    setError(null);

    const currentToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("biblos_push_token")
        : null);

    try {
      // Passo A: Exclui o token no Firebase Cloud Messaging
      try {
        const messaging = getMessaging(app);
        await deleteToken(messaging);
      } catch (err) {
        console.warn("Erro ao deletar token no FCM:", err);
      }

      // Passo B: Remove o token da subcoleção no Firestore
      if (currentToken) {
        try {
          const tokenRef = doc(
            db,
            "users",
            user.uid,
            "pushTokens",
            currentToken
          );
          await deleteDoc(tokenRef);
        } catch (err) {
          console.warn("Erro ao apagar token no Firestore:", err);
        }
      }

      // Passo C: Limpa localStorage e zera o estado local
      if (typeof window !== "undefined") {
        localStorage.removeItem("biblos_push_token");
      }
      setToken(null);
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Erro ao desinscrever notificações:", err);
      setError(err?.message || "Falha ao desativar notificações.");
      setLoading(false);
      return false;
    }
  }, [user, token]);

  // 5. Atualização de preferências (três chaves)
  const updatePreferences = useCallback(
    async (newPrefs) => {
      if (!user || user.isAnonymous) return;

      const merged = { ...preferences, ...newPrefs };
      setPreferences(merged);

      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { notif: merged }, { merge: true });
      } catch (err) {
        console.error("Erro ao salvar preferências:", err);
      }
    },
    [user, preferences]
  );

  return {
    supported,
    permission,
    isSubscribed,
    token,
    loading,
    error,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
  };
}
