import { NextResponse } from "next/server";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const token =
    process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? "";

  if (!query) {
    return NextResponse.json({ count: 0, result: [] });
  }

  if (!token) {
    return NextResponse.json(
      { error: "FINNHUB API key is not configured." },
      { status: 500 }
    );
  }

  const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(query)}&token=${token}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `Search failed: ${text}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
