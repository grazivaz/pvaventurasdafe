# Próximas melhorias — não implementar sem pedido explícito

Este documento guarda o contexto de uma conversa em que a Grazielle explicou por que
precisa deste app além de agenda simples, para retomarmos exatamente de onde paramos.
**Nada aqui deve ser construído até ela pedir.**

## Regra combinada com a Grazielle (vale para tudo daqui pra frente)

Ela pediu explicitamente: **nunca alterar o que já existe na parte de agendamento** (a
tela `/agenda`, seu layout, suas cores) sem avisar antes e ela autorizar. Qualquer
melhoria nova deve ser construída em arquivos separados sempre que possível; quando um
toque em código existente for tecnicamente inevitável (ex.: registrar um novo agendador
em `instrumentation.ts`, adicionar uma variável nova em `globals.css`), deve ser mínimo,
aditivo, e **relatado claramente** depois — não silenciado.

## O motivo (contexto pessoal — tratar com cuidado)

A Grazielle tem TDAH acentuado e tem dificuldade para se organizar e lembrar de
compromissos sozinha, o que já gerou atritos com a esposa, Julyana. O app precisa ir
além de "agenda com hora marcada": precisa ajudar a organizar a rotina da casa, dos
cachorros e do filho pequeno do casal, José.

Ela pediu para eu **entender o problema e trazer soluções práticas, criativas e úteis**
— não implementar de cara.

## O diagnóstico que eu dei (e ela não corrigiu)

Três problemas diferentes, hoje todos empurrados para dentro de "tarefa com data":

1. **Rotinas que se repetem sozinhas** — banho dos cachorros a cada 30 dias, fralda/leite
   do José, vacina, troca de filtro. O ponto de dor: ninguém deveria precisar "contar os
   dias de cabeça" nem recriar a tarefa toda vez.
2. **Lista de compras** — sem hora nem data, as duas anotando e vendo em tempo real o que
   falta comprar no mercado. Hoje isso está sendo forçado dentro de tarefas com categoria
   "mercado", o que não é o formato certo.
3. **Diário/histórico por área (Casa / Cachorros / José / Casal)** — um registro rápido tipo
   "dia 20/07 os cachorros tomaram banho" ou "comprei fralda tamanho G". Funciona como
   memória externa (não precisa lembrar se já fez) e como prova gentil em discussões
   ("está escrito aqui, foi dia 12").

## Ideia de integração entre as três

Ao marcar uma rotina cíclica como feita (ex.: "banho dos cachorros"), o app poderia:
- criar sozinho a entrada correspondente no diário daquela área
- já calcular e reagendar a próxima ocorrência (feita + 30 dias, por exemplo)

Uma ação da Grazielle resolvendo três coisas de uma vez — é o tipo de atrito que mais
importa reduzir para quem tem TDAH.

## Status

1. ✅ **Rotinas cíclicas — construída e publicada.** Ver seção própria abaixo.
2. ⏳ Lista de compras — ainda não iniciada
3. ⏳ Diário por área — ainda não iniciado

## Rotinas cíclicas — como foi construída

Área nova, totalmente separada da agenda: dados, API e telas próprias. Nada da tela
`/agenda` foi alterado em conteúdo — só duas medidas de espaçamento (ver abaixo).

- **Dados:** `src/lib/routines/types.ts` (tipos e as 5 áreas: Cachorros/José/Casa/Casal/
  Outro), `src/lib/routines/input.ts` (validação). Persistência em `rotinas: Routine[]`
  dentro do mesmo `AgendaStore` (métodos novos e aditivos em `file-store.ts` e
  `postgres-store.ts` — nenhum método de tarefa foi tocado).
- **API:** `/api/rotinas` (listar/criar), `/api/rotinas/[id]` (editar/excluir),
  `/api/rotinas/[id]/concluir` (marcar "feito hoje" — recalcula a próxima data sozinho e
  guarda no histórico), `/api/rotinas/lembretes` (cron externo, para paridade com
  `/api/lembretes`).
- **Lembretes:** agendador próprio em `src/lib/routines/scheduler.ts`, independente do
  agendador de tarefas — roda a cada 1 min, insiste a cada 3 dias se ignorado. Ligado em
  `instrumentation.ts` com uma linha adicionada (agendador de tarefas não foi tocado).
- **Tela:** `/rotinas`, cartões agrupados em "Atrasadas" / "Em dia", barra de progresso,
  botão único "Feito hoje". Componentes: `RoutinesScreen`, `RoutineCard`, `RoutineSheet`.
- **Navegação:** barra fixa no rodapé (`BottomNav.tsx`), aprovada explicitamente pela
  Grazielle antes de construir. Isso exigiu dois ajustes de espaçamento em
  `AgendaScreen.tsx` (posição do botão "+ Nova tarefa" e padding inferior) para o botão
  não ficar coberto pela barra nova — nenhuma outra linha da agenda mudou. Diff
  conferido linha a linha antes de publicar.

Testado com Playwright (claro e escuro): criar rotina, marcar "feito hoje", lembrete de
rotina atrasada disparando via push, e a tela de agenda voltando **pixel a pixel igual**
à original depois de navegar entre as duas áreas.

## Perguntas em aberto para quando ela voltar

- Quando ela quiser começar a Lista de compras ou o Diário por área
- Se a lista de compras deve ter categorias (mercado, farmácia, pet) ou ser uma lista única
- Se o diário deve reaproveitar o histórico que as rotinas já guardam (cada "feito hoje"
  já fica registrado com data e quem fez, dentro da própria rotina) ou ser algo à parte

## Estado técnico do app (para retomar rápido)

- App em Next.js 16 + React 19, código em `src/`, publicado via Docker no EasyPanel da
  Hostinger, domínio `agenda.fluxialabs.cloud`
- Branch de desenvolvimento: `claude/web-app-creation-dxm4jh`
- Deploy: EasyPanel rebuilda a partir do Git; não há deploy automático configurado ainda
  (webhook mencionado como opção, não ativado)
- Persistência: arquivo JSON no volume `/data` (não Postgres) — ver `src/lib/store/`
- Push notifications e lembretes já funcionando de ponta a ponta, testados no Mac e no
  iPhone da Grazielle
