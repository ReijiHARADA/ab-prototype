"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useExperiment } from "@/context/experiment-context";
import { calculateBmi, getBodyTypeFromBmi } from "@/lib/bodyType";
import { DESIGN_TAG_LIST, getMessages, getRegionOptions } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { DesignTag, Language, Region, UserInfo } from "@/types/experiment";

/** 5cm 区間（例: 146~150）。BMI 用の身長は区間の中央（下限+2cm）とする */
function heightRangeMins(): number[] {
  const out: number[] = [];
  for (let min = 140; min <= 196; min += 5) out.push(min);
  return out;
}

function heightMidCm(rangeMin: number): number {
  return rangeMin + 2;
}

function heightRangeLabel(rangeMin: number, heightUnit: string): string {
  const max = rangeMin + 4;
  return `${rangeMin}~${max}${heightUnit}`;
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

  const [designTag, setDesignTag] = useState<DesignTag>("simple");
  /** 選択中の身長レンジの下限（140, 145, …）。保存する heightCm は区間の中央 */
  const [heightRangeMin, setHeightRangeMin] = useState(170);
  const [weightKg, setWeightKg] = useState(65);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const heightCm = heightMidCm(heightRangeMin);
    const bmi = calculateBmi(heightCm, weightKg);
    const bodyType = getBodyTypeFromBmi(bmi);
    const region = (getRegionOptions(lang)[0]?.value ?? "tokyo") as Region;
    const payload: UserInfo = {
      ageGroup: "20s",
      gender: "male",
      region,
      designTag,
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
                const on = designTag === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDesignTag(t)}
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
                  value={heightRangeMin}
                  onChange={(e) => setHeightRangeMin(Number(e.target.value))}
                >
                  {heightRangeMins().map((min) => (
                    <option key={min} value={min}>
                      {heightRangeLabel(min, m.heightUnit)}
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
