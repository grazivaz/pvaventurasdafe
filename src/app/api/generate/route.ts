import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, topic, niche, tone, targetAudience, keywords, referenceTitle, referenceFormula } = body;

  const systemPrompt = `Você é um especialista em marketing de conteúdo para YouTube, especializado em canais dark (anônimos) virais.
Você conhece profundamente SEO do YouTube, psicologia de títulos virais, copywriting persuasivo e estratégias de crescimento orgânico.
Crie conteúdo em português brasileiro, otimizado para o algoritmo do YouTube.`;

  let userPrompt = "";

  switch (type) {
    case "titles":
      userPrompt = `Crie 10 títulos VIRAIS para um vídeo sobre: "${topic}"
Nicho: ${niche || "geral"}
Tom: ${tone || "informativo e curioso"}
Público-alvo: ${targetAudience || "adultos de 25-45 anos"}
${referenceTitle ? `Título de referência viral: ${referenceTitle}` : ""}
${referenceFormula ? `Fórmula do título de referência: ${referenceFormula}` : ""}
Palavras-chave obrigatórias: ${keywords || ""}

Crie 10 opções seguindo variações de fórmulas virais:
- Curiosidade + Número
- Choque + Revelação
- Problema urgente
- Segredo revelado
- Antes vs Depois
- Lista com número
- Pergunta provocativa
- Promessa de valor
- Exclusividade
- Medo/FOMO

Responda em JSON:
{
  "titles": [
    {"title": "...", "formula": "nome da fórmula", "whyItWorks": "explicação breve"}
  ]
}`;
      break;

    case "description":
      userPrompt = `Crie uma DESCRIÇÃO SEO otimizada para YouTube sobre: "${topic}"
Nicho: ${niche || "geral"}
Palavras-chave: ${keywords || topic}
Tom: ${tone || "profissional"}

A descrição deve ter:
- Parágrafo de abertura poderoso (2-3 linhas com gancho)
- Resumo do conteúdo do vídeo
- Palavras-chave naturalmente distribuídas
- Call-to-action para inscrição/like
- Links relevantes (use [LINK_AQUI] como placeholder)
- Hashtags relevantes no final (10-15)
- Entre 300-500 palavras no total

Responda em JSON:
{
  "description": "texto completo da descrição",
  "hashtags": ["#tag1", "#tag2"],
  "keywordsUsed": ["kw1", "kw2"],
  "seoScore": número de 1-10
}`;
      break;

    case "tags":
      userPrompt = `Gere 50 TAGS otimizadas para YouTube sobre: "${topic}"
Nicho: ${niche || "geral"}
Palavras-chave base: ${keywords || topic}

Crie tags variadas incluindo:
- Tags exatas (2-3 palavras exatas do tópico)
- Tags de cauda longa (4-6 palavras)
- Tags relacionadas (tópicos adjacentes)
- Tags de persona (quem buscaria isso)
- Tags de intenção (o que quer aprender/fazer)
- Tags em inglês equivalentes (para alcance global)

Responda em JSON:
{
  "tags": ["tag1", "tag2", ...],
  "primaryTags": ["as 10 mais importantes"],
  "longTailTags": ["tags de cauda longa"],
  "englishTags": ["tags em inglês"]
}`;
      break;

    case "thumbnail":
      userPrompt = `Crie PROMPTS detalhados para gerar thumbnails virais para: "${topic}"
Nicho: ${niche || "geral"}
Tom: ${tone || "impactante"}
${referenceTitle ? `Título do vídeo: ${referenceTitle}` : ""}

Gere 3 conceitos diferentes de thumbnail com:
- Descrição visual detalhada para IA gerar a imagem
- Elementos de texto na thumbnail
- Esquema de cores
- Emoção/expressão facial (se aplicável)
- Estilo visual

Responda em JSON:
{
  "concepts": [
    {
      "name": "nome do conceito",
      "prompt": "prompt completo para geração por IA",
      "textElements": ["texto 1", "texto 2"],
      "colorScheme": "descrição das cores",
      "emotion": "emoção transmitida",
      "style": "estilo visual"
    }
  ],
  "generalTips": ["dica 1", "dica 2"]
}`;
      break;

    case "seo":
      userPrompt = `Crie uma ESTRATÉGIA DE SEO completa para o YouTube sobre: "${topic}"
Nicho: ${niche || "geral"}
Palavras-chave: ${keywords || topic}
Público: ${targetAudience || "geral"}

Forneça:
- Análise de competição estimada
- Palavras-chave primárias e secundárias
- Estratégia de título otimizado
- Estratégia de thumbnail para CTR
- Melhores horários de publicação
- Engajamento nos primeiros 60 minutos
- Estratégia de cards e telas finais

Responda em JSON:
{
  "primaryKeywords": [{"keyword": "...", "searchVolume": "alto/médio/baixo", "competition": "alta/média/baixa"}],
  "secondaryKeywords": ["kw1", "kw2"],
  "titleStrategy": "como otimizar o título",
  "thumbnailCTR": "dicas para alta taxa de clique",
  "publishingStrategy": {"bestDays": ["dia1"], "bestTimes": ["horário1"], "frequency": "frequência recomendada"},
  "firstHourActions": ["ação 1", "ação 2"],
  "cardsStrategy": "estratégia de cards",
  "endScreenStrategy": "estratégia de tela final",
  "communityTips": ["dica de comunidade 1"]
}`;
      break;

    default:
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  try {
    const raw = await generateContent(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao gerar conteúdo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
