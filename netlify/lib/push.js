// Núcleo de envio das notificações do Biblos.
// Roda no Netlify com a chave de serviço do Firebase (variável de ambiente
// FIREBASE_SERVICE_ACCOUNT) — nunca no navegador.
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore } from "firebase-admin/firestore";

function iniciar() {
  if (!getApps().length) {
    const bruto = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!bruto) throw new Error("FIREBASE_SERVICE_ACCOUNT não configurada.");
    initializeApp({ credential: cert(JSON.parse(bruto)) });
  }
}

export function db() {
  iniciar();
  return getFirestore();
}

/**
 * Manda uma notificação para todos os aparelhos de um usuário.
 * Token morto nunca ressuscita: quando o FCM diz que não está mais registrado,
 * o documento é apagado na hora — senão a fila de erro cresce a cada execução.
 *
 * Devolve o placar do envio, que é o que o diagnóstico precisa ler.
 */
export async function enviarPara(uid, { title, body, data = {} }) {
  iniciar();
  const banco = getFirestore();
  const snap = await banco.collection(`users/${uid}/pushTokens`).get();
  const tokens = snap.docs.map((d) => d.id);
  if (tokens.length === 0) return { uid, tokens: 0, enviados: 0, erros: [] };

  const mensagens = getMessaging();
  const resultados = await Promise.all(
    tokens.map(async (token) => {
      try {
        // SÓ `data`, nunca `notification`. Com o bloco `notification`, o
        // navegador exibe o aviso sozinho E o nosso service worker exibe o
        // dele: chegavam DUAS notificações iguais, uma com a logo e outra com
        // o ícone genérico. Mandando só dados, quem desenha é apenas o
        // firebase-messaging-sw.js, uma vez, com o ícone do app.
        // Todo valor de `data` tem de ser string — o FCM recusa o resto.
        const dados = { title, body };
        for (const [chave, valor] of Object.entries(data || {})) {
          dados[chave] = String(valor);
        }
        const id = await mensagens.send({
          token,
          data: dados,
          webpush: {
            headers: { Urgency: "high" },
            fcmOptions: { link: "https://biblos.devmf.com.br/" },
          },
        });
        return { token, ok: true, id };
      } catch (err) {
        const codigo = err?.errorInfo?.code || err?.code || String(err);
        if (codigo.includes("registration-token-not-registered")) {
          await banco.doc(`users/${uid}/pushTokens/${token}`).delete();
        }
        return { token, ok: false, codigo, detalhe: err?.message };
      }
    })
  );

  return {
    uid,
    tokens: tokens.length,
    enviados: resultados.filter((r) => r.ok).length,
    erros: resultados.filter((r) => !r.ok),
  };
}
