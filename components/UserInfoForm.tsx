"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useExperiment } from "@/context/experiment-context";
import { calculateBmi, getBodyTypeFromBmi } from "@/lib/bodyType";
import { DESIGN_TAG_LIST, getMessages, getRegionOptions } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { DesignTag, Language, Region, UserInfo } from "@/types/experiment";

function heights(): number[] {
  const out: number[] = [];
  for (let h = 140; h <= 200; h += 5) out.push(h);
  return out;
}

function heightOptionLabel(cm: number): string {
  return `~${cm}cm`;
}

function weights(): number[] {
  const out: number[] = [];
  for (let w = 40; w <= 120; w += 5) out.push(w);
  return out;
}

type WizardStep = 1 | 2;

export function UserInfoForm() {
  const { language, submitUserInfo } = useExperiment();
  const lang: Language = language ?? "ja";
  const m = getMessages(lang);

  const [step, setStep] = useState<WizardStep>(1);

  const [designTags, setDesignTags] = useState<DesignTag[]>(["simple"]);
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(65);

  const toggleTag = (t: DesignTag) => {
    setDesignTags((prev) => {
      if (prev.includes(t)) {
        if (prev.length <= 1) return prev;
        return prev.filter((x) => x !== t);
      }
      return [...prev, t];
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bmi = calculateBmi(heightCm, weightKg);
    const bodyType = getBodyTypeFromBmi(bmi);
    const tags = designTags.length > 0 ? designTags : (["simple"] as DesignTag[]);
    const region = (getRegionOptions(lang)[0]?.value ?? "tokyo") as Region;
    const payload: UserInfo = {
      ageGroup: "20s",
      gender: "male",
      region,
      designTags: tags,
      heightCm,
      weightKg,
      bmi,
      bodyType,
    };
    submitUserInfo(payload);
  };

  const bodySelectClass =
    "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-base outline-none transition-colors focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200";

  return (
    <form onSubmit={onSubmit} className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col px-5 pb-4 pt-6">
        {step === 1 && (
          <>
            <header className="mb-6">
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
                {m.userInfoDesignTitle}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {m.userInfoDesignHint}
              </p>
            </header>

            <div className="flex flex-wrap gap-2">
              {DESIGN_TAG_LIST.map((t) => {
                const on = designTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={cn(
                      "rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
                      on
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400"
                    )}
                  >
                    {m.designTags[t]}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <header className="mb-8">
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
                {m.userInfoBodyTitle}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {m.userInfoBodyHint}
              </p>
            </header>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-600">
                  {m.heightLabel}
                </Label>
                <select
                  className={bodySelectClass}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                >
                  {heights().map((h) => (
                    <option key={h} value={h}>
                      {heightOptionLabel(h)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-600">
                  {m.weightLabel}
                </Label>
                <select
                  className={bodySelectClass}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                >
                  {weights().map((w) => (
                    <option key={w} value={w}>
                      {w}
                      {m.weightUnit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="sticky bottom-0 z-50 border-t border-neutral-200 bg-white/95 px-5 py-4 backdrop-blur-sm [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
        {step === 1 && (
          <Button
            type="button"
            className="h-12 min-h-12 w-full rounded-xl text-base font-medium"
            onClick={() => setStep(2)}
          >
            {m.userInfoSubmit}
          </Button>
        )}
        {step === 2 && (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 min-h-12 flex-1 rounded-xl text-base"
              onClick={() => setStep(1)}
            >
              {m.userInfoBack}
            </Button>
            <Button
              type="submit"
              className="h-12 min-h-12 flex-[1.4] rounded-xl text-base font-medium"
            >
              {m.userInfoSubmit}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
