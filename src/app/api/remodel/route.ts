import { NextRequest, NextResponse } from "next/server";
import { generateContent, generateLongContent } from "@/lib/anthropic";
import { YouTubeVideo } from "@/lib/youtube";

const SYSTEM_PROMPT = `Você é um estrategista sênior de YouTube especializado em remodelar vídeos virais para canais dark (anônimos), com domínio de retenção, CTR, SEO e monetização rápida.

REGRA INEGOCIÁVEL DE VERACIDADE:
- Toda informação factual sobre o vídeo original deve vir EXCLUSIVAMENTE dos dados fornecidos (metadados e transcrição).
- NUNCA invente fatos, números, nomes, datas ou acontecimentos. Se um dado não estiver disponível, diga explicitamente que não está disponível ou marque como [VERIFICAR].
- A dramatização é permitida e desejada NA FORMA (gatilhos mentais, curiosidade, tensão, storytelling), nunca no CONTEÚDO factual.
- Se a transcrição não foi fornecida, baseie-se apenas em título, descrição e estatísticas, e sinalize as limitações.

Responda sempre em português brasileiro. Quando o formato pedido for JSON, responda APENAS com o JSON válido, sem texto adicional.`;

function videoContext(video: YouTubeVideo, transcript: string | null): string {
  return `## DADOS REAIS DO VÍDEO ORIGINAL

**Título:** ${video.title}
**Canal:** ${video.channelTitle}
**Visualizações:** ${video.viewCount}
**Likes:** ${video.likeCount}
**Comentários:** ${video.commentCount}
**Duração:** ${video.duration}
**Publicado em:** ${video.publishedAt}
**Tags:** ${video.tags.slice(0, 20).join(", ") || "Nenhuma"}
**Descrição:**
${video.description.slice(0, 1500) || "(sem descrição)"}

**Transcrição:** ${transcript ? `\n${transcript}` : "NÃO DISPONÍVEL — baseie-se apenas nos metadados acima e sinalize as limitações."}`;
}

async function runAnalysis(video: YouTubeVideo, transcript: string | null) {
  const prompt = `${videoContext(video, transcript)}

Analise este vídeo como candidato a REMODELAGEM (recriar o conteúdo com identidade própria, sem copiar). Responda em JSON com esta estrutura exata:

{
  "viralScore": número de 1-10 do potencial viral do tema,
  "worthRemodeling": {
    "verdict": "SIM" | "NÃO" | "COM RESSALVAS",
    "score": número de 1-10,
    "reasoning": "justificativa objetiva baseada nos dados (views vs. tamanho do canal, atemporalidade do tema, demanda, concorrência)"
  },
  "videoSummary": "resumo fiel do que o vídeo aborda, baseado apenas nos dados fornecidos",
  "mainHook": "o gancho central que fez este vídeo funcionar",
  "emotionTriggered": "emoção principal explorada",
  "contentFormula": "fórmula estrutural identificada",
  "howToRemodel": ["passo concreto 1 para remodelar sem copiar", "passo 2", "passo 3", "passo 4", "passo 5"],
  "whatToKeep": ["elemento que deve ser mantido 1", "elemento 2"],
  "whatToChange": ["o que mudar obrigatoriamente para não ser cópia 1", "item 2"],
  "angleRecommendation": {
    "shouldChange": true | false,
    "current": "ângulo do vídeo original",
    "suggested": "novo ângulo recomendado e por quê"
  },
  "characterRecommendation": {
    "shouldChange": true | false,
    "current": "personagem/narrador/protagonista do original (ou 'não identificável')",
    "suggested": "recomendação de personagem/voz narrativa e por quê"
  },
  "themeRecommendation": {
    "shouldChange": true | false,
    "current": "tema central do original",
    "suggested": "manter ou variação de tema recomendada e por quê"
  },
  "viralTriggers": ["gatilho mental a usar na nova versão 1", "gatilho 2", "gatilho 3"],
  "monetizationTips": ["dica para monetizar rápido 1", "dica 2", "dica 3"],
  "risks": ["risco de copyright/diretrizes/saturação a evitar 1", "risco 2"],
  "dataLimitations": "o que NÃO foi possível verificar com os dados disponíveis (ex: transcrição ausente)"
}`;

  const raw = await generateContent(SYSTEM_PROMPT, prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : raw);
}

async function runLongScript(
  video: YouTubeVideo,
  transcript: string | null,
  analysis: Record<string, unknown>
) {
  const prompt = `${videoContext(video, transcript)}

## ANÁLISE ESTRATÉGICA JÁ APROVADA
${JSON.stringify(analysis, null, 2)}

Escreva o ROTEIRO COMPLETO da versão remodelada para VÍDEO LONGO de NO MÍNIMO 9 minutos (mínimo de 1.400 palavras de narração — conte as palavras e garanta isso). Siga o ângulo, personagem e tema recomendados na análise.

Regras:
- Use APENAS fatos presentes nos dados fornecidos. Onde precisar de um dado externo, escreva [VERIFICAR: o que pesquisar].
- Dramatize com técnicas de retenção (loops abertos, curiosidade, quebras de padrão), mas sem inventar informação.
- NÃO copie frases da transcrição original — reescreva tudo com estrutura e voz próprias.

Formato (markdown):

# TÍTULO DE TRABALHO

## 🎣 GANCHO (0:00–0:30)
[narração palavra por palavra]
[TEXTO NA TELA: ...] [B-ROLL: ...] quando relevante

## 📖 INTRODUÇÃO (0:30–1:30)
...

## 🔥 BLOCO 1 (1:30–3:30) — nome do bloco
...
(continue com blocos até pelo menos 9:00, com re-hooks a cada ~90 segundos marcados como [RE-HOOK])

## 🏁 CONCLUSÃO + CTA (último minuto)
...

Ao final, inclua:
**Contagem de palavras da narração:** X
**Duração estimada:** X minutos (a ~150 palavras/min)`;

  return generateLongContent(SYSTEM_PROMPT, prompt);
}

