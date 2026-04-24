import Image from "next/image";
import { YouTubeVideo, formatNumber } from "@/lib/youtube";

interface VideoCardProps {
  video: YouTubeVideo;
  onAnalyze?: (video: YouTubeVideo) => void;
  onSelect?: (video: YouTubeVideo) => void;
  selected?: boolean;
}

export default function VideoCard({ video, onAnalyze, onSelect, selected }: VideoCardProps) {
  return (
    <div
      className={`bg-gray-900 rounded-xl overflow-hidden border transition-all ${
        selected ? "border-red-500 ring-2 ring-red-500/30" : "border-gray-800 hover:border-gray-700"
      }`}
    >
      <div className="relative aspect-video">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <span className="text-4xl">▶️</span>
          </div>
        )}
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
        <div className="absolute top-1 left-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
          {formatNumber(video.viewCount)} views
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">{video.title}</h3>
        <p className="text-gray-500 text-xs mb-2">{video.channelTitle}</p>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span>👍 {formatNumber(video.likeCount)}</span>
          <span>💬 {formatNumber(video.commentCount)}</span>
          <span>{new Date(video.publishedAt).toLocaleDateString("pt-BR")}</span>
        </div>

        <div className="flex gap-2">
          {onAnalyze && (
            <button
              onClick={() => onAnalyze(video)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-2 rounded transition-colors"
            >
              🔬 Analisar
            </button>
          )}
          {onSelect && (
            <button
              onClick={() => onSelect(video)}
              className={`flex-1 text-xs font-medium py-1.5 px-2 rounded transition-colors ${
                selected
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300"
              }`}
            >
              {selected ? "✓ Selecionado" : "Selecionar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
