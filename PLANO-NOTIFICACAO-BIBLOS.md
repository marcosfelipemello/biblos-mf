# PLANO NOTIFICAÇÃO BIBLOS (v1 · 11/09/2026)

Notificações no Biblos MF (`/root/projetos/biblos-mf/app`). Identificador para handoff:
**NOTIFICACAO-BIBLOS-01**. Executor: **agy** (Antigravity). Fiscal: Claude. Dono: Marcos.

## O que o dono pediu (11/09/2026)

1. **Pão Diário** — o versículo do dia chega às **9h de Brasília**.
2. **Plano de leitura parado** — quem começou um plano e não avança há **2 dias** recebe
   um empurrãozinho.
3. **Plano de casais** — três avisos, todos escolhidos por ele:
   - lembrete diário da leitura do casal;
   - quando o cônjuge conclui o dia, o outro é avisado;
   - quando um já leu e o outro não, o que ficou para trás recebe um toque no fim do dia.

E as notificações têm de chegar **com o app fechado** — push de verdade, não aviso local.

## Situação — leia antes de escrever uma linha

- **Stack:** Vite + React 19 + Firebase (Auth + Firestore) + Netlify Functions. PWA já
  instalável (`vite-plugin-pwa`, `registerType: "prompt"`).
- **Não existe nenhuma linha de notificação no projeto hoje.** Nada para reaproveitar,
  nada para quebrar.
- **Onde os dados já estão** (não invente coleção nova para o que já existe):
  - plano solo: `users/{uid}/planProgress/{planId}` — `{ currentDay, completedDays[], startedAt, updatedAt }`
  - casal: `couples/{codigo}` — `{ members[], profiles, planId, track, currentDay, positions{uid}, completions{uid:[dias]}, notes }`
  - vínculo: `users/{uid}.coupleId`
  - Pão Diário: `src/data/dailyManna.js` (`DAILY_MANNA`, lista de `{ ref, text, theme, reflection }`)
- **Firebase v12.7.0 instalado.** Conferido em `node_modules/@firebase/messaging`: a API
  pública desta versão é `getMessaging`, `getToken(messaging, { vapidKey })`, `onMessage`,
  `deleteToken`, `isSupported`. **Use essa.** Documentação na internet pode mostrar um
  `register()` que NÃO existe nesta versão.
- **As `firestore.rules` do repositório nunca foram deployadas** (ver
  `BIBLOS-BLINDAGEM-01.md`, pendência 1 — não há firebase CLI nesta VPS). Então toda regra
  nova deste plano nasce **escrita, não aplicada**, e vai junto com as outras quando o dono
  mandar deployar.

## Regras fixas

1. Uma etapa por vez, **1 commit por etapa, feito pelo fiscal**, com o identificador na
   mensagem.
2. Ritual de fechamento de cada etapa: implementar → `npx eslint .` sem erro novo +
   `npm run build` passando → conferência do fiscal → commit → **aval do Marcos** → próxima.
3. **Nunca `git add`, `git commit`, `git push`.** Entregue na área de trabalho e avise.
   Motivo: publicar é decisão do dono, e quem confere é o fiscal.
4. **Nenhum segredo no repositório.** A chave de serviço do Firebase existe só como
   variável de ambiente no Netlify e se lê por `process.env`. Motivo: o repositório é
   público no GitHub — chave commitada é chave vazada, e revogar depois não desfaz.
5. Nada de "melhorar de passagem". Só o que a etapa nomeia.
6. **Não toque** em `src/data/bible.json`, `harpaCristaData.js`, `cantorCristaoData.js`,
   `knowledgeBase.js` (arquivos de conteúdo, megabytes) nem em `netlify/functions/chat.js`.
   Motivo: não têm nada a ver com notificação e um diff acidental ali é impossível de revisar.

---

## O que só o Marcos pode fazer (Console do Firebase e Netlify)

