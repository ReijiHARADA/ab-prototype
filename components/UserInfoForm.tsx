"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useExperiment } from "@/context/experiment-context";
import { calculateBmi, getBodyTypeFromBmi } from "@/lib/bodyType";
import {
  DESIGN_TAG_LIST,
  getMessages,
  getRegionOptions,
} from "@/lib/i18n";
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

/** 140〜200cm、5cm 刻み（保存値はその代表 cm） */
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

export function UserInfoForm() {
  const { language, submitUserInfo } = useExperiment();
  const lang: Language = language ?? "ja";
  const m = getMessages(lang);

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
    setDesignTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
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

  return (
    <form
      onSubmit={onSubmit}
      className="flex min-h-dvh flex-col"
    >
      <div className="flex flex-1 flex-col gap-8 px-5 py-8 text-sm leading-relaxed">
      <h1 className="text-lg font-medium">{m.userInfoTitle}</h1>

      <fieldset className="space-y-2">
        <legend className="mb-2 font-medium">{m.ageLabel}</legend>
        <div className="grid grid-cols-2 gap-2">
          {AGES.map((a) => (
            <label
              key={a}
              className="flex cursor-pointer items-center gap-2 border border-neutral-200 px-3 py-2"
            >
              <input
                type="radio"
                name="age"
                className="accent-neutral-900"
                checked={ageGroup === a}
                onChange={() => setAgeGroup(a)}
              />
              <span>{m.ages[a]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="mb-2 font-medium">{m.genderLabel}</legend>
        <div className="flex flex-col gap-2">
          {GENDERS.map((g) => (
            <label
              key={g}
              className="flex cursor-pointer items-center gap-2 border border-neutral-200 px-3 py-2"
            >
              <input
                type="radio"
                name="gender"
                className="accent-neutral-900"
                checked={gender === g}
                onChange={() => setGender(g)}
              />
              <span>{m.genders[g]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label className="text-base font-medium">{m.regionLabel}</Label>
        <select
          className="w-full border border-neutral-200 bg-white px-3 py-3 text-base outline-none"
          value={region}
          onChange={(e) => setRegion(e.target.value as Region)}
        >
          {regionOptions.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <p className="font-medium">{m.designLabel}</p>
        <div className="grid grid-cols-2 gap-2">
          {DESIGN_TAG_LIST.map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-center gap-2 border border-neutral-200 px-2 py-2"
            >
              <Checkbox
                checked={designTags.includes(t)}
                onCheckedChange={() => toggleTag(t)}
              />
              <span>{m.designTags[t]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{m.heightLabel}</Label>
          <select
            className="w-full border border-neutral-200 bg-white px-2 py-3 text-base"
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
          <Label>{m.weightLabel}</Label>
          <select
            className="w-full border border-neutral-200 bg-white px-2 py-3 text-base"
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
      </div>

      <div
        className="sticky bottom-0 z-50 border-t border-neutral-200 bg-white/95 px-5 py-4 backdrop-blur-sm [padding-bottom:max(1rem,env(safe-area-inset-bottom))]"
      >
        <Button
          type="submit"
          className="h-12 min-h-12 w-full rounded-md text-base"
        >
          {m.userInfoSubmit}
        </Button>
      </div>
    </form>
  );
}
