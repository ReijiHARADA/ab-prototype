"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useExperiment } from "@/context/experiment-context";
import { downloadCsv, patternLogsToCsv } from "@/lib/csv";
import { getLocalLogs, getLocalPatternLogs } from "@/lib/logger";
import { getMessages } from "@/lib/i18n";

export function ResultDashboard() {
  const { language, sessionId, sessionPatternLogs, resetExperiment } =
    useExperiment();
  const lang = language ?? "ja";
  const m = getMessages(lang);
  const [showStorage, setShowStorage] = useState(true);

  const { patternLogs: storedPatterns, eventLogs: storedEvents } =
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

  const summary = useMemo(() => {
    const dwell = rows.map(
      (p) => `${p.conditionId}: ${p.durationSec}s`
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
    const csv = patternLogsToCsv(rows);
    downloadCsv(`experiment-${Date.now()}.csv`, csv);
  };

  const mark = (ok: boolean) => (ok ? "○" : "—");

  return (
    <div className="flex flex-col gap-8 px-4 py-6 pb-8 text-sm [padding-bottom:max(2rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-3">
        <h1 className="text-lg font-medium">{m.resultTitle}</h1>
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
                {m.resultColumns.dwellSec}
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
                  {log.durationSec}
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
