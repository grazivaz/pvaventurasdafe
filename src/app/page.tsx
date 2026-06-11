import Link from "next/link";

const features = [
  {
    href: "/remodel",
    icon: "🎬",
    title: "Remodelador de Vídeos",
    description:
      "Cole o link de um vídeo e receba tudo: veredito de remodelagem, roteiro 9+ min, Short, SEO, thumbnail e estrutura de cenas com prompts.",
    color: "from-red-600 to-rose-600",
  },
  {
    href: "/trending",
    icon: "🔥",
    title: "Pesquisa Viral",
    description: "Pesquise vídeos em alta no YouTube por nicho e identifique as tendências do momento.",
    color: "from-orange-600 to-red-600",
  },
  {
    href: "/analyzer",
    icon: "🔬",
    title: "Analisador de Fórmulas",
    description: "Cole um vídeo viral e a IA decifra sua fórmula de sucesso para você replicar em outro tema.",
    color: "from-purple-600 to-pink-600",
  },
  {
    href: "/generator",
    icon: "⚡",
    title: "Gerador de Conteúdo",
    description: "Gere títulos virais, descrições SEO, tags, prompts de thumbnail e estratégia de SEO.",
    color: "from-yellow-600 to-orange-600",
  },
  {
    href: "/script",
    icon: "📝",
    title: "Roteiro Completo",
    description: "Crie roteiros completos estruturados para maximizar retenção e engajamento do vídeo.",
    color: "from-green-600 to-teal-600",
  },
  {
    href: "/strategy",
    icon: "🎯",
    title: "Estratégia de Canal",
    description: "Monte uma estratégia completa de canal dark com plano de crescimento e monetização.",
    color: "from-blue-600 to-cyan-600",
  },
];

const steps = [
  { num: "1", title: "Pesquise", desc: "Encontre vídeos virais no seu nicho" },
  { num: "2", title: "Analise", desc: "Decifre a fórmula que fez viralizar" },
  { num: "3", title: "Adapte", desc: "Gere conteúdo novo com a mesma fórmula" },
  { num: "4", title: "Publique", desc: "Use o roteiro e SEO otimizado" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600/30 text-red-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Powered by Claude AI (Opus 4.8)
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Crie Vídeos{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              Virais
            </span>{" "}
            no YouTube
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Pesquise tendências, analise fórmulas virais e gere todo o conteúdo do seu canal dark —
            títulos, roteiros, SEO, thumbnails e estratégia completa.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/remodel"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              🎬 Remodelar um Vídeo
            </Link>
            <Link
              href="/trending"
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              🔥 Começar Pesquisa
            </Link>
            <Link
              href="/strategy"
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              🎯 Ver Estratégia
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-gray-950 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                  {step.num}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{step.title}</p>
                  <p className="text-gray-500 text-xs">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <span className="text-gray-700 text-lg hidden md:block ml-3">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            Tudo que você precisa para um canal de sucesso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group bg-gray-950 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-all hover:-translate-y-0.5"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                <div className="mt-4 text-red-500 text-sm font-medium flex items-center gap-1 transition-all">
                  Acessar →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Setup notice */}
      <section className="py-8 px-4 bg-gray-950 border-t border-gray-800">
        <div className="max-w-2xl mx-auto bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4">
          <h3 className="text-yellow-400 font-bold mb-2">⚙️ Configuração necessária</h3>
          <p className="text-gray-400 text-sm mb-3">
            Para usar o ViralLab, configure as variáveis de ambiente no arquivo{" "}
            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-yellow-300">.env.local</code>:
          </p>
          <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-green-400 space-y-1">
            <p>ANTHROPIC_API_KEY=sk-ant-...</p>
            <p>YOUTUBE_API_KEY=AIza...</p>
          </div>
        </div>
      </section>
    </main>
  );
}
