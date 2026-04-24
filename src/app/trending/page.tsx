"use client";

import { useState } from "react";
import VideoCard from "@/components/VideoCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { YouTubeVideo } from "@/lib/youtube";

const CATEGORIES = [
  { id: "", label: "Todos" },
  { id: "22", label: "🎬 Entretenimento" },
  { id: "10", label: "🎵 Música" },
  { id: "24", label: "😂 Comédia" },
  { id: "28", label: "🔧 Tecnologia" },
  { id: "27", label: "📚 Educação" },
  { id: "17", label: "⚽ Esportes" },
  { id: "25", label: "📰 Notícias" },
  { id: "26", label: "🍕 Comida" },
  { id: "19", label: "✈️ Viagens" },
];

export default function TrendingPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setVideos([]);
    try {
      const params = new URLSearchParams({ q: query });
      if (category) params.set("category", category);
      const res = await fetch(`/api/trending?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na busca");
      setVideos(data.videos || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const goToAnalyzer = (video: YouTubeVideo) => {
    const params = new URLSearchParams({
      title: video.title,
      channel: video.channelTitle,
      views: video.viewCount,
      likes: video.likeCount,
      comments: video.commentCount,
      duration: video.duration,
      description: video.description.slice(0, 500),
      tags: video.tags.slice(0, 15).join(","),
    });
    window.location.href = `/analyzer?${params}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">🔥 Pesquisa Viral</h1>
        <p className="text-gray-400">Encontre vídeos em alta no YouTube e descubra o que está viralizando</p>
      </div>

      {/* Search form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Ex: como ganhar dinheiro, receitas fit, vida saudável..."
            className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors md:w-48"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <button
            onClick={search}
            disabled={loading || !query.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            🔍 Buscar
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-3">
          Dica: Use termos específicos do nicho que você quer explorar. Resultados ordenados por visualizações.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
          {error.includes("YOUTUBE_API_KEY") && (
            <p className="text-gray-500 text-xs mt-1">Configure YOUTUBE_API_KEY no .env.local</p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSpinner message="Buscando vídeos em alta no YouTube..." />}

      {/* Results */}
      {videos.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">{videos.length} vídeos encontrados</p>
            <p className="text-gray-600 text-xs">Clique em &quot;Analisar&quot; para decifrar a fórmula viral</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onAnalyze={goToAnalyzer}
                onSelect={(v) => setSelectedVideo(selectedVideo?.id === v.id ? null : v)}
                selected={selectedVideo?.id === video.id}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && !error && videos.length === 0 && (
        <div className="text-center py-20 text-gray-600">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg">Digite um tópico para pesquisar vídeos virais</p>
          <p className="text-sm mt-2">Ex: &quot;como ganhar dinheiro online&quot;, &quot;receitas fitness&quot;, &quot;marketing digital&quot;</p>
        </div>
      )}
    </div>
  );
}
