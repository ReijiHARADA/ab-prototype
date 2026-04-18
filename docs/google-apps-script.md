# Google スプレッドシートへ自動追記（このプロジェクト用）

**初めて接続するときは**、ゼロからの手順を **[spreadsheet-setup.md](./spreadsheet-setup.md)** にまとめています（GAS デプロイ → `LOG_ENDPOINT` → 動作確認）。

**共有リンクだけ**（`?usp=sharing` など）にした場合の意味と、**横持ち（条件ごとに列ブロック）のシート**用の GAS は **[google-apps-script-wide-sheet.md](./google-apps-script-wide-sheet.md)** を参照してください。

---

次のスプレッドシートの **指定シート（gid）** に、**1 回のログ = 1 行** で追記します。

- スプレッドシート:  
  `https://docs.google.com/spreadsheets/d/1Cr2w3GpVxiqoK9ILBVQ_-6_TdjRnjfQBTHNYWCW4bpk/edit`
- シート ID（`gid` / `sheetId`）: **`1471844174`**

列は **第 1 行 = 英語キー（分析・スクリプト用）**、**第 2 行 = 日本語 / 韓国語の短い説明** として、日韓のどちらの研究者が見ても意味が通じるようにしています。

## アプリ側の設定（推奨）

1. 下の **Google Apps Script** をデプロイし、表示された **ウェブアプリ URL** を控える。
2. Vercel（または `.env.local`）に **`LOG_ENDPOINT`** としてその URL を設定する（**クライアントには出さない**）。
3. フロントは **`/api/log`** に POST し、Next.js が GAS にプロキシします（CORS 回避・URL 非公開）。

任意で **`NEXT_PUBLIC_LOG_ENDPOINT`** に GAS URL を直指定すると、ブラウザから GAS に直接 POST します（CORS の都合で失敗しやすいため、通常は `LOG_ENDPOINT` + `/api/log` を推奨）。

## 列定義（1 行 = 1 レコード）

| # | 英語キー（1 行目） | 日本語 / 한국어（2 行目の意味） |
|---|-------------------|----------------------------------|
| A | received_at_UTC | サーバが行を書き込んだ時刻（UTC） / 서버가 기록한 시각(UTC) |
| B | record_type | `pattern` = 条件1回分、`event` = 補助操作 / 패턴·보조 이벤트 |
| C | session_id | セッション ID / 세션 ID |
| D | ui_language | UI 言語 `ja` \| `ko` / UI 언어 |
| E | condition_index | 0〜7（pattern のみ） / 조건 번호 |
| F | condition_id | 条件種別 ID / 조건 유형 |
| G | social_proof_text | 表示したソーシャルプルーフ文言 / 노출 문구 |
| H | pattern_action | `timeout` \| `back` \| `add_to_cart`（pattern のみ） |
| I | action_detail | 補足（例: view_cart_clicked） |
| J | duration_sec | 滞在秒 / 체류(초) |
| K | duration_ms | 滞在ミリ秒 / 체류(ms) |
| L | selected_size | 選択サイズ / 선택 사이즈 |
| M | selected_color | 選択カラー / 선택 컬러 |
| N | quantity | 数量 / 수량 |
| O | pattern_started_at | パターン開始（ISO） / 패턴 시작 |
| P | pattern_ended_at | パターン終了（ISO） / 패턴 종료 |
| Q | user_info_json | 回答者属性の JSON / 응답자 속성 JSON |
| R | product_id | 固定商品 ID / 상품 ID |
| S | event_name | 補助イベント名（event のみ） |
| T | event_value | 補助イベント値（event のみ） |
| U | event_client_time | クライアント発生時刻 ISO（event のみ） |

- **pattern** 行: `S`〜`U` は空にします。  
- **event** 行: `E`〜`R` のうち該当しないものは空にします。

## Google Apps Script（コピペ用）

スプレッドシートから **拡張機能 → Apps Script** で新規プロジェクトを作り、次を貼り付けてデプロイしてください。

