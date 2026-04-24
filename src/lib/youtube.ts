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

  const videos: YouTubeVideo[] = detailsData.items?.map(
    (item: {
      id: string;
      snippet: {
        title: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails: { high?: { url: string }; medium?: { url: string } };
        description: string;
        tags?: string[];
        categoryId: string;
      };
      statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
      contentDetails: { duration: string };
    }) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      viewCount: item.statistics.viewCount || "0",
      likeCount: item.statistics.likeCount || "0",
      commentCount: item.statistics.commentCount || "0",
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || "",
      description: item.snippet.description,
      tags: item.snippet.tags || [],
      duration: formatDuration(item.contentDetails.duration),
      categoryId: item.snippet.categoryId,
    })
  ) || [];

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
