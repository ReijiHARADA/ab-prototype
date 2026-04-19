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
    <div className="flex min-h-[60vh] flex-col justify-center px-5 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl border-2 border-red-600 bg-red-50/40 p-6 shadow-sm">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-red-600">
          {jaM.experimenterOnlyBadge}
        </p>
        <h1 className="text-center text-lg font-semibold tracking-wide text-red-800">
          {jaM.languageTitle}
        </h1>
        <div className="mt-8 flex flex-col gap-3">
          <Button
            type="button"
            size="lg"
            className="h-12 w-full rounded-xl border-0 bg-red-600 text-base font-medium text-white shadow-sm hover:bg-red-700 active:bg-red-800"
            onClick={() => pick("ja")}
          >
            {jaM.languageJa}
          </Button>
          <Button
            type="button"
            size="lg"
            className="h-12 w-full rounded-xl border-0 bg-red-600 text-base font-medium text-white shadow-sm hover:bg-red-700 active:bg-red-800"
            onClick={() => pick("ko")}
          >
            {koM.languageKo}
          </Button>
        </div>
      </div>
    </div>
  );
}
