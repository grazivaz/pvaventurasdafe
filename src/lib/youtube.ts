export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
  tags: string[];
  duration: string;
  categoryId: string;
}

export interface TrendingSearchResult {
  videos: YouTubeVideo[];
  nextPageToken?: string;
}

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export function extractVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/live\/([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface YouTubeApiItem {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { maxres?: { url: string }; high?: { url: string }; medium?: { url: string } };
    description: string;
    tags?: string[];
    categoryId: string;
  };
  statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
  contentDetails: { duration: string };
}

function mapVideoItem(item: YouTubeApiItem): YouTubeVideo {
  return {
    id: item.id,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    viewCount: item.statistics.viewCount || "0",
    likeCount: item.statistics.likeCount || "0",
    commentCount: item.statistics.commentCount || "0",
    publishedAt: item.snippet.publishedAt,
    thumbnail:
      item.snippet.thumbnails?.maxres?.url ||
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.medium?.url ||
      "",
    description: item.snippet.description,
    tags: item.snippet.tags || [],
    duration: formatDuration(item.contentDetails.duration),
    categoryId: item.snippet.categoryId,
  };
}

export async function getVideoById(videoId: string): Promise<YouTubeVideo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("YOUTUBE_API_KEY não configurada");

  const params = new URLSearchParams({
    part: "snippet,statistics,contentDetails",
    id: videoId,
    key: apiKey,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
  if (!res.ok) throw new Error("Erro ao buscar dados do vídeo no YouTube");
  const data = await res.json();
  const item: YouTubeApiItem | undefined = data.items?.[0];
  return item ? mapVideoItem(item) : null;
}

// Busca a transcrição (legendas) do vídeo via página do watch — sem API oficial.
// Retorna null se o vídeo não tiver legendas ou se o YouTube bloquear a requisição.
export async function getTranscript(videoId: string): Promise<string | null> {
  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });
    if (!pageRes.ok) return null;
    const html = await pageRes.text();

    const tracksMatch = html.match(/"captionTracks":(\[.*?\])(?=,\s*")/);
    if (!tracksMatch) return null;

    const tracks: { baseUrl: string; languageCode: string; kind?: string }[] = JSON.parse(
      tracksMatch[1]
    );
    if (!tracks.length) return null;

    // Prefere legenda manual em pt, depois automática em pt, depois qualquer uma
    const track =
      tracks.find((t) => t.languageCode.startsWith("pt") && t.kind !== "asr") ||
      tracks.find((t) => t.languageCode.startsWith("pt")) ||
      tracks.find((t) => t.kind !== "asr") ||
      tracks[0];

    const baseUrl = track.baseUrl.replace(/\\u0026/g, "&");
    const captionRes = await fetch(`${baseUrl}&fmt=json3`);
    if (!captionRes.ok) return null;
    const captionData = await captionRes.json();

    const text = (captionData.events || [])
      .flatMap((e: { segs?: { utf8?: string }[] }) => e.segs || [])
      .map((s: { utf8?: string }) => s.utf8 || "")
      .join("")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) return null;
    // Limita para caber confortavelmente no prompt
    return text.length > 40000 ? text.slice(0, 40000) + " [...transcrição truncada]" : text;
  } catch {
    return null;
  }
}

export async function searchTrending(
  query: string,
  categoryId?: string,
  maxResults = 10
): Promise<TrendingSearchResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("YOUTUBE_API_KEY não configurada");

  const searchParams = new URLSearchParams({
    part: "id,snippet",
    q: query,
    type: "video",
    order: "viewCount",
    maxResults: maxResults.toString(),
    key: apiKey,
    relevanceLanguage: "pt",
    regionCode: "BR",
  });

  if (categoryId) searchParams.set("videoCategoryId", categoryId);

  const searchRes = await fetch(`${YOUTUBE_API_BASE}/search?${searchParams}`);
  if (!searchRes.ok) throw new Error("Erro ao buscar no YouTube");
  const searchData = await searchRes.json();

  const videoIds = searchData.items?.map((item: { id: { videoId: string } }) => item.id.videoId).join(",");
  if (!videoIds) return { videos: [] };

  const detailsParams = new URLSearchParams({
    part: "snippet,statistics,contentDetails",
    id: videoIds,
    key: apiKey,
  });

  const detailsRes = await fetch(`${YOUTUBE_API_BASE}/videos?${detailsParams}`);
  if (!detailsRes.ok) throw new Error("Erro ao buscar detalhes");
  const detailsData = await detailsRes.json();

  const videos: YouTubeVideo[] = detailsData.items?.map(mapVideoItem) || [];

  return { videos, nextPageToken: searchData.nextPageToken };
}

function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatNumber(num: string | number): string {
  const n = typeof num === "string" ? parseInt(num) : num;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
