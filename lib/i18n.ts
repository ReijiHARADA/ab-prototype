import type {
  AgeGroup,
  BodyTypeKey,
  DesignTag,
  Gender,
  Language,
  Region,
} from "@/types/experiment";

const ja = {
  appTitle: "商品詳細（実験）",
  languageTitle: "言語を選択してください",
  languageJa: "日本語",
  languageKo: "한국어",
  userInfoTitle: "基本情報",
  userInfoSubmit: "次へ",
  surveyPromptTitle: "Googleフォーム",
  surveyPromptBody:
    "続けるには、Google formのアンケートに回答してください。",
  surveyPromptCta: "次の画面へ",
  productHeroCarouselAria: "商品画像（横にスワイプ）",
  ageLabel: "年齢層",
  genderLabel: "性別",
  regionLabel: "居住地域",
  designLabel: "デザインの好み（複数選択可）",
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
    monotone: "モノトーン",
    minimal: "ミニマル",
    casual: "カジュアル",
    clean: "きれいめ",
    street: "ストリート",
    luxury: "ラグジュアリー",
    basic: "ベーシック",
    trendy: "トレンド感",
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
  bodyTypeYourType: (label: string) =>
    `あなたの体型タイプは「${label}」です。`,
  viewProduct: "商品を見る",
  productInStock: "在庫あり",
  productPrice: "¥1,990",
  addToCart: "カートに入れる",
  addToFavorites: "お気に入りに追加",
  storeStock: "店舗在庫状況",
  aboutProduct: "この商品について",
  details: "詳細",
  specs: "仕様",
  materialCare: "素材・お手入れ",
  quantity: "数量",
  color: "カラー",
  size: "サイズ",
  resultTitle: "ログ確認",
  resultDownloadCsv: "CSVをダウンロード",
  resultLocalTitle: "localStorageに保存されたログ",
  resultSummaryTitle: "集計",
  resultColumns: {
    conditionId: "種別",
    index: "#",
    text: "表示文言",
    action: "アクション",
    dwellSec: "滞在(秒)",
    cart: "カート",
    back: "戻る",
    timeout: "タイムアウト",
    started: "開始",
    ended: "終了",
  },
  summaryDwell: "各パターンの滞在時間（秒）",
  summaryCart: "カート追加されたパターン",
  summaryBack: "戻るが押されたパターン",
  summaryTimeout: "タイムアウトしたパターン",
  /** ユニクロ商品ページに準拠: https://www.uniqlo.com/jp/ja/products/E465185-000/01 */
  productName: "エアリズムコットンオーバーサイズTシャツ/5分袖",
  productBadge: "ベストセラー",
  productDesc:
    "見た目コットンの「エアリズム」。汗をかいてもサラッとした肌ざわり。着た瞬間にひんやりとして、涼しい着心地。5分袖、オーバーサイズ、ドロップショルダーでリラックス感のある着心地。やや詰まったクルーネックでクリーンに着こなせる。",
  productDetailBody:
    "商品番号: 475355。掲載画像には販売予定にないカラーが含まれている場合があります。着丈・身幅などの採寸情報は参考値です。",
  productSpecsBody:
    "きれいなシルエットに仕上がる素材。XS・XXL・3XL・4XLサイズは、オンラインストアのみでの取り扱いとなります。",
  productMaterialCareBody:
    "【素材】53% 綿、30% ポリエステル、17% 複合繊維（ポリエステル）（30% リサイクルポリエステル繊維を使用）\n\n【取扱い】洗濯機可、ドライクリーニング可、乾燥機不可。濃色は色落ちする事がありますので、他の物とのお洗濯はお避け下さい。汗や雨等で湿った状態、または摩擦によって、他の物に色移りする事がありますので、ご注意下さい。",
  colorPink: "12 PINK",
} as const;

const ko = {
  appTitle: "상품 상세 (실험)",
  languageTitle: "언어를 선택하세요",
  languageJa: "日本語",
  languageKo: "한국어",
  userInfoTitle: "기본 정보",
  userInfoSubmit: "다음",
  surveyPromptTitle: "Google Form",
  surveyPromptBody:
    "계속하려면 Google Form 설문에 응답해 주세요.",
  surveyPromptCta: "다음 화면으로",
  productHeroCarouselAria: "상품 이미지(가로로 스와이프)",
  ageLabel: "연령대",
  genderLabel: "성별",
  regionLabel: "거주 지역",
  designLabel: "디자인 취향 (복수 선택)",
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
    monotone: "모노톤",
    minimal: "미니멀",
    casual: "캐주얼",
    clean: "클린",
    street: "스트리트",
    luxury: "럭셔리",
    basic: "베이직",
    trendy: "트렌디",
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
  bodyTypeYourType: (label: string) =>
    `당신의 체형 타입은 "${label}"입니다.`,
  viewProduct: "상품 보기",
  productInStock: "재고 있음",
  productPrice: "₩19,900",
  addToCart: "장바구니에 담기",
  addToFavorites: "찜하기",
  storeStock: "매장 재고",
  aboutProduct: "이 상품에 대해",
  details: "상세 정보",
  specs: "사양",
  materialCare: "소재 & 관리",
  quantity: "수량",
  color: "컬러",
  size: "사이즈",
  resultTitle: "로그 확인",
  resultDownloadCsv: "CSV 다운로드",
  resultLocalTitle: "localStorage에 저장된 로그",
  resultSummaryTitle: "요약",
  resultColumns: {
    conditionId: "유형",
    index: "#",
    text: "문구",
    action: "액션",
    dwellSec: "체류(초)",
    cart: "장바구니",
    back: "뒤로",
    timeout: "타임아웃",
    started: "시작",
    ended: "종료",
  },
  summaryDwell: "패턴별 체류 시간(초)",
  summaryCart: "장바구니에 담긴 패턴",
  summaryBack: "뒤로가기가 눌린 패턴",
  summaryTimeout: "타임아웃한 패턴",
  /** 유니클로 상품 페이지 기준 (일본어판과 동등 내용) */
  productName: "에어리즘 코튼 오버사이즈 티셔츠/5부 소매",
  productBadge: "베스트셀러",
  productDesc:
    "겉보기엔 코튼인 「에어리즘」. 땀을 흘려도 산뜻한 촉감. 입는 순간 시원하고, 시원한 착용감. 5부 소매, 오버사이즈, 드롭숄더로 편안한 실루엣. 조금 모인 크루넥으로 깔끔하게 연출할 수 있습니다.",
  productDetailBody:
    "상품 번호: 475355. 게재 이미지에 판매 예정이 아닌 컬러가 포함될 수 있습니다. 기장·가슴둘레 등 치수 정보는 참고용입니다.",
  productSpecsBody:
    "깔끔한 실루엣을 내는 소재. XS·XXL·3XL·4XL 사이즈는 온라인 스토어에서만 취급합니다.",
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
  "monotone",
  "minimal",
  "casual",
  "clean",
  "street",
  "luxury",
  "basic",
  "trendy",
];