O código das etapas 1 e 2 **não funciona sem estes três passos manuais**. Eles não são
tarefa do agy — são do dono, com o fiscal explicando clique a clique. O agy escreve o
código lendo as chaves de variável de ambiente e segue.

1. **Ativar o Cloud Messaging** no projeto `banco-de-dados---dho`.
2. **Gerar o par de chaves Web Push (VAPID)** em Configurações → Cloud Messaging. A chave
   **pública** entra no código do cliente (ela é pública por natureza, como o `apiKey` que
   já está em `src/config/firebase.js`).
3. **Gerar uma chave de conta de serviço** (JSON) e colá-la no Netlify como variável de
   ambiente `FIREBASE_SERVICE_ACCOUNT`. Essa é **secreta** e nunca entra no repositório.

---

## Etapa 1 — O aparelho passa a saber receber (permissão + token)

**Arquivos:** `src/hooks/usePush.js` (novo), `public/firebase-messaging-sw.js` (novo),
`src/components/Dashboard.jsx` ou a tela de ajustes já existente (um botão), `firestore.rules`.

**O que fazer.**
- Hook `usePush(user)` que: checa `isSupported()`, pede permissão **só quando o usuário
  toca no botão**, chama `getToken(messaging, { vapidKey })` e grava o token.
- **Onde gravar:** `users/{uid}/pushTokens/{token}` — um documento por aparelho, com
  `{ createdAt, userAgent }`. Subcoleção, não campo de array: assim o servidor apaga um
  token morto sem reescrever o documento do usuário, e a regra de escrita fica simples.
- **Preferências:** `users/{uid}.notif = { manna: true, plan: true, couple: true }`, com
  três chaves e mais nada. Quem nunca tocou no botão não tem token e não recebe nada —
  desligar é apagar o token ou virar a chave.
- **Service worker:** `public/firebase-messaging-sw.js` com `onBackgroundMessage`. Ele
  convive com o service worker do `vite-plugin-pwa` (são arquivos diferentes, escopos
  diferentes) — não mexa na configuração do PWA no `vite.config.js`.
- **Rules:** `users/{uid}/pushTokens/{token}` — só o dono lê, cria e apaga. Escrita
  **escrita, não deployada** (ver Situação).

**PROIBIDO pedir a permissão no carregamento da página.** Motivo: navegador moderno ignora
(ou pune) pedido de notificação sem gesto do usuário, e **no iPhone o push de PWA só existe
se o app estiver instalado na tela de início** — pedir antes disso queima a única chance,
porque quem nega uma vez não é perguntado de novo. O botão precisa explicar o que a pessoa
vai receber ANTES de abrir o diálogo do navegador.

**Fecha quando:** tocar no botão em um aparelho grava um documento em
`users/{uid}/pushTokens/`, e recarregar a página não cria um segundo documento para o mesmo
aparelho.

---

## Etapa 2 — O servidor passa a saber enviar (a primeira notificação: Pão Diário)

**Arquivos:** `netlify/functions/_push.js` (novo, ajudante compartilhado),
`netlify/functions/pao-diario.js` (novo), `package.json` (dependência `firebase-admin`).

**O ajudante `_push.js`** concentra o que as três funções agendadas vão repetir: inicializar
o `firebase-admin` com `process.env.FIREBASE_SERVICE_ACCOUNT`, buscar os tokens de um
usuário, mandar a mensagem e **apagar o token quando o FCM responder
`messaging/registration-token-not-registered`**. Motivo de apagar: token morto nunca
ressuscita, e token morto acumulado vira fila de erro em toda execução.

**A função agendada:**
```js
export default async (req) => { /* ... */ };
export const config = { schedule: "0 12 * * *" };
```
`0 12 * * *` é **9h de Brasília** — o cron do Netlify roda em **UTC**, e Brasília é UTC-3 o
ano inteiro (não há mais horário de verão desde 2019). Escreva esse motivo no comentário,
senão alguém "conserta" para `0 9 * * *` e a notificação passa a chegar às 6h.

