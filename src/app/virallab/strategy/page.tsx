"use client";

import { useState } from "react";
import CopyButton from "@/components/CopyButton";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ContentPillar {
  name: string;
  description: string;
  exampleTitles: string[];
}

interface MonthPlan {
  week: string;
  actions: string[];
}

interface MonetizationPhase {
  phase: string;
  timeframe: string;
  strategies: string[];
  expectedRevenue: string;
}

interface ChannelStrategy {
  channelConcept: string;
  positioning: string;
  contentPillars: ContentPillar[];
  firstMonthPlan: MonthPlan[];
  seoStrategy: string[];
  growthHacks: string[];
  monetizationRoadmap: MonetizationPhase[];
  anonymityTips: string[];
  toolsRecommended: string[];
  kpis: { metric: string; target: string }[];
}

export default function StrategyPage() {
  const [form, setForm] = useState({
    niche: "",
    targetAudience: "",
    competitorChannels: "",
    monetizationGoal: "adsense",
    weeklyHours: "10",
    budget: "zero",
    differentiator: "",
  });
  const [strategy, setStrategy] = useState<ChannelStrategy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState(0);

  const generate = async () => {
    if (!form.niche) return;
    setLoading(true);
    setError("");
    setStrategy(null);
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStrategy(data.strategy);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar estratégia");
    } finally {
      setLoading(false);
    }
  };

  const sections = strategy
    ? [
        { label: "Conceito", icon: "🎯" },
        { label: "Pilares", icon: "🏛️" },
        { label: "Plano 30 dias", icon: "📅" },
        { label: "SEO", icon: "📈" },
        { label: "Growth", icon: "🚀" },
        { label: "Monetização", icon: "💰" },
        { label: "Anonimato", icon: "🕶️" },
        { label: "KPIs", icon: "📊" },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">🎯 Estratégia de Canal</h1>
        <p className="text-gray-400">Monte uma estratégia completa de canal dark com plano de crescimento e monetização</p>
      </div>

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Nicho do canal *</label>
            <input
              value={form.niche}
              onChange={(e) => setForm({ ...form, niche: e.target.value })}
              placeholder="Ex: finanças pessoais, emagrecimento, marketing digital, tecnologia"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Público-alvo</label>
            <input
              value={form.targetAudience}
              onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
              placeholder="Ex: brasileiros 25-45 anos com dívidas"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Canais concorrentes (referência)</label>
            <input
              value={form.competitorChannels}
              onChange={(e) => setForm({ ...form, competitorChannels: e.target.value })}
              placeholder="Ex: canal A, canal B, canal C"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Objetivo de monetização</label>
            <select
              value={form.monetizationGoal}
              onChange={(e) => setForm({ ...form, monetizationGoal: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            >
              <option value="adsense">AdSense (monetização YouTube)</option>
              <option value="produtos-digitais">Produtos digitais / Cursos</option>
              <option value="afiliados">Marketing de afiliados</option>
              <option value="membros">Canal de membros</option>
              <option value="multiplo">Múltiplas fontes</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Horas disponíveis por semana</label>
            <select
              value={form.weeklyHours}
              onChange={(e) => setForm({ ...form, weeklyHours: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            >
              <option value="5">Até 5 horas (canal secundário)</option>
              <option value="10">5-10 horas (dedicação moderada)</option>
              <option value="20">10-20 horas (semi-profissional)</option>
              <option value="40">20+ horas (tempo integral)</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Orçamento inicial</label>
            <select
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            >
              <option value="zero">Zero (100% gratuito)</option>
              <option value="baixo">Até R$200/mês</option>
              <option value="medio">R$200-500/mês</option>
              <option value="alto">R$500+/mês</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Diferencial do canal (o que te tornará único)</label>
            <input
              value={form.differentiator}
              onChange={(e) => setForm({ ...form, differentiator: e.target.value })}
              placeholder="Ex: conteúdo mais prático, ângulo diferente, público específico..."
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading || !form.niche}
          className="mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          🎯 Gerar Estratégia Completa
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      {loading && <LoadingSpinner message="IA montando sua estratégia de canal..." />}

      {/* Strategy Result */}
      {strategy && (
        <div className="space-y-4">
          {/* Section nav */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveSection(i)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeSection === i
                    ? "bg-red-600 text-white"
                    : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {/* Section 0: Conceito */}
          {activeSection === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-xl">🎯 Conceito do Canal</h2>
                <CopyButton text={strategy.channelConcept + "\n\n" + strategy.positioning} label="Copiar" />
              </div>
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-red-400 text-xs font-bold mb-2">Conceito Central</p>
                  <p className="text-white text-sm leading-relaxed">{strategy.channelConcept}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-yellow-400 text-xs font-bold mb-2">Posicionamento</p>
                  <p className="text-white text-sm leading-relaxed">{strategy.positioning}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-green-400 text-xs font-bold mb-2">🛠️ Ferramentas Recomendadas</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {strategy.toolsRecommended.map((tool, i) => (
                      <span key={i} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-lg">{tool}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Pilares */}
          {activeSection === 1 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-xl mb-4">🏛️ Pilares de Conteúdo</h2>
              <div className="space-y-4">
                {strategy.contentPillars.map((pillar, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-4">
                    <p className="text-white font-bold mb-1">{pillar.name}</p>
                    <p className="text-gray-400 text-sm mb-3">{pillar.description}</p>
                    <p className="text-gray-500 text-xs mb-2">Exemplos de títulos:</p>
                    <ul className="space-y-1">
                      {pillar.exampleTitles.map((title, j) => (
                        <li key={j} className="text-gray-300 text-xs flex gap-2">
                          <span className="text-red-500">▸</span>{title}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Plano 30 dias */}
          {activeSection === 2 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-xl mb-4">📅 Plano dos Primeiros 30 Dias</h2>
              <div className="space-y-4">
                {strategy.firstMonthPlan.map((week, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-4">
                    <p className="text-yellow-400 font-bold text-sm mb-2">{week.week}</p>
                    <ul className="space-y-1.5">
                      {week.actions.map((action, j) => (
                        <li key={j} className="text-gray-300 text-sm flex gap-2">
                          <span className="text-yellow-500 mt-0.5">▸</span>{action}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: SEO */}
          {activeSection === 3 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-xl">📈 Estratégia SEO</h2>
                <CopyButton text={strategy.seoStrategy.join("\n")} label="Copiar" />
              </div>
              <ul className="space-y-3">
                {strategy.seoStrategy.map((tip, i) => (
                  <li key={i} className="flex gap-3 bg-gray-800 rounded-xl p-3">
                    <span className="text-green-500 font-bold text-sm mt-0.5">✓</span>
                    <p className="text-gray-300 text-sm">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 4: Growth */}
          {activeSection === 4 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-xl">🚀 Growth Hacks</h2>
                <CopyButton text={strategy.growthHacks.join("\n")} label="Copiar" />
              </div>
              <ul className="space-y-3">
                {strategy.growthHacks.map((hack, i) => (
                  <li key={i} className="flex gap-3 bg-gray-800 rounded-xl p-3">
                    <span className="text-orange-500 font-bold">🔥</span>
                    <p className="text-gray-300 text-sm">{hack}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 5: Monetização */}
          {activeSection === 5 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-xl mb-4">💰 Roadmap de Monetização</h2>
              <div className="space-y-4">
                {strategy.monetizationRoadmap.map((phase, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-bold">{phase.phase}</p>
                      <span className="text-gray-500 text-xs">{phase.timeframe}</span>
                    </div>
                    <p className="text-green-400 text-sm font-medium mb-2">{phase.expectedRevenue}</p>
                    <ul className="space-y-1">
                      {phase.strategies.map((s, j) => (
                        <li key={j} className="text-gray-300 text-xs flex gap-2">
                          <span className="text-green-500">▸</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Anonimato */}
          {activeSection === 6 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-xl">🕶️ Dicas de Anonimato</h2>
                <CopyButton text={strategy.anonymityTips.join("\n")} label="Copiar" />
              </div>
              <ul className="space-y-3">
                {strategy.anonymityTips.map((tip, i) => (
                  <li key={i} className="flex gap-3 bg-gray-800 rounded-xl p-3">
                    <span className="text-purple-400">🕶️</span>
                    <p className="text-gray-300 text-sm">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 7: KPIs */}
          {activeSection === 7 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-xl mb-4">📊 KPIs e Metas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {strategy.kpis.map((kpi, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
                    <p className="text-gray-300 text-sm">{kpi.metric}</p>
                    <p className="text-green-400 font-bold text-sm">{kpi.target}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
