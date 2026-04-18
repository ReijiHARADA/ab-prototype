"use client";

import type { EventLog, PatternLog } from "@/types/experiment";

const PATTERN_KEY = "ab-pattern-logs-v1";
const EVENT_KEY = "ab-event-logs-v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveLocalPatternLog(log: PatternLog): void {
  if (!isBrowser()) return;
  const prev = getLocalPatternLogs();
  prev.push(log);
  window.localStorage.setItem(PATTERN_KEY, JSON.stringify(prev));
}

export function saveLocalEventLog(log: EventLog): void {
  if (!isBrowser()) return;
  const prev = getLocalEventLogs();
  prev.push(log);
  window.localStorage.setItem(EVENT_KEY, JSON.stringify(prev));
}

export function getLocalPatternLogs(): PatternLog[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(PATTERN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PatternLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLocalEventLogs(): EventLog[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(EVENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EventLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLocalLogs(): {
  patternLogs: PatternLog[];
  eventLogs: EventLog[];
} {
  return {
    patternLogs: getLocalPatternLogs(),
    eventLogs: getLocalEventLogs(),
  };
}

/**
 * 送信先:
 * - NEXT_PUBLIC_LOG_ENDPOINT があればその URL（GAS 直 POST・CORS 要確認）
 * - なければ同一オリジンの /api/log → サーバの LOG_ENDPOINT（GAS）へプロキシ（推奨）
 */
function getEndpoint(): string | undefined {
  if (!isBrowser()) return undefined;
  const direct = process.env.NEXT_PUBLIC_LOG_ENDPOINT?.trim();
  if (direct) return direct;
  return "/api/log";
}

async function postPayload(body: unknown): Promise<boolean> {
  const endpoint = getEndpoint();
  /** ビルド時に未設定でも /api/log は常に存在 */
  if (!endpoint) return false;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      mode: "cors",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** PatternLog をサーバーへ送る。失敗時は localStorage に保存。 */
export async function logPatternResult(log: PatternLog): Promise<void> {
  const ok = await postPayload({ type: "pattern", ...log });
  if (!ok) {
    saveLocalPatternLog(log);
  }
}

/** 補助イベントを記録。 */
export async function logEvent(event: EventLog): Promise<void> {
  const ok = await postPayload({ type: "event", ...event });
  if (!ok) {
    saveLocalEventLog(event);
  }
}

/** 後方互換・仕様名 */
export function saveLocalLog(
  log: PatternLog | EventLog
): void {
  if ("conditionIndex" in log) {
    saveLocalPatternLog(log);
  } else {
    saveLocalEventLog(log);
  }
}
