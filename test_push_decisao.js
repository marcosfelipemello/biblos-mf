// Confere a tabela de decisão de notificações para casais (Etapa 4 / Etapa 6).
// Execução: node test_push_decisao.js
import assert from "node:assert";
import { decidirMensagemDoCasal } from "./netlify/lib/casal-do-dia.js";

// Caso 1: Você marcou o dia -> NADA (retorna null)
{
  const res = decidirMensagemDoCasal({
    currentDay: 5,
    completions: {
      userA: [1, 2, 3, 4, 5],
      userB: [1, 2, 3, 4],
    },
    uid: "userA",
    outroUid: "userB",
    nomeDoOutro: "Lari",
  });
  assert.strictEqual(
    res,
    null,
    "Caso 1 falhou: quem já marcou o dia não deve receber notificação"
  );
}

// Caso 1b: Ambos marcaram o dia -> NADA para ambos
{
  const resA = decidirMensagemDoCasal({
    currentDay: 5,
    completions: {
      userA: [5],
      userB: [5],
    },
    uid: "userA",
    outroUid: "userB",
    nomeDoOutro: "Lari",
  });
  assert.strictEqual(resA, null, "Caso 1b (userA) falhou: ambos concluíram");

  const resB = decidirMensagemDoCasal({
    currentDay: 5,
    completions: {
      userA: [5],
      userB: [5],
    },
    uid: "userB",
    outroUid: "userA",
    nomeDoOutro: "Marcos",
  });
  assert.strictEqual(resB, null, "Caso 1b (userB) falhou: ambos concluíram");
}

// Caso 2: O outro marcou, você não -> incentivo citando o parceiro
{
  const res = decidirMensagemDoCasal({
    currentDay: 5,
    completions: {
      userA: [1, 2, 3, 4],
      userB: [1, 2, 3, 4, 5],
    },
    uid: "userA",
    outroUid: "userB",
    nomeDoOutro: "Lari",
  });
  assert.ok(res !== null, "Caso 2 falhou: mensagem deveria existir");
  assert.strictEqual(res.title, "Plano de Casal");
  assert.strictEqual(
    res.body,
    "Lari já leu hoje — te espera na leitura do Dia 5!"
  );
}

// Caso 2b: O outro marcou, você não, mas o perfil do parceiro está sem nome -> fallback 'Seu par'
{
  const res = decidirMensagemDoCasal({
    currentDay: 5,
    completions: {
      userA: [],
      userB: [5],
    },
    uid: "userA",
    outroUid: "userB",
    nomeDoOutro: null,
  });
  assert.ok(res !== null, "Caso 2b falhou: mensagem deveria existir");
  assert.strictEqual(
    res.body,
    "Seu par já leu hoje — te espera na leitura do Dia 5!"
  );
}

// Caso 3: Ninguém dos dois marcou -> lembrete de que a leitura de vocês está esperando
{
  const res = decidirMensagemDoCasal({
    currentDay: 5,
    completions: {
      userA: [1, 2, 3, 4],
      userB: [1, 2, 3, 4],
    },
    uid: "userA",
    outroUid: "userB",
    nomeDoOutro: "Lari",
  });
  assert.ok(res !== null, "Caso 3 falhou: mensagem deveria existir");
  assert.strictEqual(res.title, "Plano de Casal");
  assert.strictEqual(
    res.body,
    "A leitura de hoje de vocês está esperando (Dia 5)."
  );
}

console.log("OK: todos os testes de decisão de casal passaram com sucesso!");
