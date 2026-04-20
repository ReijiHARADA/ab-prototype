# 1参加者1行（`participantSession`）のスプレッドシート連携

アプリは **4回分（4条件）すべて完了したとき** に、次の形の JSON を **`/api/log` 経由で GAS に POST** します。

## ペイロードの要点

- **`type`**: 常に `"participantSession"`
- **`language`**: UI 言語 `"ja"` | `"ko"`
- **`sheetTab`**: **`"jp"`**（日本語）または **`"ko"`**（韓国語）— **スプレッドシートのタブ名と一致**（GAS は `ko` が無いとき **`kr`** にフォールバック可）
- **`rounds`**: 長さ 4 の配列。各要素が 1 回の商品詳細（条件）の結果

## スプレッドシートの準備

スプレッドシートのブック内に、次の **2 つのシート（タブ）** を作成してください。

| シート名（タブ名） | 用途 |
|-------------------|------|
| **`jp`** | 日本語 UI のログ |
| **`ko`** | 韓国語 UI のログ（旧名 **`kr`** でも GAS がフォールバック） |

※ 左から何番目かは不問。**タブ名は `jp` と `ko`**（既存の **`kr`** のみのブックは GAS の `getSheetForParticipantLog` で吸収）。

**行の意味（下の GAS 例どおり）**

| 行 | 内容 |
|----|------|
| **1 行目** | **英語キー**（`serial`, `sessionId`, … — `lib/participantSessionHeaders.ts` の `getParticipantSessionCsvHeadersEnglish` と同じ順） |
| **2 行目** | **`jp` シートは日本語、`ko` シートは韓国語**の見出し（`getParticipantSessionCsvHeaders` と同じ順・文言） |
| **3 行目以降** | 参加者データ（**A 列は通し番号** `serial`、GAS が自動採番） |

シートが空のときは、下記スクリプトが **1〜2 行目に英語ヘッダ→言語ヘッダ**を書き込みます。既に行がある場合はヘッダを追加しません（`getLastRow() === 0` のときのみ）。

---

## GAS に届くデータ（POST の中身）

Next.js の `/api/log` が、そのまま JSON 文字列を GAS の `doPost` に転送します。`e.postData.contents` を `JSON.parse` すると、おおよそ次のオブジェクトになります（`rounds` は 4 要素）。

```json
{
  "type": "participantSession",
  "sessionId": "uuid…",
  "language": "ja",
  "sheetTab": "jp",
  "sequencePattern": 1,
  "experimentStartedAt": "2026-01-01T00:00:00.000Z",
  "ageGroup": "20代",
  "gender": "男性",
  "region": "東京都",
  "designTagsJoined": "シンプル、カジュアル",
  "height": 170,
  "weight": 65,
  "bmi": 22.5,
  "bodyType": "スタンダード",
  "rounds": [
    {
      "conditionIndex": 0,
      "conditionId": "none",
      "socialProofText": "",
      "action": "add_to_cart",
      "durationMs": 12000,
      "selectedSize": "M",
      "quantity": 1,
      "startedAt": "…",
      "endedAt": "…"
    }
  ]
}
```

---

## `doPost` で `language` によりシートを切り替える（具体例）

**ポイント**

1. **記録先タブ**は **`body.language` を正**とする（`"ko"` → シート名 **`ko`**、それ以外 → **`jp`**）。`sheetTab` と食い違う場合は **`language` 優先**（Next.js の `/api/log` でも同様）。  
2. シートが **完全に空**（`getLastRow() === 0`）なら、**1 行目＝英語キー**、**2 行目＝`jp` なら日本語 / `ko` なら韓国語**のヘッダを書く（`lib/participantSessionHeaders.ts` と一致）。  
3. `appendRow` で **データ行**を追加する。**A 列（`serial`）は** `getLastRow() - 2` から算出した **通し番号**。各条件の列は **常に `none` → `sales_volume` → `design_preference` → `body_type`** の順。

