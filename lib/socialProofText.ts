import { SOLD_COUNT_BY_CONDITION } from "@/lib/experiment";
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
  viewerCount: number;
  /** body_type で身長ベース文言を使うか（false なら体型ラベル） */
  useHeightForBodyType: boolean;
}

export type SocialProofSegment = { bold?: boolean; text: string };

function labelForUser(
  m: Messages,
  u: UserInfo
): {
  ageGroup: string;
  gender: string;
  region: string;
  designPick: string;
  bodyTypeLabel: string;
} {
  const designPick =
    u.designTags.length > 0
      ? m.designTags[u.designTags[0]!]
      : m.designTags.simple;
  return {
    ageGroup: m.ages[u.ageGroup],
    gender: m.genders[u.gender],
    region: m.regions[u.region],
    designPick,
    bodyTypeLabel: m.bodyTypeLabels[u.bodyType],
  };
}

/** 画面上はセグメント単位で太字を付与。ログ用は {@link getSocialProofText} で結合。句点「。」は付けない。 */
export function getSocialProofSegments(
  ctx: SocialProofContext
): SocialProofSegment[] {
  const { conditionId, language, user, viewerCount, useHeightForBodyType } =
    ctx;
  const sold = SOLD_COUNT_BY_CONDITION[conditionId];
  const m = getMessages(language);
  const L = labelForUser(m, user);

  switch (conditionId) {
    case "sales_volume":
      return language === "ja"
        ? [
            { bold: true, text: `過去1ヶ月で${sold}点以上販売された` },
            { text: `商品です` },
          ]
        : [
            { bold: true, text: `최근 1개월 동안 ${sold}개 이상 판매된` },
            { text: ` 상품입니다` },
          ];
    case "age_based":
      return language === "ja"
        ? [
            { bold: true, text: `${L.ageGroup}の方` },
            { text: `に人気のある商品です` },
          ]
        : [
            { bold: true, text: `${L.ageGroup}` },
            { text: `에게 인기 있는 상품입니다` },
          ];
    case "gender_based":
      return language === "ja"
        ? [
            { bold: true, text: `${L.gender}の方` },
            { text: `によく購入されている商品です` },
          ]
        : [
            { bold: true, text: `${L.gender}` },
            { text: `에게 자주 구매되는 상품입니다` },
          ];
    case "region_based":
      return language === "ja"
        ? [
            { bold: true, text: `${L.region}に住む方` },
            { text: `に人気のある商品です` },
          ]
        : [
            { bold: true, text: `${L.region}에 거주하는 분들` },
            { text: `에게 인기 있는 상품입니다` },
          ];
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
    case "realtime_behavior":
      return language === "ja"
        ? [
            { bold: true, text: `現在${viewerCount}名` },
            { text: `がこの商品を見ています` },
          ]
        : [
            { bold: true, text: `현재 ${viewerCount}명` },
            { text: `이 이 상품을 보고 있습니다` },
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
