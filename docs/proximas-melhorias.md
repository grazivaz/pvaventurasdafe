# Próximas melhorias — não implementar sem pedido explícito

Este documento guarda o contexto de uma conversa em que a Grazielle explicou por que
precisa deste app além de agenda simples, para retomarmos exatamente de onde paramos.
**Nada aqui deve ser construído até ela pedir.**

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

## Ordem sugerida de construção (ela ainda não confirmou)

1. Rotinas cíclicas — usa o mesmo motor de notificação que já existe e resolve os dois
   exemplos que ela deu (cachorros, fraldas do José)
2. Lista de compras — mais simples, alívio mais rápido no dia a dia
3. Diário por área — a peça de registro/memória

## Perguntas em aberto para quando ela voltar

- Qual das três partes ela quer que eu comece a construir primeiro (ou se prefere as três
  em sequência, sem pausa para escolher)
- Se "rotina cíclica" deve viver dentro da mesma lista de tarefas (com um selo "se repete
  a cada X dias") ou como uma área separada da agenda
- Quais áreas do diário fazem sentido além de Casa / Cachorros / José / Casal — perguntar
  se falta alguma
- Se a lista de compras deve ter categorias (mercado, farmácia, pet) ou ser uma lista única

## Estado técnico do app (para retomar rápido)

- App em Next.js 16 + React 19, código em `src/`, publicado via Docker no EasyPanel da
  Hostinger, domínio `agenda.fluxialabs.cloud`
- Branch de desenvolvimento: `claude/web-app-creation-dxm4jh`
- Deploy: EasyPanel rebuilda a partir do Git; não há deploy automático configurado ainda
  (webhook mencionado como opção, não ativado)
- Persistência: arquivo JSON no volume `/data` (não Postgres) — ver `src/lib/store/`
- Push notifications e lembretes já funcionando de ponta a ponta, testados no Mac e no
  iPhone da Grazielle
