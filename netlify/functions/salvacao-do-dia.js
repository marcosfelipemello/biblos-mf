// Função agendada: lembrete diário para o Plano da Salvação.
//
// Cron: 0 22 * * * = 19h de BRASÍLIA.
// MOTIVO: O cron do Netlify roda em UTC e Brasília é UTC-3 o ano inteiro
// (sem horário de verão desde 2019). 22h UTC = 19h em Brasília.
// NUNCA altere para 0 19 * * *, senão a notificação passa a chegar às 16h.
import { executarSalvacaoDoDia } from "../lib/salvacao-do-dia.js";

export default async () => {
  const placar = await executarSalvacaoDoDia();
  console.log("[salvacao-do-dia] Execução concluída:", placar);
};

export const config = { schedule: "0 22 * * *" };
