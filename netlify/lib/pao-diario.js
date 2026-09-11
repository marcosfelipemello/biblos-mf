// Disparo diário do Pão Diário para todos os usuários elegíveis.
import { db, enviarPara } from "./push.js";
import { getDailyManna } from "../../src/data/dailyManna.js";

function formatarTexto(texto, limite = 150) {
  if (!texto || texto.length <= limite) return texto || "";
  return texto.slice(0, limite - 1).trimEnd() + "…";
}

function dataHojeBrasilia() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

/**
 * Executa o envio do Pão Diário do dia para usuários que possuem tokens
 * registrados, não desativaram o Pão Diário e ainda não receberam hoje.
 *
 * Devolve o placar { candidatos, enviados, pulados, erros } para relatório/diagnóstico.
 */
export async function executarPaoDiario() {
  const banco = db();
  const manna = getDailyManna();
  const hoje = dataHojeBrasilia();

  const title = `Pão Diário — ${manna.ref}`;
  const body = formatarTexto(manna.text, 150);

  // ponytail: varredura simples, trocar por collectionGroup + indice quando passar de ~500 usuarios
  const usersSnap = await banco.collection("users").get();

  let candidatos = 0;
  let enviados = 0;
  let pulados = 0;
  const erros = [];

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userData = userDoc.data() || {};
    const notif = userData.notif || {};

    // Pula se o usuário desligou explicitamente as notificações do Pão Diário
    if (notif.manna === false) {
      pulados++;
      continue;
    }

    // Pula se já recebeu a notificação de hoje
    if (notif.lastManna === hoje) {
      pulados++;
      continue;
    }

    // Lê os tokens registrados do usuário
    const tokensSnap = await banco.collection(`users/${uid}/pushTokens`).get();
    if (tokensSnap.empty) {
      pulados++;
      continue;
    }

    candidatos++;

    try {
      const res = await enviarPara(uid, {
        title,
        body,
        data: {
          tipo: "pao-diario",
          ref: manna.ref,
        },
      });

      if (res.enviados > 0) {
        enviados++;
        // Grava a data de hoje para garantir idempotência em reexecuções
        await banco.doc(`users/${uid}`).set(
          {
            notif: {
              ...notif,
              lastManna: hoje,
            },
          },
          { merge: true }
        );
      } else if (res.erros && res.erros.length > 0) {
        erros.push({ uid, erros: res.erros });
      }
    } catch (err) {
      erros.push({ uid, erro: err?.message || String(err) });
    }
  }

  return {
    candidatos,
    enviados,
    pulados,
    erros,
  };
}
