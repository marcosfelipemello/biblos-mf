// Aviso instantâneo ao parceiro quando o cônjuge conclui a leitura do dia.
//
// Segurança:
// 1. Exige e valida o ID token do Firebase (Authorization: Bearer <token>).
// 2. Lê couples/{coupleId} no servidor e confirma que o chamador é membro
//    e que o dia informado realmente consta em completions[uid].
// 3. Respeita a preferência do destinatário (notif.couple !== false).
// 4. Guarda anti-spam: grava users/{destinatario}.notif.lastPar = `${coupleId}:${dia}`
//    e não envia duplicado para o mesmo par/dia.
import { db, enviarPara } from "../lib/push.js";

// Verificação do ID token SEM o firebase-admin/auth de propósito: ele depende do
// pacote `jose`, que só existe como ESM e morre no bundler do Netlify
// ("require() of ES Module .../jose", 502 em produção). O endpoint público do
// Google valida assinatura e validade do token do mesmo jeito, com um fetch e
// zero dependência. A apiKey usada aqui é a mesma pública do cliente.
const API_KEY = "AIzaSyCG8j-KgPOLIVdTTCmiGtQA7VVT_5ysFM8";

async function uidDoToken(idToken) {
  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!resp.ok) return null;
  const dados = await resp.json();
  return dados?.users?.[0]?.localId || null;
}

const json = (status, corpo) => ({
  statusCode: status,
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(corpo, null, 2),
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { erro: "Use POST." });

  const authHeader =
    event.headers.authorization || event.headers.Authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return json(401, { erro: "Cabeçalho Authorization ausente ou inválido." });
  }

  const idToken = authHeader.slice(7).trim();
  if (!idToken) {
    return json(401, { erro: "Token ausente." });
  }

  const banco = db();

  let uid;
  try {
    uid = await uidDoToken(idToken);
  } catch {
    return json(401, { erro: "Não foi possível verificar o token." });
  }

  if (!uid) {
    return json(401, { erro: "Usuário não identificado pelo token." });
  }

  let coupleId;
  let dia;
  try {
    const parsed = JSON.parse(event.body || "{}");
    coupleId = parsed.coupleId;
    dia = Number(parsed.dia);
  } catch {
    return json(400, { erro: "Corpo JSON inválido." });
  }

  if (!coupleId || !dia || isNaN(dia)) {
    return json(400, {
      erro: "Parâmetros coupleId e dia são obrigatórios.",
    });
  }

  // Validação no servidor: lê couples/{coupleId}
  const coupleRef = banco.doc(`couples/${coupleId}`);
  const coupleSnap = await coupleRef.get();
  if (!coupleSnap.exists) {
    return json(404, { erro: "Casal não encontrado." });
  }

  const coupleData = coupleSnap.data() || {};
  const members = Array.isArray(coupleData.members) ? coupleData.members : [];

  if (!members.includes(uid)) {
    return json(403, { erro: "Você não é membro deste casal." });
  }

  if (members.length !== 2) {
    return json(400, { erro: "Casal não possui 2 membros ativos." });
  }

  // Confere se o dia realmente consta em completions[uid] no Firestore
  const completions = coupleData.completions || {};
  const minhas = Array.isArray(completions[uid]) ? completions[uid] : [];
  if (!minhas.map(Number).includes(dia)) {
    return json(400, {
      erro: "O dia informado não está marcado como concluído no servidor.",
    });
  }

  const destinatarioUid = members.find((m) => m !== uid);

  // Se o destinatário JÁ concluiu esse dia, não há o que avisar.
  // Isto também é anti-spam: sem essa checagem, quem concluiu dez dias podia
  // chamar a função dez vezes, um dia por chamada, e metralhar o celular do par
  // — a chave lastPar sozinha não barra isso, porque muda a cada dia.
  const jaLeu = Array.isArray(completions[destinatarioUid])
    ? completions[destinatarioUid].map(Number).includes(dia)
    : false;
  if (jaLeu) {
    return json(200, { enviado: false, motivo: "destinatario-ja-leu" });
  }

  // Lê destinatário para verificar preferências e anti-spam
  const destUserSnap = await banco.doc(`users/${destinatarioUid}`).get();
  if (!destUserSnap.exists) {
    return json(200, { enviado: false, motivo: "destinatario-inexistente" });
  }

  const destUserData = destUserSnap.data() || {};
  const destNotif = destUserData.notif || {};

  // Respeita preferência do destinatário
  if (destNotif.couple === false) {
    return json(200, { enviado: false, motivo: "notificacao-desativada" });
  }

  // Guarda anti-spam contra múltiplos cliques de marcar/desmarcar
  const chaveSpam = `${coupleId}:${dia}`;
  if (destNotif.lastPar === chaveSpam) {
    return json(200, { enviado: false, motivo: "anti-spam-duplicado" });
  }

  // Só envia se houver tokens
  const tokensSnap = await banco
    .collection(`users/${destinatarioUid}/pushTokens`)
    .get();
  if (tokensSnap.empty) {
    return json(200, { enviado: false, motivo: "sem-tokens" });
  }

  // Nome do autor da conclusão
  const meuPerfil = coupleData.profiles?.[uid];
  const rawNome =
    typeof meuPerfil === "object" && meuPerfil !== null
      ? meuPerfil.name
      : meuPerfil;
  const nome =
    typeof rawNome === "string" && rawNome.trim() ? rawNome.trim() : "Seu par";

  const title = "Plano de Casal";
  const body = `${nome} concluiu a leitura do Dia ${dia}. Que tal ler também?`;

  try {
    const res = await enviarPara(destinatarioUid, {
      title,
      body,
      data: {
        tipo: "casal-concluiu",
        coupleId,
        day: String(dia),
        authorUid: uid,
      },
    });

    if (res.enviados > 0) {
      await banco.doc(`users/${destinatarioUid}`).set(
        {
          notif: {
            ...destNotif,
            lastPar: chaveSpam,
          },
        },
        { merge: true }
      );
    }

    // Devolve só o placar. NUNCA devolver o `res` inteiro: ele traz os tokens
    // dos aparelhos do destinatário, e token de push não é assunto de quem chamou.
    return json(200, { enviado: res.enviados > 0, aparelhos: res.enviados });
  } catch (err) {
    return json(500, { erro: err?.message || String(err) });
  }
};
