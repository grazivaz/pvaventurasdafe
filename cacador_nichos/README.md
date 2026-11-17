# Caçador de Nichos do YouTube

Pesquisa 18 buscas (PT / EN / ES) no YouTube, com o filtro **"Data de envio: este mês"**,
e fica só com vídeos de **mais de 4 minutos**. Depois analisa cada canal e gera uma página
HTML com um card por canal, ordenada pelo maior **views ÷ inscritos**.

## Como rodar

Precisa só do Python 3.8+ (não tem nada para instalar).

```bash
cd cacador_nichos
python cacador.py
```

Leva uns 5–7 minutos. No final, abre o `resultado.html` no seu navegador.

Opções:

| Comando | O que faz |
|---|---|
| `python cacador.py --no-open` | Roda sem abrir o navegador |
| `python cacador.py --paginas 1` | Só a 1ª página de cada busca (~20 vídeos), mais rápido |
| `python cacador.py --so-html` | Refaz a página a partir do `resultado.json`, sem pesquisar de novo |

As buscas e os limites (60 mil inscritos, 4 meses, 5x, etc.) ficam no topo do `cacador.py`,
na seção `CONFIG`.

## O que cada número significa

- **views ÷ inscritos**: views do vídeo achado na busca ÷ inscritos do canal (o melhor vídeo do canal).
- **views ÷ média do canal**: views desse vídeo ÷ (views totais do canal ÷ nº de vídeos).
- **Selos**
  - `CANAL NOVO`: canal criado há menos de 4 meses (120 dias).
  - `OUTLIER`: algum vídeo achado tem 5x ou mais views que o canal tem de inscritos.
  - `CONSISTENTE`: 3 ou mais dos ~30 vídeos recentes do canal estão acima da média de views do canal.
- Canais com mais de 60 mil inscritos (ou com inscritos ocultos) ficam de fora.
- As 3 thumbs são os 3 vídeos com mais views entre os recentes do canal (clicáveis).

## Como funciona

Sem chave de API: o script lê a própria página de busca do YouTube (`ytInitialData`),
com 1 segundo de pausa entre as buscas. Para cada canal, lê a página "Sobre" (inscritos,
nº de vídeos, data de criação, views totais) e a aba "Vídeos".

## Se o scraper parar de funcionar

O YouTube muda as páginas de vez em quando, ou pode bloquear por excesso de acessos (erro 429).
Primeiro espere alguns minutos e rode de novo. Se continuar falhando, dá para trocar para a
**YouTube Data API v3**, que é grátis (10.000 unidades por dia):

1. Entre em <https://console.cloud.google.com/> com sua conta Google.
2. No topo, clique em **Selecionar projeto → Novo projeto**, dê um nome (ex.: `cacador-nichos`) e crie.
3. Vá em **APIs e serviços → Biblioteca**, procure **YouTube Data API v3** e clique em **Ativar**.
4. Vá em **APIs e serviços → Credenciais → Criar credenciais → Chave de API**. Copie a chave.
5. (Recomendado) Clique na chave → **Restringir chave** → marque só a *YouTube Data API v3*.
6. Me mande uma mensagem dizendo que tem a chave (não cole a chave no chat) que eu troco o
   script para usar a API.

Atenção: na API, cada busca custa 100 unidades, então 18 buscas × 3 páginas = 5.400 unidades.
Dá para rodar uma vez por dia com folga.
