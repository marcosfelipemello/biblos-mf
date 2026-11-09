// Confere a regra de disparo e seleção de mensagem do Plano da Salvação.
// Execução: node test_salvacao_do_dia.js
import assert from "node:assert";
import {
  decidirMensagemSalvacao,
  dataBrasilia,
} from "./netlify/lib/salvacao-do-dia.js";
import { PLANO_SALVACAO } from "./src/data/planoSalvacao.js";

const HOJE = "2026-11-09";
const ONTEM = "2026-11-08";

// 1. RECEBE: Usuário no início do plano (Dia 1, nenhuma leitura concluída)
{
  const res = decidirMensagemSalvacao({
    planData: {
      currentDay: 1,
      completedDays: [],
      startedAt: ONTEM,
    },
    plan: PLANO_SALVACAO,
    hoje: HOJE,
  });

  assert.ok(res !== null, "Dia 1 não concluído deveria gerar notificação");
  assert.strictEqual(res.title, "Plano da Salvação — Dia 1");
  assert.strictEqual(res.body, PLANO_SALVACAO.schedule[0].titulo);
  assert.strictEqual(res.data.tipo, "salvacao-do-dia");
  assert.strictEqual(res.data.planId, "salvacao-30");
  assert.strictEqual(res.data.day, "1");
}

// 1b. RECEBE: Usuário no Dia 5, leu até o Dia 4 ontem
{
  const res = decidirMensagemSalvacao({
    planData: {
      currentDay: 5,
      completedDays: [1, 2, 3, 4],
      updatedAt: ONTEM,
    },
    plan: PLANO_SALVACAO,
    hoje: HOJE,
  });

  assert.ok(res !== null, "Dia 5 pendente deveria gerar notificação");
  assert.strictEqual(res.title, "Plano da Salvação — Dia 5");
  assert.strictEqual(res.body, PLANO_SALVACAO.schedule[4].titulo);
  assert.strictEqual(res.data.day, "5");
}

// 2. NÃO RECEBE SEM PLANO: planData nulo ou indefinido
{
  assert.strictEqual(
    decidirMensagemSalvacao({ planData: null, plan: PLANO_SALVACAO, hoje: HOJE }),
    null,
    "Sem plano (null) não deve receber notificação"
  );

  assert.strictEqual(
    decidirMensagemSalvacao({ planData: undefined, plan: PLANO_SALVACAO, hoje: HOJE }),
    null,
    "Sem plano (undefined) não deve receber notificação"
  );
}

// 3. NÃO RECEBE COM PLANO TERMINADO: todos os 30 dias concluídos
{
  const todosConcluidos = Array.from({ length: 30 }, (_, i) => i + 1);

  const res = decidirMensagemSalvacao({
    planData: {
      currentDay: 30,
      completedDays: todosConcluidos,
      updatedAt: ONTEM,
    },
    plan: PLANO_SALVACAO,
    hoje: HOJE,
  });

  assert.strictEqual(
    res,
    null,
    "Plano concluído com 30 dias não deve receber notificação"
  );

  // Mesmo se currentDay for 31
  const res31 = decidirMensagemSalvacao({
    planData: {
      currentDay: 31,
      completedDays: todosConcluidos,
      updatedAt: ONTEM,
    },
    plan: PLANO_SALVACAO,
    hoje: HOJE,
  });

  assert.strictEqual(
    res31,
    null,
    "Plano com cursor após o último dia não deve receber notificação"
  );
}

// 4. NÃO RECEBE SE JÁ LEU HOJE
{
  // 4a. Concluiu leitura hoje (updatedAt no fuso de Brasília é HOJE)
  const resHoje = decidirMensagemSalvacao({
    planData: {
      currentDay: 3,
      completedDays: [1, 2],
      updatedAt: "2026-11-09T18:30:00Z", // 15h30 em Brasília no dia 09/11
    },
    plan: PLANO_SALVACAO,
    hoje: HOJE,
  });

  assert.strictEqual(
    resHoje,
    null,
    "Quem já concluiu um dia hoje não deve receber notificação"
  );

  // 4b. Com Timestamp do Firestore (_seconds) representando HOJE às 19h UTC (16h Brasília)
  const tsHoje = { _seconds: Math.floor(new Date("2026-11-09T19:00:00Z").getTime() / 1000) };
  const resTs = decidirMensagemSalvacao({
    planData: {
      currentDay: 4,
      completedDays: [1, 2, 3],
      updatedAt: tsHoje,
    },
    plan: PLANO_SALVACAO,
    hoje: HOJE,
  });

  assert.strictEqual(
    resTs,
    null,
    "Timestamp do Firestore de hoje deve ser reconhecido e suprimir aviso"
  );

  // 4c. O dia atual já consta em completedDays (mesmo que updatedAt seja antigo)
  const resJaMarcado = decidirMensagemSalvacao({
    planData: {
      currentDay: 3,
      completedDays: [1, 2, 3],
      updatedAt: ONTEM,
    },
    plan: PLANO_SALVACAO,
    hoje: HOJE,
  });

  assert.strictEqual(
    resJaMarcado,
    null,
    "Se o currentDay já foi concluído, não deve receber"
  );
}

// 5. O DIA N E O TÍTULO VÊM DO SCHEDULE PARA TODOS OS 30 DIAS
{
  assert.strictEqual(PLANO_SALVACAO.schedule.length, 30, "Schedule deve ter exatamente 30 dias");

  for (let dia = 1; dia <= 30; dia++) {
    const itemEsperado = PLANO_SALVACAO.schedule[dia - 1];
    assert.strictEqual(itemEsperado.day, dia, `Item do schedule para dia ${dia} deve ter day === ${dia}`);
    assert.ok(itemEsperado.titulo && itemEsperado.titulo.trim().length > 0, `Dia ${dia} deve possuir título não vazio`);

    const res = decidirMensagemSalvacao({
      planData: {
        currentDay: dia,
        completedDays: Array.from({ length: dia - 1 }, (_, i) => i + 1),
        updatedAt: ONTEM,
      },
      plan: PLANO_SALVACAO,
      hoje: HOJE,
    });

    assert.ok(res !== null, `Dia ${dia} deveria gerar notificação`);
    assert.strictEqual(res.title, `Plano da Salvação — Dia ${dia}`);
    assert.strictEqual(res.body, itemEsperado.titulo, `Título do dia ${dia} não bate com schedule`);
    assert.strictEqual(res.data.day, String(dia));
  }
}

// 6. CASOS DE BORDA: Fuso horário de Brasília
{
  // 22h UTC de 09/11 = 19h Brasília de 09/11 -> HOJE
  assert.strictEqual(
    dataBrasilia(new Date("2026-11-09T22:00:00Z")),
    "2026-11-09"
  );

  // 01h UTC de 10/11 = 22h Brasília de 09/11 -> ainda é HOJE em Brasília
  assert.strictEqual(
    dataBrasilia(new Date("2026-11-10T01:00:00Z")),
    "2026-11-09"
  );

  // String pura YYYY-MM-DD é tratada diretamente sem desvio de UTC
  assert.strictEqual(dataBrasilia("2026-11-09"), "2026-11-09");
}

console.log("ok — todos os testes de test_salvacao_do_dia.js passaram com sucesso");
