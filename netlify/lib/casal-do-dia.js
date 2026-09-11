// Disparo diário de lembrete para casais no plano compartilhado.
import { db, enviarPara } from "./push.js";

/**
 * Função pura que determina a mensagem de notificação de casal para um membro.
 *
 * Tabela de decisão (Etapa 4):
 * | Situação do dia de hoje (currentDay) | Mensagem |
 * |---|---|
 * | você marcou | nada (retorna null) |
 * | o outro marcou, você não | "<nome> já leu hoje — te espera na leitura do Dia <dia>!" |
 * | ninguém dos dois marcou | "A leitura de hoje de vocês está esperando (Dia <dia>)." |
 */
export function decidirMensagemDoCasal({
  currentDay,
  completions,
  uid,
  outroUid,
  nomeDoOutro,
}) {
  const dia = Number(currentDay) || 1;
  const minhas = Array.isArray(completions?.[uid]) ? completions[uid] : [];

  // Se eu já marquei a leitura de hoje, não devo receber lembrete
  if (minhas.map(Number).includes(dia)) {
    return null;
  }

  const doOutro = Array.isArray(completions?.[outroUid])
    ? completions[outroUid]
    : [];
  const outroMarcou = doOutro.map(Number).includes(dia);

  const rawNome =
    typeof nomeDoOutro === "object" && nomeDoOutro !== null
      ? nomeDoOutro.name
      : nomeDoOutro;
  const nome =
    typeof rawNome === "string" && rawNome.trim() ? rawNome.trim() : "Seu par";

  if (outroMarcou) {
    return {
      title: "Plano de Casal",
      body: `${nome} já leu hoje — te espera na leitura do Dia ${dia}!`,
    };
  }

  return {
    title: "Plano de Casal",
    body: `A leitura de hoje de vocês está esperando (Dia ${dia}).`,
  };
}

function dataHojeBrasilia() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

/**
 * Executa a verificação dos casais ativos e dispara os lembretes noturnos
 * (20h Brasília) de acordo com a tabela de decisão.
 *
 * Devolve o placar { candidatos, enviados, pulados, erros }.
 */
export async function executarCasalDoDia() {
  const banco = db();
  const hoje = dataHojeBrasilia();

  // ponytail: varredura simples, trocar por collectionGroup + indice quando passar de ~500 usuarios
  const couplesSnap = await banco.collection("couples").get();

  let candidatos = 0;
  let enviados = 0;
  let pulados = 0;
  const erros = [];

  for (const coupleDoc of couplesSnap.docs) {
    const coupleData = coupleDoc.data() || {};
    const members = Array.isArray(coupleData.members) ? coupleData.members : [];

    // Notificação de casal só se aplica a duplas completas
    if (members.length !== 2) {
      continue;
    }

    const currentDay = Number(coupleData.currentDay) || 1;
    const completions = coupleData.completions || {};
    const profiles = coupleData.profiles || {};

    for (const uid of members) {
      const outroUid = members.find((m) => m !== uid);

      // Lê dados do usuário para verificar preferências e anti-repetição
      const userSnap = await banco.doc(`users/${uid}`).get();
      if (!userSnap.exists) {
        pulados++;
        continue;
      }

      const userData = userSnap.data() || {};
      const notif = userData.notif || {};

      // Pula se usuário desativou notificações de casal
      if (notif.couple === false) {
        pulados++;
        continue;
      }

      // Anti-repetição: no máximo 1 envio por dia
      if (notif.lastCouple === hoje) {
        pulados++;
        continue;
      }

      // Verifica se possui tokens de push registrados
      const tokensSnap = await banco.collection(`users/${uid}/pushTokens`).get();
      if (tokensSnap.empty) {
        pulados++;
        continue;
      }

      const perfilOutro = profiles[outroUid];
      const nomeDoOutro =
        (typeof perfilOutro === "string" ? perfilOutro : perfilOutro?.name) ||
        "Seu par";

      const msg = decidirMensagemDoCasal({
        currentDay,
        completions,
        uid,
        outroUid,
        nomeDoOutro,
      });

      // Se msg for null, significa que o usuário já concluiu o dia
      if (!msg) {
        pulados++;
        continue;
      }

      candidatos++;

      try {
        const res = await enviarPara(uid, {
          title: msg.title,
          body: msg.body,
          data: {
            tipo: "casal-do-dia",
            day: String(currentDay),
            coupleId: coupleDoc.id,
          },
        });

        if (res.enviados > 0) {
          enviados++;
          // Grava a data para garantir idempotência contra reexecuções no mesmo dia
          await banco.doc(`users/${uid}`).set(
            {
              notif: {
                ...notif,
                lastCouple: hoje,
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
  }

  return {
    candidatos,
    enviados,
    pulados,
    erros,
  };
}
