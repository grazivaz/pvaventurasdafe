"use client";

import { useState } from "react";
import CopyButton from "@/components/CopyButton";
import LoadingSpinner from "@/components/LoadingSpinner";

type GenerateType = "titles" | "description" | "tags" | "thumbnail" | "seo";

interface TitleOption {
  title: string;
  formula: string;
  whyItWorks: string;
}

interface TagsResult {
  primary: string[];
  longTail: string[];
  english: string[];
}

interface ThumbnailPrompt {
  style: string;
  prompt: string;
  elements: string[];
}

interface SeoStrategy {
  bestTimeToPost: string;
  publishingFrequency: string;
  communityEngagement: string;
  playlistStrategy: string;
  endScreenStrategy: string;
  firstHourActions: string[];
  channelOptimization: string[];
}

type GenerateResult =
  | { type: "titles"; titles: TitleOption[] }
  | { type: "description"; description: string }
  | { type: "tags"; tags: TagsResult }
  | { type: "thumbnail"; prompts: ThumbnailPrompt[] }
  | { type: "seo"; strategy: SeoStrategy };

const TABS: { id: GenerateType; label: string; icon: string }[] = [
  { id: "titles", label: "Títulos Virais", icon: "⚡" },
  { id: "description", label: "Descrição SEO", icon: "📄" },
  { id: "tags", label: "Tags", icon: "🏷️" },
  { id: "thumbnail", label: "Thumbnail", icon: "🖼️" },
  { id: "seo", label: "Estratégia SEO", icon: "📈" },
];

export default function GeneratorPage() {
  const [activeTab, setActiveTab] = useState<GenerateType>("titles");
  const [form, setForm] = useState({
    topic: "",
    niche: "",
    tone: "informativo",
    targetAudience: "",
    keywords: "",
    viralFormula: "",
  });
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!form.topic) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          ...form,
          keywords: form.keywords.split(",").filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ type: activeTab, ...data } as GenerateResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar conteúdo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">⚡ Gerador de Conteúdo</h1>
        <p className="text-gray-400">Gere títulos virais, descrições SEO, tags, prompts de thumbnail e estratégia completa</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResult(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-red-600 text-white"
                : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Tópico / Assunto do vídeo *</label>
            <input
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="Ex: como economizar dinheiro em 2025"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Nicho do canal</label>
            <input
              value={form.niche}
              onChange={(e) => setForm({ ...form, niche: e.target.value })}
              placeholder="Ex: finanças pessoais, saúde, tecnologia"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Tom do conteúdo</label>
            <select
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            >
              <option value="informativo">Informativo</option>
              <option value="urgente">Urgente / Alarmante</option>
              <option value="inspiracional">Inspiracional</option>
              <option value="controverso">Controverso</option>
              <option value="educativo">Educativo</option>
              <option value="entretenimento">Entretenimento</option>
              <option value="motivacional">Motivacional</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Público-alvo</label>
            <input
              value={form.targetAudience}
              onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
              placeholder="Ex: jovens de 18-35 anos interessados em..."
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Palavras-chave (separadas por vírgula)</label>
            <input
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder="keyword1, keyword2, keyword3"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Fórmula viral de referência (opcional)</label>
            <input
              value={form.viralFormula}
              onChange={(e) => setForm({ ...form, viralFormula: e.target.value })}
              placeholder="Cole aqui a fórmula identificada pelo Analisador..."
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading || !form.topic}
          className="mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          ⚡ Gerar {TABS.find((t) => t.id === activeTab)?.label}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      {loading && <LoadingSpinner message="IA gerando conteúdo otimizado..." />}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {result.type === "titles" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-xl">⚡ Títulos Virais Gerados</h2>
                <CopyButton
                  text={result.titles.map((t, i) => `${i + 1}. ${t.title}`).join("\n")}
                  label="Copiar todos"
                />
              </div>
              <div className="space-y-3">
                {result.titles.map((t, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm mb-2">{t.title}</p>
                        <p className="text-yellow-400 text-xs mb-1">
                          <span className="text-gray-500">Fórmula:</span> {t.formula}
                        </p>
                        <p className="text-gray-400 text-xs">{t.whyItWorks}</p>
                      </div>
                      <CopyButton text={t.title} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.type === "description" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-xl">📄 Descrição SEO</h2>
                <CopyButton text={result.description} label="Copiar descrição" />
              </div>
              <pre className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed bg-gray-800 rounded-xl p-4">
                {result.description}
              </pre>
            </div>
          )}

          {result.type === "tags" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-xl">🏷️ Tags Otimizadas</h2>
                <CopyButton
                  text={[...result.tags.primary, ...result.tags.longTail, ...result.tags.english].join(", ")}
                  label="Copiar todas"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-red-400 text-sm font-bold mb-2">Tags Primárias ({result.tags.primary.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.primary.map((tag, i) => (
                      <span key={i} className="bg-red-900/30 text-red-300 text-xs px-2 py-1 rounded-lg">{tag}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-yellow-400 text-sm font-bold mb-2">Long Tail ({result.tags.longTail.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.longTail.map((tag, i) => (
                      <span key={i} className="bg-yellow-900/30 text-yellow-300 text-xs px-2 py-1 rounded-lg">{tag}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-blue-400 text-sm font-bold mb-2">Em Inglês ({result.tags.english.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.english.map((tag, i) => (
                      <span key={i} className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded-lg">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {result.type === "thumbnail" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-xl mb-4">🖼️ Prompts de Thumbnail</h2>
              <div className="space-y-4">
                {result.prompts.map((p, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-purple-400 font-bold text-sm">Opção {i + 1}: {p.style}</span>
                      <CopyButton text={p.prompt} label="Copiar prompt" />
                    </div>
                    <p className="text-gray-300 text-sm mb-3 leading-relaxed">{p.prompt}</p>
                    <div className="flex flex-wrap gap-2">
                      {p.elements.map((el, j) => (
                        <span key={j} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">{el}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.type === "seo" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-xl mb-4">📈 Estratégia SEO Completa</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-500 text-xs mb-1">Melhor horário para publicar</p>
                  <p className="text-white text-sm font-medium">{result.strategy.bestTimeToPost}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-500 text-xs mb-1">Frequência de publicação</p>
                  <p className="text-white text-sm font-medium">{result.strategy.publishingFrequency}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-500 text-xs mb-1">Engajamento com comunidade</p>
                  <p className="text-white text-sm">{result.strategy.communityEngagement}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-500 text-xs mb-1">Estratégia de playlists</p>
                  <p className="text-white text-sm">{result.strategy.playlistStrategy}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 md:col-span-2">
                  <p className="text-gray-500 text-xs mb-1">Tela final (End Screen)</p>
                  <p className="text-white text-sm">{result.strategy.endScreenStrategy}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-yellow-400 text-sm font-bold mb-2">⚡ Ações na primeira hora</p>
                  <ul className="space-y-1.5">
                    {result.strategy.firstHourActions.map((a, i) => (
                      <li key={i} className="text-gray-300 text-xs flex gap-2">
                        <span className="text-yellow-500">▸</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-green-400 text-sm font-bold mb-2">✅ Otimização do canal</p>
                  <ul className="space-y-1.5">
                    {result.strategy.channelOptimization.map((a, i) => (
                      <li key={i} className="text-gray-300 text-xs flex gap-2">
                        <span className="text-green-500">✓</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
