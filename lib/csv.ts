import type { PatternLog } from "@/types/experiment";

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
    "conditionIndex",
    "conditionId",
    "socialProofText",
    "action",
    "actionDetail",
    "durationSec",
    "selectedSize",
    "selectedColor",
    "quantity",
    "startedAt",
    "endedAt",
  ];
  const lines = [headers.join(",")];
  for (const log of logs) {
    const row = [
      log.sessionId,
      log.language,
      String(log.conditionIndex),
      log.conditionId,
      log.socialProofText,
      log.action,
      log.actionDetail ?? "",
      String(log.durationSec),
      log.selectedSize,
      log.selectedColor,
      String(log.quantity),
      log.startedAt,
      log.endedAt,
    ].map((cell) => escapeCsvCell(String(cell)));
    lines.push(row.join(","));
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
