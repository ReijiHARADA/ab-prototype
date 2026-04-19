"use client";

import { useExperiment } from "@/context/experiment-context";
import { SEQUENCE_PATTERN_ABC_LABEL } from "@/lib/experiment";
import { getMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { SequencePatternId } from "@/types/experiment";

const PATTERN_IDS = [1, 2, 3, 4, 5, 6] as const satisfies readonly SequencePatternId[];

export function PatternSelectScreen() {
  const { language, submitSequencePattern } = useExperiment();
  const lang = language ?? "ja";
  const m = getMessages(lang);

  return (
    <div className="flex min-h-dvh flex-col px-5 pb-4 pt-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          {m.patternSelectTitle}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          {m.patternSelectIntro}
        </p>
      </header>

      <div className="mb-6 space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs leading-relaxed text-neutral-700">
        <p>{m.patternLegendA}</p>
        <p>{m.patternLegendB}</p>
        <p>{m.patternLegendC}</p>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {PATTERN_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => submitSequencePattern(id)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-left transition-colors",
              "hover:border-neutral-400 hover:bg-neutral-50 active:bg-neutral-100"
            )}
          >
            <span className="text-sm font-medium text-neutral-900">
              {m.patternN(id)}
            </span>
            <span className="font-mono text-xs tabular-nums text-neutral-600">
              {SEQUENCE_PATTERN_ABC_LABEL[id]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