```javascript
/**
 * スプレッドシートの URL の /d/ と /edit の間の ID に置き換える
 */
var SPREADSHEET_ID = "ここにスプレッドシートID";

/**
 * Web アプリとして POST されたときに実行される
 */
function doPost(e) {
  if (!e.postData || !e.postData.contents) {
    return jsonResponse({ ok: false, error: "no body" });
  }

  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, error: "invalid json" });
  }

  if (body.type === "participantSession") {
    try {
      appendParticipantSession(body);
      return jsonResponse({ ok: true });
    } catch (err) {
      return jsonResponse({ ok: false, error: String(err) });
    }
  }

  // ほかの type（event など）を扱う場合はここに分岐
  return jsonResponse({ ok: false, error: "unknown type" });
}

/**
 * 1 条件あたりの操作回数キー（lib/productInteractions.ts の INTERACTION_COUNT_KEYS と同じ順）
 */
var INTERACTION_KEYS = [
  "accordion_about",
  "accordion_detail",
  "accordion_spec",
  "accordion_care",
  "favorite_toggle",
  "quantity_plus",
  "quantity_minus",
  "tap_add_to_cart",
];

/**
 * データ列の条件ブロック順（lib/experiment.ts の CANONICAL_CONDITION_ORDER と同じ）
 */
var CANONICAL_CONDITION_ORDER = [
  "none",
  "sales_volume",
  "design_preference",
  "body_type",
];

/** ヘッダ行数（1 行目=英語、2 行目=言語別） */
var HEADER_ROWS = 2;

/**
 * 記録先シート名。body.language を正とする（"ko" → "ko"、それ以外 → "jp"）
 */
function getSheetTabName(body) {
  return body.language === "ko" ? "ko" : "jp";
}

/**
 * タブ取得。韓国語は **`ko` を優先**し、無ければ旧名 **`kr`** を試す。
 */
function getSheetForParticipantLog(ss, tabName) {
  var sh = ss.getSheetByName(tabName);
  if (sh) return sh;
  if (tabName === "ko") {
    sh = ss.getSheetByName("kr");
    if (sh) return sh;
  }
  if (tabName === "kr") {
    sh = ss.getSheetByName("ko");
    if (sh) return sh;
  }
  return null;
}

/**
 * 1 行目: 英語キー（lib/participantSessionHeaders.ts の PARTICIPANT_SESSION_COLUMN_KEYS と同じ順）
 */
function buildParticipantSessionHeadersEnglish() {
  var headers = [
    "serial",
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
  ];
  var roundFields = [
    "conditionId",
    "socialProofText",
    "action",
    "durationMs",
    "selectedSize",
    "quantity",
    "startedAt",
    "endedAt",
  ];
  for (var r = 0; r < CANONICAL_CONDITION_ORDER.length; r++) {
    var cid = CANONICAL_CONDITION_ORDER[r];
    for (var i = 0; i < roundFields.length; i++) {
      headers.push(cid + "_" + roundFields[i]);
    }
    for (var j = 0; j < INTERACTION_KEYS.length; j++) {
      headers.push(cid + "_" + INTERACTION_KEYS[j]);
    }
  }
  return headers;
}

/**
 * 2 行目: tabName が "ko" または "kr" なら韓国語、それ以外は日本語。
 * lib/participantSessionHeaders.ts の getParticipantSessionCsvHeaders と文言を揃えること。
 */
function buildParticipantSessionHeadersLocalized(tabName) {
  var isKo = tabName === "ko" || tabName === "kr";
  var headers = [];
  headers.push(isKo ? "연번" : "通し番号");
  if (!isKo) {
    headers.push(
      "セッションID",
      "言語",
      "記録シート",
      "表示順パターン",
      "実験開始日時",
      "デザイン好み",
      "身長_cm",
      "体重_kg",
      "BMI",
      "体型"
    );
  } else {
    headers.push(
      "세션 ID",
      "언어",
      "기록 시트",
      "표시 순서 패턴",
      "실험 시작 시각",
      "디자인 선호",
      "키_cm",
      "체중_kg",
      "BMI",
      "체형"
    );
  }

  var blockJa = ["何もなし", "販売量", "デザインの好み", "体型"];
  var blockKo = ["없음", "판매량", "디자인 선호", "체형"];

  var roundFieldJa = [
    "条件ID",
    "ソーシャルプルーフ文言",
    "アクション",
    "滞在ミリ秒",
    "選択サイズ",
    "数量",
    "開始日時",
    "終了日時",
  ];
  var roundFieldKo = [
    "조건 ID",
    "소셜 프루프 문구",
    "액션",
    "체류(ms)",
    "선택 사이즈",
    "수량",
    "시작 시각",
    "종료 시각",
  ];
  var interactionJa = [
    "アコーディオン_概要",
    "アコーディオン_詳細",
    "アコーディオン_仕様",
    "アコーディオン_お手入れ",
    "お気に入り",
    "数量プラス",
    "数量マイナス",
    "カートに追加",
  ];
  var interactionKo = [
    "아코디언_개요",
    "아코디언_상세",
    "아코디언_사양",
    "아코디언_관리",
    "즐겨찾기",
    "수량+",
    "수량-",
    "장바구니 담기",
  ];

  for (var b = 0; b < CANONICAL_CONDITION_ORDER.length; b++) {
    var prefix = isKo ? blockKo[b] : blockJa[b];
    var rf = isKo ? roundFieldKo : roundFieldJa;
    var ig = isKo ? interactionKo : interactionJa;
    for (var i = 0; i < rf.length; i++) {
      headers.push(prefix + "_" + rf[i]);
    }
    for (var j = 0; j < ig.length; j++) {
      headers.push(prefix + "_" + ig[j]);
    }
  }
  return headers;
}

/**
 * シートが空のときだけ 1〜2 行目に英語ヘッダ→言語ヘッダを書く
 */
function ensureParticipantSessionHeaderRows(sheet, tabName) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(buildParticipantSessionHeadersEnglish());
    sheet.appendRow(buildParticipantSessionHeadersLocalized(tabName));
  }
}

/**
 * language に応じて jp / ko シートを選び、ヘッダ（初回のみ）＋データ 1 行を追加する
 */
function appendParticipantSession(body) {
  var tabName = getSheetTabName(body);
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = getSheetForParticipantLog(ss, tabName);
  if (!sheet) {
    throw new Error(
      "シートが見つかりません: " +
        tabName +
        "（`ko` または旧名 `kr` のいずれかを用意してください。jp も必要です）"
    );
  }

  ensureParticipantSessionHeaderRows(sheet, tabName);
  var serial = Math.max(0, sheet.getLastRow() - HEADER_ROWS) + 1;
  var row = buildParticipantRow(body, tabName);
  sheet.appendRow([serial].concat(row));
}

/**
 * アプリの CSV（participantSessionsToCsv）と同じ列順の 1 行配列を作る
 */

function pickRoundByCondition(rounds, conditionId) {
  for (var i = 0; i < rounds.length; i++) {
    if (rounds[i].conditionId === conditionId) {
      return rounds[i];
    }
  }
  return null;
}

function buildParticipantRow(body, tabName) {
  var row = [
    body.sessionId,
    body.language,
    tabName,
    body.sequencePattern,
    body.experimentStartedAt || "",
    body.designTagsJoined,
    body.height,
    body.weight,
    body.bmi,
    body.bodyType,
  ];

  var rounds = body.rounds || [];
  for (var c = 0; c < CANONICAL_CONDITION_ORDER.length; c++) {
    var round = pickRoundByCondition(rounds, CANONICAL_CONDITION_ORDER[c]);
    if (!round) {
      for (var i = 0; i < 8 + INTERACTION_KEYS.length; i++) {
        row.push("");
      }
      continue;
    }
    row.push(
      round.conditionId,
      round.socialProofText,
      round.action,
      round.durationMs != null ? round.durationMs : "",
      round.selectedSize,
      round.quantity,
      round.startedAt,
      round.endedAt
    );
    var ic = round.interactionCounts || {};
    for (var j = 0; j < INTERACTION_KEYS.length; j++) {
      var key = INTERACTION_KEYS[j];
      row.push(ic[key] != null ? ic[key] : 0);
    }
  }

  return row;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
```

