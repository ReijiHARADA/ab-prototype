import type { Language, ParticipantSessionLog, PatternLog } from "@/types/experiment";

import { CANONICAL_CONDITION_ORDER } from "@/lib/experiment";
import { INTERACTION_COUNT_KEYS } from "@/lib/productInteractions";
import {
  getParticipantSessionCsvHeaders,
  PARTICIPANT_SESSION_COLUMN_KEYS,
  ROUND_FIELD_KEYS,
} from "@/lib/participantSessionHeaders";

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function patternLogsToCsv(logs: PatternLog[]): string {
  const headers = [
    "sessionId",
    "language",
    "sequencePattern",
    "conditionIndex",
    "conditionId",
    "socialProofText",
    "action",
    "actionDetail",
    "durationSec",
    "selectedSize",
    "quantity",
    "startedAt",
    "endedAt",
    ...INTERACTION_COUNT_KEYS,
  ];
  const lines = [headers.join(",")];
  for (const log of logs) {
    const ic = log.interactionCounts;
    const row = [
      log.sessionId,
      log.language,
      String(log.sequencePattern),
      String(log.conditionIndex),
      log.conditionId,
      log.socialProofText,
      log.action,
      log.actionDetail ?? "",
      String(log.durationSec),
      log.selectedSize,
      String(log.quantity),
      log.startedAt,
      log.endedAt,
      ...INTERACTION_COUNT_KEYS.map((k) => String(ic[k])),
    ].map((cell) => escapeCsvCell(String(cell)));
    lines.push(row.join(","));
  }
  return lines.join("\n");
}

/** 列の内部キー（英語・順序のみ）。表示用は {@link getParticipantSessionCsvHeaders}。 */
export const PARTICIPANT_SESSION_CSV_HEADERS: string[] =
  PARTICIPANT_SESSION_COLUMN_KEYS;

export { getParticipantSessionCsvHeaders, PARTICIPANT_SESSION_COLUMN_KEYS };

/** 1参加者1行（3条件分を横に展開）。Excel 取り込み用。1行目は `headerLanguage`（未指定時は先頭の `logs[].language`）。 */
export function participantSessionsToCsv(
  logs: ParticipantSessionLog[],
  headerLanguage?: Language
): string {
  const lang =
    headerLanguage ??
    (logs[0]?.language === "ko" ? "ko" : "ja");
  const headers = getParticipantSessionCsvHeaders(lang);
  const lines = [headers.map((h) => escapeCsvCell(h)).join(",")];
  for (const p of logs) {
    const row: string[] = [
      p.sessionId,
      p.language,
      p.sheetTab,
      String(p.sequencePattern),
      p.experimentStartedAt ?? "",
      p.designTagsJoined,
      String(p.height),
      String(p.weight),
      String(p.bmi),
      p.bodyType,
    ];
    for (const conditionId of CANONICAL_CONDITION_ORDER) {
      const round = p.rounds.find((r) => r.conditionId === conditionId);
      if (!round) {
        for (let i = 0; i < ROUND_FIELD_KEYS.length; i++) row.push("");
        for (let i = 0; i < INTERACTION_COUNT_KEYS.length; i++) row.push("");
        continue;
      }
      row.push(
        round.conditionId,
        round.socialProofText,
        round.action,
        String(round.durationSec),
        round.selectedSize,
        String(round.quantity),
        round.startedAt,
        round.endedAt
      );
      const ic = round.interactionCounts;
      for (const k of INTERACTION_COUNT_KEYS) {
        row.push(String(ic[k]));
      }
    }
    lines.push(row.map((cell) => escapeCsvCell(String(cell))).join(","));
  }
  return lines.join("\n");
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
