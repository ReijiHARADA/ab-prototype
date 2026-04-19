import type { ConditionId, Language } from "@/types/experiment";

import { CANONICAL_CONDITION_ORDER } from "@/lib/experiment";
import { INTERACTION_COUNT_KEYS } from "@/lib/productInteractions";

/** データ列のキー（英語）。順序は CANONICAL_CONDITION_ORDER（なし→デザイン→体型） */
export const ROUND_FIELD_KEYS = [
  "conditionId",
  "socialProofText",
  "action",
  "durationSec",
  "selectedSize",
  "quantity",
  "startedAt",
  "endedAt",
] as const;

/** 列順は `lib/csv.ts` のデータ行と同一（英語キー名） */
export const PARTICIPANT_SESSION_COLUMN_KEYS: string[] = [
  "sessionId",
  "language",
  "sheetTab",
  "sequencePattern",
  "experimentStartedAt",
  "designTags",
  "height",
  "weight",
  "bmi",
  "bodyType",
  ...CANONICAL_CONDITION_ORDER.flatMap((cid) => [
    ...ROUND_FIELD_KEYS.map((k) => `${cid}_${k}`),
    ...INTERACTION_COUNT_KEYS.map((k) => `${cid}_${k}`),
  ]),
];

const BASE_LABELS: Record<
  | "sessionId"
  | "language"
  | "sheetTab"
  | "sequencePattern"
  | "experimentStartedAt"
  | "designTags"
  | "height"
  | "weight"
  | "bmi"
  | "bodyType",
  { ja: string; ko: string }
> = {
  sessionId: { ja: "セッションID", ko: "세션 ID" },
  language: { ja: "言語", ko: "언어" },
  sheetTab: { ja: "記録シート", ko: "기록 시트" },
  sequencePattern: { ja: "表示順パターン", ko: "표시 순서 패턴" },
  experimentStartedAt: { ja: "実験開始日時", ko: "실험 시작 시각" },
  designTags: { ja: "デザイン好み", ko: "디자인 선호" },
  height: { ja: "身長_cm", ko: "키_cm" },
  weight: { ja: "体重_kg", ko: "체중_kg" },
  bmi: { ja: "BMI", ko: "BMI" },
  bodyType: { ja: "体型", ko: "체형" },
};

const ROUND_FIELD_LABELS: Record<
  (typeof ROUND_FIELD_KEYS)[number],
  { ja: string; ko: string }
> = {
  conditionId: { ja: "条件ID", ko: "조건 ID" },
  socialProofText: {
    ja: "ソーシャルプルーフ文言",
    ko: "소셜 프루프 문구",
  },
  action: { ja: "アクション", ko: "액션" },
  durationSec: { ja: "滞在秒", ko: "체류(초)" },
  selectedSize: { ja: "選択サイズ", ko: "선택 사이즈" },
  quantity: { ja: "数量", ko: "수량" },
  startedAt: { ja: "開始日時", ko: "시작 시각" },
  endedAt: { ja: "終了日時", ko: "종료 시각" },
};

const INTERACTION_LABELS: Record<
  (typeof INTERACTION_COUNT_KEYS)[number],
  { ja: string; ko: string }
> = {
  accordion_about: { ja: "アコーディオン_概要", ko: "아코디언_개요" },
  accordion_detail: { ja: "アコーディオン_詳細", ko: "아코디언_상세" },
  accordion_spec: { ja: "アコーディオン_仕様", ko: "아코디언_사양" },
  accordion_care: { ja: "アコーディオン_お手入れ", ko: "아코디언_관리" },
  favorite_toggle: { ja: "お気に入り", ko: "즐겨찾기" },
  quantity_plus: { ja: "数量プラス", ko: "수량+" },
  quantity_minus: { ja: "数量マイナス", ko: "수량-" },
  tap_add_to_cart: { ja: "カートに追加", ko: "장바구니 담기" },
};

/** スプレッドシート列の条件ブロック見出し（表示順ではなく固定順） */
const CONDITION_BLOCK_LABELS: Record<ConditionId, { ja: string; ko: string }> =
  {
    none: { ja: "何もなし", ko: "없음" },
    design_preference: { ja: "デザインの好み", ko: "디자인 선호" },
    body_type: { ja: "体型", ko: "체형" },
  };

/**
 * スプレッドシート1行目・CSV1行目用の表示列名。
 * `jp` シート → 日本語、`kr` シート → 韓国語。
 */
export function getParticipantSessionCsvHeaders(lang: Language): string[] {
  const L = lang === "ko" ? "ko" : "ja";
  const base: string[] = (
    [
      "sessionId",
      "language",
      "sheetTab",
      "sequencePattern",
      "experimentStartedAt",
      "designTags",
      "height",
      "weight",
      "bmi",
      "bodyType",
    ] as const
  ).map((k) => BASE_LABELS[k][L]);

  for (const conditionId of CANONICAL_CONDITION_ORDER) {
    const block = CONDITION_BLOCK_LABELS[conditionId][L];
    for (const k of ROUND_FIELD_KEYS) {
      base.push(`${block}_${ROUND_FIELD_LABELS[k][L]}`);
    }
    for (const k of INTERACTION_COUNT_KEYS) {
      base.push(`${block}_${INTERACTION_LABELS[k][L]}`);
    }
  }

  return base;
}

/** GAS やドキュメント用: シート名からヘッダ言語を決める */
export function headerLangFromSheetTab(sheetTab: string): Language {
  return sheetTab === "kr" ? "ko" : "ja";
}