### 動作の整理

| 手順 | 内容 |
|------|------|
| 1 | `e.postData.contents` を `JSON.parse` する |
| 2 | `body.type === "participantSession"` なら記録処理へ |
| 3 | **`body.language === "ko"`** ならシート **`ko`**（無ければ **`kr`**）、**`"ja"`** なら **`jp`**（`getSheetTabName` + `getSheetForParticipantLog`） |
| 4 | `SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(tabName)` でシート取得 |
| 5 | **`getLastRow() === 0` なら** 1 行目に英語キー、2 行目に言語別ヘッダを `appendRow` |
| 6 | 通し番号 `serial` を付け、`buildParticipantRow(body, tabName)` の結果の **先頭に `serial` を結合**して **3 行目以降**にデータを追加 |

---

## デプロイ後の確認

1. Vercel の **`LOG_ENDPOINT`** に、この GAS の **ウェブアプリ URL**（`/exec` で終わるもの）を設定する。  
2. アプリで実験を最後まで完了し、`jp` または `ko`（または旧 `kr`）を開いて行が増えているか確認する。

**1 行目**は **`getParticipantSessionCsvHeadersEnglish`**、**2 行目**は **`getParticipantSessionCsvHeaders`**（`jp`/`ko` に対応）、データの並びは **`lib/csv.ts` の `participantSessionsToCsv`** と揃えると、CSV ダウンロードと見比べやすいです。
