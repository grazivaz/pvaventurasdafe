#!/usr/bin/env python3
"""
Caçador de nichos do YouTube (scraper, sem chave de API).

Uso:
    python cacador.py              # roda tudo e abre o resultado no navegador
    python cacador.py --no-open    # roda sem abrir o navegador
    python cacador.py --paginas 1  # menos resultados por busca (mais rápido)

Só usa a biblioteca padrão do Python 3.8+ (nada para instalar).
"""

import argparse
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
import webbrowser
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from pathlib import Path

# ----------------------------------------------------------------- CONFIG ---
BUSCAS = [
    # (busca, idioma)
    ("mistérios do oceano", "pt"),
    ("ocean mysteries", "en"),
    ("misterios del océano", "es"),
    ("história antiga documentário", "pt"),
    ("ancient history documentary", "en"),
    ("historia antigua documental", "es"),
    ("como era a vida na idade média", "pt"),
    ("what life was like in medieval times", "en"),
    ("cómo era la vida en la edad media", "es"),
    ("mistérios do espaço", "pt"),
    ("space mysteries", "en"),
    ("misterios del espacio", "es"),
    ("psicologia sombria", "pt"),
    ("dark psychology", "en"),
    ("psicología oscura", "es"),
    ("civilizações perdidas", "pt"),
    ("lost civilizations", "en"),
    ("civilizaciones perdidas", "es"),
]

PAIS_POR_IDIOMA = {"pt": "BR", "en": "US", "es": "MX"}
NOME_IDIOMA = {"pt": "Português", "en": "English", "es": "Español"}

FILTRO_ESTE_MES_VIDEOS = "EgQIBBAB"  # Data de envio: este mês + tipo: vídeo
DURACAO_MINIMA_S = 4 * 60            # mais de 4 minutos (nada de Shorts)
PAUSA_ENTRE_BUSCAS_S = 1.0
MAX_INSCRITOS = 60_000
CANAL_NOVO_DIAS = 120                # ~4 meses
OUTLIER_MULT = 5                     # views >= 5x inscritos
CONSISTENTE_MIN = 3                  # 3+ vídeos acima da média do canal
THREADS_CANAIS = 4

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
PASTA = Path(__file__).resolve().parent
SAIDA_HTML = PASTA / "resultado.html"
SAIDA_JSON = PASTA / "resultado.json"


class BloqueadoError(Exception):
    pass


