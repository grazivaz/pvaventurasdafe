"use client";

import { useState } from "react";
import CopyButton from "@/components/CopyButton";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ScriptSection {
  title: string;
  timeCode: string;
  content: string;
  bRoll: string;
  music: string;
  energyLevel: "baixo" | "médio" | "alto";
  retentionTip: string;
}

interface Script {
  videoTitle: string;
  totalDuration: string;
  hook: string;
  sections: ScriptSection[];
  callToAction: string;
  retentionStrategy: string;
  musicMood: string;
}

const ENERGY_COLORS = {
  baixo: "text-blue-400 bg-blue-900/30",
  médio: "text-yellow-400 bg-yellow-900/30",
  alto: "text-red-400 bg-red-900/30",
};

export default function ScriptPage() {
  const [form, setForm] = useState({
    title: "",
    topic: "",
    targetAudience: "",
    tone: "educativo-entretenimento",
    duration: "10-15",
    viralFormula: "",
    mainHook: "",
    keyPoints: "",
  });
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const generate = async () => {
    if (!form.topic) return;
    setLoading(true);
    setError("");
    setScript(null);
    try {
      const res = await fetch("/api/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          keyPoints: form.keyPoints.split("\n").filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScript(data.script);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar roteiro");
    } finally {
      setLoading(false);
    }
  };

  const fullScriptText = script
    ? `TÍTULO: ${script.videoTitle}\nDURATION: ${script.totalDuration}\n\n[GANCHO]\n${script.hook}\n\n${script.sections
        .map(
          (s) =>
            `[${s.timeCode}] ${s.title.toUpperCase()}\n${s.content}\n\nB-Roll: ${s.bRoll}\nMúsica: ${s.music}`
        )
        .join("\n\n")}\n\n[CALL TO ACTION]\n${script.callToAction}`
    : "";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">📝 Gerador de Roteiro</h1>
        <p className="text-gray-400">Crie roteiros completos estruturados para maximizar retenção e engajamento</p>
      </div>

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Título do vídeo (ou deixe a IA criar)</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Como Economizar R$1000 em 30 Dias (mesmo ganhando pouco)"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Tópico / Assunto principal *</label>
            <input
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="Ex: como economizar dinheiro com salário mínimo"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Público-alvo</label>
            <input
              value={form.targetAudience}
              onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
              placeholder="Ex: trabalhadores CLT com dívidas"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Tom do roteiro</label>
            <select
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            >
              <option value="educativo-entretenimento">Educativo + Entretenimento</option>
              <option value="storytelling">Storytelling / Narrativa</option>
              <option value="listas">Lista / Top N</option>
              <option value="tutorial">Tutorial / Passo a passo</option>
              <option value="debate">Debate / Controverso</option>
              <option value="motivacional">Motivacional / Inspirador</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Duração estimada (minutos)</label>
            <select
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            >
              <option value="5-7">5-7 minutos (Short-form)</option>
              <option value="10-15">10-15 minutos (Ideal)</option>
              <option value="15-20">15-20 minutos (Long-form)</option>
              <option value="20-30">20-30 minutos (Deep dive)</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Gancho principal (opcional)</label>
            <input
              value={form.mainHook}
              onChange={(e) => setForm({ ...form, mainHook: e.target.value })}
              placeholder="Ex: A maioria das pessoas comete esse erro..."
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Fórmula viral de referência (opcional)</label>
            <input
              value={form.viralFormula}
              onChange={(e) => setForm({ ...form, viralFormula: e.target.value })}
              placeholder="Cole a fórmula do Analisador aqui..."
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs mb-1 block">Pontos principais a cobrir (um por linha)</label>
            <textarea
              value={form.keyPoints}
              onChange={(e) => setForm({ ...form, keyPoints: e.target.value })}
              placeholder={"Ponto 1: por que as pessoas falham em economizar\nPonto 2: o método dos 3 envelopes\nPonto 3: apps gratuitos para controle"}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-sm resize-none"
            />
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading || !form.topic}
          className="mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          📝 Gerar Roteiro Completo
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      {loading && <LoadingSpinner message="IA criando roteiro estruturado..." />}

      {/* Script Result */}
      {script && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-bold text-xl">{script.videoTitle}</h2>
                <div className="flex gap-4 mt-2">
                  <span className="text-gray-500 text-sm">⏱️ {script.totalDuration}</span>
                  <span className="text-gray-500 text-sm">🎵 {script.musicMood}</span>
                </div>
              </div>
              <CopyButton text={fullScriptText} label="Exportar roteiro" />
            </div>

            {/* Hook */}
            <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 mb-4">
              <p className="text-red-400 text-xs font-bold mb-1">🎣 GANCHO (primeiros 30 segundos)</p>
              <p className="text-white text-sm leading-relaxed">{script.hook}</p>
            </div>

            {/* Retention strategy */}
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-yellow-400 text-xs font-bold mb-1">🔄 Estratégia de retenção</p>
              <p className="text-gray-300 text-xs">{script.retentionStrategy}</p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-2">
            {script.sections.map((section, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-sm font-mono">{section.timeCode}</span>
                    <span className="text-white font-medium text-sm">{section.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ENERGY_COLORS[section.energyLevel]}`}>
                      {section.energyLevel}
                    </span>
                  </div>
                  <span className="text-gray-600">{expandedSection === i ? "▲" : "▼"}</span>
                </button>

                {expandedSection === i && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-4">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Conteúdo</p>
                      <p className="text-white text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-blue-400 text-xs font-bold mb-1">🎬 B-Roll</p>
                        <p className="text-gray-300 text-xs">{section.bRoll}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-purple-400 text-xs font-bold mb-1">🎵 Música</p>
                        <p className="text-gray-300 text-xs">{section.music}</p>
                      </div>
                    </div>
                    <div className="bg-yellow-900/20 border border-yellow-700/20 rounded-lg p-3">
                      <p className="text-yellow-400 text-xs font-bold mb-1">💡 Dica de retenção</p>
                      <p className="text-gray-300 text-xs">{section.retentionTip}</p>
                    </div>
                    <div className="flex justify-end">
                      <CopyButton text={section.content} label="Copiar seção" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-green-400 text-sm font-bold mb-2">📣 Call to Action Final</p>
            <p className="text-white text-sm leading-relaxed">{script.callToAction}</p>
          </div>
        </div>
      )}
    </div>
  );
}
