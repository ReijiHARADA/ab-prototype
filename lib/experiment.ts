import type { ConditionId } from "@/types/experiment";

/** 固定順。ランダム化する場合はこの配列をシャッフルする。 */
export const CONDITION_ORDER: readonly ConditionId[] = [
  "sales_volume",
  "age_based",
  "gender_based",
  "region_based",
  "design_preference",
  "body_type",
  "realtime_behavior",
  "none",
] as const;

/** パターンごとに固定の販売数（1200〜4800） */
export const SOLD_COUNT_BY_CONDITION: Record<ConditionId, number> = {
  sales_volume: 3420,
  age_based: 2180,
  gender_based: 4560,
  region_based: 1890,
  design_preference: 2670,
  body_type: 3010,
  realtime_behavior: 4120,
  none: 0,
};

export function getConditionIdAtIndex(index: number): ConditionId {
  return CONDITION_ORDER[index] ?? "none";
}
