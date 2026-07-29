# Contrato de conteúdo — Plano para Casais

Regras para escrever uma fase nova. Existem porque o plano vai até ~695 dias:
sem um padrão escrito, a fase 20 não se parece com a fase 2.

## Formato de um dia

```js
{
  readings: ["Provérbios 15", "Provérbios 16"],  // livro + capítulo
  theme: "A resposta branda",                     // 2 a 4 palavras
  devotional: "...",                              // 110 a 140 palavras
  prayer: "Que ...",                              // uma frase
  action: "..."                                   // opcional
}
```

O `day` é acrescentado automaticamente pelo `.map()` no fim do arquivo. Não
escreva à mão.

## Devocional

- **110 a 140 palavras.** O teste aceita 90 a 170 para dar folga, mas mire na
  faixa.
- **Comece no texto do dia**, não numa ideia genérica sobre casamento. Cite o
  que está escrito ali.
- **Feche com uma pergunta ou provocação concreta ao casal.**
- **Honestidade com o texto.** Em Levítico, genealogias e censos, ensine a
  passagem de verdade em vez de torcê-la para virar conselho conjugal. Um
  devocional forçado destrói a confiança mais rápido que um dia difícil.
- **Sem clichê.** Nada de "Deus tem um plano" como conclusão automática.

## Tema

Duas a quatro palavras. **Não pode repetir tema de nenhuma fase anterior** — o
teste falha se repetir.

## Oração

Uma frase, primeira pessoa do plural, que **faça sentido sozinha**: ela vai
parar na lista de Motivos de Oração do usuário, fora do contexto do dia. Não
pode repetir literalmente nenhuma outra do plano.

## Ação (opcional)

Uma proposta concreta e pequena: uma pergunta para conversarem, um gesto, orar
juntos em voz alta. Use com parcimônia — se todo dia tiver, perde o efeito.
Cerca de um terço dos dias é uma boa medida.

## Antes de commitar

1. Somar a entrada no `manifest.js` com o `dayCount` correto
2. `node test_couples_plan.js` — confere manifesto x conteúdo, numeração,
   faixa de palavras, tema e oração sem repetição, referências resolvendo no
   `bible.json`, e cobertura completa de cada livro tocado
