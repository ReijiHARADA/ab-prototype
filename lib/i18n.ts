import type {
  AgeGroup,
  BodyTypeKey,
  DesignTag,
  Gender,
  Language,
  Region,
  SequencePatternId,
} from "@/types/experiment";

const ja = {
  appTitle: "商品詳細（実験）",
  languageTitle: "言語を選択してください",
  experimenterOnlyBadge: "実験者用",
  patternSelectTitle: "表示パターンを選択してください",
  patternSelectIntro:
    "商品詳細は4回表示されます。1回目は常にソーシャルプルーフなし。その後の3回は a・b・c（販売量・デザイン・体型）の順序がパターンによります。",
  patternLegendA: "a：過去１ヶ月の販売量（よく購入されている商品です）",
  patternLegendB: "b：デザインの好み（よく購入されている商品です）",
  patternLegendC: "c：体型（よく購入されている商品です）",
  /** パターン選択の右側ラベル（1回目＝なし固定） */
  sequencePatternOrderLabel: {
    1: "なし→販売→デザイン→体型",
    2: "なし→販売→体型→デザイン",
    3: "なし→デザイン→販売→体型",
    4: "なし→デザイン→体型→販売",
    5: "なし→体型→販売→デザイン",
    6: "なし→体型→デザイン→販売",
  } satisfies Record<SequencePatternId, string>,
  experimentStartCta: "実験開始",
  patternN: (n: number) => `パターン${n}`,
  languageJa: "日本語",
  languageKo: "한국어",
  userInfoTitle: "基本情報",
  userInfoSubmit: "次へ",
  userInfoBack: "戻る",
  userInfoIntroShort: "商品のおすすめ表示に利用します。",
  userInfoDesignTitle: "デザインの好み",
  userInfoDesignHint: "当てはまるものを1つ選んでください",
  userInfoBodyTitle: "身長・体重",
  userInfoBodyHint: "サイズの参考に利用します。",
  surveyPromptTitle: "Googleフォーム",
  surveyPromptBody:
    "続けるには、Google formのアンケートに回答してください。",
  surveyPromptCheckboxLabel: "Googleフォームに回答しました",
  surveyPromptCta: "次の画面へ",
  /** 4条件目（最終の商品画面）直後の案内のみ */
  surveyPromptLastTitle: "お疲れ様でした！",
  surveyPromptLastBody:
    "プロトタイプの操作はこれで終了です。Googleフォームのアンケートに回答してください。",
  surveyPromptLastCta: "プロトタイプ操作を終了する。",
  /** 最終画面で送信〜遷移までの待機表示 */
  surveyPromptSaving: "記録中です…",
  productHeroCarouselAria: "商品画像（横にスワイプ）",
  productCarouselDotAria: (n: number, total: number) =>
    `画像 ${n} / ${total}`,
  ageLabel: "年齢層",
  genderLabel: "性別",
  regionLabel: "居住地域",
  designLabel: "デザインの好み",
  heightLabel: "身長",
  weightLabel: "体重",
  heightUnit: "cm",
  weightUnit: "kg",
  ages: {
    "10s": "10代",
    "20s": "20代",
    "30s": "30代",
    "40s": "40代",
    "50plus": "50代以上",
  } satisfies Record<AgeGroup, string>,
  genders: {
    male: "男性",
    female: "女性",
    other: "その他 / 回答しない",
  } satisfies Record<Gender, string>,
  regions: {
    tokyo: "東京都",
    chiba: "千葉県",
    kanagawa: "神奈川県",
    osaka: "大阪府",
    other: "その他",
    seoul: "서울",
    gyeonggi: "경기",
    incheon: "인천",
    busan: "부산",
  } as Record<Region, string>,
  designTags: {
    simple: "シンプル",
    mode: "モード",
    classic: "クラシック",
    casual: "カジュアル",
    street: "ストリート",
    feminine: "フェミニン",
    sporty: "スポーティ",
    y2k: "Y2K",
  } satisfies Record<DesignTag, string>,
  bodyTypeLabels: {
    slim: "スリム",
    standard: "スタンダード",
    solid: "ソリッド",
    large: "ラージ",
  } satisfies Record<BodyTypeKey, string>,
  bodyTypeScreenTitle: "体型タイプ",
  bodyTypeExplanation:
    "この情報は、後の商品詳細画面で一部の表示に反映されます。",
  bodyTypeYourTypeLead: "あなたの体型タイプ",
  bodyTypeYourTypeQuote: (label: string) => `「${label}」`,
  /** 体型ソーシャルプルーフの太字部分（例: スタンダード型の方）— label は BMI 区分に対応する bodyTypeLabels の値 */
  socialProofBodyTypeLead: (label: string) => `${label}型の方`,
  socialProofBodyTypeTail: "によく購入されている商品です",
  viewProduct: "商品を見る",
  productInStock: "在庫あり",
  productPrice: "¥1,990",
  addToCart: "カートに入れる",
  addToCartConfirmTitle: "カートに追加しますか？",
  addToCartConfirmBack: "戻る",
  addToCartConfirmSubmit: "カートに追加する",
  /** 1回目・ソーシャルプルーフなしで、1分未満に戻る／カート確定したときの全画面メッセージ */
  firstNoneEarlyActionMessage:
    "この画面は1分間の制限があります。1分が経過するまで、戻る・カートに追加では次の画面には進めません。操作すると約2秒後に同じ商品画面に戻ります。1分経過後は通常どおり次へ進めます。",
  addToFavorites: "お気に入りに追加",
  storeStock: "店舗在庫状況",
  storeStockPlaceholder:
    "店舗を選択すると、その店舗の在庫の目安を表示します。在庫は入荷・販売状況により変わる場合があります。",
  aboutProduct: "この商品について",
  details: "詳細",
  specs: "仕様",
  materialCare: "素材・お手入れ",
  quantity: "数量",
  color: "カラー",
  size: "サイズ",
  resultTitle: "ログ確認",
  resultSpreadsheetOk: "スプレッドシートへの記録が完了しました。",
  resultSpreadsheetNg:
    "スプレッドシートへの記録に失敗しました。担当者に連絡するか、しばらくしてからお試しください。",
  resultColumns: {
    conditionId: "種別",
    index: "#",
    text: "表示文言",
    action: "アクション",
    dwellMs: "滞在(ms)",
    cart: "カート",
    back: "戻る",
    timeout: "タイムアウト",
    started: "開始",
    ended: "終了",
  },
  /** ユニクロ商品ページに準拠: https://www.uniqlo.com/jp/ja/products/E465185-000/01 */
  productName: "エアリズムコットンオーバーサイズTシャツ/5分袖",
  productDesc:
    "見た目コットンの「エアリズム」。汗をかいてもサラッとした肌ざわり。着た瞬間にひんやりとして、涼しい着心地。5分袖、オーバーサイズ、ドロップショルダーでリラックス感のある着心地。やや詰まったクルーネックでクリーンに着こなせる。",
  productDetailBody:
    "商品番号: 475355。掲載画像には販売予定にないカラーが含まれている場合があります。着丈・身幅などの採寸情報は参考値です。",
  productSpecsBody:
    "きれいなシルエットに仕上がる素材。軽やかな着心地で、インナーにも一枚でも着やすい一枚です。",
  productMaterialCareBody:
    "【素材】53% 綿、30% ポリエステル、17% 複合繊維（ポリエステル）（30% リサイクルポリエステル繊維を使用）\n\n【取扱い】洗濯機可、ドライクリーニング可、乾燥機不可。濃色は色落ちする事がありますので、他の物とのお洗濯はお避け下さい。汗や雨等で湿った状態、または摩擦によって、他の物に色移りする事がありますので、ご注意下さい。",
  colorPink: "12 PINK",
} as const;

