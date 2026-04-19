import type { ConditionId } from "@/types/experiment";

/** 固定順。ランダム化する場合はこの配列をシャッフルする。 */
export const CONDITION_ORDER: readonly ConditionId[] = [
  "body_type",
  "design_preference",
  "none",
] as const;

export function getConditionIdAtIndex(index: number): ConditionId {
  return CONDITION_ORDER[index] ?? "none";
}

/**
 * 商品画面で数量がこの値のときに「カートに入れる」を押すと、
 * 実験を中断して言語選択（最初の画面）へ戻る（管理者・デモ用の抜け道）。
 */
export const ADMIN_RESET_QUANTITY = 5;
