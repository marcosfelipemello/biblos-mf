// Função agendada: lembrete noturno para casais no plano compartilhado.
//
// Cron: 0 23 * * * = 20h de BRASÍLIA.
// MOTIVO: O cron do Netlify roda em UTC e Brasília é UTC-3 o ano inteiro
// (sem horário de verão desde 2019). 23h UTC = 20h em Brasília.
// NUNCA altere para 0 20 * * *, senão a notificação passa a chegar às 17h.
import { executarCasalDoDia } from "../lib/casal-do-dia.js";

export default async () => {
  const placar = await executarCasalDoDia();
  console.log("[casal-do-dia] Execução concluída:", placar);
};

export const config = { schedule: "0 23 * * *" };
