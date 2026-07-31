# Agenda — Julyana & Grazielle

Agenda on-line compartilhada por duas pessoas, sem login e sem senha. Serve para anotar as
tarefas do dia a dia (mercado, médico, remédio, contas) e receber um alerta no celular quando a
hora chega.

## Como funciona

- **Quem é você?** A primeira tela pede o nome. A escolha fica guardada no aparelho, então só
  aparece uma vez. Cada pessoa tem uma cor — Julyana é violeta, Grazielle é rosa — e toda tarefa
  fica com a tag de quem anotou.
- **Semana a semana.** A agenda mostra de domingo a sábado. Todo domingo a tela já abre na semana
  nova, e as setas ‹ › levam para as outras semanas.
- **Lembrete na hora.** Ao criar a tarefa você escolhe a antecedência (na hora, 30 min antes,
  1 dia antes…) e se o aviso vai para as duas ou só para quem anotou. Na hora certa o celular
  recebe uma notificação — mesmo com o app fechado. Se a agenda estiver aberta, um alarme aparece
  na tela e toca um som.
- **Aviso quando a outra anota algo.** Quem adiciona uma tarefa dispara uma notificação para a
  outra pessoa na mesma hora. Quem estiver com o app aberto ainda vê a tarefa surgir na lista com
  um toque de aviso.

## Ativando os alertas no celular

1. Abra a agenda no navegador do celular.
2. Toque em **Ativar** no cartão "Ativar alertas" e permita as notificações.
3. Use o botão **testar** para conferir que o aviso chega.

No **iPhone** o site precisa estar instalado na tela de início para poder notificar: toque em
Compartilhar → **Adicionar à Tela de Início**, abra a agenda por esse ícone e o botão de ativar
aparece. No Android funciona direto pelo Chrome.

## Rodando no computador

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>. As notificações do navegador exigem HTTPS; para testá-las na sua
máquina use `npx next dev --experimental-https`.

## Publicando

O app precisa de um servidor que fique **sempre ligado** e tenha um **disco que não apague**:
é esse servidor que confere os lembretes de 30 em 30 segundos e dispara as notificações, e é no
disco que ficam as tarefas. Serviços que "dormem" quando ninguém acessa não servem, porque o
lembrete não sai na hora.

O repositório já vem com tudo pronto: `Dockerfile`, `railway.json`, `render.yaml` e `fly.toml`.

### Railway (o caminho mais simples — tudo pelo site)

1. Entre em <https://railway.com> e crie a conta com **Login with GitHub**.
2. **New Project → Deploy from GitHub repo** e escolha `grazivaz/pvaventurasdafe`. Autorize o
   Railway a enxergar o repositório se ele pedir.
3. Abra o serviço criado, vá em **Settings → Source** e confira o **branch**. Se a agenda ainda
   estiver na branch `claude/web-app-creation-dxm4jh`, selecione ela aqui (ou faça o merge na
   `main` antes e deixe `main`).
4. Ainda em **Settings**, procure **Volumes → Add Volume** e use o caminho de montagem `/data`.
   É aqui que as tarefas ficam guardadas — sem o volume, tudo se perde a cada atualização.
5. Vá em **Settings → Networking → Generate Domain**. O Railway devolve um endereço parecido com
   `https://agenda-production.up.railway.app`. Esse é o endereço da agenda.
6. Espere o deploy terminar (fica verde) e abra o endereço no celular.

Não precisa configurar nenhuma variável de ambiente: o `Dockerfile` já define a pasta de dados e
o fuso de São Paulo, e as chaves de notificação são geradas sozinhas na primeira execução.

O plano Hobby do Railway custa cerca de US$ 5 por mês; no começo há um crédito de teste.

### Render

Igual em espírito: **New → Blueprint**, aponte para o repositório e o `render.yaml` já descreve o
serviço e o disco de 1 GB em `/data`. Atenção: no Render o disco só existe a partir do plano pago
(Starter, cerca de US$ 7/mês) — o plano gratuito dorme e apaga os dados.

### Fly.io

Precisa do programa `flyctl` no computador:

```bash
fly auth login
fly launch --no-deploy        # confirme o nome do app; ele reaproveita o fly.toml
fly volumes create agenda_dados --region gru --size 1
fly deploy
```

O `fly.toml` já fixa a região de São Paulo (`gru`) e impede a máquina de dormir.

### Servidor próprio (VPS com Docker)

```bash
git clone https://github.com/grazivaz/pvaventurasdafe.git
cd pvaventurasdafe
docker build -t agenda .
docker volume create agenda_dados
docker run -d --name agenda --restart unless-stopped \
  -p 3000:3000 -v agenda_dados:/data agenda
```

Coloque um nginx ou o Caddy na frente para servir por HTTPS — as notificações do navegador só
funcionam em endereço seguro.

### Depois de publicar

1. Abra o endereço no celular e escolha o seu nome.
2. Toque em **Ativar** no cartão de alertas e permita as notificações.
3. Use o **testar** para confirmar que o aviso chega.
4. Adicione a agenda à tela de início (obrigatório no iPhone) e mande o endereço para a Julyana
   fazer o mesmo, escolhendo o nome dela.

### Opção Vercel (ou outra hospedagem serverless)

Lá não existe disco fixo nem processo contínuo, então são necessários dois ajustes:

1. Crie um banco Postgres grátis (Neon, Supabase, Vercel Postgres) e defina `DATABASE_URL`. As
   tabelas são criadas automaticamente.
2. Agende um cron externo (o [cron-job.org](https://cron-job.org) faz isso de graça) chamando
   `https://SEU-SITE/api/lembretes` de minuto em minuto, senão os lembretes não saem. Defina
   `CRON_SECRET` e chame a URL com `?token=SEU-SEGREDO` para ninguém mais conseguir acionar.

## Variáveis de ambiente

Todas são opcionais — sem nenhuma delas o app roda guardando os dados em `.data/agenda.json`.

| Variável | Para que serve |
| --- | --- |
| `AGENDA_DATA_DIR` | Pasta onde o arquivo de dados é gravado (padrão `.data`). |
| `DATABASE_URL` | Se definida, os dados vão para o Postgres em vez do arquivo. |
| `NEXT_PUBLIC_APP_TIMEZONE` | Fuso usado nos horários (padrão `America/Sao_Paulo`). |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Chaves de notificação. Se faltarem, são geradas e guardadas junto com os dados. |
| `VAPID_SUBJECT` | E-mail de contato exigido pelo serviço de push (`mailto:voce@exemplo.com`). |
| `CRON_SECRET` | Protege a rota `/api/lembretes` quando um cron externo a chama. |
| `AGENDA_DISABLE_SCHEDULER` | `1` desliga o agendador interno (use quando o cron externo cuidar disso). |

## Backup

Com o modo arquivo, tudo mora em um único JSON (`.data/agenda.json` por padrão): tarefas,
inscrições de notificação e as chaves de push. Copiar esse arquivo é o backup completo.

## Como o projeto é organizado

```
src/app/            páginas (/ e /agenda) e rotas de API
src/components/     tela da agenda, formulário, alarme e avisos
src/hooks/          sincronização das tarefas, push e alarme
src/lib/            datas, pessoas, tipos, persistência e envio de push
src/instrumentation.ts  liga o agendador de lembretes quando o servidor sobe
public/sw.js        service worker que exibe as notificações
```
