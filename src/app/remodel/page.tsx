"use client";

import { useState } from "react";
import CopyButton from "@/components/CopyButton";
import { YouTubeVideo, formatNumber } from "@/lib/youtube";

interface Analysis {
  viralScore: number;
  worthRemodeling: { verdict: string; score: number; reasoning: string };
  videoSummary: string;
  mainHook: string;
  emotionTriggered: string;
  contentFormula: string;
  howToRemodel: string[];
  whatToKeep: string[];
  whatToChange: string[];
  angleRecommendation: { shouldChange: boolean; current: string; suggested: string };
  characterRecommendation: { shouldChange: boolean; current: string; suggested: string };
  themeRecommendation: { shouldChange: boolean; current: string; suggested: string };
  viralTriggers: string[];
  monetizationTips: string[];
  risks: string[];
  dataLimitations: string;
}

interface Packaging {
  titles: { title: string; ctrTechnique: string }[];
  recommendedTitle: string;
  thumbnail: { concept: string; textOverlay: string; colors: string; imagePrompt: string };
  description: string;
  tags: string[];
  hashtags: string[];
  seoKeywords: string[];
  shortVersion: {
    hook: string;
    script: string;
    textOverlays: string[];
    cta: string;
    title: string;
    hashtags: string[];
  };
  publishStrategy: { bestTime: string; shortTiming: string; firstHourActions: string[] };
}

interface Scene {
  number: number;
  timeCode: string;
  block: string;
  narrationSnippet: string;
  visualType: string;
  visualDescription: string;
  aiPrompt: string;
  effects: string;
  soundDesign: string;
}

interface ScenesResult {
  scenes: Scene[];
  editingGuidelines: { pacing: string; colorGrade: string; captionStyle: string; musicArc: string };
  toolSuggestions: string[];
  productionOrder: string[];
}

