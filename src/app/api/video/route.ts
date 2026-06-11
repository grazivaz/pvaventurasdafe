import { NextRequest, NextResponse } from "next/server";
import { extractVideoId, getVideoById, getTranscript } from "@/lib/youtube";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json({ error: "Cole o link do vídeo do YouTube" }, { status: 400 });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return NextResponse.json(
      { error: "Link inválido. Use um link de vídeo do YouTube (watch, youtu.be ou shorts)" },
      { status: 400 }
    );
  }

  try {
    const [video, transcript] = await Promise.all([
      getVideoById(videoId),
      getTranscript(videoId),
    ]);

    if (!video) {
      return NextResponse.json(
        { error: "Vídeo não encontrado. Verifique se o link está correto e o vídeo é público" },
        { status: 404 }
      );
    }

    return NextResponse.json({ video, transcript });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao buscar o vídeo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
