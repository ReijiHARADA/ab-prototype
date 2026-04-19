export type Language = "ja" | "ko";

/** スプレッドシートのタブ名（言語選択に対応）。GAS は `getSheetByName` で使用 */
export type SpreadsheetSheetTab = "jp" | "kr";

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
  | "simple"
  | "mode"
  | "classic"
  | "casual"
  | "street"
  | "feminine"
  | "sporty"
  | "y2k";

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

export type ConditionId = "body_type" | "design_preference" | "none";

/** 商品詳細3回分の条件順（a/b/c の並び替え） */
export type SequencePatternId = 1 | 2 | 3 | 4 | 5 | 6;

export type PatternAction = "add_to_cart" | "back" | "timeout";

/** 商品詳細1画面あたりの操作回数（タップベース） */
export interface ProductInteractionCounts {
  accordion_about: number;
  accordion_detail: number;
  accordion_spec: number;
  accordion_care: number;
  /** お気に入りボタンのトグル回数 */
  favorite_toggle: number;
  quantity_plus: number;
  quantity_minus: number;
  tap_add_to_cart: number;
}

export interface ExperimentSession {
  sessionId: string;
  language: Language;
  userInfo: UserInfo;
  startedAt: string;
}

/** スプレッドシート・集計用: 1参加者 = 1行（3条件分を rounds に内包） */
export interface ParticipantSessionLog {
  type: "participantSession";
  sessionId: string;
  language: Language;
  /** 記録先タブ名。日本語 UI → `jp`、韓国語 UI → `kr`（スプレッドシートで同名のシートを用意） */
  sheetTab: SpreadsheetSheetTab;
  sequencePattern: SequencePatternId;
  experimentStartedAt?: string;
  designTagsJoined: string;
  height: number;
  weight: number;
  bmi: number;
  bodyType: string;
  rounds: Array<{
    conditionIndex: number;
    conditionId: ConditionId;
    socialProofText: string;
    action: PatternAction;
    durationSec: number;
    durationMs: number;
    selectedSize: string;
    selectedColor: string;
    quantity: number;
    startedAt: string;
    endedAt: string;
    interactionCounts: ProductInteractionCounts;
  }>;
}

export interface PatternLog {
  sessionId: string;
  language: Language;
  /** 選択したパターン（1〜6）。商品の表示順の再現に用いる */
  sequencePattern: SequencePatternId;
  conditionIndex: number;
  conditionId: ConditionId;
  socialProofText: string;
  userInfo: {
    designTags: string[];
    height: number;
    weight: number;
    bmi: number;
    bodyType: string;
  };
  interactionCounts: ProductInteractionCounts;
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
  | "patternSelect"
  | "userInfo"
  | "bodyType"
  | "product"
  /** 戻る／カート追加後 → Googleフォーム案内（CTA で次パターンへ） */
  | "surveyPrompt"
  | "completed";
