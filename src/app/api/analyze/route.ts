import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, viewCount, likeCount, tags, duration, channelTitle, newTopic } = body;

  const systemPrompt = `Você é um especialista em análise de conteúdo viral do YouTube e estratégia de canais dark (anônimos).
Analise vídeos virais e identifique os elementos que os tornaram populares, fornecendo insights acionáveis para replicar o sucesso em outros nichos.
Seja específico, direto e sempre baseie suas análises em dados concretos.`;

  const userPrompt = `Analise este vídeo viral do YouTube e identifique sua fórmula de sucesso:

**Título:** ${title}
**Canal:** ${channelTitle}
**Visualizações:** ${viewCount}
**Likes:** ${likeCount}
**Duração:** ${duration}
**Tags:** ${tags?.slice(0, 10).join(", ") || "Nenhuma"}
**Descrição (primeiros 500 chars):** ${description?.slice(0, 500) || ""}
${newTopic ? `**Novo Tópico para Adaptação:** ${newTopic}` : ""}

Forneça uma análise completa em JSON com esta estrutura exata:
{
  "viralScore": número de 1-10,
  "mainHook": "qual é o gancho principal que prende atenção",
  "emotionTriggered": "emoção principal provocada no espectador",
  "contentFormula": "fórmula estrutural do vídeo (ex: Problema → Agitação → Solução)",
  "titleFormula": "padrão do título que funciona",
  "thumbnailStrategy": "estratégia de thumbnail inferida pelo título",
  "audienceProfile": "perfil do público-alvo",
  "whyItWentViral": ["razão 1", "razão 2", "razão 3"],
  "replicableElements": ["elemento replicável 1", "elemento replicável 2"],
  "avoidElements": ["o que evitar ao replicar"],
  "adaptedConceptFor": "${newTopic || "outro nicho"}",
  "adaptationStrategy": "como adaptar esta fórmula para o novo tópico"
}

Responda APENAS com o JSON, sem texto adicional.`;

  try {
    const raw = await generateContent(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
    return NextResponse.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao analisar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
