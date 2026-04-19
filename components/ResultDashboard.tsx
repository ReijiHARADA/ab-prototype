"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useExperiment } from "@/context/experiment-context";
import { downloadCsv, participantSessionsToCsv } from "@/lib/csv";
import { groupPatternLogsToParticipantSessions } from "@/lib/participantLog";
import { getLocalLogs, getLocalParticipantLogs, getLocalPatternLogs } from "@/lib/logger";
import { getMessages } from "@/lib/i18n";

export function ResultDashboard() {
  const { language, sessionId, sessionPatternLogs, resetExperiment } =
    useExperiment();
  const lang = language ?? "ja";
  const m = getMessages(lang);
  const [showStorage, setShowStorage] = useState(true);

  const { patternLogs: storedPatterns, eventLogs: storedEvents, participantLogs: storedParticipants } =
    getLocalLogs();

  const fromStorage = useMemo(
    () => getLocalPatternLogs().filter((p) => p.sessionId === sessionId),
    [sessionId]
  );

  const rows = useMemo(
    () =>
      sessionPatternLogs.length > 0 ? sessionPatternLogs : fromStorage,
    [sessionPatternLogs, fromStorage]
  );

  /** 1人1行の CSV 用（メモリの PatternLog またはローカル退避） */
  const participantRowsForCsv = useMemo(() => {
    const fromPatterns = groupPatternLogsToParticipantSessions(
      sessionPatternLogs.length > 0 ? sessionPatternLogs : fromStorage
    );
    const fromLocal = getLocalParticipantLogs().filter(
      (p) => p.sessionId === sessionId
    );
    const merged = [...fromPatterns];
    for (const p of fromLocal) {
      if (!merged.some((x) => x.sessionId === p.sessionId)) merged.push(p);
    }
    if (merged.length > 0) return merged;
    const single = groupPatternLogsToParticipantSessions(
      getLocalPatternLogs().filter((p) => p.sessionId === sessionId)
    );
    return single;
  }, [sessionPatternLogs, fromStorage, sessionId]);

  const summary = useMemo(() => {
    const dwell = rows.map(
      (p) => `${p.conditionId}: ${p.durationMs}ms`
    );
    const carts = rows
      .filter((p) => p.action === "add_to_cart")
      .map((p) => p.conditionId);
    const backs = rows
      .filter((p) => p.action === "back")
      .map((p) => p.conditionId);
    const timeouts = rows
      .filter((p) => p.action === "timeout")
      .map((p) => p.conditionId);
    return { dwell, carts, backs, timeouts };
  }, [rows]);

  const onCsv = () => {
    const csv = participantSessionsToCsv(participantRowsForCsv, lang);
    downloadCsv(
      `experiment-${sessionId.slice(0, 8)}-${Date.now()}.csv`,
      csv
    );
  };

  const mark = (ok: boolean) => (ok ? "○" : "—");

  return (
    <div className="flex flex-col gap-8 px-4 py-6 pb-8 text-sm [padding-bottom:max(2rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-3">
        <h1 className="text-lg font-medium">{m.resultTitle}</h1>
        <p className="text-xs text-neutral-600">
          {lang === "ja"
            ? "CSV は1行目が英語キー、2行目が見出し（この画面の言語）、3行目以降がデータです。A列は通し番号。条件列は「なし→デザイン→体型」固定順。記録シートは言語（ja→jp / ko→ko）に合わせます。"
            : "CSV는 1행 영어 키, 2행 헤더(UI 언어), 3행부터 데이터. A열 연번. 조건 열 순서 고정. 기록 시트는 언어(ja→jp, ko→ko)에 맞춥니다."}
        </p>
        <Button
          type="button"
          className="h-11 min-h-11 w-full max-w-xs rounded-md"
          onClick={onCsv}
        >
          {m.resultDownloadCsv}
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="font-medium">{m.resultSummaryTitle}</h2>
        <div className="space-y-2 rounded border border-neutral-200 bg-neutral-50 p-3 text-xs leading-relaxed">
          <p>
            <span className="font-medium">{m.summaryDwell}:</span>{" "}
            {summary.dwell.join(", ")}
          </p>
          <p>
            <span className="font-medium">{m.summaryCart}:</span>{" "}
            {summary.carts.length > 0 ? summary.carts.join(", ") : "—"}
          </p>
          <p>
            <span className="font-medium">{m.summaryBack}:</span>{" "}
            {summary.backs.length > 0 ? summary.backs.join(", ") : "—"}
          </p>
          <p>
            <span className="font-medium">{m.summaryTimeout}:</span>{" "}
            {summary.timeouts.length > 0 ? summary.timeouts.join(", ") : "—"}
          </p>
        </div>
      </section>

      <section className="space-y-2 overflow-x-auto">
        <h2 className="font-medium">Session</h2>
        <table className="w-full min-w-[720px] border-collapse border border-neutral-200 text-xs">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-200 px-2 py-2">#</th>
              <th className="border border-neutral-200 px-2 py-2">
                {m.resultColumns.conditionId}
              </th>
              <th className="border border-neutral-200 px-2 py-2">
                {m.resultColumns.text}
              </th>
              <th className="border border-neutral-200 px-2 py-2">
                {m.resultColumns.action}
              </th>
              <th className="border border-neutral-200 px-2 py-2">
                {m.resultColumns.dwellMs}
              </th>
              <th className="border border-neutral-200 px-2 py-2">
                {m.resultColumns.cart}
              </th>
              <th className="border border-neutral-200 px-2 py-2">
                {m.resultColumns.back}
              </th>
              <th className="border border-neutral-200 px-2 py-2">
                {m.resultColumns.timeout}
              </th>
              <th className="border border-neutral-200 px-2 py-2">
                {m.resultColumns.started}
              </th>
              <th className="border border-neutral-200 px-2 py-2">
                {m.resultColumns.ended}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((log, i) => (
              <tr key={`${log.sessionId}-${log.conditionIndex}-${i}`}>
                <td className="border border-neutral-200 px-2 py-2 text-center">
                  {log.conditionIndex + 1}
                </td>
                <td className="border border-neutral-200 px-2 py-2">
                  {log.conditionId}
                </td>
                <td className="max-w-[240px] border border-neutral-200 px-2 py-2">
                  {log.socialProofText || "(none)"}
                </td>
                <td className="border border-neutral-200 px-2 py-2">
                  {log.action}
                  {log.actionDetail ? ` / ${log.actionDetail}` : ""}
                </td>
                <td className="border border-neutral-200 px-2 py-2 text-right tabular-nums">
                  {log.durationMs}
                </td>
                <td className="border border-neutral-200 px-2 py-2 text-center">
                  {mark(log.action === "add_to_cart")}
                </td>
                <td className="border border-neutral-200 px-2 py-2 text-center">
                  {mark(log.action === "back")}
                </td>
                <td className="border border-neutral-200 px-2 py-2 text-center">
                  {mark(log.action === "timeout")}
                </td>
                <td className="max-w-[140px] whitespace-pre-wrap border border-neutral-200 px-2 py-2 text-[10px] text-neutral-600">
                  {log.startedAt}
                </td>
                <td className="max-w-[140px] whitespace-pre-wrap border border-neutral-200 px-2 py-2 text-[10px] text-neutral-600">
                  {log.endedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-2">
        <button
          type="button"
          className="min-h-11 py-2 text-left text-sm touch-manipulation underline underline-offset-4"
          onClick={() => setShowStorage((s) => !s)}
        >
          {m.resultLocalTitle} ({showStorage ? "▼" : "▶"})
        </button>
        {showStorage && (
          <div className="space-y-4 rounded border border-dashed border-neutral-300 p-3 text-xs">
            <p className="font-medium">
              Participant (1行) ({storedParticipants.length})
            </p>
            <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all rounded bg-neutral-100 p-2">
              {JSON.stringify(
                storedParticipants.filter((p) => p.sessionId === sessionId),
                null,
                2
              )}
            </pre>
            <p className="font-medium">Pattern logs ({storedPatterns.length})</p>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded bg-neutral-100 p-2">
              {JSON.stringify(storedPatterns, null, 2)}
            </pre>
            <p className="font-medium">Event logs ({storedEvents.length})</p>
            <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all rounded bg-neutral-100 p-2">
              {JSON.stringify(storedEvents, null, 2)}
            </pre>
          </div>
        )}
      </section>

      <Button
        type="button"
        variant="outline"
        className="h-11 min-h-11 rounded-md"
        onClick={() => resetExperiment()}
      >
        {lang === "ja" ? "最初から" : "처음부터"}
      </Button>
    </div>
  );
}
