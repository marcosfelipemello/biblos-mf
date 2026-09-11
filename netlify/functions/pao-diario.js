// Função agendada: disparo diário do Pão Diário.
//
// Cron: 0 12 * * * = 9h de BRASÍLIA.
// MOTIVO: O cron do Netlify roda em UTC e Brasília é UTC-3 o ano inteiro
// (sem horário de verão desde 2019). 12h UTC = 09h em Brasília.
// NUNCA altere para 0 9 * * *, senão a notificação passa a chegar às 6h da manhã.
import { executarPaoDiario } from "../lib/pao-diario.js";

export default async () => {
  const placar = await executarPaoDiario();
  console.log("[pao-diario] Execução concluída:", placar);
};

export const config = { schedule: "0 12 * * *" };
