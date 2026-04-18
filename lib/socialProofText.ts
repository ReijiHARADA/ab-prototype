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
      : m.designTags.basic;
  return {
    ageGroup: m.ages[u.ageGroup],
    gender: m.genders[u.gender],
    region: m.regions[u.region],
    designPick,
    bodyTypeLabel: m.bodyTypeLabels[u.bodyType],
  };
}

export function getSocialProofText(ctx: SocialProofContext): string {
  const { conditionId, language, user, viewerCount, useHeightForBodyType } =
    ctx;
  const m = getMessages(language);
  const sold = SOLD_COUNT_BY_CONDITION[conditionId];
  const L = labelForUser(m, user);

  switch (conditionId) {
    case "sales_volume":
      return language === "ja"
        ? `過去1ヶ月で${sold}点以上販売された商品です。`
        : `최근 1개월 동안 ${sold}개 이상 판매된 상품입니다.`;
    case "age_based":
      return language === "ja"
        ? `${L.ageGroup}の方に人気のある商品です。`
        : `${L.ageGroup}에게 인기 있는 상품입니다.`;
    case "gender_based":
      return language === "ja"
        ? `${L.gender}の方によく購入されている商品です。`
        : `${L.gender}에게 자주 구매되는 상품입니다.`;
    case "region_based":
      return language === "ja"
        ? `${L.region}に住む方に人気のある商品です。`
        : `${L.region}에 거주하는 분들에게 인기 있는 상품입니다.`;
    case "design_preference":
      return language === "ja"
        ? `${L.designPick}が好きな方に人気のある商品です。`
        : `${L.designPick} 스타일을 선호하는 분들에게 인기 있는 상품입니다.`;
    case "body_type":
      if (useHeightForBodyType) {
        return language === "ja"
          ? `${user.heightCm}cm前後の方によく選ばれている商品です。`
          : `${user.heightCm}cm 전후의 분들이 자주 선택하는 상품입니다.`;
      }
      return language === "ja"
        ? `${L.bodyTypeLabel}体型の方によく購入されている商品です。`
        : `${L.bodyTypeLabel} 체형의 분들이 자주 구매하는 상품입니다.`;
    case "realtime_behavior":
      return language === "ja"
        ? `現在${viewerCount}名がこの商品を見ています。`
        : `현재 ${viewerCount}명이 이 상품을 보고 있습니다.`;
    case "none":
      return "";
    default:
      return "";
  }
}