**Qual versículo:** o mesmo critério que o app já usa para escolher o Pão Diário do dia
(leia `src/components/Devotionals.jsx` / `dailyManna.js` e **copie o critério que já
existe**). Se o app mostra o versículo X hoje, a notificação tem de falar do versículo X.
Duas fontes de verdade para "o dia de hoje" é defeito garantido.

**Quem recebe:** cada usuário com ao menos um token e `notif.manna != false`.

**Percorra a coleção `users` e leia a subcoleção de cada um.** PROIBIDO usar
`collectionGroup` aqui. Motivo: consulta de grupo de coleção exige índice declarado, o
`firestore.indexes.json` do projeto está vazio e ninguém aplicou índice nenhum — a função
quebraria em produção e não no seu teste. Deixe um comentário
`// ponytail: varredura simples, trocar por collectionGroup + índice quando passar de ~500 usuários`.

**Anti-repetição:** grave `users/{uid}.notif.lastManna = <data do dia>` e não envie duas
vezes no mesmo dia. Motivo: função agendada pode ser reexecutada, e ninguém quer o mesmo
versículo duas vezes.

**Fecha quando:** com um token real gravado, a execução manual da função entrega a
notificação no aparelho, e a segunda execução no mesmo dia não entrega nada.

---

## Etapa 3 — Plano solo começado e parado (2 dias)

**Arquivo:** `netlify/functions/plano-parado.js` (novo).

`export const config = { schedule: "0 22 * * *" }` → **19h de Brasília**. Não é às 9h de
propósito: duas notificações no mesmo minuto viram uma só na cabeça de quem recebe, e a
segunda ensina a ignorar as duas.

**Regra:** para cada usuário com token e `notif.plan != false`, olhar
`users/{uid}/planProgress/{planId}`. Avisa se `updatedAt` (ou `startedAt`, quando o plano
nunca avançou) é mais velho que **2 dias**, e o plano ainda não terminou
(`completedDays.length < total de dias do plano`).

**Um aviso por usuário, não um por plano.** Motivo: quem tem três planos parados não merece
três notificações — cite o plano mais recente e pare por aí.

**Anti-repetição:** `notif.lastPlan` com a data; no máximo **um aviso a cada 2 dias** por
usuário. Motivo: sem isso, quem abandonou um plano recebe a mesma cobrança todo santo dia
até desinstalar o app.

**Fecha quando:** um plano parado há 2 dias gera exatamente um aviso; no dia seguinte, sem
o usuário ter avançado, não gera outro.

---

## Etapa 4 — O casal (o lembrete e o "seu par já leu")

**Arquivo:** `netlify/functions/casal-do-dia.js` (novo).

`export const config = { schedule: "0 23 * * *" }` → **20h de Brasília**, hora em que casal
lê junto.

Uma execução só resolve os dois avisos do fim do dia, porque a decisão é a mesma leitura do
documento `couples/{codigo}`. Para cada casal com dois membros, e para cada membro com token
e `notif.couple != false`, decidir **uma** mensagem:

| Situação do dia de hoje (`currentDay`) | Mensagem |
|---|---|
| ninguém dos dois marcou | lembrete: "a leitura de hoje de vocês está esperando" |
| o outro marcou, você não | "o(a) `<nome do perfil>` já leu hoje — te espera na leitura" |
| você marcou | **nada** |

O nome sai de `couple.profiles[uid]`; se não houver nome, use uma fórmula neutra ("seu par").
Motivo: nome errado numa notificação de casal é constrangedor.

**Fecha quando:** num casal de teste onde só um marcou o dia, exatamente uma pessoa recebe —
a que não marcou.

---

## Etapa 5 — "O cônjuge acabou de concluir" (aviso na hora)

**Arquivos:** `netlify/functions/avisar-par.js` (novo), `src/hooks/useCouple.js` (uma chamada),
`netlify.toml` (redirect `/api/avisar-par`).