async function runPackaging(
  video: YouTubeVideo,
  analysis: Record<string, unknown>,
  longScript: string
) {
  const prompt = `## CONTEXTO
Vídeo original: "${video.title}" (${video.viewCount} views, canal ${video.channelTitle})

## ANÁLISE ESTRATÉGICA
${JSON.stringify(analysis, null, 2)}

## ROTEIRO LONGO JÁ ESCRITO
${longScript.slice(0, 12000)}

Crie o pacote de publicação da versão remodelada. Responda em JSON com esta estrutura exata:

{
  "titles": [
    { "title": "opção de título 1 (máx 60 chars, otimizado para CTR máximo)", "ctrTechnique": "técnica usada (curiosity gap, número, medo, etc)" },
    { "title": "opção 2", "ctrTechnique": "..." },
    { "title": "opção 3", "ctrTechnique": "..." },
    { "title": "opção 4", "ctrTechnique": "..." },
    { "title": "opção 5", "ctrTechnique": "..." }
  ],
  "recommendedTitle": "o melhor título das 5 opções e por quê",
  "thumbnail": {
    "concept": "conceito visual da thumbnail para CTR máximo",
    "textOverlay": "texto da thumbnail (máx 4 palavras, impacto)",
    "colors": "paleta e contraste recomendados",
    "imagePrompt": "prompt completo em inglês para gerar a thumbnail em IA (Midjourney/Ideogram), incluindo composição, iluminação, emoção, estilo"
  },
  "description": "descrição completa do vídeo otimizada para SEO: primeiras 2 linhas com gancho + palavra-chave, corpo com contexto, timestamps dos blocos do roteiro, CTA",
  "tags": ["tag 1", "tag 2", "... 15 a 20 tags SEO"],
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "seoKeywords": ["palavra-chave principal", "secundária 1", "secundária 2"],
  "shortVersion": {
    "hook": "gancho dos primeiros 2 segundos do Short",
    "script": "roteiro completo do Short de 45-60 segundos, palavra por palavra, derivado do momento mais forte do roteiro longo",
    "textOverlays": ["texto na tela 1", "texto 2"],
    "cta": "CTA final apontando para o vídeo longo",
    "title": "título do Short",
    "hashtags": ["#shorts", "#..."]
  },
  "publishStrategy": {
    "bestTime": "melhor janela de publicação e por quê",
    "shortTiming": "quando publicar o short em relação ao longo",
    "firstHourActions": ["ação na primeira hora 1", "ação 2"]
  }
}`;

  const raw = await generateContent(SYSTEM_PROMPT, prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : raw);
}

async function runScenes(longScript: string) {
  const prompt = `## ROTEIRO LONGO FINAL
${longScript}

Crie a ESTRUTURA COMPLETA DE PRODUÇÃO E EDIÇÃO deste roteiro, cena por cena, cobrindo o vídeo inteiro. Para cada cena defina o formato visual ideal e o prompt de geração. Responda em JSON com esta estrutura exata:

{
  "scenes": [
    {
      "number": 1,
      "timeCode": "0:00-0:15",
      "block": "GANCHO",
      "narrationSnippet": "primeiras palavras da narração desta cena...",
      "visualType": "imagem-ia" | "video-ia" | "footage-real" | "screen-recording" | "texto-animado" | "mapa/infografico",
      "visualDescription": "o que aparece na tela",
      "aiPrompt": "prompt completo em inglês para gerar esta cena (imagem ou vídeo) em IA — composição, estilo, iluminação, movimento de câmera se for vídeo",
      "effects": "efeitos de edição (zoom lento, shake, glitch, transição, etc)",
      "soundDesign": "efeito sonoro ou mudança de trilha neste momento"
    }
  ],
  "editingGuidelines": {
    "pacing": "ritmo de cortes recomendado por bloco",
    "colorGrade": "tratamento de cor",
    "captionStyle": "estilo das legendas",
    "musicArc": "arco da trilha sonora do início ao fim"
  },
  "toolSuggestions": ["ferramenta recomendada e para quê 1", "ferramenta 2"],
  "productionOrder": ["passo 1 do fluxo de produção mais eficiente", "passo 2"]
}

Importante: gere cenas suficientes para cobrir TODO o roteiro (geralmente 25-45 cenas para 9-12 minutos), variando os tipos visuais para manter retenção.`;

  const raw = await generateLongContent(SYSTEM_PROMPT, prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : raw);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { step, video, transcript, analysis, longScript } = body;

  try {
    switch (step) {
      case "analysis": {
        if (!video) throw new Error("Dados do vídeo ausentes");
        const result = await runAnalysis(video, transcript ?? null);
        return NextResponse.json({ result });
      }
      case "script": {
        if (!video || !analysis) throw new Error("Análise ausente");
        const result = await runLongScript(video, transcript ?? null, analysis);
        return NextResponse.json({ result });
      }
      case "packaging": {
        if (!video || !analysis || !longScript) throw new Error("Roteiro ausente");
        const result = await runPackaging(video, analysis, longScript);
        return NextResponse.json({ result });
      }
      case "scenes": {
        if (!longScript) throw new Error("Roteiro ausente");
        const result = await runScenes(longScript);
        return NextResponse.json({ result });
      }
      default:
        return NextResponse.json({ error: "Etapa inválida" }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao processar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
