# 1参加者1行（`participantSession`）のスプレッドシート連携

アプリは **3条件すべて完了したとき** に、次の形の JSON を **`/api/log` 経由で GAS に POST** します（パターンごとの `type: "pattern"` 送信は行いません）。

## ペイロードの要点

- **`type`**: 常に `"participantSession"`
- **`spreadsheetTarget`**: `"ja"` または `"ko"` — **日本語 UI / 韓国語 UI に応じて記録先シートを切り替える**ときに使います（`language` と同じ値）
- **`rounds`**: 長さ 3 の配列。各要素が 1 回の商品詳細（条件）の結果

## GAS の例（シートを言語で分ける）

```javascript
function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  if (body.type === "participantSession") {
    var sheet =
      body.spreadsheetTarget === "ko"
        ? SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("KO")
        : SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("JA");
    // フラットな配列にして appendRow する場合は、クライアントの CSV と同じ列順に合わせる
    sheet.appendRow([
      new Date(),
      body.sessionId,
      body.spreadsheetTarget,
      body.sequencePattern,
      // … rounds など
    ]);
    return ContentService.createTextOutput("ok");
  }
  // 既存の pattern / event 処理
}
```

列定義は **`lib/csv.ts` の `participantSessionsToCsv`** と揃えると、CSV ダウンロードと GAS の列が一致しやすいです。
