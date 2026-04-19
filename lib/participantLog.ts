import type {
  Language,
  ParticipantSessionLog,
  PatternLog,
  SpreadsheetSheetTab,
} from "@/types/experiment";

/** 初回の言語選択に対応するスプレッドシートのタブ名（`jp` / `ko`） */
export function languageToSheetTab(lang: Language): SpreadsheetSheetTab {
  return lang === "ko" ? "ko" : "jp";
}

const EXPECTED_ROUNDS = 3;

/** 旧ログ（`userInfo.designTags` 配列）と新ログ（単一 `designTag`）の両方に対応 */
function designPreferenceJoined(
  u: PatternLog["userInfo"] | { designTags?: string[] }
): string {
  if ("designTag" in u && typeof u.designTag === "string") return u.designTag;
  const tags = (u as { designTags?: string[] }).designTags;
  return Array.isArray(tags) ? tags.join("、") : "";
}

/**
 * 同一セッションの PatternLog（条件ごと1件）から、1参加者1行のレコードを組み立てる。
 */
export function buildParticipantSessionLog(
  logs: PatternLog[],
  experimentStartedAt?: string | null
): ParticipantSessionLog | null {
  if (logs.length < EXPECTED_ROUNDS) return null;
  const sorted = [...logs].sort((a, b) => a.conditionIndex - b.conditionIndex);
  const first = sorted[0];
  if (!first) return null;
  const sid = first.sessionId;
  if (sorted.some((l) => l.sessionId !== sid)) return null;
  if (sorted.length !== EXPECTED_ROUNDS) return null;
  for (let i = 0; i < EXPECTED_ROUNDS; i++) {
    if (sorted[i]?.conditionIndex !== i) return null;
  }

  const lang = first.language;
  const u = first.userInfo;
  const rounds = sorted.map((log) => ({
    conditionIndex: log.conditionIndex,
    conditionId: log.conditionId,
    socialProofText: log.socialProofText,
    action: log.action,
    durationMs: log.durationMs,
    selectedSize: log.selectedSize,
    quantity: log.quantity,
    startedAt: log.startedAt,
    endedAt: log.endedAt,
    interactionCounts: log.interactionCounts,
  }));

  return {
    type: "participantSession",
    sessionId: sid,
    language: lang,
    sheetTab: languageToSheetTab(lang),
    sequencePattern: first.sequencePattern,
    experimentStartedAt: experimentStartedAt ?? undefined,
    designTagsJoined: designPreferenceJoined(u),
    height: u.height,
    weight: u.weight,
    bmi: u.bmi,
    bodyType: u.bodyType,
    rounds,
  };
}

/** 保存済み PatternLog 一覧からセッション単位にまとめる（CSV 用） */
export function groupPatternLogsToParticipantSessions(
  logs: PatternLog[]
): ParticipantSessionLog[] {
  const bySession = new Map<string, PatternLog[]>();
  for (const log of logs) {
    const arr = bySession.get(log.sessionId) ?? [];
    arr.push(log);
    bySession.set(log.sessionId, arr);
  }
  const out: ParticipantSessionLog[] = [];
  for (const group of bySession.values()) {
    const row = buildParticipantSessionLog(group);
    if (row) out.push(row);
  }
  return out;
}
