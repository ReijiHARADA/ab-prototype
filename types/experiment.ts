export type Language = "ja" | "ko";

export type AgeGroup =
  | "10s"
  | "20s"
  | "30s"
  | "40s"
  | "50plus";

export type Gender = "male" | "female" | "other";

export type RegionJa =
  | "tokyo"
  | "chiba"
  | "kanagawa"
  | "osaka"
  | "other";

export type RegionKo =
  | "seoul"
  | "gyeonggi"
  | "incheon"
  | "busan"
  | "other";

export type Region = RegionJa | RegionKo;

export type DesignTag =
  | "monotone"
  | "minimal"
  | "casual"
  | "clean"
  | "street"
  | "luxury"
  | "basic"
  | "trendy";

export type BodyTypeKey = "slim" | "standard" | "solid" | "large";

export interface UserInfo {
  ageGroup: AgeGroup;
  gender: Gender;
  region: Region;
  designTags: DesignTag[];
  heightCm: number;
  weightKg: number;
  bmi: number;
  bodyType: BodyTypeKey;
}

export type ConditionId =
  | "sales_volume"
  | "age_based"
  | "gender_based"
  | "region_based"
  | "design_preference"
  | "body_type"
  | "realtime_behavior"
  | "none";

export type PatternAction = "add_to_cart" | "back" | "timeout";

export interface ExperimentSession {
  sessionId: string;
  language: Language;
  userInfo: UserInfo;
  startedAt: string;
}

export interface PatternLog {
  sessionId: string;
  language: Language;
  conditionIndex: number;
  conditionId: ConditionId;
  socialProofText: string;
  userInfo: {
    ageGroup: string;
    gender: string;
    region: string;
    designTags: string[];
    height: number;
    weight: number;
    bmi: number;
    bodyType: string;
  };
  productId: "waffle-henley-shirt";
  action: PatternAction;
  actionDetail?: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  durationSec: number;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface EventLog {
  sessionId: string;
  /** スプレッドシートの ui_language 列用 */
  language?: Language;
  conditionId: ConditionId;
  eventName: string;
  eventValue?: string;
  timestamp: string;
}

export type AppStep =
  | "language"
  | "userInfo"
  | "bodyType"
  | "product"
  | "cartAdded"
  | "completed";

export type CartAddedView = "summary" | "cartStub";