# ------------------------------------------------------------------ HTTP ---
def http(url, data=None, tentativas=3):
    headers = {
        "User-Agent": UA,
        "Accept-Language": "en-US,en;q=0.9",
        "Cookie": "SOCS=CAI; CONSENT=YES+1",  # pula a tela de consentimento
    }
    body = None
    if data is not None:
        body = json.dumps(data).encode()
        headers["Content-Type"] = "application/json"
    for i in range(tentativas):
        try:
            req = urllib.request.Request(url, data=body, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            if e.code == 429:
                if i == tentativas - 1:
                    raise BloqueadoError("YouTube respondeu 429 (muitas requisições).")
                time.sleep(10 * (i + 1))
            elif i == tentativas - 1:
                raise
            else:
                time.sleep(2 * (i + 1))
        except Exception:
            if i == tentativas - 1:
                raise
            time.sleep(2 * (i + 1))


def initial_data(pagina):
    m = re.search(r"var ytInitialData\s*=\s*(\{.*?\});\s*</script>", pagina, re.S)
    if not m:
        if "consent.youtube.com" in pagina or "unusual traffic" in pagina:
            raise BloqueadoError("YouTube pediu consentimento/captcha.")
        return None
    return json.loads(m.group(1))


def ytcfg(pagina, chave):
    m = re.search(r'"%s"\s*:\s*"([^"]+)"' % chave, pagina)
    return m.group(1) if m else None


def achar(obj, chave):
    """Gera todos os valores de `chave` em qualquer profundidade."""
    pilha = [obj]
    while pilha:
        o = pilha.pop()
        if isinstance(o, dict):
            for k, v in o.items():
                if k == chave:
                    yield v
                else:
                    pilha.append(v)
        elif isinstance(o, list):
            pilha.extend(reversed(o))


def texto(t):
    if not t:
        return ""
    if isinstance(t, str):
        return t
    if "simpleText" in t:
        return t["simpleText"]
    if "runs" in t:
        return "".join(r.get("text", "") for r in t["runs"])
    if "content" in t:
        return t["content"]
    return ""


# ------------------------------------------------------------- PARSERS ---
def numero(s):
    """'88,040 views' -> 88040 ; '1.2K' -> 1200 ; '2.85M subscribers' -> 2850000."""
    if not s:
        return None
    s = s.replace(",", "").strip()
    if s.lower().startswith("no "):
        return 0
    m = re.search(r"([\d.]+)\s*([KMB])?", s, re.I)
    if not m:
        return None
    n = float(m.group(1))
    mult = {"K": 1e3, "M": 1e6, "B": 1e9}.get((m.group(2) or "").upper(), 1)
    return int(round(n * mult))


def duracao_s(s):
    if not s:
        return None
    partes = [int(p) for p in s.strip().split(":") if p.isdigit()]
    seg = 0
    for p in partes:
        seg = seg * 60 + p
    return seg


def dias_atras(s):
    """'3 days ago', '4w ago', '1 month ago', 'Streamed 5 hours ago' -> dias."""
    if not s:
        return None
    m = re.search(r"(\d+)\s*(mo|y|w|d|h|m|s|month|year|week|day|hour|minute|second)", s.lower())
    if not m:
        return None
    n = int(m.group(1))
    u = m.group(2)
    if u.startswith("mo"):
        return n * 30
    if u.startswith("y"):
        return n * 365
    if u.startswith("w"):
        return n * 7
    if u.startswith("d"):
        return n
    return 0


def data_criacao(s):
    m = re.search(r"([A-Z][a-z]{2}) (\d{1,2}), (\d{4})", s or "")
    if not m:
        return None
    try:
        return datetime.strptime(" ".join(m.groups()), "%b %d %Y")
    except ValueError:
        return None


# --------------------------------------------------------------- BUSCA ---
def video_da_busca(v, idioma, busca):
    dur = duracao_s(texto(v.get("lengthText")))
    if dur is None or dur <= DURACAO_MINIMA_S:
        return None  # ao vivo, Shorts ou curto demais
    dono = (v.get("ownerText") or v.get("longBylineText") or {}).get("runs") or [{}]
    canal_id = dono[0].get("navigationEndpoint", {}).get("browseEndpoint", {}).get("browseId")
    if not canal_id:
        return None
    return {
        "id": v["videoId"],
        "titulo": texto(v.get("title")),
        "views": numero(texto(v.get("viewCountText"))) or 0,
        "dias": dias_atras(texto(v.get("publishedTimeText"))),
        "duracao": texto(v.get("lengthText")),
        "canal_id": canal_id,
        "canal_nome": dono[0].get("text", ""),
        "idioma": idioma,
        "busca": busca,
    }


def buscar(busca, idioma, paginas):
    gl = PAIS_POR_IDIOMA[idioma]
    url = ("https://www.youtube.com/results?search_query=%s&sp=%s&hl=en&gl=%s"
           % (urllib.parse.quote_plus(busca), FILTRO_ESTE_MES_VIDEOS, gl))
    pagina = http(url)
    dados = initial_data(pagina)
    if dados is None:
        raise BloqueadoError("Página de busca sem ytInitialData.")
    chave_api = ytcfg(pagina, "INNERTUBE_API_KEY")
    versao = ytcfg(pagina, "INNERTUBE_CLIENT_VERSION") or "2.20241101.00.00"

    videos = []
    for p in range(paginas):
        for v in achar(dados, "videoRenderer"):
            vid = video_da_busca(v, idioma, busca)
            if vid:
                videos.append(vid)
        token = next((c.get("continuationCommand", {}).get("token")
                      for c in achar(dados, "continuationEndpoint")), None)
        if p == paginas - 1 or not token or not chave_api:
            break
        time.sleep(PAUSA_ENTRE_BUSCAS_S)
        resp = http("https://www.youtube.com/youtubei/v1/search?key=" + chave_api, data={
            "context": {"client": {"clientName": "WEB", "clientVersion": versao,
                                   "hl": "en", "gl": gl}},
            "continuation": token,
        })
        dados = json.loads(resp)
    return videos


# --------------------------------------------------------------- CANAL ---
def info_canal(canal_id):
    base = "https://www.youtube.com/channel/%s/%s?hl=en&gl=US"
    dados = initial_data(http(base % (canal_id, "about")))
    sobre = next(achar(dados or {}, "aboutChannelViewModel"), None)
    if not sobre:
        return None
    criado = data_criacao(texto(sobre.get("joinedDateText")))
    canal = {
        "id": canal_id,
        "inscritos": numero(sobre.get("subscriberCountText")),
        "n_videos": numero(sobre.get("videoCountText")),
        "views_total": numero(sobre.get("viewCountText")),
        "criado": criado.strftime("%d/%m/%Y") if criado else None,
        "idade_dias": (datetime.now() - criado).days if criado else None,
        "url": sobre.get("canonicalChannelUrl") or "https://www.youtube.com/channel/" + canal_id,
    }
    return canal


def videos_do_canal(canal_id):
    """Vídeos longos recentes da aba 'Vídeos' (até ~30)."""
    dados = initial_data(http("https://www.youtube.com/channel/%s/videos?hl=en&gl=US" % canal_id))
    lista = []
    for lk in achar(dados or {}, "lockupViewModel"):
        vid = lk.get("contentId")
        views = None
        for parte in achar(lk.get("metadata", {}), "metadataParts"):
            for p in parte:
                rotulo = (p.get("accessibilityLabel") or "") + " " + texto(p.get("text"))
                if "view" in rotulo.lower() or p.get("leadingIcon", {}).get("name", "").startswith("PLAY"):
                    views = numero(texto(p.get("text")))
                    break
            if views is not None:
                break
        titulo = texto(next(achar(lk.get("metadata", {}), "title"), "")) or ""
        if vid and views is not None:
            lista.append({"id": vid, "views": views, "titulo": titulo})
    for v in achar(dados or {}, "videoRenderer"):  # formato antigo, por garantia
        lista.append({"id": v["videoId"], "views": numero(texto(v.get("viewCountText"))) or 0,
                      "titulo": texto(v.get("title"))})
    return lista


# ------------------------------------------------------------ PRINCIPAL ---
def fmt(n):
    if n is None:
        return "—"
    for lim, suf in ((1e9, "B"), (1e6, "M"), (1e3, "K")):
        if n >= lim:
            return ("%.1f" % (n / lim)).rstrip("0").rstrip(".") + suf
    return str(int(n))


def analisar(paginas):
    # 1-3. Buscas
    todos = {}
    for i, (busca, idioma) in enumerate(BUSCAS, 1):
        if i > 1:
            time.sleep(PAUSA_ENTRE_BUSCAS_S)
        try:
            vids = buscar(busca, idioma, paginas)
        except BloqueadoError:
            raise
        except Exception as e:
            print("  [%2d/%d] %-40s ERRO: %s" % (i, len(BUSCAS), busca, e))
            continue
        for v in vids:
            todos.setdefault(v["id"], v)
        print("  [%2d/%d] %-40s %3d vídeos longos" % (i, len(BUSCAS), busca, len(vids)))

    por_canal = {}
    for v in todos.values():
        por_canal.setdefault(v["canal_id"], []).append(v)
    print("\n%d vídeos de %d canais. Buscando dados dos canais..." % (len(todos), len(por_canal)))

    # 4. Dados de cada canal (inscritos, nº de vídeos, criação)
    def pega_sobre(cid):
        time.sleep(0.3)
        try:
            return cid, info_canal(cid)
        except Exception as e:
            return cid, {"erro": str(e)}

    canais = {}
    with ThreadPoolExecutor(THREADS_CANAIS) as ex:
        for n, (cid, c) in enumerate(ex.map(pega_sobre, por_canal), 1):
            canais[cid] = c
            if n % 25 == 0:
                print("  ...%d/%d canais" % (n, len(por_canal)))

    # 7. Tira canais grandes (ou com inscritos ocultos)
    pequenos = [cid for cid, c in canais.items()
                if c and "erro" not in c and c["inscritos"] and c["inscritos"] <= MAX_INSCRITOS]
    print("%d canais com até %s inscritos. Buscando os vídeos deles..." % (len(pequenos), fmt(MAX_INSCRITOS)))

    def pega_videos(cid):
        time.sleep(0.3)
        try:
            return cid, videos_do_canal(cid)
        except Exception:
            return cid, []

    with ThreadPoolExecutor(THREADS_CANAIS) as ex:
        recentes = dict(ex.map(pega_videos, pequenos))

    # 5-6. Métricas e selos
    cards = []
    for cid in pequenos:
        c = canais[cid]
        achados = por_canal[cid]
        lista = recentes.get(cid, [])
        if c["views_total"] and c["n_videos"]:
            media = c["views_total"] / c["n_videos"]
        elif lista:
            media = sum(v["views"] for v in lista) / len(lista)
        else:
            media = None

        for v in achados:
            v["v_insc"] = v["views"] / c["inscritos"]
            v["v_media"] = v["views"] / media if media else None
        melhor = max(achados, key=lambda v: v["v_insc"])

        conhecidos = {v["id"]: v for v in lista}
        for v in achados:
            conhecidos.setdefault(v["id"], {"id": v["id"], "views": v["views"], "titulo": v["titulo"]})
        top3 = sorted(conhecidos.values(), key=lambda v: v["views"], reverse=True)[:3]
        acima = sum(1 for v in lista if media and v["views"] > media)

        selos = []
        if c["idade_dias"] is not None and c["idade_dias"] < CANAL_NOVO_DIAS:
            selos.append("CANAL NOVO")
        if any(v["views"] >= OUTLIER_MULT * c["inscritos"] for v in achados):
            selos.append("OUTLIER")
        if acima >= CONSISTENTE_MIN:
            selos.append("CONSISTENTE")

        cards.append({
            "nome": melhor["canal_nome"], "url": c["url"], "inscritos": c["inscritos"],
            "n_videos": c["n_videos"], "criado": c["criado"], "idade_dias": c["idade_dias"],
            "media": media, "acima": acima, "amostra": len(lista), "selos": selos,
            "idiomas": sorted({v["idioma"] for v in achados}),
            "melhor": melhor, "achados": sorted(achados, key=lambda v: -v["v_insc"]), "top3": top3,
        })

    cards.sort(key=lambda c: c["melhor"]["v_insc"], reverse=True)
    return cards, len(todos), len(por_canal)


# ---------------------------------------------------------------- HTML ---
def gerar_html(cards, n_videos, n_canais):
    e = html.escape
    contagem = {k: sum(1 for c in cards if k in c["idiomas"]) for k in NOME_IDIOMA}
    botoes = ['<button class="on" data-l="all">Todos (%d)</button>' % len(cards)]
    botoes += ['<button data-l="%s">%s (%d)</button>' % (k, n, contagem[k]) for k, n in NOME_IDIOMA.items()]
    selo_css = {"CANAL NOVO": "novo", "OUTLIER": "outlier", "CONSISTENTE": "cons"}

    blocos = []
    for i, c in enumerate(cards, 1):
        m = c["melhor"]
        selos = "".join('<span class="selo %s">%s</span>' % (selo_css[s], s) for s in c["selos"])
        thumbs = "".join(
            '<a href="https://www.youtube.com/watch?v=%s" target="_blank" title="%s">'
            '<img loading="lazy" src="https://i.ytimg.com/vi/%s/mqdefault.jpg" alt="">'
            '<span>%s views</span></a>' % (v["id"], e(v["titulo"]), v["id"], fmt(v["views"]))
            for v in c["top3"])
        achados = "".join(
            '<li><a href="https://www.youtube.com/watch?v=%s" target="_blank">%s</a> — '
            '%s views · há %s dias · <b>%.1fx</b> inscritos%s · <i>“%s”</i></li>'
            % (v["id"], e(v["titulo"]), fmt(v["views"]),
               v["dias"] if v["dias"] is not None else "?", v["v_insc"],
               (" · %.1fx média" % v["v_media"]) if v["v_media"] else "", e(v["busca"]))
            for v in c["achados"])
        idade = ("%d dias" % c["idade_dias"]) if c["idade_dias"] is not None else "?"
        blocos.append("""
<article class="card" data-l="{langs}">
  <header><span class="pos">#{i}</span>
    <a class="nome" href="{url}" target="_blank">{nome}</a>
    <span class="langs">{langtxt}</span></header>
  <div class="selos">{selos}</div>
  <div class="nums">
    <div><b>{vins:.1f}x</b><small>views ÷ inscritos</small></div>
    <div><b>{vmed}</b><small>views ÷ média do canal</small></div>
    <div><b>{insc}</b><small>inscritos</small></div>
    <div><b>{nvid}</b><small>vídeos</small></div>
    <div><b>{media}</b><small>média de views</small></div>
    <div><b>{criado}</b><small>criado ({idade})</small></div>
  </div>
  <p class="acima">{acima} de {amostra} vídeos recentes acima da média</p>
  <div class="thumbs">{thumbs}</div>
  <details><summary>Vídeos encontrados nas buscas ({nach})</summary><ul>{achados}</ul></details>
</article>""".format(
            langs=" ".join(c["idiomas"]), i=i, url=e(c["url"]), nome=e(c["nome"]),
            langtxt=" · ".join(NOME_IDIOMA[l] for l in c["idiomas"]), selos=selos,
            vins=m["v_insc"], vmed=("%.1fx" % m["v_media"]) if m["v_media"] else "—",
            insc=fmt(c["inscritos"]), nvid=fmt(c["n_videos"]), media=fmt(c["media"]),
            criado=c["criado"] or "?", idade=idade, acima=c["acima"], amostra=c["amostra"],
            thumbs=thumbs, nach=len(c["achados"]), achados=achados))

    pagina = """<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Caçador de Nichos</title>
<style>
:root{--bg:#f6f6f4;--card:#fff;--tx:#1b1b1b;--mut:#6b6b6b;--bd:#e3e3df;--ac:#c4302b}
@media (prefers-color-scheme:dark){:root{--bg:#121212;--card:#1d1d1d;--tx:#eee;--mut:#9a9a9a;--bd:#2e2e2e;--ac:#ff5a52}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.45 system-ui,sans-serif}
main{max-width:1200px;margin:auto;padding:24px 16px}
h1{margin:0 0 4px}p.sub{color:var(--mut);margin:0 0 16px}
.filtros{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;position:sticky;top:0;background:var(--bg);padding:8px 0;z-index:2}
.filtros button{border:1px solid var(--bd);background:var(--card);color:var(--tx);padding:8px 14px;border-radius:999px;cursor:pointer;font:inherit}
.filtros button.on{background:var(--ac);border-color:var(--ac);color:#fff}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:16px;min-width:0}
.card header{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.pos{color:var(--mut);font-weight:600}.nome{font-weight:700;font-size:17px;color:var(--tx);text-decoration:none}
.nome:hover{color:var(--ac)}.langs{margin-left:auto;color:var(--mut);font-size:12px}
.selos{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0;min-height:4px}
.selo{font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;letter-spacing:.03em}
.novo{background:#dff3e4;color:#17663a}.outlier{background:#fde2e1;color:#a31d17}.cons{background:#e1ebfd;color:#1f4fa3}
.nums{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}
.nums div{background:var(--bg);border-radius:8px;padding:8px}.nums b{display:block;font-size:17px}
.nums small{color:var(--mut);font-size:11px}.nums div:first-child b{color:var(--ac)}
.acima{color:var(--mut);font-size:12px;margin:4px 0 10px}
.thumbs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.thumbs a{position:relative;display:block;border-radius:6px;overflow:hidden;aspect-ratio:16/9;background:var(--bd)}
.thumbs img{width:100%;height:100%;object-fit:cover;display:block}
.thumbs span{position:absolute;right:4px;bottom:4px;background:#000c;color:#fff;font-size:11px;padding:1px 5px;border-radius:4px}
details{margin-top:10px;font-size:13px}summary{cursor:pointer;color:var(--mut)}
details ul{padding-left:18px;margin:6px 0}details li{margin-bottom:6px}details a{color:var(--tx)}
.vazio{color:var(--mut);padding:40px;text-align:center}
</style></head><body><main>
<h1>Caçador de Nichos</h1>
<p class="sub">Gerado em __DATA__ · __NVID__ vídeos longos deste mês · __NCAN__ canais analisados · __NCARDS__ canais com até __MAX__ inscritos ·
ordenado por views ÷ inscritos</p>
<div class="filtros">__BOTOES__</div>
<div class="grid">__CARDS__</div>
__VAZIO__
</main>
<script>
document.querySelectorAll('.filtros button').forEach(function(b){b.onclick=function(){
  document.querySelectorAll('.filtros button').forEach(function(x){x.classList.toggle('on',x===b)});
  var l=b.dataset.l;document.querySelectorAll('.card').forEach(function(c){
    c.style.display=(l==='all'||c.dataset.l.split(' ').indexOf(l)>=0)?'':'none'})}});
</script></body></html>"""
    trocas = {
        "__DATA__": datetime.now().strftime("%d/%m/%Y %H:%M"), "__NVID__": str(n_videos),
        "__NCAN__": str(n_canais), "__NCARDS__": str(len(cards)), "__MAX__": fmt(MAX_INSCRITOS),
        "__BOTOES__": "".join(botoes), "__CARDS__": "".join(blocos),
        "__VAZIO__": "" if cards else '<p class="vazio">Nenhum canal encontrado.</p>',
    }
    for k, v in trocas.items():
        pagina = pagina.replace(k, v)
    return pagina


def main():
    ap = argparse.ArgumentParser(description="Caçador de nichos do YouTube")
    ap.add_argument("--paginas", type=int, default=3, help="páginas de resultado por busca (~20 vídeos cada)")
    ap.add_argument("--no-open", action="store_true", help="não abrir o navegador no final")
    ap.add_argument("--so-html", action="store_true",
                    help="só refaz a página a partir do resultado.json (sem pesquisar de novo)")
    args = ap.parse_args()

    if args.so_html:
        d = json.loads(SAIDA_JSON.read_text(encoding="utf-8"))
        SAIDA_HTML.write_text(gerar_html(d["cards"], d["n_videos"], d["n_canais"]), encoding="utf-8")
        print("Página refeita: %s" % SAIDA_HTML)
        if not args.no_open:
            webbrowser.open(SAIDA_HTML.as_uri())
        return

    print("Pesquisando %d buscas no YouTube (este mês, > 4 min)...\n" % len(BUSCAS))
    try:
        cards, n_videos, n_canais = analisar(args.paginas)
    except BloqueadoError as e:
        print("\nO YouTube bloqueou o scraper: %s" % e)
        print("Espere alguns minutos e rode de novo. Se continuar, veja no README.md "
              "como usar a YouTube Data API (chave grátis).")
        sys.exit(1)

    SAIDA_JSON.write_text(json.dumps({"cards": cards, "n_videos": n_videos, "n_canais": n_canais},
                                     ensure_ascii=False, indent=1), encoding="utf-8")
    SAIDA_HTML.write_text(gerar_html(cards, n_videos, n_canais), encoding="utf-8")
    print("\nPronto! %d canais no resultado: %s" % (len(cards), SAIDA_HTML))
    if not args.no_open:
        webbrowser.open(SAIDA_HTML.as_uri())


if __name__ == "__main__":
    main()