Este é o único aviso que **não** é agendado: ele nasce de uma ação. Como o projeto não tem
Cloud Functions (gatilho de Firestore exigiria o plano Blaze), o caminho é o que o projeto
já usa para o chat: **o cliente chama uma função no Netlify**.

- Depois que `completeDay` grava com sucesso, o app chama `/api/avisar-par`.
- A função **exige o ID token do Firebase no cabeçalho e o verifica** com
  `admin.auth().verifyIdToken()`. Motivo: sem isso, qualquer pessoa na internet dispara
  notificação para qualquer casal — a função roda com poder de administrador e não tem as
  rules protegendo.
- Depois de verificar, ela confere **no servidor** que quem chamou é membro daquele casal e
  que o dia foi mesmo marcado. PROIBIDO confiar no que o cliente mandou no corpo do pedido.
  Motivo: o corpo é digitável por qualquer um; o documento no Firestore é a verdade.
- Chamada **sem bloquear a tela**: se a notificação falhar, marcar o dia continua funcionando.
  Motivo: aviso é enfeite, marcar o dia é a função do app.

**Fecha quando:** um membro marca o dia e o outro recebe a notificação em segundos; e uma
chamada sem token válido, ou de quem não é do casal, é recusada.

---

## Etapa 6 — Desligar de verdade, e a conferência

**Arquivos:** a tela de ajustes, `netlify/functions/_push.js`.

- Três chaves (Pão Diário, plano parado, casal) que o usuário liga e desliga, e um
  "parar de receber neste aparelho" que apaga o token (`deleteToken` + apagar o documento).
- **Uma verificação automática, pequena:** extrair a decisão do casal (a tabela da Etapa 4)
  numa função pura e deixar um `test_push_decisao.js` com `assert` na raiz, no mesmo estilo
  dos `test_*.js` que já existem no projeto. Sem framework, sem fixture: três asserts, um
  por linha da tabela. Motivo: é a única lógica deste plano que decide QUEM recebe o quê —
  se ela inverter, o app vira spam.

**Fecha quando:** desligar uma chave faz a notificação daquele tipo parar de chegar, e
`node test_push_decisao.js` passa.

---

## Andamento

| Etapa | Estado | Executor | Data | Commit |
|---|---|---|---|---|
| 1 — permissão e token no aparelho | ✅ feito e provado em produção (2 aparelhos) | agy + fiscal | 11/09/2026 | `e5861cb` |
| 2 — envio no servidor + Pão Diário (9h) | ✅ feito e provado: disparo sob demanda enviou (1/1) e a repetição imediata pulou | fiscal (`push.js`) + agy (agendada) | 11/09/2026 | `1bcda48` + (este commit) |
| 3 — plano solo parado há 2 dias (19h) | ⏳ pendente | | | |
| 4 — casal: lembrete e "seu par já leu" (20h) | ⏳ pendente | | | |
| 5 — aviso na hora em que o cônjuge conclui | ⏳ pendente | | | |
| 6 — desligar, e a verificação da decisão | ⏳ pendente | | | |

**Achado de 11/09/2026 — o `firebase-admin` NÃO pode ser empacotado.** Empacotado pelo
bundler do Netlify ele quebra ao buscar o token OAuth (`app/invalid-credential` — "Class
extends value #<Object> is not a constructor"), embora a leitura do Firestore continue
funcionando, o que faz o erro parecer credencial errada. A cura está no `netlify.toml`:
`external_node_modules = ["firebase-admin"]`. Não desfaça.

**Dependências:** a Etapa 1 não fecha sem a chave VAPID; a 2, a 3, a 4 e a 5 não fecham sem a
chave de serviço no Netlify. As duas são passos manuais do dono, listados lá em cima.

**Fora deste plano, de propósito:** notificação por e-mail, agendamento por horário
escolhido pelo usuário, som e vibração personalizados, e resumo semanal. Nada disso foi
pedido — entra num `PLANO-NOTIFICACAO-BIBLOS-02` se fizer falta depois de a primeira versão
rodar.
