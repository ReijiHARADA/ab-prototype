import { getMessages, type Messages } from "@/lib/i18n";
import type {
  ConditionId,
  Language,
  UserInfo,
} from "@/types/experiment";

export interface SocialProofContext {
  language: Language;
  user: UserInfo;
  conditionId: ConditionId;
  /** body_type で身長ベース文言を使うか（false なら体型ラベル） */
  useHeightForBodyType: boolean;
}

export type SocialProofSegment = { bold?: boolean; text: string };

function labelForUser(
  m: Messages,
  u: UserInfo
): {
  designPick: string;
  bodyTypeLabel: string;
} {
  const designPick =
    u.designTags.length > 0
      ? m.designTags[u.designTags[0]!]
      : m.designTags.simple;
  return {
    designPick,
    bodyTypeLabel: m.bodyTypeLabels[u.bodyType],
  };
}

/** 画面上はセグメント単位で太字を付与。ログ用は {@link getSocialProofText} で結合。句点「。」は付けない。 */
export function getSocialProofSegments(
  ctx: SocialProofContext
): SocialProofSegment[] {
  const { conditionId, language, user, useHeightForBodyType } = ctx;
  const m = getMessages(language);
  const L = labelForUser(m, user);

  switch (conditionId) {
    case "design_preference":
      return language === "ja"
        ? [
            { bold: true, text: `${L.designPick}が好きな方` },
            { text: `に人気のある商品です` },
          ]
        : [
            { bold: true, text: `${L.designPick} 스타일을 선호하는 분들` },
            { text: `에게 인기 있는 상품입니다` },
          ];
    case "body_type":
      if (useHeightForBodyType) {
        return language === "ja"
          ? [
              { bold: true, text: `${user.heightCm}cm前後の方` },
              { text: `によく選ばれている商品です` },
            ]
          : [
              { bold: true, text: `${user.heightCm}cm 전후의 분들` },
              { text: `이 자주 선택하는 상품입니다` },
            ];
      }
      return language === "ja"
        ? [
            { bold: true, text: `${L.bodyTypeLabel}体型の方` },
            { text: `によく購入されている商品です` },
          ]
        : [
            { bold: true, text: `${L.bodyTypeLabel} 체형의 분들` },
            { text: `이 자주 구매하는 상품입니다` },
          ];
    case "none":
      return [];
    default:
      return [];
  }
}

/** CSV・ログ用のプレーンテキスト（太字情報なし・句点なし） */
export function getSocialProofText(ctx: SocialProofContext): string {
  return getSocialProofSegments(ctx).map((s) => s.text).join("");
}
