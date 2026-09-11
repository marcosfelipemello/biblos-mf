// Função agendada: lembrete para planos individuais parados há mais de 2 dias.
//
// Cron: 0 22 * * * = 19h de BRASÍLIA.
// MOTIVO: O cron do Netlify roda em UTC e Brasília é UTC-3 o ano inteiro
// (sem horário de verão desde 2019). 22h UTC = 19h em Brasília.
// NUNCA altere para 0 19 * * *, senão a notificação passa a chegar às 16h.
import { executarPlanoParado } from "../lib/plano-parado.js";

export default async () => {
  const placar = await executarPlanoParado();
  console.log("[plano-parado] Execução concluída:", placar);
};

export const config = { schedule: "0 22 * * *" };
