# Refazendo a Agenda no Lovable

Este documento tem os prompts prontos para recriar a agenda no [Lovable](https://lovable.dev),
que gera React + Vite + Tailwind + shadcn/ui com Supabase como backend.

**Como usar:** crie um projeto novo no Lovable e cole o **Prompt 1** inteiro como primeira
mensagem. Depois que ele terminar e a tela estiver funcionando, mande os prompts seguintes um de
cada vez, na ordem, esperando cada um terminar.

---

## Prompt 1 — PRD principal (cole como primeira mensagem)

````text
Crie um aplicativo web de agenda compartilhada, em português do Brasil, pensado primeiro para
celular. Ele é usado por exatamente duas pessoas: Julyana e Grazielle.

## Objetivo
Anotar tarefas do dia a dia (ir ao supermercado, consulta médica, comprar remédio, pagar contas)
e receber um alerta no celular quando a hora está chegando.

## Regras gerais
- NÃO crie login, cadastro nem autenticação. A pessoa é identificada só pela escolha na primeira
  tela, guardada no localStorage.
- Todos os horários são no fuso America/Sao_Paulo.
- Interface inteiramente em português do Brasil, com linguagem simples e acolhedora.

## Banco de dados (Supabase)
Crie duas tabelas com RLS habilitada, mas com políticas que permitam SELECT, INSERT, UPDATE e
DELETE para o papel anon (o app não tem login, então o acesso é aberto).

Tabela `tarefas`:
- id: uuid, chave primária, default gen_random_uuid()
- titulo: text, obrigatório
- observacao: text, default ''
- categoria: text, obrigatório, um de: mercado, saude, farmacia, casa, contas, pessoal, outro
- data: date, obrigatório
- hora: time, pode ser nulo (nulo significa "dia todo")
- lembrete_minutos: integer, pode ser nulo (nulo = sem lembrete), valores aceitos:
  0, 10, 30, 60, 180, 1440
- avisar: text, default 'todas', valores: 'todas' ou 'somente_eu'
- criada_por: text, obrigatório, 'julyana' ou 'grazielle'
- feita: boolean, default false
- feita_em: timestamptz, nulo
- feita_por: text, nulo
- lembrete_enviado_em: timestamptz, nulo
- criada_em: timestamptz, default now()

Tabela `inscricoes_push`:
- id: uuid, chave primária, default gen_random_uuid()
- pessoa: text, obrigatório ('julyana' ou 'grazielle')
- endpoint: text, obrigatório, único
- p256dh: text, obrigatório
- auth: text, obrigatório
- criada_em: timestamptz, default now()

Ative o Realtime na tabela `tarefas`.

## Tela 1 — "Quem é você?"
Rota `/`. Ocupa a tela inteira, centralizada.
- Título grande em fonte serifada: "Quem é você?"
- Subtítulo: "Toque no seu nome. Tudo que você anotar fica marcado com ele — e a outra recebe um
  aviso na hora."
- Dois cartões grandes, empilhados no celular e lado a lado no computador, com altura de uns
  190px, cantos bem arredondados e fundo em degradê:
  - Julyana — degradê violeta (#a08cff → #7c5cff → #5a34e0)
  - Grazielle — degradê rosa (#ff8fb4 → #ff4d8d → #e0246b)
  - Cada cartão traz a inicial dentro de um círculo translúcido no topo, o nome em fonte
    serifada embaixo e a frase "sou eu ›". A inicial também aparece gigante e semitransparente
    como decoração no canto.
- Ao tocar: salva a escolha no localStorage e vai para `/agenda`.
- Quem já escolheu antes é levado direto para `/agenda` ao abrir o site.
- Rodapé: "Sem login e sem senha. Dá para trocar de nome depois, é só tocar no seu avatar."

## Tela 2 — Agenda semanal
Rota `/agenda`. Se não houver nome escolhido no localStorage, volta para `/`.

Topo (rola junto com a página):
- Mês e ano em letras maiúsculas espaçadas, pequeno e discreto
- "Oi, {Nome}" em fonte serifada
- Avatar circular no canto direito com a inicial e o degradê da pessoa; ao tocar, limpa a escolha
  e volta para a tela 1
- Uma frase de resumo: "Você tem 2 tarefas para hoje." / "Nada para hoje. 3 tarefas no resto da
  semana." / "Semana livre por enquanto. 🌿"

Barra fixa no topo ao rolar (sticky), com fundo translúcido e desfoque:
- Setas ‹ e › para semana anterior e próxima
- No centro: o intervalo da semana ("26 de julho a 1 de agosto") e embaixo, menor, "esta
  semana" / "próxima semana" / "semana passada"
- Uma régua com os 7 dias (DOM a SÁB) mostrando o número do dia; o dia de hoje fica destacado
  com fundo colorido, e dias com tarefa pendente ganham um pontinho embaixo. Tocar em um dia
  rola a página até ele.
- Quando não está na semana atual, aparece um botão "Voltar para esta semana"

Corpo: uma seção por dia, de domingo a sábado, na ordem.
- Cabeçalho do dia: nome do dia por extenso em fonte serifada ("quinta-feira", só a primeira
  letra maiúscula), "dia 30" ao lado, etiqueta "HOJE" quando for o caso, e "1/3 feitas" à direita
- Dias sem tarefa mostram um botão tracejado "Nada marcado — adicionar", que abre o formulário
  já com aquela data
- Dias passados aparecem com o título em cinza

Cartão de tarefa:
- Barra vertical fina na borda esquerda com a cor de quem criou
- Círculo de marcar como feita à esquerda; quando marcada, o círculo fica preenchido com a cor da
  pessoa e o título fica riscado e cinza
- Título, observação (se houver) e uma linha de etiquetas pequenas: horário (ou "dia todo") na
  cor da pessoa, categoria com emoji, antecedência do lembrete com ícone de sino, e "atrasada" em
  vermelho quando já passou da hora e não foi feita
- No canto direito da linha de etiquetas: um pontinho da cor da pessoa e o nome dela
- Botões de editar (lápis) e excluir (lixeira) à direita. O excluir pede confirmação numa
  faixinha dentro do próprio cartão ("Excluir esta tarefa? Não / Excluir"), sem usar alert do
  navegador

Botão flutuante fixo no canto inferior direito: "+ Nova tarefa", com o degradê da pessoa.

## Formulário de tarefa (abre de baixo para cima, como uma gaveta)
Serve tanto para criar quanto para editar. Campos:
- "O que precisa fazer?" — texto, obrigatório, máximo 120 caracteres, com foco automático,
  placeholder "Ex.: comprar remédio da pressão"
- "Tipo" — etiquetas clicáveis: 🛒 Mercado, 🩺 Saúde, 💊 Remédio, 🏠 Casa, 💳 Contas,
  ✨ Pessoal, 📌 Outro
- "Quando" — seletor de data, com o dia por extenso embaixo e atalhos "Hoje", "Amanhã",
  "Depois de amanhã"
- "Horário" — seletor de hora, com uma caixinha "dia todo" que desativa o campo. Ao criar, já
  vem preenchido com o próximo horário redondo (ou 09:00 se for um dia futuro)
- "Me avise" — lista: Sem lembrete, Na hora, 10 min antes, 30 min antes, 1 hora antes,
  3 horas antes, 1 dia antes. Padrão: 30 min antes
- Quando há lembrete, aparecem dois botões: "Avisar nós duas" (padrão) e "Avisar só quem anotou"
- "Observação (opcional)" — texto de duas linhas
- Botão grande embaixo, na cor da pessoa: "Adicionar à agenda" (ou "Salvar alterações")
- Fecha com Esc, com o X ou tocando fora

Tarefas marcadas como "dia todo" usam 08:00 como referência para calcular o lembrete.

## Aparência
- Estilo leve e acolhedor, nada corporativo. Cantos bem arredondados (20 a 28px), sombras
  suaves, bastante respiro entre os elementos.
- Fundo creme claro (#f7f4fa) com dois degradês radiais suaves e discretos nos cantos de cima,
  um lilás e um rosado.
- Títulos em fonte serifada elegante (Fraunces ou Playfair Display); textos em fonte sem serifa
  moderna (Inter ou Geist).
- Modo escuro automático seguindo o sistema, com fundo #100d18 e cartões #191527.
- Julyana é violeta (#7c5cff), Grazielle é rosa (#ff4d8d). Essas cores aparecem na barra do
  cartão, na etiqueta de horário, no círculo de concluir e no botão flutuante.
- Animações discretas: cartões surgindo de baixo, gaveta deslizando.

## Sincronização entre as duas
Use o Realtime do Supabase na tabela `tarefas`. Quando a outra pessoa cria uma tarefa, a lista
atualiza sozinha e aparece um aviso flutuante na parte de baixo: "Julyana anotou: ir ao mercado",
com o pontinho na cor dela.

## Aceite
- Consigo escolher meu nome, ver a semana atual, criar, editar, concluir e excluir tarefas
- Toda tarefa mostra claramente quem anotou, pela cor e pelo nome
- A semana muda com as setas e volta para a atual com um toque
- Tudo funciona bem numa tela de celular de 390px de largura
````

---

## Prompt 2 — Notificações no celular (mande depois que a tela estiver pronta)

Antes de mandar este prompt, gere um par de chaves VAPID em <https://vapidkeys.com> e guarde as
duas (pública e privada). O Lovable vai pedir para você cadastrá-las como secrets do Supabase.

````text
Agora adicione notificações push de verdade, que funcionem com o app fechado.

1. Crie `public/sw.js`, um service worker que:
   - no evento `push`, lê o JSON recebido e mostra a notificação com título, corpo, ícone,
     vibração e `renotify: true`
   - no evento `notificationclick`, fecha o aviso e abre (ou foca) o app na rota /agenda

2. Na tela da agenda, adicione um cartão "Ativar alertas" com um botão. Ao tocar:
   - registra o service worker
   - pede permissão de notificação
   - inscreve no PushManager usando a chave pública VAPID
   - salva endpoint, p256dh, auth e a pessoa na tabela `inscricoes_push`
   O cartão some quando já está ativo, virando uma linha discreta "Alertas ligados neste
   aparelho · testar · desligar".

3. Se for iPhone e o app não estiver instalado na tela de início, mostre no lugar do botão:
   "Toque em Compartilhar e depois em Adicionar à Tela de Início para receber alertas."

4. Crie uma edge function `enviar-push` que recebe { pessoas: string[], titulo, corpo, tag, url },
   busca as inscrições dessas pessoas e envia usando `npm:web-push`, com as chaves vindas dos
   secrets VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY e VAPID_SUBJECT. Inscrições que retornarem 404 ou
   410 devem ser apagadas da tabela.

5. Logo depois de criar uma tarefa, o app chama `enviar-push` para a OUTRA pessoa, com título
   "{Nome} anotou uma tarefa" e corpo "{emoji} {titulo} · hoje às 14:30".

6. Transforme o app em PWA instalável: manifest com nome "Agenda", cor de tema #7c5cff, modo
   standalone e ícones 192 e 512 (um calendário branco com um "check", sobre degradê
   violeta→rosa).
````

---

## Prompt 3 — Lembretes na hora certa

````text
Agora faça os lembretes dispararem sozinhos.

Crie uma edge function `disparar-lembretes` que:
- busca em `tarefas` as que têm `feita = false`, `lembrete_enviado_em` nulo e
  `lembrete_minutos` não nulo
- calcula o instante do lembrete: data + hora (ou 08:00 quando hora é nula), no fuso
  America/Sao_Paulo, menos `lembrete_minutos`
- para cada uma cujo instante já passou, marca `lembrete_enviado_em = now()` e chama a função de
  envio de push. Vai para todas as duas quando `avisar = 'todas'`, ou só para quem criou quando
  `avisar = 'somente_eu'`
- lembretes atrasados mais de 6 horas são apenas marcados como enviados, sem notificar, para não
  disparar uma enxurrada de avisos antigos
- o título da notificação é "{emoji da categoria} {titulo}" e o corpo é
  "hoje às 14:30 · anotado por Julyana"

Agende essa função para rodar a cada minuto usando pg_cron com pg_net.
````

---

## Prompt 4 — Alarme na tela com som

````text
Quando a agenda estiver aberta no celular e chegar a hora de uma tarefa, mostre um alarme por
cima da tela, além da notificação do sistema.

- A cada 10 segundos, procure tarefas não feitas cujo horário de lembrete já passou (dentro dos
  últimos 30 minutos) e que ainda não tenham tocado neste aparelho. Guarde os ids já tocados no
  localStorage para não repetir.
- Respeite o campo `avisar`: se for 'somente_eu', só alerta quem criou a tarefa.
- O alarme é um cartão centralizado com fundo escurecido atrás, mostrando o emoji da categoria
  num círculo, o texto "HORA DA TAREFA", o título da tarefa, "hoje às 22:30 · anotado por
  Julyana", a observação, e dois botões: "Já fiz" (marca como concluída e fecha) e
  "Ok, entendi" (só fecha).
- Ao aparecer, toque um sino de três notas gerado com a Web Audio API (880, 1109 e 1319 Hz,
  em sequência, repetindo uma vez) e vibre o celular. Não use arquivo de áudio.
- Como o navegador só libera som depois de um toque na tela, inicialize o AudioContext quando a
  pessoa escolher o nome na primeira tela.
````

---

## Prompt 5 — Ajustes finais

````text
Últimos ajustes:
- Confira que tudo funciona bem em tela de 390px, sem rolagem horizontal
- Respeite as áreas seguras do iPhone (safe-area-inset) no topo, no botão flutuante e na gaveta
- Nomes de dias e meses só com a primeira letra maiúscula ("quinta-feira", não "Quinta-Feira")
- A semana vai de domingo a sábado, e vira sozinha quando o dia muda, sem precisar recarregar
- Modo escuro consistente em todas as telas, incluindo a gaveta e o alarme
- Textos de estado vazio e de erro em português, com tom gentil
````

---

## O que provavelmente vai dar trabalho lá

- **Chaves VAPID e secrets.** O Lovable vai pedir para você cadastrar `VAPID_PUBLIC_KEY`,
  `VAPID_PRIVATE_KEY` e `VAPID_SUBJECT` nos secrets do Supabase. Gere o par em vapidkeys.com.
- **pg_cron.** Precisa estar habilitado no projeto Supabase (Database → Extensions). Sem ele os
  lembretes não disparam sozinhos.
- **RLS.** Como não há login, as políticas precisam liberar o papel `anon`. Se o Lovable insistir
  em criar autenticação, repita: "não crie login; libere as políticas para anon".
- **iPhone.** Continua valendo: só recebe notificação depois de adicionar à tela de início.
