import type { ConditionId, SequencePatternId } from "@/types/experiment";

/** a: ソーシャルプルーフなし */
const A: ConditionId = "none";
/** b: デザインの好み */
const B: ConditionId = "design_preference";
/** c: 体型 */
const C: ConditionId = "body_type";

/**
 * パターン定義（言語選択後にユーザーが選ぶ）
 * - パターン1: abc … なし → デザインの好み → 体型
 * - パターン2: acb … なし → 体型 → デザインの好み
 * - パターン3: bac …
 * - パターン4: bca …
 * - パターン5: cab …
 * - パターン6: cba …
 */
export const SEQUENCE_PATTERN_ORDERS: Record<
  SequencePatternId,
  readonly ConditionId[]
> = {
  1: [A, B, C],
  2: [A, C, B],
  3: [B, A, C],
  4: [B, C, A],
  5: [C, A, B],
  6: [C, B, A],
};

/** UI 用の a/b/c 表記（矢印区切り） */
export const SEQUENCE_PATTERN_ABC_LABEL: Record<SequencePatternId, string> = {
  1: "a→b→c",
  2: "a→c→b",
  3: "b→a→c",
  4: "b→c→a",
  5: "c→a→b",
  6: "c→b→a",
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
