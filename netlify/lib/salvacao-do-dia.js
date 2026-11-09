// Disparo diário do Plano da Salvação para usuários com o plano em andamento.
import { db, enviarPara } from "./push.js";
import { PLANO_SALVACAO } from "../../src/data/planoSalvacao.js";

export function paraMillis(ts) {
  if (!ts) return null;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.toDate === "function") return ts.toDate().getTime();
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === "number") return ts;
  if (typeof ts._seconds === "number") return ts._seconds * 1000;
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  const parsed = Date.parse(ts);
  return isNaN(parsed) ? null : parsed;
}

export function dataBrasilia(ts) {
  if (!ts) return null;
  if (typeof ts === "string" && /^\d{4}-\d{2}-\d{2}$/.test(ts.trim())) {
    return ts.trim();
  }
  const ms = paraMillis(ts);
  if (!ms) return null;
  return new Date(ms).toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

export function dataHojeBrasilia() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

/**
 * Função pura que determina a mensagem de notificação do Plano da Salvação.
 *
 * Regras:
 * 1. Sem plano: retorna null.
 * 2. Plano já concluído (completedDays.length >= 30): retorna null.
 * 3. currentDay fora do intervalo (1..30): retorna null.
 * 4. currentDay já marcado em completedDays: retorna null.
 * 5. Já concluiu um dia hoje (updatedAt no fuso de Brasília == hoje e completedDays > 0): retorna null.
 * 6. Caso elegível: devolve { title, body, data }.
 */
export function decidirMensagemSalvacao({
  planData,
  plan = PLANO_SALVACAO,
  hoje = dataHojeBrasilia(),
}) {
  if (!planData) return null;

  const totalDias = plan?.days || 30;
  const completed = Array.isArray(planData.completedDays)
    ? planData.completedDays.map(Number)
    : [];

  // Se já concluiu todos os dias do plano, não recebe mais lembrete
  if (completed.length >= totalDias) {
    return null;
  }

  const currentDay = Number(planData.currentDay) || 1;

  // Se o dia atual está fora do intervalo válido do plano
  if (currentDay < 1 || currentDay > totalDias) {
    return null;
  }

  // Se o dia atual já consta como concluído
  if (completed.includes(currentDay)) {
    return null;
  }

  // Se já concluiu algum dia hoje no fuso de Brasília (usando updatedAt do último completeDay)
  if (completed.length > 0 && planData.updatedAt) {
    const dataUpdate = dataBrasilia(planData.updatedAt);
    if (dataUpdate === hoje) {
      return null;
    }
  }

  const schedule = plan?.schedule || [];
  const item =
    schedule[currentDay - 1] ||
    schedule.find((d) => Number(d.day) === currentDay);

  const diaTitulo = item?.titulo || "";

  return {
    title: `Plano da Salvação — Dia ${currentDay}`,
    body: diaTitulo,
    data: {
      tipo: "salvacao-do-dia",
      planId: plan?.id || "salvacao-30",
      day: String(currentDay),
      url: "https://biblos.devmf.com.br/",
    },
  };
}

/**
 * Executa o envio do lembrete do Plano da Salvação para usuários que:
 * - Possuem tokens de push registrados
 * - Não desativaram as notificações da salvação (notif.salvation !== false)
 * - Ainda não receberam a notificação hoje (notif.lastSalvation !== hoje)
 * - Possuem o plano salvacao-30 iniciado e incompleto
 * - Não concluíram nenhum dia hoje
 *
 * Devolve o placar { candidatos, enviados, pulados, erros }.
 */
export async function executarSalvacaoDoDia() {
  const banco = db();
  const hoje = dataHojeBrasilia();

  const usersSnap = await banco.collection("users").get();

  let candidatos = 0;
  let enviados = 0;
  let pulados = 0;
  const erros = [];

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userData = userDoc.data() || {};
    const notif = userData.notif || {};

    // Pula se o usuário desligou notificações do Plano da Salvação
    if (notif.salvation === false || notif.plan === false) {
      pulados++;
      continue;
    }

    // Anti-repetição: no máximo 1 envio por dia
    if (notif.lastSalvation === hoje) {
      pulados++;
      continue;
    }

    // Verifica se possui tokens de push registrados
    const tokensSnap = await banco.collection(`users/${uid}/pushTokens`).get();
    if (tokensSnap.empty) {
      pulados++;
      continue;
    }

    // Lê o progresso do plano de salvação do usuário
    const planSnap = await banco
      .doc(`users/${uid}/planProgress/salvacao-30`)
      .get();
    if (!planSnap.exists) {
      pulados++;
      continue;
    }

    const planData = planSnap.data() || {};
    const msg = decidirMensagemSalvacao({
      planData,
      plan: PLANO_SALVACAO,
      hoje,
    });

    if (!msg) {
      pulados++;
      continue;
    }

    candidatos++;

    try {
      const res = await enviarPara(uid, {
        title: msg.title,
        body: msg.body,
        data: msg.data,
      });

      if (res.enviados > 0) {
        enviados++;
        // Grava lastSalvation para idempotência (o plano-parado já ignora o salvacao-30)
        await banco.doc(`users/${uid}`).set(
          {
            notif: {
              ...notif,
              lastSalvation: hoje,
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
