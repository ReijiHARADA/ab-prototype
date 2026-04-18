"use client";

import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useExperiment } from "@/context/experiment-context";
import { getMessages } from "@/lib/i18n";

export function SurveyPromptScreen() {
  const { language, goToSurveyFromPrompt } = useExperiment();
  const m = getMessages(language ?? "ja");

  return (
    <div className="flex min-h-[55vh] flex-col justify-center gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-700"
          aria-hidden
        >
          <ClipboardList className="size-7" />
        </div>
        <h1 className="text-lg font-medium leading-snug">{m.surveyPromptTitle}</h1>
        <p className="max-w-sm text-sm leading-relaxed text-neutral-600">
          {m.surveyPromptBody}
        </p>
      </div>
      <Button
        type="button"
        className="h-12 w-full rounded-md text-base"
        onClick={() => goToSurveyFromPrompt()}
      >
        {m.surveyPromptCta}
      </Button>
    </div>
  );
}
