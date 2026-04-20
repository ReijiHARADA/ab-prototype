import type { ConditionId, SequencePatternId } from "@/types/experiment";

/** 1回目の商品画面は常にソーシャルプルーフなし */
const N: ConditionId = "none";
/** 過去1ヶ月の販売量ベース */
const S: ConditionId = "sales_volume";
/** デザインの好み */
const D: ConditionId = "design_preference";
/** 体型 */
const B: ConditionId = "body_type";

/**
 * スプレッドシート・CSV の列ブロック順（表示順パターンに依らず常にこの順）
 * — 何もなし → 販売量 → デザインの好み → 体型
 */
export const CANONICAL_CONDITION_ORDER: readonly ConditionId[] = [
  N,
  S,
  D,
  B,
] as const;

/**
 * パターン定義（言語選択後にユーザーが選ぶ）
 * - 1回目は必ず「なし（none）」
 * - 2・3回目は「販売量・デザイン・体型」のうち2種を順序付きで割り当て（6通り）
 */
export const SEQUENCE_PATTERN_ORDERS: Record<
  SequencePatternId,
  readonly ConditionId[]
> = {
  1: [N, S, D],
  2: [N, S, B],
  3: [N, D, S],
  4: [N, D, B],
  5: [N, B, S],
  6: [N, B, D],
};

export function getConditionIdAtIndexInOrder(
  order: readonly ConditionId[],
  index: number
): ConditionId {
  return order[index] ?? "none";
}

export function isSequencePatternId(n: number): n is SequencePatternId {
  return n >= 1 && n <= 6;
}

/**
 * 商品画面で数量がこの値のときに「カートに入れる」を押すと、
 * 実験を中断して言語選択（最初の画面）へ戻る（管理者・デモ用の抜け道）。
 */
export const ADMIN_RESET_QUANTITY = 5;
