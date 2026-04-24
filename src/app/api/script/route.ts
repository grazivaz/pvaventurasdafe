import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { topic, niche, duration, tone, targetAudience, referenceFormula, keywords, callToAction } = body;

  const systemPrompt = `Você é um roteirista especialista em conteúdo viral para YouTube, com profundo conhecimento em retenção de audiência, storytelling e psicologia do espectador.
Crie roteiros completos em português brasileiro, estruturados para maximizar a retenção e engajamento.
Cada roteiro deve seguir a fórmula AIDA (Atenção, Interesse, Desejo, Ação) adaptada ao YouTube.`;

  const userPrompt = `Crie um ROTEIRO COMPLETO e VIRAL para YouTube:

**Tópico:** ${topic}
**Nicho:** ${niche || "geral"}
**Duração alvo:** ${duration || "8-10 minutos"}
**Tom:** ${tone || "informativo com energia"}
**Público-alvo:** ${targetAudience || "adultos curiosos"}
**Fórmula de referência:** ${referenceFormula || "Problema → Agitação → Solução"}
**Palavras-chave:** ${keywords || topic}
**Call-to-action:** ${callToAction || "se inscrever e ativar o sino"}

O roteiro deve ter:

1. **GANCHO (0:00-0:30)** - Os primeiros 30 segundos que PRENDEM o espectador
2. **INTRODUÇÃO (0:30-1:30)** - Apresentação do problema/promessa de valor
3. **CORPO DO CONTEÚDO (1:30-7:00)** - Conteúdo principal dividido em seções
4. **CONCLUSÃO (7:00-8:00)** - Resumo e reforço da mensagem principal
5. **CALL-TO-ACTION (8:00-8:30)** - Chamada para ação natural e persuasiva

Inclua também:
- [PAUSA DRAMÁTICA] onde fazer pausa
- [B-ROLL: descrição] sugestões de imagens/vídeos de apoio
- [TEXTO NA TELA: texto] para legendas de destaque
- [MÚSICA: estilo] sugestões musicais para cada parte
- Indicações de ritmo e energia em cada seção

Responda em JSON:
{
  "title": "título sugerido para o vídeo",
  "totalDuration": "duração estimada",
  "sections": [
    {
      "name": "nome da seção",
      "timeCode": "0:00-0:30",
      "script": "roteiro completo desta seção",
      "directions": ["direção de câmera/b-roll 1", "direção 2"],
      "energy": "alto/médio/baixo",
      "musicMood": "estilo musical sugerido"
    }
  ],
  "visualNotes": ["nota visual geral 1", "nota 2"],
  "retentionTips": ["dica de retenção 1", "dica 2"],
  "wordCount": número estimado de palavras
}`;

  try {
    const raw = await generateContent(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao gerar roteiro";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
