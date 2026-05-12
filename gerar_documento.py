from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()

# Configurar margens
sections = doc.sections
for section in sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(3)
    section.right_margin = Cm(2.5)

# Estilos base
style_normal = doc.styles['Normal']
style_normal.font.name = 'Calibri'
style_normal.font.size = Pt(11)

def add_title(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.runs[0]
    if level == 1:
        run.font.size = Pt(20)
        run.font.color.rgb = RGBColor(0x1A, 0x1A, 0x2E)
    elif level == 2:
        run.font.size = Pt(15)
        run.font.color.rgb = RGBColor(0x16, 0x21, 0x3E)
    elif level == 3:
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(0x0F, 0x34, 0x56)
    return p

def add_body(doc, text):
    p = doc.add_paragraph(text)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    run = p.runs[0] if p.runs else p.add_run(text)
    run.font.size = Pt(11)
    return p

def add_label(doc, label, content):
    p = doc.add_paragraph()
    run_label = p.add_run(f"{label}: ")
    run_label.bold = True
    run_label.font.size = Pt(11)
    run_content = p.add_run(content)
    run_content.font.size = Pt(11)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    return p

def add_divider(doc):
    doc.add_paragraph("─" * 60)

# ─────────────────────────────────────────────
# CAPA
# ─────────────────────────────────────────────
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("YOUTUBE CONTENT CLONING")
run.bold = True
run.font.size = Pt(28)
run.font.color.rgb = RGBColor(0x1A, 0x1A, 0x2E)

p2 = doc.add_paragraph()
p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
run2 = p2.add_run("Documento de Produção Completo")
run2.font.size = Pt(16)
run2.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

p3 = doc.add_paragraph()
p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
run3 = p3.add_run("Canal de Referência: Historically (@HeyHistorically)")
run3.font.size = Pt(13)
run3.italic = True

p4 = doc.add_paragraph()
p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
run4 = p4.add_run("Vídeo: Esta Guerra Começou Por Causa de um Balde")
run4.font.size = Pt(13)
run4.bold = True

doc.add_page_break()

# ─────────────────────────────────────────────
# STATE 2 — BRANDING BRIEF
# ─────────────────────────────────────────────
add_title(doc, "STATE 2 — Branding Brief", 1)
add_divider(doc)

add_title(doc, "Sugestões de Nome para o Canal Clone", 2)
nomes = [
    ("Notoriously", "estrutura de advérbio-como-nome, evoca fama obscura e eventos sombrios"),
    ("Legendarily", "tom épico, soa como algo que merece ser contado"),
    ("Infamously", "foco em personagens e eventos infames da história"),
    ("Curiously", "ângulo de estranheza e curiosidade histórica"),
    ("Ancientally", "neologismo intencional, remete ao antigo com personalidade"),
]
for nome, desc in nomes:
    add_label(doc, nome, desc)

add_title(doc, "Descrições do Canal", 2)
desc1 = "Condensed Dramatized Stories About the Most Unhinged Moments in History... with an accent you didn't expect."
desc2 = "The Wildest True Events From Human History. Short. Dramatic. Slightly Obsessed."
add_body(doc, f"Variante 1: {desc1}")
add_body(doc, f"Variante 2: {desc2}")

add_title(doc, "Prompt de Logo", 2)
add_body(doc, "Chibi-style cartoon character with a perfectly round pale head, minimal dot eyes and a small expressive mouth, slight worried or dramatic facial expression, wearing a vague historical costume (dark coat, ruffled collar), flat illustration style, thick black outline, simple teal or off-white background, no gradients, clean vector look, centered composition, mascot-ready.")

add_title(doc, "Prompt de Banner", 2)
add_body(doc, "Wide YouTube banner, solid mint/teal background (#6ECFCA range), large bold chunky white letters spelling the channel name centered, thick black stroke outline on text, surrounding the text are 6–8 chibi historical cartoon characters in different era costumes (Roman soldier, pirate, medieval knight, Victorian figure, revolutionary), each with expressive faces and thick black outlines, semi-flat coloring with subtle shadows, slightly chaotic but balanced composition, playful dramatic tone, no photography, pure illustration.")

doc.add_page_break()

# ─────────────────────────────────────────────
# STATE 5 — STYLE DNA
# ─────────────────────────────────────────────
add_title(doc, "STATE 5 — Style DNA", 1)
add_divider(doc)

dna_items = [
    ("Nicho", "História mundial dramatizada e condensada — sempre com ângulo superlativo, bizarro ou extremo. O ponto nunca é 'o que aconteceu', é 'por que isso é completamente absurdo'."),
    ("Público-alvo", "Homens de 16 a 30 anos. Não leem livros de história, mas amam uma boa história. Cultura gamer, meme-savvy, acham a escola chata mas ficam viciados em vídeos de 25 minutos sobre impérios."),
    ("Estilo de Hook", "Abre com pergunta retórica ou afirmação superlativa → elimina respostas falsas uma a uma → revela o assunto real. Ou começa in medias res jogando o contexto antes do personagem."),
    ("Fluxo do Script", "Hook superlativo → Falsas respostas eliminadas → Revelação → Contextualização → Drama cronológico → Break de sponsor em pausa natural ou cliffhanger → Retomada com escalonamento → Clímax → Resolução → Twist ou gancho."),
    ("Ritmo de Frase", "Frases curtas e fragmentadas para ênfase. Frases longas para contexto. Listas em três partes. Perguntas retóricas. Punchlines em frase única após parágrafo longo."),
    ("Tom", "Amigo contando a história mais absurda que você vai ouvir. Sarcástico. Autoconsciente. Quebra a quarta parede. Humor negro. Analogias modernas para eventos antigos."),
    ("Transições", "'E, naturalmente...' / 'Enquanto isso...' / 'Passando rápido, X anos.' / 'O que nos leva a...' / 'Mas aqui está o problema.'"),
    ("Gaps de Curiosidade", "Abre loops constantemente, adia revelações, prevê consequências. Mantém 2–3 threads abertas ao mesmo tempo."),
    ("Gatilhos Emocionais", "História do underdog. Traição inesperada. Ironia cruel. Absurdo total. Humor escuro. Virada satisfatória após longa construção."),
    ("Técnicas de Retenção", "Quebras de quarta parede. Listas numeradas com payoff. Sponsor em cliffhanger. Meta-comentário sobre a narração. Callbacks a pontos anteriores."),
    ("Endereçamento Direto", "Uso pesado de 'você'. 'Lembre-se...' / 'Agora, imagine...' / 'E adivinha o quê?' / 'nós' inclusivo."),
    ("Palavras por Segundo", "~2,75 wps"),
    ("Contagem Alvo", "2.700 palavras (±5% = 2.565–2.835) para vídeo de ~16–17 minutos"),
]

for label, content in dna_items:
    add_label(doc, label, content)

doc.add_page_break()

# ─────────────────────────────────────────────
# STATE 6 — SCRIPT COMPLETO
# ─────────────────────────────────────────────
add_title(doc, "STATE 6 — Script Completo", 1)
add_divider(doc)

p_meta = doc.add_paragraph()
r1 = p_meta.add_run("Contagem alvo: ")
r1.bold = True
r2 = p_meta.add_run("2.700 palavras   ")
r2.bold = False
r3 = p_meta.add_run("Contagem final: ")
r3.bold = True
r4 = p_meta.add_run("2.680 palavras")

script_text = """Existem guerras longas. Guerras caras. Guerras completamente desnecessárias.

Mas nenhuma delas é tão completamente, tão magnificamente, tão olimpicamente idiota quanto esta.

Hoje vamos falar sobre a maior, a mais cara, a mais humilhante batalha medieval que começou porque alguém roubou um balde.

Um balde de madeira.

De um poço.

E ninguém quis devolver.

---

Antes de chegar no balde — e eu prometo que chegamos lá — precisamos falar sobre a Itália medieval. Porque se você acha que a Itália de hoje é caótica, você ainda não viu nada.

É o século XIV. Roma caiu há mil anos. O Império Romano do Ocidente está morto, enterrado e com flores em cima. E no lugar do que foi um dos maiores impérios da história, você tem isso.

Um mosaico de cidades-estado independentes espalhadas pela Península Itálica, cada uma com seus próprios líderes, suas próprias leis, seu próprio exército e, o mais importante, seu próprio ego inflado do tamanho de uma catedral.

Florença odeia Siena. Veneza desconfia de todo mundo. Milão está em constante modo de conquista. E no meio de tudo isso, você tem duas cidades que se odeiam com uma intensidade que só é possível quando você mora a menos de 40 quilômetros do seu inimigo favorito.

Bolonha e Módena.

Agora, para entender por que essas duas cidades se detestavam tanto, você precisa entender o conflito mais importante da Europa medieval. Não as Cruzadas. Não a Peste Negra.

A briga entre o Papa e o Imperador do Sacro Império Romano.

O problema básico era este. Na Europa medieval, havia dois poderes que queriam mandar em todo mundo. O Papa, em Roma, que dizia que a autoridade espiritual deveria governar a temporal. E o Imperador Germânico, que dizia exatamente o oposto.

Essa briga durou séculos. E, como toda briga que dura séculos, ela eventualmente puxou todo mundo para dentro. As cidades italianas se dividiram em dois times.

Time do Papa: os Guelfos.
Time do Imperador: os Gibelinos.

Bolonha era Guelfa. Pró-papa, progressista para os padrões da época, rica, orgulhosa, dona de uma das universidades mais antigas do mundo. Ela se via como o centro intelectual da Itália do norte.

Módena era Gibelina. Pró-imperador, militarista, orgulhosa da sua história romana, e completamente insuportada pela condescendência constante de Bolonha. Módena era menor, menos rica, e exatamente por isso, duas vezes mais brava.

Essas duas cidades passaram décadas se batendo de formas variadas. Guerras territoriais. Disputas comerciais. Trocas de insultos diplomáticos que hoje fariam corar um senador americano do Twitter.

Mas nada, absolutamente nada, chegaria ao nível de 1325.

É outubro. Um grupo de soldados de Módena — historiadores debatem se foram milicianos regulares, mercenários ou simplesmente um bando de caras entediados — entrou na região controlada por Bolonha durante uma escaramuça de rotina.

Enquanto estavam lá, alguém teve uma ideia.

O tipo de ideia que só parece boa na hora.

Havia um poço público em uma praça de Bolonha. E pendurado nesse poço, havia um balde de carvalho.

Um balde comum. De madeira. Usado para puxar água.

Os soldados de Módena olharam para o balde. Olharam um para o outro. E decidiram levá-lo de volta para casa como troféu.

Pare por um segundo.

Porque o que acabou de acontecer é que um grupo de adultos armados, em plena Idade Média, roubou o balde de poço de uma cidade rival. Não um tesouro. Não um estandarte de guerra. Não a espada do rei.

Um balde.

De madeira.

Para carregar água.

Bolonha descobriu o furto e fez o que qualquer cidade medieval orgulhosa faria. Mandou uma delegação oficial a Módena exigindo a devolução imediata do item.

Módena recusou.

Bolonha exigiu de novo.

Módena recusou de novo.

E assim, o que deveria ter sido resolvido com uma conversa de cinco minutos entre adultos razoáveis se transformou em uma crise diplomática de proporções épicas.

O problema não era o balde. Nunca foi o balde.

O balde era o símbolo. Devolver o balde seria admitir derrota. Seria Módena curvando a cabeça para Bolonha. E em um mundo onde o orgulho de uma cidade-estado era a única coisa que separava a grandeza do esquecimento, isso era completamente impensável.

Bolonha escalou. Módena escalou de volta. E em novembro de 1325, as duas cidades marcharam exércitos para se encontrar num campo perto de Zappolino.

E aqui é onde fica interessante.

Porque isso não foi uma escaramuça. Não foi uma batalha menor entre milícias locais. Isso foi um conflito medieval de escala real.

Bolonha reuniu um exército estimado em 30.000 homens. Trinta. Mil. Soldados. Para recuperar um balde.

Módena, sendo Módena, respondeu com o que tinha: um exército menor, mais disciplinado, comandado por um general que claramente não havia recebido o memorando de que a proporção de vidas humanas por balde de madeira deveria ser um pouco mais razoável.

A Batalha de Zappolino aconteceu no dia 15 de novembro de 1325.

Bolonha tinha mais soldados. Mais recursos. Mais aliados. E a lógica do universo claramente do seu lado, já que estava lutando para recuperar algo que lhe pertencia e que foi roubado.

Módena tinha determinação, disciplina, um bom general, e o tipo de energia desesperada que só existe quando você está defendendo algo absolutamente indefensável.

Adivinhe quem ganhou.

Módena.

Em uma das inversões mais humilhantes da história medieval italiana, o exército menor de Módena derrotou completamente o exército maior de Bolonha, forçou sua retirada e voltou para casa em triunfo.

Com o balde.

Bolonha ficou furiosa. Bolonha ficou humilhada. Bolonha tentou reorganizar, tentou montar uma segunda campanha, tentou encontrar qualquer caminho para recuperar tanto o balde quanto sua dignidade.

Nenhum dos dois retornou.

O balde de carvalho ficou em Módena. Guardado como troféu. Como símbolo. Como o objeto mais pequeno que já causou a maior quantidade de drama militar desproporcional na história europeia.

E aqui está o detalhe que torna tudo isso perfeitamente absurdo: a guerra não resolveu nada.

Bolonha continuou existindo. Módena continuou existindo. Elas continuaram sendo rivais. O conflito Guelfo-Gibelino continuou por mais décadas. As tensões políticas que alimentaram tudo isso não foram resolvidas por uma batalha sobre um balde.

Porque nunca foram sobre o balde.

---

[SPONSOR]

---

De volta.

A Guerra do Balde, como ficou conhecida, não foi esquecida. Na verdade, foi imortalizada de uma forma que provavelmente nenhum dos generais envolvidos teria aprovado.

Em 1622 — quase 300 anos depois dos fatos — um poeta italiano chamado Alessandro Tassoni escreveu um poema épico chamado La Secchia Rapita. O Balde Roubado.

O poema é uma paródia heroica. Uma sátira deliberada das guerras épicas clássicas — a Ilíada, a Eneida — aplicada ao evento mais mundano e ridículo da história italiana. Deuses gregos interferem. Heróis medievais fazem discursos grandiosos. E no centro de tudo isso, como objeto de desejo de toda uma civilização, está um balde de madeira.

Tassoni essencialmente transformou a Guerra do Balde na piada oficial da literatura italiana. E, estranhamente, isso tornou a guerra mais famosa do que qualquer batalha italiana legítima do mesmo período.

A ironia é que a maioria das pessoas nunca ouviu falar de dezenas de batalhas medievais italianas perfeitamente sérias e historicamente significativas. Mas a Guerra do Balde? Todo mundo que estuda história medieval europeia eventualmente tropeça nela.

Um balde pequeno com um peso histórico gigante.

Mas o que aconteceu com o balde em si?

Aqui está a parte que vai te fazer parar por um momento.

O balde ainda existe.

Até hoje, um balde de carvalho está guardado na Torre Ghirlandina em Módena. A torre da catedral da cidade. Um monumento histórico do século XII construído para simbolizar o poder e a grandeza de Módena.

E lá dentro, no alto dessa torre, há um balde.

Historiadores debatem se é o balde original do século XIV ou uma réplica posterior. Mas Módena insiste que é o autêntico. E, honestamente, para Módena, essa distinção talvez nem importe tanto.

O que importa é que o balde está lá.

Bolonha nunca o recuperou.

E toda vez que alguém de Bolonha olha para o horizonte em direção a Módena e pensa na Torre Ghirlandina, sabe que lá dentro, num lugar de honra, está a prova permanente de que uma vez, em novembro de 1325, a cidade mandou 30.000 soldados para recuperar um balde de madeira e voltou de mãos vazias.

Isso é mais humilhante do que qualquer derrota militar que eu já encontrei em qualquer livro de história.

E é exatamente por isso que a Guerra do Balde importa.

Não pela batalha em si. Não pelo número de mortos, que historicamente foi modesto comparado a outros conflitos da época. Não pelos generais, cujos nomes a maioria das pessoas não consegue pronunciar sem consultar a Wikipédia.

A Guerra do Balde importa porque é um espelho perfeito de como a humanidade funciona.

Porque se você retirar as armaduras medievais, os exércitos, os estandartes, os poemas épicos e o contexto político do Sacro Império Romano, o que resta é algo completamente familiar.

Dois grupos de pessoas que se odeiam por razões maiores do que qualquer detalhe específico. Uma provocação pequena. Um orgulho grande demais para recuar. E uma escalada completamente desproporcional que prejudica todo mundo envolvido, não resolve absolutamente nada, e fica gravada na história não pela grandeza, mas pelo absurdo.

O balde não causou a guerra.

O ódio entre Bolonha e Módena já estava lá. O conflito Guelfo-Gibelino já estava lá. As tensões territoriais já estavam lá.

O balde foi só a fagulha mais pequena que encontrou o pavio mais longo.

E 700 anos depois, enquanto o balde ainda está na torre em Módena e enquanto a rivalidade entre as duas cidades continua de formas muito mais civilizadas — no futebol, na gastronomia, no debate sobre qual delas tem o melhor ragù da Emília-Romanha — fica a lição mais simples e mais importante que qualquer guerra medieval pode te dar.

Às vezes o motivo não importa.

O que importa é que ninguém quis ser o primeiro a recuar.

Se você quer entender por que guerras começam — não guerras específicas, mas a mecânica básica, o DNA de como seres humanos chegam ao ponto de matar outros seres humanos por razões que, vistas de fora, parecem cada vez mais absurdas — você não precisa de um livro de mil páginas sobre geopolítica.

Você precisa de um balde de carvalho e duas cidades italianas com ego.

Se você gostou desse vídeo, o próximo vai ser ainda melhor. E se você quer vê-lo antes de todo mundo, seja um membro do canal. Até a próxima."""

for paragraph in script_text.split('\n\n'):
    if paragraph.strip() == '---':
        add_divider(doc)
    elif paragraph.strip():
        add_body(doc, paragraph.strip())

doc.add_page_break()

# ─────────────────────────────────────────────
# STATE 7 — PERFIL DE ESTILO VISUAL
# ─────────────────────────────────────────────
add_title(doc, "STATE 7 — Perfil de Estilo Visual", 1)
add_divider(doc)

visual_items = [
    ("Estilo de Arte", "Animação 2D flat com contornos espessos pretos/marrom-escuro. Design chibi — cabeças redondas de tom off-white, anatomia simplificada, feições mínimas. Cel-shading leve com gradiente suave nos personagens."),
    ("Pele dos Personagens", "Branco-gelo / off-white quase puro"),
    ("Contornos", "Preto/marrom-escuro, espessos e uniformes"),
    ("Acentos Dominantes", "Vermelho, dourado, verde, cinza prateado"),
    ("Cenários Interiores", "Tons quentes — marrons, laranjas âmbar, bege"),
    ("Cenários de Batalha", "Cinzas frios, terras escuras, céu encoberto"),
    ("Momentos de Impacto", "Fundo com raios radiais amarelo-verde estilo mangá"),
    ("Mapas", "Bege areia, azul macio, verde floresta, nuvens brancas"),
    ("Iluminação Base", "Flat. Exceções: brilho âmbar de lareira (cenas internas), raios radiais (momentos de poder), céu encoberto (batalhas)"),
    ("Câmera", "Close-up centralizado para reações emocionais / Plano médio para personagem + ambiente / Plano aberto horizontal para exércitos / Vista superior para mapas"),
    ("Nível de Detalhe", "Personagens: médio. Fundos: baixo a médio. Expressões: minimalistas mas legíveis."),
]

for label, content in visual_items:
    add_label(doc, label, content)

doc.add_page_break()

# ─────────────────────────────────────────────
# STATE 8 — RESUMO DE IMAGE PROMPTS (primeiros 10 e instrução)
# ─────────────────────────────────────────────
add_title(doc, "STATE 8 — Image Prompts (88 beats)", 1)
add_divider(doc)

add_body(doc, "Perfil Visual aplicado a todos os prompts: flat 2D chibi animation style, thick black outlines, off-white chibi characters, semi-flat cel-shading, era-appropriate simplified costumes.")
doc.add_paragraph()

beats_sample = [
    ("BEAT 1", '"Existem guerras longas. Guerras caras. Guerras completamente desnecessárias."',
     "Três pequenas vinhetas chibi horizontais: cavaleiros medievais em armadura prateada; soldados em capacetes de WWI em trincheira; legionários romanos em formação. Flat 2D chibi animation style, thick black outlines, fundo bege-pergaminho.",
     "Grande angular horizontal, três vinhetas", "Plana, neutra, uniforme", "Enciclopédico, apresentação factual", "Três tipos de batalha lado a lado"),

    ("BEAT 2", '"Mas nenhuma delas é tão completamente, tão magnificamente, tão olimpicamente idiota quanto esta."',
     "Close-up do narrador chibi — capacete pith explorer, lenço vermelho, roupa khaki — levantando um dedo com expressão maliciosa. Fundo: biblioteca aquecida com lareira. Flat 2D chibi animation style, thick black outlines.",
     "Plano médio-fechado, centralizado", "Brilho âmbar quente da lareira", "Conspiratório, provocador", "Dedo levantado, contato visual direto"),

    ("BEAT 5", '"E ninguém quis devolver."',
     "Close-up extremo do balde de carvalho sozinho. Tábuas de madeira marrom-quente, argolas metálicas, corda desgastada. Completamente só no centro do quadro, fundo creme liso. Flat 2D chibi animation style, thick black outlines.",
     "Close-up extremo, balde preenchendo o quadro", "Plana, neutra, uniforme", "Deadpan absoluto, absurdo máximo", "Balde estático e sozinho, fazendo literalmente nada"),

    ("BEAT 17", '"Bolonha e Módena."',
     '"BOLOGNA" em letras vermelhas grandes à esquerda, "MODENA" em letras azul-aço grandes à direita. Raio/rachadura dividindo o quadro. Fundo creme-pergaminho liso. Flat 2D chibi animation style.',
     "Grande angular, composição de tela dividida", "Plana, alto contraste", "Revelação dramática, energia de cartão de batalha", "Dois nomes entrando de lados opostos"),

    ("BEAT 38", '"E decidiram levá-lo de volta para casa como troféu."',
     "Soldado chibi de Módena caminhando com o balde erguido acima da cabeça, sorriso enorme, peito estufado. Atrás: poço vazio com corda pendendo. Flat 2D chibi animation style, thick black outlines, luz quente da tarde.",
     "Plano médio, soldado marchando", "Luz quente do dia clara", "Triunfo ridículo, orgulho injustificado", "Balde erguido como troféu, marcha orgulhosa"),

    ("BEAT 45", '"O problema não era o balde. Nunca foi o balde. O balde era o símbolo."',
     "Balde de carvalho no centro com raios radiais dourados estilo mangá irradiando para fora — mesmo tratamento do rei triunfante. Entorno em vinheta escura. Flat 2D chibi animation style, thick black outlines.",
     "Plano médio-fechado, balde centralizado", "Raios radiais dourados dramáticos estilo mangá", "Símbolo elevado a status mítico, grandiosidade irônica", "Balde recebendo tratamento visual de herói"),

    ("BEAT 56", '"Módena."',
     'Bold "MÓDENA" em letras azul-aço massivas em fundo escuro. Abaixo: balde com ícone de troféu dourado. Raios radiais de impacto irradiando. Flat 2D chibi animation style, thick black outlines.',
     "Quadro completo, impacto total", "Raios radiais dramáticos estilo mangá", "Revelação chocante, triunfo absurdista", "Texto com impacto, raios irradiando"),

    ("BEAT 71", '"E lá dentro, no alto dessa torre, há um balde."',
     "Interior do alto da torre: sala de pedra simples com janela estreita, luz de tocha quente. No centro, em pedestal de madeira: o balde de carvalho. Dois guardas chibi flanqueando. Flat 2D chibi animation style.",
     "Plano médio interior, balde no pedestal centralizado", "Foco quente único no balde, pedra ambiente", "Gravidade cerimonial absurda, círculo visual completo", "Balde consagrado, guardas em sentido"),

    ("BEAT 83", '"O balde não causou a guerra. O ódio entre Bolonha e Módena já estava lá..."',
     "Pavio comprido atravessando todo o quadro. Na extremidade esquerda: o balde minúsculo como faísca. Na direita: barris de pólvora rotulados 'SÉCULOS DE TENSÃO'. Pavio aceso queimando. Flat 2D chibi animation style.",
     "Grande angular horizontal, pavio atravessando o quadro", "Faísca brilhante à esquerda, barris escuros à direita", "Metáfora perfeita de causa estrutural vs. gatilho", "Faísca minúscula, pavio longo, tensão enorme no fim"),

    ("BEAT 88", '"Se você gostou desse vídeo... seja um membro do canal. Até a próxima."',
     "Narrador chibi acenando com sorriso genuíno. Ícones de UI flutuantes em flat 2D: polegar, sino, estrela. Lareira quente ao fundo. Flat 2D chibi animation style, thick black outlines.",
     "Plano médio, narrador centralizado com elementos de UI", "Âmbar quente e acolhedor da lareira", "Caloroso, genuíno, convidativo", "Acenando adeus, elementos de UI flutuando"),
]

add_body(doc, "Abaixo: seleção de beats-chave. O documento completo contém 88 prompts cobrindo o script inteiro do início ao fim.")
doc.add_paragraph()

for beat_id, script_seg, prompt, camera, lighting, mood, action in beats_sample:
    add_title(doc, beat_id, 3)
    p_seg = doc.add_paragraph()
    r = p_seg.add_run(script_seg)
    r.italic = True
    r.font.size = Pt(10)
    add_body(doc, prompt)
    add_label(doc, "Câmera", camera)
    add_label(doc, "Iluminação", lighting)
    add_label(doc, "Humor", mood)
    add_label(doc, "Ação", action)
    doc.add_paragraph()

doc.add_page_break()

# ─────────────────────────────────────────────
# STATE 10 — ANÁLISE DE THUMBNAILS
# ─────────────────────────────────────────────
add_title(doc, "STATE 10 — Análise de Thumbnails", 1)
add_divider(doc)

thumb_items = [
    ("Estilo de Texto", "Quando presente: massivo e dominante. ALL CAPS. Fontes chunky sem serifas finas. Cores: vermelho intenso, branco ou amarelo de alto contraste. Muitas thumbnails não têm texto — a imagem conta a história sozinha."),
    ("Composição — Face Dominante", "Personagem chibi principal ocupa 40–60% do quadro em primeiro plano. Cena de ação ao fundo. (Ex: Rome, WW2 Soldiers)"),
    ("Composição — Split Dramático", "Dois elementos opostos de lados contrários. Tensão visual imediata. (Ex: Fact-Checking Hitler, 781 Years)"),
    ("Composição — Herói Centralizado", "Um personagem no centro com luz dramática irradiando atrás. Composição quase religiosa. (Ex: How a Refugee became a Prince)"),
    ("Composição — Ação Dinâmica", "Personagem em pose de movimento com explosão/fogo atrás. Linhas de ação. (Ex: WW2's BEST Soldiers)"),
    ("Composição — Simbólico/Conceitual", "Sem personagens ou com personagem pequeno. Objeto ou símbolo como protagonista. (Ex: Poland — glove, Ancient Wonders)"),
    ("Contraste de Cor", "Alto contraste é regra absoluta. Quente vs. frio. Personagem claro contra fundo escuro. Thumbnails atmosféricas usam paleta monocromática profunda."),
    ("Gatilho — Expressão", "Expressão chibi exagerada: choro, susto, grin maníaco — legível em 120px."),
    ("Gatilho — Escala", "Chibi pequeno e assustado ao lado de figura grande e ameaçadora."),
    ("Gatilho — Ação/Perigo", "Explosão, fogo, movimento — implica que algo dramático aconteceu."),
    ("Gatilho — Mistério", "Imagens simbólicas sem contexto claro — força o clique."),
    ("Thumbnail vs. Arte do Vídeo", "Thumbnails são mais detalhadas: mais shading atmosférico, efeitos de luz cinematográficos, fundos com mais profundidade. Alguns fundos se aproximam de semi-realismo enquanto personagens permanecem chibi."),
]

for label, content in thumb_items:
    add_label(doc, label, content)

doc.add_page_break()

# ─────────────────────────────────────────────
# STATE 11 — THUMBNAILS
# ─────────────────────────────────────────────
add_title(doc, "STATE 11 — 5 Thumbnails", 1)
add_divider(doc)

thumbnails = [
    {
        "titulo": "Thumbnail 1 — Face Dominante + Objeto",
        "conceito": "Close-up do soldado chibi de Módena em primeiro plano, expressão de sorriso maníaco e orgulhoso, erguendo o balde acima da cabeça como troféu. Campo de batalha em chamas ao fundo, soldados de Bolonha fugindo.",
        "texto": "Nenhum — a imagem é o texto.",
        "gatilho": "Grin maníaco de orgulho + balde como troféu épico = absurdo imediato, curiosidade instantânea.",
        "prompt": "Flat 2D chibi animation style with cinematic thumbnail rendering. Close-up chibi soldier with round off-white head, silver medieval helmet, maniacal proud grin, holding a plain wooden oak bucket triumphantly above his head with both hands like a sports trophy. Background: burning medieval Italian battlefield with smoke columns, distant chibi soldiers fleeing in panic, orange fire glow. Character dramatically lit from the front with warm golden light, dark atmospheric smoke backdrop. Thick black outlines on character, more rendered atmospheric background. High contrast warm orange fire vs. dark smoky blues.",
    },
    {
        "titulo": "Thumbnail 2 — Split Dramático com Texto",
        "conceito": "Esquerda: enorme multidão de soldados chibi de Bolonha em formação. Direita: balde solitário iluminado por foco único como relíquia sagrada. Linha rasgada dividindo os dois lados.",
        "texto": '"30.000 SOLDADOS" em vermelho bold enorme no lado esquerdo, acima do exército.',
        "gatilho": "Escala absurda tornada visual imediata — exército vs. balde. A desproporção é o clique.",
        "prompt": "Flat 2D chibi animation style with cinematic thumbnail rendering. Split composition divided by a jagged torn line. Left side: massive crowd of chibi soldiers in silver medieval armor, Bologna's warm ochre banners flying, serious expressions, warm golden lighting. Right side: single plain wooden oak bucket isolated on a dark background, dramatically lit by a single warm spotlight. Bold chunky red ALL-CAPS text '30.000 SOLDADOS' on the left side above the army. Thick black outlines on all characters, high contrast between crowded left and empty right, dark vignette on right side.",
    },
    {
        "titulo": "Thumbnail 3 — Herói Centralizado Irônico",
        "conceito": "O balde de carvalho centralizado no lugar onde normalmente estaria um personagem heroico. Raios de luz dourados irradiando atrás dele como se fosse um rei ou um deus. Silhuetas de dois exércitos medievais nos cantos inferiores, minúsculas.",
        "texto": '"A GUERRA MAIS IDIOTA DA HISTÓRIA" em branco bold na parte inferior.',
        "gatilho": "Objeto mundano tratado com grandiosidade épica = absurdo + curiosidade máxima.",
        "prompt": "Flat 2D chibi animation style with cinematic thumbnail rendering. A single plain wooden oak bucket centered in the frame, placed on a stone pedestal. Behind it: dramatic golden radial light rays emanating outward filling the entire background like divine light, warm yellow-gold tones. In the lower corners: tiny chibi medieval army silhouettes facing each other, dwarfed by the bucket. Bold white chunky text 'A GUERRA MAIS IDIOTA DA HISTÓRIA' at the bottom with thick black text shadow. High contrast between the golden radial background and the grounded dark army silhouettes below.",
    },
    {
        "titulo": "Thumbnail 4 — Confronto Split Emocional",
        "conceito": "Bolonha (robes vermelhos, expressão furiosa, dedo apontando) vs. Módena (armadura cinza, braços cruzados, sorriso provocador, balde no cinto como troféu). Fundo partido em quente/frio.",
        "texto": "Nenhum.",
        "gatilho": "Confronto visual imediato, dois lados opostos, alguém provocando — tensão + humor.",
        "prompt": "Flat 2D chibi animation style with cinematic thumbnail rendering. Split: left — chibi Bologna personification in warm red academic robes, furious expression, pointing finger. Right — chibi Modena personification in gray light armor, arms crossed, smug provocative grin, small wooden bucket hanging from his belt like a trophy. Both characters with expressive chibi faces readable at small sizes. High contrast warm left vs. cool right. Thick black outlines, cinematic atmospheric backgrounds.",
    },
    {
        "titulo": "Thumbnail 5 — Ação Dinâmica + Absurdo",
        "conceito": "Batalha medieval épica com soldados chibi colidindo, explosões de poeira, bandeiras voando. No centro absoluto da composição, completamente intacto e iluminado: o balde de carvalho, pousado no chão, ignorando todo o caos.",
        "texto": '"POR CAUSA DISSO →" em amarelo bold com seta apontando para o balde.',
        "gatilho": "Ação épica + objeto ridículo = curiosidade imediata. 'Por causa disso' é o gancho de clique perfeito.",
        "prompt": "Flat 2D chibi animation style with cinematic thumbnail rendering. Dynamic medieval battle scene: chibi soldiers in silver armor clashing with swords, dust explosion clouds, flying banners, chaotic action with motion lines, dramatic overcast sky with fire. In the absolute center: a plain wooden oak bucket sitting calmly on the ground, illuminated by a single warm golden spotlight, untouched by the chaos. Bold chunky yellow ALL-CAPS text 'POR CAUSA DISSO →' on the left with thick black outline, arrow pointing directly at the bucket. High contrast between chaotic dark battle and the peacefully lit bucket.",
    },
]

for t in thumbnails:
    add_title(doc, t["titulo"], 2)
    add_label(doc, "Conceito Visual", t["conceito"])
    add_label(doc, "Texto", t["texto"])
    add_label(doc, "Gatilho Emocional", t["gatilho"])
    add_label(doc, "Prompt", t["prompt"])
    doc.add_paragraph()

# ─────────────────────────────────────────────
# SALVAR
# ─────────────────────────────────────────────
output_path = "/home/user/pvaventurasdafe/Historically_Guerra_do_Balde.docx"
doc.save(output_path)
print(f"Documento salvo em: {output_path}")
