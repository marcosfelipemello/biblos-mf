// Disparo manual de notificação, só para diagnóstico.
// Protegido por segredo: sem ele, qualquer um na internet mandaria notificação
// para qualquer usuário do app.
import { enviarPara } from "../lib/push.js";
import { executarPaoDiario } from "../lib/pao-diario.js";
import { executarPlanoParado } from "../lib/plano-parado.js";
import { executarCasalDoDia } from "../lib/casal-do-dia.js";

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

  let uid, title, body, job;
  try {
    ({ uid, title = "Biblos", body = "Teste de notificação", job } = JSON.parse(
      event.body || "{}"
    ));
  } catch {
    return json(400, { erro: "Corpo inválido." });
  }

  // Execução de rotina agendada sob demanda para teste e validação
  if (job === "pao-diario") {
    try {
      const placar = await executarPaoDiario();
      return json(200, { job: "pao-diario", ...placar });
    } catch (err) {
      return json(500, { erro: err?.message, codigo: err?.errorInfo?.code });
    }
  }

  if (job === "plano-parado") {
    try {
      const placar = await executarPlanoParado();
      return json(200, { job: "plano-parado", ...placar });
    } catch (err) {
      return json(500, { erro: err?.message, codigo: err?.errorInfo?.code });
    }
  }

  if (job === "casal-do-dia") {
    try {
      const placar = await executarCasalDoDia();
      return json(200, { job: "casal-do-dia", ...placar });
    } catch (err) {
      return json(500, { erro: err?.message, codigo: err?.errorInfo?.code });
    }
  }

  if (!uid) return json(400, { erro: "Informe o uid ou job." });

  try {
    return json(200, await enviarPara(uid, { title, body }));
  } catch (err) {
    return json(500, { erro: err?.message, codigo: err?.errorInfo?.code });
  }
};
