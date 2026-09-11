// Disparo manual de notificação, só para diagnóstico.
// Protegido por segredo: sem ele, qualquer um na internet mandaria notificação
// para qualquer usuário do app.
import { enviarPara } from "./_push.js";

const json = (status, corpo) => ({
  statusCode: status,
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(corpo, null, 2),
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { erro: "Use POST." });

  const segredo = process.env.PUSH_TEST_SECRET;
  if (!segredo || event.headers["x-push-secret"] !== segredo) {
    return json(401, { erro: "Segredo ausente ou errado." });
  }

  let uid, title, body;
  try {
    ({ uid, title = "Biblos", body = "Teste de notificação" } = JSON.parse(
      event.body || "{}"
    ));
  } catch {
    return json(400, { erro: "Corpo inválido." });
  }
  if (!uid) return json(400, { erro: "Informe o uid." });

  try {
    return json(200, await enviarPara(uid, { title, body }));
  } catch (err) {
    return json(500, { erro: err?.message, codigo: err?.errorInfo?.code });
  }
};