```javascript
/** スプレッドシート URL の /d/ と /edit の間 */
var SPREADSHEET_ID = "1Cr2w3GpVxiqoK9ILBVQ_-6_TdjRnjfQBTHNYWCW4bpk";

/** ブラウザ URL の gid= の数値＝シート ID */
var SHEET_GID = 1471844174;

var NUM_COLS = 21;

var HEADERS_EN = [
  "received_at_UTC",
  "record_type",
  "session_id",
  "ui_language",
  "condition_index",
  "condition_id",
  "social_proof_text",
  "pattern_action",
  "action_detail",
  "duration_sec",
  "duration_ms",
  "selected_size",
  "selected_color",
  "quantity",
  "pattern_started_at",
  "pattern_ended_at",
  "user_info_json",
  "product_id",
  "event_name",
  "event_value",
  "event_client_time"
];

/** 分析者向け: JA / KO が並んだ説明行 */
var HEADERS_I18N = [
  "UTC受信 / UTC수신",
  "pattern=1条件 event=補助 / pattern|보조",
  "session / 세션",
  "UI言語 ja|ko / UI 언어",
  "条件番号0-7 / 조건#",
  "条件ID / 조건 ID",
  "表示文言 / 노출 문구",
  "timeout|back|add_to_cart",
  "詳細 / 상세",
  "滞在(秒) / 체류(초)",
  "滞在(ms) / 체류(ms)",
  "size / 사이즈",
  "color / 컬러",
  "数量 / 수량",
  "パターン開始ISO / 시작",
  "パターン終了ISO / 종료",
  "ユーザーJSON / 사용자JSON",
  "商品ID / 상품ID",
  "イベント名 / 이벤트",
  "イベント値 / 값",
  "イベント時刻 / 시각"
];

function getLogSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetById(SHEET_GID);
  if (!sheet) {
    throw new Error("Sheet gid not found: " + SHEET_GID);
  }
  return sheet;
}

function ensureHeaders(sheet) {
  /** 既に何か行があるとヘッダ自動作成はスキップ。列順は appendRow と 1 行目を一致させること */
  if (sheet.getLastRow() > 0) {
    return;
  }
  sheet.getRange(1, 1, 1, NUM_COLS).setValues([HEADERS_EN]);
  sheet.getRange(2, 1, 2, NUM_COLS).setValues([HEADERS_I18N]);
  sheet.setFrozenRows(2);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getLogSheet();
    ensureHeaders(sheet);

    var now = new Date();
    if (data.type === "pattern") {
      sheet.appendRow([
        now,
        "pattern",
        data.sessionId || "",
        data.language || "",
        data.conditionIndex != null ? data.conditionIndex : "",
        data.conditionId || "",
        data.socialProofText || "",
        data.action || "",
        data.actionDetail || "",
        data.durationSec != null ? data.durationSec : "",
        data.durationMs != null ? data.durationMs : "",
        data.selectedSize || "",
        data.selectedColor || "",
        data.quantity != null ? data.quantity : "",
        data.startedAt || "",
        data.endedAt || "",
        data.userInfo ? JSON.stringify(data.userInfo) : "",
        data.productId || "",
        "",
        "",
        ""
      ]);
    } else if (data.type === "event") {
      sheet.appendRow([
        now,
        "event",
        data.sessionId || "",
        data.language || "",
        "",
        data.conditionId || "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        data.eventName || "",
        data.eventValue || "",
        data.timestamp || ""
      ]);
    } else {
      return jsonOut({ ok: false, error: "unknown type" });
    }
    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function jsonOut(obj) {
  var out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}
```

### デプロイ

1. **デプロイ → 新しいデプロイ** → 種類: **ウェブアプリ**  
2. 次のユーザーとして実行: **自分**  
3. アクセスできるユーザー: **全員**（※ URL を知っている人が POST できるので、運用では URL を秘密にする）  
4. 発行された URL を **`LOG_ENDPOINT`** に設定する。

### 失敗時

アプリは送信に失敗したログを **localStorage** に保存します（`lib/logger.ts`）。
