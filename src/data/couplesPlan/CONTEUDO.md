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

## Trilhas: noivos e casados

Uma fase pode ter duas versões, e o casal escolhe a sua no pareamento. Isso se
escreve de dois jeitos, e o critério é quanto do conteúdo realmente diverge.

**Arquivo paralelo** — quando mais de dois terços dos dias mudam. É o caso da
Fase 2: `fase2.js` (casados) e `fase2-noivos.js`, escolhidos pelo `load(track)`
no manifesto. Cânticos e Provérbios pedem isso, porque quase todo dia aplica
diferente para quem espera e para quem já convive.

**Override por dia** — quando só uma parte diverge. A fase mantém o arquivo
base e declara `overrides` no manifesto; um segundo arquivo traz um mapa de
`{ diaNaFase: { campos que mudam } }`, mesclado por cima da base. É o caso da
Fase 1 (16 de 30 dias) e da Fase 3 (6 de 12). Metade dos dias de Gênesis e de
João fala do casal bíblico ou aplica em segunda pessoa neutra — reescrevê-los
seria trabalho jogado fora, e mais um arquivo para manter em sincronia.

Regras do override:

- **Nunca inclua `readings`.** É o que garante o alinhamento entre trilhas de
  graça. O teste falha se aparecer.
- Só os campos que mudam. Muitas vezes é só a última frase do devocional e a
  oração — a pergunta ao casal é onde mora o pressuposto.
- `action: null` remove a ação do dia; o componente já renderiza a seção só
  quando ela existe.
- Se o override troca o `theme`, o tema novo entra na contagem de temas únicos
  daquela trilha como qualquer outro.
- Override idêntico à base é dia esquecido pela metade, e o teste reprova.

As fases sem nenhuma das duas coisas têm um arquivo só, e o `load` delas ignora
o argumento da trilha.

A regra que não se quebra: **variantes compartilham o `dayCount` e as
`readings` de cada dia.** O progresso do casal (`completions`) guarda o número
global do dia, então uma trilha com outra contagem ou outra leitura no dia N
faria quem troca de trilha depois do casamento perder o lugar em silêncio. Só
`theme`, `devotional`, `prayer` e `action` mudam entre trilhas. O teste compara
as leituras dia a dia e falha se divergirem.

Cada trilha é validada como sequência completa e independente: tema e oração
não podem repetir dentro da mesma trilha, e cada livro tocado tem de ser
coberto por inteiro naquela trilha. Trilhas diferentes podem, em teoria, usar
o mesmo tema no mesmo dia — mas não use: confunde na revisão.

Escrever para noivos não é escrever para casados com desconto. Os eixos são
outros: espera, expectativa, conhecer a família do outro, dinheiro antes de
juntar as contas, temperamento sob pressão, preparar antes de mudar de
endereço. E honestidade com os capítulos mais sexuais (Cânticos 4–5,
Provérbios 5–7): ensine o texto, sem virar sermão de pureza nem fingir que o
assunto não está ali.

## Antes de commitar

1. Somar a entrada no `manifest.js` com o `dayCount` correto
2. `node test_couples_plan.js` — confere manifesto x conteúdo, numeração,
   faixa de palavras, tema e oração sem repetição, referências resolvendo no
   `bible.json`, cobertura completa de cada livro tocado, e as leituras batendo
   entre as trilhas
