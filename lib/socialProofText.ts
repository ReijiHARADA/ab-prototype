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
}

export type SocialProofSegment = { bold?: boolean; text: string };

function labelForUser(
  m: Messages,
  u: UserInfo
): {
  designPick: string;
  bodyTypeLabel: string;
} {
  const designPick = m.designTags[u.designTag];
  return {
    designPick,
    bodyTypeLabel: m.bodyTypeLabels[u.bodyType],
  };
}

/** 画面上はセグメント単位で太字を付与。ログ用は {@link getSocialProofText} で結合。句点「。」は付けない。 */
export function getSocialProofSegments(
  ctx: SocialProofContext
): SocialProofSegment[] {
  const { conditionId, language, user } = ctx;
  const m = getMessages(language);
  const L = labelForUser(m, user);

  switch (conditionId) {
    case "sales_volume":
      return language === "ja"
        ? [
            {
              bold: true,
              text: "過去１ヶ月でよく購入されている商品です",
            },
          ]
        : [
            {
              bold: true,
              text: "지난 한 달 동안 자주 구매되는 상품입니다",
            },
          ];
    case "design_preference":
      return language === "ja"
        ? [
            { bold: true, text: `${L.designPick}が好きな方` },
            { text: "によく購入されている商品です" },
          ]
        : [
            { bold: true, text: `${L.designPick} 스타일을 선호하는 분들` },
            { text: "에게 잘 구매되는 상품입니다" },
          ];
    case "body_type":
      return [
        {
          bold: true,
          text: m.socialProofBodyTypeLead(L.bodyTypeLabel),
        },
        { text: m.socialProofBodyTypeTail },
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
