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
      "selectedColor": "PINK",
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
2. そのシートに `appendRow` で **1 行分の配列**を書く（列順は下の例か、`lib/csv.ts` の `participantSessionsToCsv` と揃える）。

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
 * sheetTab に応じて jp / kr シートを選び、1 行追加する
 */
function appendParticipantSession(body) {
  var tabName = body.sheetTab === "kr" ? "kr" : "jp";
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    throw new Error("シートが見つかりません: " + tabName + "（タブ名を jp / kr にしてください）");
  }

  var row = buildParticipantRow(body);
  sheet.appendRow(row);
}

/**
 * アプリの CSV（participantSessionsToCsv）と同じ列順の 1 行配列を作る
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
  for (var r = 0; r < 3; r++) {
    var round = rounds[r];
    if (!round) {
      for (var i = 0; i < 9 + INTERACTION_KEYS.length; i++) {
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
      round.selectedColor,
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
| 5 | `appendRow(列の配列)` で 1 行追加 |

### ヘッダ行を自動で入れたい場合

最初の 1 行目の列名を、`lib/csv.ts` の `participantSessionsToCsv` のヘッダと同じ順に並べ、`sheet.getLastRow() === 0` のときだけ `appendRow(headers)` する、といった処理を `appendParticipantSession` の前に足せます。  
`buildParticipantRow` の先頭に `new Date()` を入れている場合は、ヘッダの 1 列目を `received_at_UTC` などに合わせてください。

---

## デプロイ後の確認

1. Vercel の **`LOG_ENDPOINT`** に、この GAS の **ウェブアプリ URL**（`/exec` で終わるもの）を設定する。  
2. アプリで実験を最後まで完了し、`jp` または `kr` を開いて行が増えているか確認する。

列定義は **`lib/csv.ts` の `participantSessionsToCsv`** と揃えると、CSV ダウンロードと見比べやすいです。
