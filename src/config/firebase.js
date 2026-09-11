import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCG8j-KgPOLIVdTTCmiGtQA7VVT_5ysFM8",
  authDomain: "banco-de-dados---dho.firebaseapp.com",
  projectId: "banco-de-dados---dho",
  storageBucket: "banco-de-dados---dho.firebasestorage.app",
  messagingSenderId: "688145715081",
  appId: "1:688145715081:web:e17c953b50424da5a41b58",
  measurementId: "G-N3SWSYDHM3",
};

const app = initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable persistent authentication (keeps user logged in across sessions)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

/**
 * Chave pública Web Push (VAPID).
 * Gerada no Console do Firebase:
 * Configurações do projeto -> Cloud Messaging -> Certificados do Web Push -> Gerar par de chaves.
 *
 * Gerada em 11/09/2026 pelo dono.
 * Ela é pública por natureza (como o apiKey acima) e necessária para o navegador assinar as notificações.
 */
export const VAPID_KEY = "BFn1rg9CDSWBEGGqYfHdmXH6hCmYxggGjAXFmKweWi1Scy5lv4g4ULfvUp9s_UjzbfpHZpHAM0EW_3bxu2MYfbY";

export { app };
