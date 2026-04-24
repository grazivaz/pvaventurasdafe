import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { niche, channelGoal, targetAudience, contentFrequency, monetizationGoal } = body;

  const systemPrompt = `Você é um estrategista de canais dark (anônimos) no YouTube com vasta experiência em crescimento orgânico, monetização e posicionamento de nicho.
Você ajuda criadores a construir canais de sucesso sem revelar sua identidade, utilizando estratégias de conteúdo comprovadas.
Seja específico, prático e baseado em dados do algoritmo atual do YouTube.`;

  const userPrompt = `Crie uma ESTRATÉGIA COMPLETA para um canal dark do YouTube:

**Nicho:** ${niche}
**Objetivo do canal:** ${channelGoal || "crescer organicamente e monetizar"}
**Público-alvo:** ${targetAudience || "adultos de 25-45 anos"}
**Frequência de publicação:** ${contentFrequency || "2-3 vídeos por semana"}
**Meta de monetização:** ${monetizationGoal || "AdSense + produtos digitais"}

Crie uma estratégia detalhada em JSON:
{
  "channelConcept": {
    "name": "sugestão de nome anônimo para o canal",
    "identity": "persona/identidade do canal (sem revelar criador)",
    "uniqueValue": "proposta de valor única",
    "brandVoice": "voz e tom da marca"
  },
  "contentPillars": [
    {
      "pillar": "nome do pilar",
      "percentage": "% do conteúdo",
      "examples": ["exemplo de vídeo 1", "exemplo 2"]
    }
  ],
  "firstMonthPlan": {
    "week1": {"focus": "foco", "videos": ["vídeo 1", "vídeo 2"]},
    "week2": {"focus": "foco", "videos": ["vídeo 1", "vídeo 2"]},
    "week3": {"focus": "foco", "videos": ["vídeo 1", "vídeo 2"]},
    "week4": {"focus": "foco", "videos": ["vídeo 1", "vídeo 2"]}
  },
  "seoStrategy": {
    "mainKeywords": ["kw1", "kw2"],
    "contentGaps": ["oportunidade 1", "oportunidade 2"],
    "competitorAnalysis": "como se diferenciar"
  },
  "growthHacks": [
    {"hack": "estratégia", "description": "como implementar", "expectedResult": "resultado esperado"}
  ],
  "monetizationRoadmap": {
    "phase1": {"subscribers": "0-1000", "strategy": "foco", "revenue": "estimativa"},
    "phase2": {"subscribers": "1000-10000", "strategy": "foco", "revenue": "estimativa"},
    "phase3": {"subscribers": "10000+", "strategy": "foco", "revenue": "estimativa"}
  },
  "anonymityTips": ["dica para manter anonimato 1", "dica 2"],
  "toolsRecommended": [
    {"tool": "nome", "use": "para que serve", "cost": "gratuito/pago"}
  ],
  "kpis": ["métrica 1 para acompanhar", "métrica 2"]
}`;

  try {
    const raw = await generateContent(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao gerar estratégia";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
