import { NextRequest, NextResponse } from "next/server";
import { searchTrending } from "@/lib/youtube";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "videos virais";
  const category = searchParams.get("category") || undefined;

  try {
    const result = await searchTrending(query, category, 12);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
