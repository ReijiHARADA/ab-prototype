"use client";

import { Button } from "@/components/ui/button";
import { useExperiment } from "@/context/experiment-context";
import { getMessages } from "@/lib/i18n";

export function BodyTypeResult() {
  const { userInfo, language, goProductFromBodyType } = useExperiment();
  const m = getMessages(language ?? "ja");

  if (!userInfo) return null;

  const label = m.bodyTypeLabels[userInfo.bodyType];

  return (
    <div className="flex min-h-[55vh] flex-col justify-center gap-8 px-6 py-12">
      <div className="space-y-6">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          {m.bodyTypeScreenTitle}
        </p>
        <div className="rounded-2xl border-2 border-neutral-900 bg-neutral-50 px-5 py-7">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-xs font-medium text-neutral-600 sm:text-sm">
              {m.bodyTypeYourTypeLead}
            </p>
            <p className="text-[1.35rem] font-bold leading-snug tracking-tight text-neutral-900 sm:text-2xl">
              {m.bodyTypeYourTypeQuote(label)}
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-neutral-600">
          {m.bodyTypeExplanation}
        </p>
      </div>
      <Button
        type="button"
        className="h-12 w-full rounded-md text-base"
        onClick={() => goProductFromBodyType()}
      >
        {m.viewProduct}
      </Button>
    </div>
  );
}
