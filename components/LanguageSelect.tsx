"use client";

import { Button } from "@/components/ui/button";
import { useExperiment } from "@/context/experiment-context";
import { getMessages } from "@/lib/i18n";
import type { Language } from "@/types/experiment";

export function LanguageSelect() {
  const { setLanguage } = useExperiment();
  const jaM = getMessages("ja");
  const koM = getMessages("ko");

  const pick = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="flex min-h-[60vh] flex-col justify-center gap-10 px-6 py-12">
      <h1 className="text-center text-lg font-medium tracking-wide">
        {jaM.languageTitle}
      </h1>
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full rounded-md text-base"
          variant="default"
          onClick={() => pick("ja")}
        >
          {jaM.languageJa}
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-12 w-full rounded-md text-base"
          variant="default"
          onClick={() => pick("ko")}
        >
          {koM.languageKo}
        </Button>
      </div>
    </div>
  );
}
