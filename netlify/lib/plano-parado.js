// Disparo de lembrete para usuários com planos de leitura individuais parados.
import { db, enviarPara } from "./push.js";
import { getPlan } from "../../src/data/readingPlans.js";

function paraMillis(ts) {
  if (!ts) return null;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.toDate === "function") return ts.toDate().getTime();
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === "number") return ts;
  if (typeof ts._seconds === "number") return ts._seconds * 1000;
  const parsed = Date.parse(ts);
  return isNaN(parsed) ? null : parsed;
}

function dataHojeBrasilia() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

function diasEntre(dataStr1, dataStr2) {
  const d1 = new Date(dataStr1 + "T12:00:00Z");
  const d2 = new Date(dataStr2 + "T12:00:00Z");
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * Executa o envio de lembrete para usuários que iniciaram um plano de leitura
 * e não avançam há mais de 2 dias (48 horas), e cujo plano ainda não acabou.
 *
 * Devolve o placar { candidatos, enviados, pulados, erros }.
 */
export async function executarPlanoParado() {
  const banco = db();
  const hoje = dataHojeBrasilia();
  const agora = Date.now();
  const limiteDoisDias = agora - 2 * 24 * 60 * 60 * 1000;

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

    // Pula se usuário desativou notificações de plano
    if (notif.plan === false) {
      pulados++;
      continue;
    }

    // Anti-repetição: no máximo um aviso a cada 2 dias por usuário
    if (notif.lastPlan && diasEntre(notif.lastPlan, hoje) < 2) {
      pulados++;
      continue;
    }

    // Verifica se possui tokens registrados
    const tokensSnap = await banco.collection(`users/${uid}/pushTokens`).get();
    if (tokensSnap.empty) {
      pulados++;
      continue;
    }

    // Lê os planos do usuário
    const plansSnap = await banco.collection(`users/${uid}/planProgress`).get();
    if (plansSnap.empty) {
      pulados++;
      continue;
    }

    let planoEscolhido = null;
    let maiorTimestamp = -1;

    for (const planDoc of plansSnap.docs) {
      const planId = planDoc.id;
      const planData = planDoc.data() || {};
      const plan = getPlan(planId);
      if (!plan) continue;

      const completedDays = Array.isArray(planData.completedDays)
        ? planData.completedDays
        : [];

      // Pula plano já concluído
      if (completedDays.length >= plan.days) continue;

      const ts = paraMillis(planData.updatedAt || planData.startedAt);
      if (!ts) continue;

      // Verifica se a última mexida tem mais de 2 dias (48 horas)
      if (ts <= limiteDoisDias) {
        // Seleciona o plano mexido mais recentemente entre os parados
        if (ts > maiorTimestamp) {
          maiorTimestamp = ts;
          planoEscolhido = {
            id: planId,
            title: plan.title,
            currentDay: planData.currentDay || (completedDays.length + 1),
          };
        }
      }
    }

    // Se nenhum plano estiver parado há mais de 2 dias, pula
    if (!planoEscolhido) {
      pulados++;
      continue;
    }

    candidatos++;

    const title = `Plano de Leitura — ${planoEscolhido.title}`;
    const body = `Seu plano "${planoEscolhido.title}" está no Dia ${planoEscolhido.currentDay}. Que tal continuar sua leitura hoje?`;

    try {
      const res = await enviarPara(uid, {
        title,
        body,
        data: {
          tipo: "plano-parado",
          planId: planoEscolhido.id,
          day: String(planoEscolhido.currentDay),
        },
      });

      if (res.enviados > 0) {
        enviados++;
        // Grava a data do último aviso para garantir janela de 2 dias
        await banco.doc(`users/${uid}`).set(
          {
            notif: {
              ...notif,
              lastPlan: hoje,
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
