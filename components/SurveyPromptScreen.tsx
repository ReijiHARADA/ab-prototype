"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useExperiment } from "@/context/experiment-context";
import { getMessages } from "@/lib/i18n";

const SURVEY_CONFIRMED_ID = "survey-prompt-confirmed";

export function SurveyPromptScreen() {
  const { language, advanceFromSurveyPrompt } = useExperiment();
  const m = getMessages(language ?? "ja");
  const [confirmed, setConfirmed] = useState(false);

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
      <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50/80 px-4 py-3">
        <Checkbox
          id={SURVEY_CONFIRMED_ID}
          checked={confirmed}
          onCheckedChange={(checked) => setConfirmed(checked === true)}
          className="mt-0.5"
        />
        <Label
          htmlFor={SURVEY_CONFIRMED_ID}
          className="cursor-pointer text-left text-sm font-normal leading-snug text-neutral-800"
        >
          {m.surveyPromptCheckboxLabel}
        </Label>
      </div>
      <Button
        type="button"
        className="h-12 w-full rounded-md text-base"
        disabled={!confirmed}
        onClick={() => advanceFromSurveyPrompt()}
      >
        {m.surveyPromptCta}
      </Button>
    </div>
  );
}