const STEPS = [
  { key: "video", label: "Buscando dados reais do vídeo" },
  { key: "analysis", label: "Analisando se vale a pena remodelar" },
  { key: "script", label: "Escrevendo roteiro longo (9+ min)" },
  { key: "packaging", label: "Gerando título, thumbnail, SEO e Short" },
  { key: "scenes", label: "Montando estrutura de cenas e prompts" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];
type StepStatus = "pending" | "running" | "done" | "error";

const visualTypeStyle: Record<string, string> = {
  "imagem-ia": "bg-purple-900/40 text-purple-300 border-purple-700/40",
  "video-ia": "bg-blue-900/40 text-blue-300 border-blue-700/40",
  "footage-real": "bg-green-900/40 text-green-300 border-green-700/40",
  "screen-recording": "bg-yellow-900/40 text-yellow-300 border-yellow-700/40",
  "texto-animado": "bg-pink-900/40 text-pink-300 border-pink-700/40",
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro inesperado");
  return data;
}

export default function RemodelPage() {
  const [url, setUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [stepStatus, setStepStatus] = useState<Record<StepKey, StepStatus>>({
    video: "pending",
    analysis: "pending",
    script: "pending",
    packaging: "pending",
    scenes: "pending",
  });
  const [error, setError] = useState("");

  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [hasTranscript, setHasTranscript] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [longScript, setLongScript] = useState("");
  const [packaging, setPackaging] = useState<Packaging | null>(null);
  const [scenes, setScenes] = useState<ScenesResult | null>(null);

  const setStatus = (key: StepKey, status: StepStatus) =>
    setStepStatus((prev) => ({ ...prev, [key]: status }));

  const run = async () => {
    if (!url || running) return;
    setRunning(true);
    setError("");
    setVideo(null);
    setAnalysis(null);
    setLongScript("");
    setPackaging(null);
    setScenes(null);
    setStepStatus({ video: "pending", analysis: "pending", script: "pending", packaging: "pending", scenes: "pending" });

    let current: StepKey = "video";
    try {
      setStatus("video", "running");
      const { video: v, transcript } = await postJson<{
        video: YouTubeVideo;
        transcript: string | null;
      }>("/api/video", { url });
      setVideo(v);
      setHasTranscript(!!transcript);
      setStatus("video", "done");

      current = "analysis";
      setStatus("analysis", "running");
      const { result: a } = await postJson<{ result: Analysis }>("/api/remodel", {
        step: "analysis",
        video: v,
        transcript,
      });
      setAnalysis(a);
      setStatus("analysis", "done");

      current = "script";
      setStatus("script", "running");
      const { result: s } = await postJson<{ result: string }>("/api/remodel", {
        step: "script",
        video: v,
        transcript,
        analysis: a,
      });
      setLongScript(s);
      setStatus("script", "done");

      current = "packaging";
      setStatus("packaging", "running");
      const { result: p } = await postJson<{ result: Packaging }>("/api/remodel", {
        step: "packaging",
        video: v,
        analysis: a,
        longScript: s,
      });
      setPackaging(p);
      setStatus("packaging", "done");

      current = "scenes";
      setStatus("scenes", "running");
      const { result: sc } = await postJson<{ result: ScenesResult }>("/api/remodel", {
        step: "scenes",
        longScript: s,
      });
      setScenes(sc);
      setStatus("scenes", "done");
    } catch (e) {
      setStatus(current, "error");
      setError(e instanceof Error ? e.message : "Erro ao processar");
    } finally {
      setRunning(false);
    }
  };

  const verdictColor = (verdict: string) => {
    if (verdict?.toUpperCase().includes("SIM")) return "text-green-400 border-green-700/40 bg-green-900/20";
    if (verdict?.toUpperCase().includes("NÃO")) return "text-red-400 border-red-700/40 bg-red-900/20";
    return "text-yellow-400 border-yellow-700/40 bg-yellow-900/20";
  };

  const recBadge = (shouldChange: boolean) =>
    shouldChange ? (
      <span className="text-xs font-bold text-orange-400 bg-orange-900/30 border border-orange-700/40 rounded-full px-2 py-0.5">TROCAR</span>
    ) : (
      <span className="text-xs font-bold text-green-400 bg-green-900/30 border border-green-700/40 rounded-full px-2 py-0.5">MANTER</span>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">🎬 Remodelador de Vídeos</h1>
        <p className="text-gray-400">
          Cole o link de um vídeo do YouTube e receba a análise completa: veredito de remodelagem,
          roteiro longo (9+ min), Short, SEO, thumbnail e estrutura de produção cena a cena.
        </p>
      </div>

      {/* Input */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-sm"
          />
          <button
            onClick={run}
            disabled={running || !url}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            {running ? "⏳ Analisando..." : "🎬 Analisar e Remodelar"}
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-2">
          ✓ Todas as informações do vídeo são extraídas dos dados reais do YouTube (metadados + transcrição). A IA nunca inventa fatos.
        </p>
      </div>

      {/* Progress */}
      {(running || video) && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {STEPS.map((step) => {
              const status = stepStatus[step.key];
              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-xs ${
                    status === "done"
                      ? "border-green-700/40 bg-green-900/20 text-green-300"
                      : status === "running"
                      ? "border-red-700/40 bg-red-900/20 text-white animate-pulse"
                      : status === "error"
                      ? "border-red-700 bg-red-900/40 text-red-300"
                      : "border-gray-800 bg-gray-950 text-gray-500"
                  }`}
                >
                  <span>
                    {status === "done" ? "✅" : status === "running" ? "⏳" : status === "error" ? "❌" : "○"}
                  </span>
                  {step.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Video card */}
      {video && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 flex flex-col md:flex-row gap-5">
          {video.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full md:w-72 rounded-xl object-cover"
            />
          )}
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg mb-1">{video.title}</h2>
            <p className="text-gray-400 text-sm mb-3">{video.channelTitle}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-3">
              <span>👁️ {formatNumber(video.viewCount)} views</span>
              <span>👍 {formatNumber(video.likeCount)}</span>
              <span>💬 {formatNumber(video.commentCount)}</span>
              <span>⏱️ {video.duration}</span>
            </div>
            <span
              className={`text-xs font-medium rounded-full px-3 py-1 border ${
                hasTranscript
                  ? "text-green-400 border-green-700/40 bg-green-900/20"
                  : "text-yellow-400 border-yellow-700/40 bg-yellow-900/20"
              }`}
            >
              {hasTranscript
                ? "✓ Transcrição obtida — análise baseada no conteúdo real"
                : "⚠ Sem transcrição — análise baseada apenas em título, descrição e estatísticas"}
            </span>
          </div>
        </div>
      )}

      {/* 1. Verdict & strategy */}
      {analysis && (
        <div className="space-y-4 mb-6">
          <div className={`border rounded-2xl p-6 ${verdictColor(analysis.worthRemodeling?.verdict)}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <h2 className="font-black text-2xl">
                Vale a pena remodelar? {analysis.worthRemodeling?.verdict}
              </h2>
              <span className="font-black text-3xl">{analysis.worthRemodeling?.score}/10</span>
            </div>
            <p className="text-sm opacity-90">{analysis.worthRemodeling?.reasoning}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold">📐 Ângulo</h3>
                {recBadge(analysis.angleRecommendation?.shouldChange)}
              </div>
              <p className="text-gray-500 text-xs mb-1">Original: {analysis.angleRecommendation?.current}</p>
              <p className="text-gray-300 text-sm">{analysis.angleRecommendation?.suggested}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold">🧑 Personagem</h3>
                {recBadge(analysis.characterRecommendation?.shouldChange)}
              </div>
              <p className="text-gray-500 text-xs mb-1">Original: {analysis.characterRecommendation?.current}</p>
              <p className="text-gray-300 text-sm">{analysis.characterRecommendation?.suggested}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold">🗂️ Tema</h3>
                {recBadge(analysis.themeRecommendation?.shouldChange)}
              </div>
              <p className="text-gray-500 text-xs mb-1">Original: {analysis.themeRecommendation?.current}</p>
              <p className="text-gray-300 text-sm">{analysis.themeRecommendation?.suggested}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-blue-400 font-bold mb-3">🛠️ Como remodelar sem copiar</h3>
              <ol className="space-y-2">
                {analysis.howToRemodel?.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-blue-500 font-bold">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-green-400 font-bold mb-2">✅ Manter</h3>
                <ul className="space-y-1.5">
                  {analysis.whatToKeep?.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-green-500">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-orange-400 font-bold mb-2">🔄 Mudar obrigatoriamente</h3>
                <ul className="space-y-1.5">
                  {analysis.whatToChange?.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-orange-500">→</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-purple-400 font-bold mb-2">🧠 Gatilhos para a nova versão</h3>
              <ul className="space-y-1.5">
                {analysis.viralTriggers?.map((item, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-purple-500">▸</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-yellow-400 font-bold mb-2">💰 Monetizar rápido</h3>
              <ul className="space-y-1.5">
                {analysis.monetizationTips?.map((item, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-yellow-500">$</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-red-400 font-bold mb-2">⚠️ Riscos a evitar</h3>
              <ul className="space-y-1.5">
                {analysis.risks?.map((item, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-red-500">!</span> {item}
                  </li>
                ))}
              </ul>
              {analysis.dataLimitations && (
                <p className="text-gray-500 text-xs mt-3 border-t border-gray-800 pt-2">
                  📋 Limitações dos dados: {analysis.dataLimitations}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Long script */}
      {longScript && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-xl">📝 Roteiro Completo — Vídeo Longo (9+ min)</h2>
            <CopyButton text={longScript} label="Copiar roteiro" />
          </div>
          <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans bg-gray-950 border border-gray-800 rounded-xl p-5 max-h-[600px] overflow-y-auto">
            {longScript}
          </pre>
        </div>
      )}

      {/* 3. Packaging */}
      {packaging && (
        <div className="space-y-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold text-xl mb-4">🏷️ Títulos para CTR Máximo</h2>
            <div className="space-y-2 mb-4">
              {packaging.titles?.map((t, i) => (
                <div key={i} className="flex items-center justify-between gap-3 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{t.title}</p>
                    <p className="text-gray-500 text-xs">{t.ctrTechnique}</p>
                  </div>
                  <CopyButton text={t.title} label="" />
                </div>
              ))}
            </div>
            <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4">
              <p className="text-green-400 text-sm font-medium">🏆 Recomendado: {packaging.recommendedTitle}</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-xl">🖼️ Thumbnail</h2>
              <CopyButton text={packaging.thumbnail?.imagePrompt || ""} label="Copiar prompt" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Conceito</p>
                  <p className="text-gray-300 text-sm">{packaging.thumbnail?.concept}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Texto na thumbnail</p>
                  <p className="text-white font-black text-2xl">{packaging.thumbnail?.textOverlay}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Cores</p>
                  <p className="text-gray-300 text-sm">{packaging.thumbnail?.colors}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Prompt para IA (Midjourney/Ideogram)</p>
                <p className="text-purple-300 text-sm bg-gray-950 border border-gray-800 rounded-xl p-3 font-mono">
                  {packaging.thumbnail?.imagePrompt}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-bold text-xl">📄 Descrição + SEO</h2>
                <CopyButton text={packaging.description || ""} label="Copiar" />
              </div>
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans bg-gray-950 border border-gray-800 rounded-xl p-4 max-h-72 overflow-y-auto mb-3">
                {packaging.description}
              </pre>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-xs">Tags ({packaging.tags?.length})</p>
                <CopyButton text={packaging.tags?.join(", ") || ""} label="Copiar tags" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {packaging.tags?.map((tag, i) => (
                  <span key={i} className="text-xs bg-gray-800 text-gray-300 rounded-full px-2.5 py-1">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {packaging.hashtags?.map((h, i) => (
                  <span key={i} className="text-xs text-blue-400">{h}</span>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-bold text-xl">📱 Versão Short (45-60s)</h2>
                <CopyButton text={packaging.shortVersion?.script || ""} label="Copiar" />
              </div>
              <p className="text-white text-sm font-medium mb-1">{packaging.shortVersion?.title}</p>
              <p className="text-red-400 text-sm mb-3">🎣 {packaging.shortVersion?.hook}</p>
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans bg-gray-950 border border-gray-800 rounded-xl p-4 max-h-56 overflow-y-auto mb-3">
                {packaging.shortVersion?.script}
              </pre>
              <p className="text-gray-400 text-xs mb-2">CTA: {packaging.shortVersion?.cta}</p>
              <div className="flex flex-wrap gap-1.5">
                {packaging.shortVersion?.hashtags?.map((h, i) => (
                  <span key={i} className="text-xs text-blue-400">{h}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold text-xl mb-3">🚀 Estratégia de Publicação</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Melhor horário</p>
                <p className="text-gray-300">{packaging.publishStrategy?.bestTime}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Timing do Short</p>
                <p className="text-gray-300">{packaging.publishStrategy?.shortTiming}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Primeira hora</p>
                <ul className="text-gray-300 space-y-1">
                  {packaging.publishStrategy?.firstHourActions?.map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Scenes */}
      {scenes && (
        <div className="space-y-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-xl">
                🎬 Estrutura de Produção — {scenes.scenes?.length} cenas
              </h2>
              <CopyButton
                text={scenes.scenes?.map((s) => `CENA ${s.number} [${s.timeCode}] (${s.visualType})\n${s.visualDescription}\nPROMPT: ${s.aiPrompt}\nEFEITOS: ${s.effects}`).join("\n\n") || ""}
                label="Copiar tudo"
              />
            </div>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {scenes.scenes?.map((scene) => (
                <div key={scene.number} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-white font-bold text-sm">Cena {scene.number}</span>
                    <span className="text-gray-500 text-xs">{scene.timeCode}</span>
                    <span className="text-gray-500 text-xs">• {scene.block}</span>
                    <span
                      className={`text-xs font-medium border rounded-full px-2 py-0.5 ${
                        visualTypeStyle[scene.visualType] || "bg-gray-800 text-gray-300 border-gray-700"
                      }`}
                    >
                      {scene.visualType}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs italic mb-2">🎙️ &ldquo;{scene.narrationSnippet}&rdquo;</p>
                  <p className="text-gray-300 text-sm mb-2">{scene.visualDescription}</p>
                  <div className="flex items-start justify-between gap-2 bg-gray-900 border border-gray-800 rounded-lg p-3 mb-2">
                    <p className="text-purple-300 text-xs font-mono flex-1">{scene.aiPrompt}</p>
                    <CopyButton text={scene.aiPrompt} label="" />
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>✨ {scene.effects}</span>
                    <span>🔊 {scene.soundDesign}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-cyan-400 font-bold mb-3">🎞️ Diretrizes de Edição</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p><span className="text-gray-500">Ritmo:</span> {scenes.editingGuidelines?.pacing}</p>
                <p><span className="text-gray-500">Cor:</span> {scenes.editingGuidelines?.colorGrade}</p>
                <p><span className="text-gray-500">Legendas:</span> {scenes.editingGuidelines?.captionStyle}</p>
                <p><span className="text-gray-500">Trilha:</span> {scenes.editingGuidelines?.musicArc}</p>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-teal-400 font-bold mb-3">🧰 Ferramentas</h3>
              <ul className="space-y-1.5">
                {scenes.toolSuggestions?.map((t, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-teal-500">▸</span> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-indigo-400 font-bold mb-3">📋 Ordem de Produção</h3>
              <ol className="space-y-1.5">
                {scenes.productionOrder?.map((p, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-indigo-500 font-bold">{i + 1}.</span> {p}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
