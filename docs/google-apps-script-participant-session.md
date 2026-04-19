# 1参加者1行（`participantSession`）のスプレッドシート連携

アプリは **3条件すべて完了したとき** に、次の形の JSON を **`/api/log` 経由で GAS に POST** します。

## ペイロードの要点

- **`type`**: 常に `"participantSession"`
- **`language`**: UI 言語 `"ja"` | `"ko"`
- **`sheetTab`**: **`"jp"`**（日本語を選んだ参加者）または **`"kr"`**（韓国語を選んだ参加者）— **スプレッドシート上のシート名（タブ名）と一致させる**
- **`rounds`**: 長さ 3 の配列。各要素が 1 回の商品詳細（条件）の結果

## スプレッドシートの準備

スプレッドシートのブック内に、次の **2 つのシート（タブ）** を作成してください。

| シート名（タブ名） | 用途 |
|-------------------|------|
| **`jp`** | 日本語 UI のログ |
| **`kr`** | 韓国語 UI のログ |

※ 左から何番目かは不問。**タブ名が正確に `jp` と `kr`** であることが必要です。

**行の意味（下の GAS 例どおり）**

| 行 | 内容 |
|----|------|
| **1 行目** | 列ヘッダ（**`jp` シートは日本語、`kr` シートは韓国語**。条件ブロックは**常に「何もなし → デザインの好み → 体型」**の順。`lib/participantSessionHeaders.ts` の `getParticipantSessionCsvHeaders` と同じ順・同じ文言） |
| **2 行目以降** | 参加者データ（`appendRow` で 1 行ずつ追加） |

シートが空のときは、下記スクリプトが **初回の追記前に 1 行目へヘッダを自動で書き込み**ます。手動で 1 行目にヘッダを入れても構いません（その場合は `getLastRow() >= 1` のため、ヘッダの二重追加はされません）。

---

## GAS に届くデータ（POST の中身）

Next.js の `/api/log` が、そのまま JSON 文字列を GAS の `doPost` に転送します。`e.postData.contents` を `JSON.parse` すると、おおよそ次のオブジェクトになります（`rounds` は 3 要素）。

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
      "durationSec": 12,
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

## `doPost` で `sheetTab` によりシートを切り替える（具体例）

**やることは次の 2 点だけです。**

1. `body.sheetTab` が `"jp"` ならシート `jp`、`"kr"` ならシート `kr` を `getSheetByName` で取得する。  
2. シートが **完全に空**（`getLastRow() === 0`）なら、**1 行目にヘッダ行**を書く（**タブが `jp` なら日本語列名、`kr` なら韓国語列名**。`lib/participantSessionHeaders.ts` の `getParticipantSessionCsvHeaders` と一致させる）。  
3. そのあと `appendRow` で **データ行**を追加する。各条件の列は **常に `none` → `design_preference` → `body_type`** の順（`rounds` の訪問順ではなく `conditionId` で対応付け）。`selectedColor` は含めない。

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
var CANONICAL_CONDITION_ORDER = ["none", "design_preference", "body_type"];

/**
 * 列ヘッダ 1 行分。tabName が "kr" のとき韓国語、それ以外は日本語。
 * 条件ブロックは「何もなし → デザインの好み → 体型」（表示パターンの訪問順ではない）。
 * lib/participantSessionHeaders.ts の getParticipantSessionCsvHeaders と文言を揃えること。
 */
function buildParticipantSessionHeadersForTab(tabName) {
  var isKo = tabName === "kr";
  var headers = [];
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

  var blockJa = ["何もなし", "デザインの好み", "体型"];
  var blockKo = ["없음", "디자인 선호", "체형"];

  var roundFieldJa = [
    "条件ID",
    "ソーシャルプルーフ文言",
    "アクション",
    "滞在秒",
    "選択サイズ",
    "数量",
    "開始日時",
    "終了日時",
  ];
  var roundFieldKo = [
    "조건 ID",
    "소셜 프루프 문구",
    "액션",
    "체류(초)",
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

  for (var b = 0; b < 3; b++) {
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
 * シートが空のときだけ 1 行目にヘッダを書く（jp=日本語 / kr=韓国語）
 */
function ensureParticipantSessionHeaderRow(sheet, tabName) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(buildParticipantSessionHeadersForTab(tabName));
  }
}

/**
 * sheetTab に応じて jp / kr シートを選び、ヘッダ（初回のみ）＋データ 1 行を追加する
 */
function appendParticipantSession(body) {
  var tabName = body.sheetTab === "kr" ? "kr" : "jp";
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    throw new Error("シートが見つかりません: " + tabName + "（タブ名を jp / kr にしてください）");
  }

  ensureParticipantSessionHeaderRow(sheet, tabName);
  var row = buildParticipantRow(body);
  sheet.appendRow(row);
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

function buildParticipantRow(body) {
  var row = [
    body.sessionId,
    body.language,
    body.sheetTab,
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
      round.durationSec,
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
| 3 | `body.sheetTab` を見る。`"kr"` ならシート名 **`kr`**、それ以外（通常は `"jp"`）なら **`jp`** |
| 4 | `SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(tabName)` でシート取得 |
| 5 | **`getLastRow() === 0` なら** `buildParticipantSessionHeadersForTab(tabName)` を `appendRow` し、**1 行目をヘッダにする**（`jp`＝日本語、`kr`＝韓国語） |
| 6 | `buildParticipantRow(body)` を `appendRow` し、**2 行目以降にデータを追加** |

---

## デプロイ後の確認

1. Vercel の **`LOG_ENDPOINT`** に、この GAS の **ウェブアプリ URL**（`/exec` で終わるもの）を設定する。  
2. アプリで実験を最後まで完了し、`jp` または `kr` を開いて行が増えているか確認する。

表示列名は **`lib/participantSessionHeaders.ts` の `getParticipantSessionCsvHeaders`**（`jp`/`kr` に対応）、データ列の並びは **`lib/csv.ts` の `participantSessionsToCsv`** と揃えると、CSV ダウンロードと見比べやすいです。
