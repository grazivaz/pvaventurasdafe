"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import CopyButton from "@/components/CopyButton";
import Link from "next/link";

interface Analysis {
  viralScore: number;
  mainHook: string;
  emotionTriggered: string;
  contentFormula: string;
  titleFormula: string;
  thumbnailStrategy: string;
  audienceProfile: string;
  whyItWentViral: string[];
  replicableElements: string[];
  avoidElements: string[];
  adaptedConceptFor: string;
  adaptationStrategy: string;
}

function AnalyzerContent() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    title: searchParams.get("title") || "",
    channelTitle: searchParams.get("channel") || "",
    viewCount: searchParams.get("views") || "",
    likeCount: searchParams.get("likes") || "",
    commentCount: searchParams.get("comments") || "",
    duration: searchParams.get("duration") || "",
    description: searchParams.get("description") || "",
    tags: searchParams.get("tags") || "",
    newTopic: "",
  });
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("title")) {
      analyze();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const analyze = async () => {
    if (!form.title) return;
    setLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: form.tags.split(",").filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao analisar");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">🔬 Analisador de Fórmulas Virais</h1>
        <p className="text-gray-400">A IA decifra o que fez um vídeo viralizar e como replicar em outro tema</p>
      </div>

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-bold mb-4">Dados do vídeo de referência</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Título do vídeo *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Cole o título do vídeo viral"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Canal</label>
            <input
              value={form.channelTitle}
              onChange={(e) => setForm({ ...form, channelTitle: e.target.value })}
              placeholder="Nome do canal"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Duração</label>
            <input
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="Ex: 12:34"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Visualizações</label>
            <input
              value={form.viewCount}
              onChange={(e) => setForm({ ...form, viewCount: e.target.value })}
              placeholder="Ex: 1500000"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Likes</label>
            <input
              value={form.likeCount}
              onChange={(e) => setForm({ ...form, likeCount: e.target.value })}
              placeholder="Ex: 45000"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Tags (separadas por vírgula)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Descrição (opcional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Primeiros parágrafos da descrição..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm resize-none"
            />
          </div>
          <div className="md:col-span-2 border-t border-gray-800 pt-4">
            <label className="text-gray-400 text-xs mb-1 block">
              🎯 Novo tópico para adaptar a fórmula (opcional)
            </label>
            <input
              value={form.newTopic}
              onChange={(e) => setForm({ ...form, newTopic: e.target.value })}
              placeholder="Ex: 'como economizar dinheiro', 'dieta cetogênica', 'marketing no Instagram'"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={analyze}
            disabled={loading || !form.title}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            🔬 Analisar Fórmula Viral
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      {loading && <LoadingSpinner message="IA analisando a fórmula viral..." />}

      {/* Analysis Result */}
      {analysis && (
        <div className="space-y-4">
          {/* Score card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-xl">📊 Resultado da Análise</h2>
              <div className="flex items-center gap-2">
                <CopyButton text={JSON.stringify(analysis, null, 2)} label="Exportar JSON" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className={`text-3xl font-black ${scoreColor(analysis.viralScore)}`}>
                  {analysis.viralScore}/10
                </p>
                <p className="text-gray-500 text-xs mt-1">Potencial Viral</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Emoção</p>
                <p className="text-white text-sm font-medium">{analysis.emotionTriggered}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Público</p>
                <p className="text-white text-sm font-medium line-clamp-2">{analysis.audienceProfile}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Fórmula</p>
                <p className="text-white text-sm font-medium line-clamp-2">{analysis.contentFormula}</p>
              </div>
            </div>
          </div>

          {/* Hook & Formulas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-red-400 font-bold mb-3">🎣 Gancho Principal</h3>
              <p className="text-white text-sm">{analysis.mainHook}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-yellow-400 font-bold mb-3">📌 Fórmula do Título</h3>
              <p className="text-white text-sm">{analysis.titleFormula}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-blue-400 font-bold mb-3">🖼️ Estratégia de Thumbnail</h3>
              <p className="text-white text-sm">{analysis.thumbnailStrategy}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-green-400 font-bold mb-3">🎯 Adaptação para: {analysis.adaptedConceptFor}</h3>
              <p className="text-white text-sm">{analysis.adaptationStrategy}</p>
            </div>
          </div>

          {/* Lists */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-orange-400 font-bold mb-3">🔥 Por que viralizou</h3>
              <ul className="space-y-2">
                {analysis.whyItWentViral.map((reason, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-orange-500 mt-0.5">▸</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-green-400 font-bold mb-3">✅ Elementos replicáveis</h3>
              <ul className="space-y-2">
                {analysis.replicableElements.map((el, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {el}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-red-400 font-bold mb-3">❌ Evitar ao replicar</h3>
              <ul className="space-y-2">
                {analysis.avoidElements.map((el, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-red-500 mt-0.5">✗</span>
                    {el}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-wrap gap-3">
            <p className="text-gray-400 text-sm w-full">Próximos passos com esta fórmula:</p>
            <Link href="/generator" className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              ⚡ Gerar Títulos e SEO
            </Link>
            <Link href="/script" className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              📝 Criar Roteiro
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyzerPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Carregando analisador..." />}>
      <AnalyzerContent />
    </Suspense>
  );
}
