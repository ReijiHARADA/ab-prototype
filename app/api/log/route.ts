import { NextResponse } from "next/server";

/**
 * ブラウザ → 同一オリジン → この Route → Google Apps Script（LOG_ENDPOINT）
 * GAS の URL をクライアントに出さずに済み、CORS も不要。
 */
export async function POST(request: Request) {
  const gasUrl = process.env.LOG_ENDPOINT;
  if (!gasUrl?.trim()) {
    return NextResponse.json(
      { ok: false, error: "LOG_ENDPOINT is not set" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  try {
    const res = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // GAS はプレーンテキストのこともある
    }
    return NextResponse.json(
      { ok: res.ok, upstream: parsed },
      { status: res.ok ? 200 : 502 }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "proxy fetch failed" }, { status: 502 });
  }
}
