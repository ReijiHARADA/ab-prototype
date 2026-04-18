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
      <div className="space-y-4">
        <h1 className="text-lg font-medium">{m.bodyTypeScreenTitle}</h1>
        <p className="text-base leading-relaxed">
          {m.bodyTypeYourType(label)}
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          {m.bodyTypeExplanation}
        </p>
        <p className="text-xs text-neutral-500">
          BMI: {Math.round(userInfo.bmi * 10) / 10}
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
