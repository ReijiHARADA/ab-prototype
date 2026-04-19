import type { BodyTypeKey } from "@/types/experiment";

export function calculateBmi(heightCm: number, weightKg: number): number {
  const h = heightCm / 100;
  if (h <= 0) return 0;
  return weightKg / (h * h);
}

/**
 * 身長・体重から求めた BMI に基づき体型区分を返す（実験用の簡易4分類）。
 * 表示名は `bodyTypeLabels`（例: スタンダード）と対応し、ソーシャルプルーフでは「〇〇型の方」として利用する。
 *
 * | 区分 | BMI の目安 |
 * |------|------------|
 * | slim | 18.5 未満 |
 * | standard | 18.5 以上 23 未満 |
 * | solid | 23 以上 27.5 未満 |
 * | large | 27.5 以上 |
 */
export function getBodyTypeFromBmi(bmi: number): BodyTypeKey {
  if (bmi < 18.5) return "slim";
  if (bmi < 23) return "standard";
  if (bmi < 27.5) return "solid";
  return "large";
}
