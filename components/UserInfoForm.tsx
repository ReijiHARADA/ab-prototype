"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useExperiment } from "@/context/experiment-context";
import { calculateBmi, getBodyTypeFromBmi } from "@/lib/bodyType";
import { DESIGN_TAG_LIST, getMessages, getRegionOptions } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type {
  AgeGroup,
  DesignTag,
  Gender,
  Language,
  Region,
  UserInfo,
} from "@/types/experiment";

const AGES: AgeGroup[] = ["10s", "20s", "30s", "40s", "50plus"];
const GENDERS: Gender[] = ["male", "female", "other"];

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

type WizardStep = 1 | 2 | 3;

export function UserInfoForm() {
  const { language, submitUserInfo } = useExperiment();
  const lang: Language = language ?? "ja";
  const m = getMessages(lang);

  const [step, setStep] = useState<WizardStep>(1);

  const [ageGroup, setAgeGroup] = useState<AgeGroup>("20s");
  const [gender, setGender] = useState<Gender>("male");
  const regionOptions = useMemo(() => getRegionOptions(lang), [lang]);
  const [region, setRegion] = useState<Region>(
    () => regionOptions[0]!.value as Region
  );
  const [designTags, setDesignTags] = useState<DesignTag[]>(["basic"]);
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
    const tags = designTags.length > 0 ? designTags : (["basic"] as DesignTag[]);
    const payload: UserInfo = {
      ageGroup,
      gender,
      region,
      designTags: tags,
      heightCm,
      weightKg,
      bmi,
      bodyType,
    };
    submitUserInfo(payload);
  };

  const selectClass =
    "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-base shadow-sm outline-none transition-colors focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200";

  return (
    <form onSubmit={onSubmit} className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col px-5 pb-4 pt-6">
        {step === 1 && (
          <>
            <header className="mb-8">
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
                {m.userInfoTitle}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {m.userInfoIntroShort}
              </p>
            </header>

            <div className="flex flex-col gap-8">
              <section>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {m.ageLabel}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {AGES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAgeGroup(a)}
                      className={cn(
                        "rounded-full border px-4 py-3 text-sm font-medium transition-colors",
                        ageGroup === a
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400"
                      )}
                    >
                      {m.ages[a]}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {m.genderLabel}
                </p>
                <div className="flex flex-col gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={cn(
                        "w-full rounded-full border px-4 py-3.5 text-center text-sm font-medium transition-colors",
                        gender === g
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400"
                      )}
                    >
                      {m.genders[g]}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <Label
                  htmlFor="region"
                  className="mb-3 block text-xs font-medium uppercase tracking-wide text-neutral-500"
                >
                  {m.regionLabel}
                </Label>
                <select
                  id="region"
                  className={selectClass}
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                >
                  {regionOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </section>
            </div>
          </>
        )}

        {step === 2 && (
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

        {step === 3 && (
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
                  className={selectClass}
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
                  className={selectClass}
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
              type="button"
              className="h-12 min-h-12 flex-[1.4] rounded-xl text-base font-medium"
              onClick={() => setStep(3)}
            >
              {m.userInfoSubmit}
            </Button>
          </div>
        )}
        {step === 3 && (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 min-h-12 flex-1 rounded-xl text-base"
              onClick={() => setStep(2)}
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