const ko = {
  appTitle: "상품 상세 (실험)",
  languageTitle: "언어를 선택하세요",
  experimenterOnlyBadge: "실험자용",
  patternSelectTitle: "표시 패턴을 선택하세요",
  patternSelectIntro:
    "상품 상세는 4번 표시됩니다. 1번째는 항상 소셜 프루프 없음. 이후 3번은 a·b·c(판매량·디자인·체형) 순서가 패턴에 따라 달라집니다.",
  patternLegendA: "a: 지난 한 달 판매량(잘 구매되는 상품입니다)",
  patternLegendB: "b: 디자인 취향(잘 구매되는 상품입니다)",
  patternLegendC: "c: 체형(잘 구매되는 상품입니다)",
  sequencePatternOrderLabel: {
    1: "없음→판매→디자인→체형",
    2: "없음→판매→체형→디자인",
    3: "없음→디자인→판매→체형",
    4: "없음→디자인→체형→판매",
    5: "없음→체형→판매→디자인",
    6: "없음→체형→디자인→판매",
  } satisfies Record<SequencePatternId, string>,
  experimentStartCta: "실험 시작",
  patternN: (n: number) => `패턴 ${n}`,
  languageJa: "日本語",
  languageKo: "한국어",
  userInfoTitle: "기본 정보",
  userInfoSubmit: "다음",
  userInfoBack: "뒤로",
  userInfoIntroShort: "상품 추천 표시에 활용합니다.",
  userInfoDesignTitle: "디자인 취향",
  userInfoDesignHint: "해당하는 항목을 하나만 선택해 주세요",
  userInfoBodyTitle: "키·체중",
  userInfoBodyHint: "사이즈 참고에 활용합니다.",
  surveyPromptTitle: "Google Form",
  surveyPromptBody:
    "계속하려면 Google Form 설문에 응답해 주세요.",
  surveyPromptCheckboxLabel: "Google 폼에 응답했습니다",
  surveyPromptCta: "다음 화면으로",
  surveyPromptLastTitle: "수고하셨습니다!",
  surveyPromptLastBody:
    "프로토타입 조작은 여기까지입니다. Google 폼 설문에 응답해 주세요.",
  surveyPromptLastCta: "프로토타입 조작을 종료합니다.",
  surveyPromptSaving: "기록 중입니다…",
  productHeroCarouselAria: "상품 이미지(가로로 스와이프)",
  productCarouselDotAria: (n: number, total: number) =>
    `이미지 ${n} / ${total}`,
  ageLabel: "연령대",
  genderLabel: "성별",
  regionLabel: "거주 지역",
  designLabel: "디자인 취향",
  heightLabel: "키",
  weightLabel: "체중",
  heightUnit: "cm",
  weightUnit: "kg",
  ages: {
    "10s": "10대",
    "20s": "20대",
    "30s": "30대",
    "40s": "40대",
    "50plus": "50대 이상",
  } satisfies Record<AgeGroup, string>,
  genders: {
    male: "남성",
    female: "여성",
    other: "기타 / 응답하지 않음",
  } satisfies Record<Gender, string>,
  regions: {
    tokyo: "도쿄도",
    chiba: "지바현",
    kanagawa: "가나가와현",
    osaka: "오사카부",
    other: "기타",
    seoul: "서울",
    gyeonggi: "경기",
    incheon: "인천",
    busan: "부산",
  } as Record<Region, string>,
  designTags: {
    simple: "심플",
    mode: "모드",
    classic: "클래식",
    casual: "캐주얼",
    street: "스트리트",
    feminine: "페미닌",
    sporty: "스포티",
    y2k: "Y2K",
  } satisfies Record<DesignTag, string>,
  bodyTypeLabels: {
    slim: "슬림",
    standard: "스탠다드",
    solid: "솔리드",
    large: "라지",
  } satisfies Record<BodyTypeKey, string>,
  bodyTypeScreenTitle: "체형 타입",
  bodyTypeExplanation:
    "이 정보는 이후 상품 상세 화면의 일부 문구에 반영됩니다.",
  bodyTypeYourTypeLead: "당신의 체형 타입",
  bodyTypeYourTypeQuote: (label: string) => `"${label}"`,
  socialProofBodyTypeLead: (label: string) => `${label}형의 분들`,
  socialProofBodyTypeTail: "에게 잘 구매되는 상품입니다",
  viewProduct: "상품 보기",
  productInStock: "재고 있음",
  productPrice: "₩19,900",
  addToCart: "장바구니에 담기",
  addToCartConfirmTitle: "장바구니에 담으시겠습니까?",
  addToCartConfirmBack: "뒤로",
  addToCartConfirmSubmit: "장바구니에 담기",
  firstNoneEarlyActionMessage:
    "이 화면은 1분간 제한이 있습니다. 1분이 지나기 전에는 뒤로가기·장바구니 담기로 다음 화면으로 갈 수 없습니다. 조작하면 약 2초 후 같은 상품 화면으로 돌아갑니다. 1분이 지난 뒤에는 평소처럼 진행됩니다.",
  addToFavorites: "찜하기",
  storeStock: "매장 재고",
  storeStockPlaceholder:
    "매장을 선택하면 해당 매장의 재고를 확인할 수 있습니다. 재고는 입고 및 판매 상황에 따라 달라질 수 있습니다.",
  aboutProduct: "이 상품에 대해",
  details: "상세 정보",
  specs: "사양",
  materialCare: "소재 & 관리",
  quantity: "수량",
  color: "컬러",
  size: "사이즈",
  resultTitle: "로그 확인",
  resultSpreadsheetOk: "스프레드시트에 기록이 완료되었습니다.",
  resultSpreadsheetNg:
    "스프레드시트 기록에 실패했습니다. 담당자에게 문의하거나 잠시 후 다시 시도해 주세요.",
  resultColumns: {
    conditionId: "유형",
    index: "#",
    text: "문구",
    action: "액션",
    dwellMs: "체류(ms)",
    cart: "장바구니",
    back: "뒤로",
    timeout: "타임아웃",
    started: "시작",
    ended: "종료",
  },
  /** 유니클로 상품 페이지 기준 (일본어판과 동등 내용) */
  productName: "에어리즘 코튼 오버사이즈 티셔츠/5부 소매",
  productDesc:
    "겉보기엔 코튼인 「에어리즘」. 땀을 흘려도 산뜻한 촉감. 입는 순간 시원하고, 시원한 착용감. 5부 소매, 오버사이즈, 드롭숄더로 편안한 실루엣. 조금 모인 크루넥으로 깔끔하게 연출할 수 있습니다.",
  productDetailBody:
    "상품 번호: 475355. 게재 이미지에 판매 예정이 아닌 컬러가 포함될 수 있습니다. 기장·가슴둘레 등 치수 정보는 참고용입니다.",
  productSpecsBody:
    "깔끔한 실루엣을 내는 소재. 가볍게 입을 수 있어 이너로도 단품으로도 활용하기 좋습니다.",
  productMaterialCareBody:
    "【소재】면 53%, 폴리에스터 30%, 복합 섬유(폴리에스터) 17% (리사이클 폴리에스터 섬유 30% 사용)\n\n【취급】세탁기 사용 가능, 드라이클리닝 가능, 건조기 사용 불가. 짙은 색은 이염할 수 있으므로 다른 옷과 함께 세탁하지 마세요. 땀이나 비 등으로 젖었을 때, 또는 마찰로 다른 물건에 이염될 수 있으니 주의하세요.",
  colorPink: "12 PINK",
} as const;

export type Messages = typeof ja | typeof ko;

const messages: Record<Language, Messages> = { ja, ko };

export function getMessages(lang: Language): Messages {
  return messages[lang];
}

export function getRegionOptions(lang: Language): { value: Region; label: string }[] {
  if (lang === "ja") {
    return [
      { value: "tokyo", label: ja.regions.tokyo },
      { value: "chiba", label: ja.regions.chiba },
      { value: "kanagawa", label: ja.regions.kanagawa },
      { value: "osaka", label: ja.regions.osaka },
      { value: "other", label: ja.regions.other },
    ];
  }
  return [
    { value: "seoul", label: ko.regions.seoul },
    { value: "gyeonggi", label: ko.regions.gyeonggi },
    { value: "incheon", label: ko.regions.incheon },
    { value: "busan", label: ko.regions.busan },
    { value: "other", label: ko.regions.other },
  ];
}

export const DESIGN_TAG_LIST: DesignTag[] = [
  "simple",
  "mode",
  "classic",
  "casual",
  "street",
  "feminine",
  "sporty",
  "y2k",
];
