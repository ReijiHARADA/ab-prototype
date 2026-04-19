"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { useExperiment } from "@/context/experiment-context";
import { getLocalPatternLogs } from "@/lib/logger";
import { getMessages } from "@/lib/i18n";

export function ResultDashboard() {
  const {
    language,
    sessionId,
    sessionPatternLogs,
    resetExperiment,
    participantSessionSaveResult,
  } = useExperiment();
  const lang = language ?? "ja";
  const m = getMessages(lang);

  const fromStorage = useMemo(
    () => getLocalPatternLogs().filter((p) => p.sessionId === sessionId),
    [sessionId]
  );

  const rows = useMemo(
    () =>
      sessionPatternLogs.length > 0 ? sessionPatternLogs : fromStorage,
    [sessionPatternLogs, fromStorage]
  );

  const mark = (ok: boolean) => (ok ? "○" : "—");

  return (
    <div className="flex flex-col gap-8 px-4 py-6 pb-8 text-sm [padding-bottom:max(2rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-3">
        <h1 className="text-lg font-medium">{m.resultTitle}</h1>
        {participantSessionSaveResult != null && (
          <div
            role="status"
            className={
              participantSessionSaveResult.ok
                ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900"
                : "rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-900"
            }
          >
            <p>
              {participantSessionSaveResult.ok
                ? m.resultSpreadsheetOk
                : m.resultSpreadsheetNg}
            </p>
            {!participantSessionSaveResult.ok &&
              participantSessionSaveResult.message && (
                <p className="mt-1.5 text-xs text-red-800/80">
                  ({participantSessionSaveResult.message})
                </p>
              )}
          </div>
        )}
      </div>

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

      <Button
        type="button"
        className="h-11 min-h-11 rounded-md bg-neutral-900 text-white hover:bg-neutral-800"
        onClick={() => resetExperiment()}
      >
        {lang === "ja" ? "最初から" : "처음부터"}
      </Button>
    </div>
  );
}
