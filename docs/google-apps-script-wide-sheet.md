# 横持ちシート（「AB log-data」形式）向け Google Apps Script

あなたのスプレッドシートは、次のような **1 行目・2 行目がヘッダ**で、**条件種別（`none` / `sales_volume` / …）ごとに列が横に並ぶ**レイアウトです（共有でいただいた表のイメージ）。

- アプリが送る JSON は **変更しなくてよい**（従来どおり `type: "pattern"` など）。**GAS だけ**を、この列配置に合わせます。

## 共有リンク `?usp=sharing` について

- **ブラウザでシートを開く・共同編集する**用途として問題ありません。  
- **プログラムからの書き込み**は、Google Apps Script を **ウェブアプリとしてデプロイした Google アカウント**の権限で行います。リンクを知っているだけの人が勝手に API で書き込めるわけではなく、**デプロイ時の実行ユーザー**がブックにアクセスできればよいです。  
- スクリプトをデプロイするアカウントに、当該スプレッドシートの **編集権限** があることを確認してください。

## 列の前提（1〜2 行目ヘッダ）

| 列 | 内容 |
|----|------|
| A | Number（通し番号） |
| B | Time（記録時刻など） |
| C | patern（ここには `conditionId` を書き込みます） |
| D 〜 | `none` / `sales_volume` / `design_preference` / `body_type` / `region_based` / `age_based` / `gender_based` / `realtime_behavior` の **8 ブロック**（各ブロック 8 列） |

各ブロックの列（2 行目ラベルの想定）:

1. 表示文言 ← `socialProofText`  
2. アクション ← `action`  
3. 滞在(秒) ← `durationSec`  
4. カート ← `add_to_cart` のとき `○`  
5. 戻る ← `back` のとき `○`  
6. タイムアウト ← `timeout` のとき `○`  
7. 開始 ← `startedAt`  
8. 終了 ← `endedAt`  

**1 回の実験パターン（POST 1 回）= スプレッドシートの 1 行**。該当する **条件ブロックの 8 列だけ**値を入れ、他ブロックは空です。

## 定数（シート ID / gid）

ドキュメント全体の既定と同じです。

```javascript
var SPREADSHEET_ID = "1Cr2w3GpVxiqoK9ILBVQ_-6_TdjRnjfQBTHNYWCW4bpk";
var SHEET_GID = 1471844174;
/** ヘッダ行数（データはその次の行から） */
var HEADER_ROWS = 2;
```

## コピペ用スクリプト（`doPost`）

既存の `Code.gs` を次で**置き換え**てください（**横持ち専用**です）。

```javascript
var SPREADSHEET_ID = "1Cr2w3GpVxiqoK9ILBVQ_-6_TdjRnjfQBTHNYWCW4bpk";
var SHEET_GID = 1471844174;
var HEADER_ROWS = 2;

/** 1 行目の条件列の並び（D 列から左からこの順） */
var CONDITION_BLOCK_ORDER = [
  "none",
  "sales_volume",
  "design_preference",
  "body_type",
  "region_based",
  "age_based",
  "gender_based",
  "realtime_behavior"
];

var SUBCOLS = 8;
/** A〜C + 条件ブロック */
var TOTAL_COLS = 3 + CONDITION_BLOCK_ORDER.length * SUBCOLS;

function getLogSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetById(SHEET_GID);
  if (!sh) throw new Error("Sheet not found: gid=" + SHEET_GID);
  return sh;
}

function jsonOut(obj) {
  var out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getLogSheet();

    if (data.type === "event") {
      /** 横持ちシートでは event を行に出さない例（必要なら別シートに追記） */
      return jsonOut({ ok: true, skipped: "event" });
    }

    if (data.type !== "pattern") {
      return jsonOut({ ok: false, error: "unknown type" });
    }

    var cid = data.conditionId || "";
    var blockIdx = CONDITION_BLOCK_ORDER.indexOf(cid);
    if (blockIdx < 0) {
      blockIdx = 0;
    }

    var row = [];
    for (var c = 0; c < TOTAL_COLS; c++) row.push("");

    var lr = sheet.getLastRow();
    var serial = Math.max(0, lr - HEADER_ROWS) + 1;
    row[0] = serial;
    row[1] = new Date();
    row[2] = cid;

    var start = 3 + blockIdx * SUBCOLS;
    row[start] = data.socialProofText || "";
    row[start + 1] = data.action || "";
    row[start + 2] = data.durationSec != null ? data.durationSec : "";
    row[start + 3] = data.action === "add_to_cart" ? "\u25cb" : "";
    row[start + 4] = data.action === "back" ? "\u25cb" : "";
    row[start + 5] = data.action === "timeout" ? "\u25cb" : "";
    row[start + 6] = data.startedAt || "";
    row[start + 7] = data.endedAt || "";

    sheet.appendRow(row);
    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}
```

### 注意

- **1〜2 行目に既にヘッダ**がある前提です。`appendRow` は **最終行の次**に追加されます。  
- Excel で列を挿入して **列位置がずれた場合**は、`CONDITION_BLOCK_ORDER` や `SUBCOLS`、`start` の計算をシートに合わせて修正してください。  
- **マージセル**があると `appendRow` の列ずれの原因になります。トラブル時はマージを外すか、列番号を実測して `start` を調整してください。

## デプロイ後

[spreadsheet-setup.md](./spreadsheet-setup.md) と同じく、ウェブアプリ URL を **`LOG_ENDPOINT`**（Vercel）に設定します。
