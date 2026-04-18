import type { BodyTypeKey } from "@/types/experiment";

export function calculateBmi(heightCm: number, weightKg: number): number {
  const h = heightCm / 100;
  if (h <= 0) return 0;
  return weightKg / (h * h);
}

export function getBodyTypeFromBmi(bmi: number): BodyTypeKey {
  if (bmi < 18.5) return "slim";
  if (bmi < 23) return "standard";
  if (bmi < 27.5) return "solid";
  return "large";
}
