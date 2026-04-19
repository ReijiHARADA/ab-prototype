"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
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

  const [selectedPattern, setSelectedPattern] =
    useState<SequencePatternId | null>(null);

  const onStart = () => {
    if (selectedPattern == null) return;
    submitSequencePattern(selectedPattern);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col px-5 pb-4 pt-8">
        <div className="mb-5 rounded-2xl border-2 border-red-600 bg-red-50/40 p-4">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-red-600">
            {m.experimenterOnlyBadge}
          </p>
          <header className="mb-4">
            <h1 className="text-xl font-semibold tracking-tight text-red-900">
              {m.patternSelectTitle}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-red-800/80">
              {m.patternSelectIntro}
            </p>
          </header>

          <div className="space-y-2 rounded-xl border border-red-200 bg-white/90 px-4 py-3 text-xs leading-relaxed text-red-950">
            <p>{m.patternLegendA}</p>
            <p>{m.patternLegendB}</p>
            <p>{m.patternLegendC}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {PATTERN_IDS.map((id) => {
            const selected = selectedPattern === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedPattern(id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border-2 px-4 py-3.5 text-left transition-colors",
                  selected
                    ? "border-red-600 bg-red-600 text-white shadow-md"
                    : "border-neutral-200 bg-white text-neutral-900 hover:border-red-300 hover:bg-red-50/50"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    selected ? "text-white" : "text-neutral-900"
                  )}
                >
                  {m.patternN(id)}
                </span>
                <span
                  className={cn(
                    "font-mono text-xs tabular-nums",
                    selected ? "text-white" : "text-neutral-600"
                  )}
                >
                  {SEQUENCE_PATTERN_ABC_LABEL[id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 z-50 border-t border-red-100 bg-white/95 px-5 py-4 backdrop-blur-sm [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
        <Button
          type="button"
          disabled={selectedPattern == null}
          className={cn(
            "h-12 min-h-12 w-full rounded-xl text-base font-semibold text-white shadow-sm",
            "border-0 bg-red-600 hover:bg-red-700 active:bg-red-800",
            "disabled:pointer-events-none disabled:opacity-40"
          )}
          onClick={onStart}
        >
          {m.experimentStartCta}
        </Button>
      </div>
    </div>
  );
}
