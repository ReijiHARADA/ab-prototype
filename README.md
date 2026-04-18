# EC 商品詳細 — ソーシャルプルーフ A/B プロトタイプ

日本人・韓国人ユーザーを想定した、商品詳細画面のソーシャルプルーフ文言が行動に与える影響を記録する研究用の Next.js アプリです。

## 技術スタック

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui（一部コンポーネント）

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 環境変数

| 変数 | 説明 |
|------|------|
| **`LOG_ENDPOINT`（推奨）** | Google Apps Script のウェブアプリ URL。**サーバ側のみ**に設定（Vercel の Environment Variables）。クライアントは **`/api/log`** に POST し、Next.js が GASへ転送するため **CORS が不要**で URL も公開されない。 |
| `NEXT_PUBLIC_LOG_ENDPOINT` | 任意。ブラウザから GAS に **直接** POST するとき。通常は不要。 |

未設定、または送信に失敗した場合はログが **localStorage** に保存されます。

`.env.local` に記述してください（例は `.env.example` 参照）。

## 連携先スプレッドシート

次のブックの **gid=`1471844174`** のシートに、**1 行 = 1 ログ**で追記する想定です（列は英語＋日韓説明の 2 行ヘッダー）。

`https://docs.google.com/spreadsheets/d/1Cr2w3GpVxiqoK9ILBVQ_-6_TdjRnjfQBTHNYWCW4bpk/edit?gid=1471844174`

- **全体の手順（GAS デプロイ → Vercel → 確認）**: [`docs/spreadsheet-setup.md`](docs/spreadsheet-setup.md)  
- **列定義・GAS サンプル（縦持ち 21 列）**: [`docs/google-apps-script.md`](docs/google-apps-script.md)  
- **共有リンクと横持ちシート（AB log-data 形式）**: [`docs/google-apps-script-wide-sheet.md`](docs/google-apps-script-wide-sheet.md)  

## GitHub と Vercel（自動デプロイ）

このアプリはリポジトリ直下ではなく **`ab-prototype/`** にあるため、Vercel の **Root Directory** に `ab-prototype` を指定してください。手順の詳細は **[`docs/vercel-github.md`](docs/vercel-github.md)** を参照してください。

概要:

1. `main` など運用ブランチへ push する  
2. [Vercel](https://vercel.com) で GitHub リポジトリを Import する  
3. **Root Directory**: `ab-prototype`  
4. **Environment Variables** に必要なら **`LOG_ENDPOINT`** を追加する  

以後、同じブランチへの push で **自動ビルド・デプロイ**されます。

デプロイは成功なのに **404** になる場合は、多くが **Root Directory** または **Output Directory** の設定ミスです。詳しくは [`docs/vercel-github.md`](docs/vercel-github.md) の「デプロイは Ready なのに…」を参照してください。

ビルド確認:

```bash
npm run build
```

## Google Sheets 連携（Google Apps Script）

[`docs/google-apps-script.md`](docs/google-apps-script.md) のスクリプトをデプロイし、発行 URL を **`LOG_ENDPOINT`** に設定してください（推奨: **`/api/log` プロキシ経由**）。

- 送信に失敗したログは自動的に **localStorage** に退避されます。

## 実験ログの仕様

### PatternLog（1 パターン = 1 レコード）

商品詳細の各条件が終了したとき（タイムアウト / 戻る / カート追加）に 1 件送信されます。

主なフィールド:

- `sessionId`: セッション UUID
- `language`: `ja` | `ko`
- `conditionIndex`: 0〜7
- `conditionId`: `sales_volume` など 8 種
- `socialProofText`: 画面上に出した文言
- `action`: `timeout` | `back` | `add_to_cart`
- `durationSec`: 滞在時間（秒）
- `selectedSize`, `selectedColor`, `quantity`

### EventLog（任意）

カート完了画面の「カートを見る」など補助操作で送信されます。

- `eventName`, `eventValue`, `conditionId`, `timestamp`

### POST ボディ形式

`lib/logger.ts` は次のいずれかの形で送信します。

- Pattern: `{ "type": "pattern", ...PatternLogのフィールド }`
- Event: `{ "type": "event", ...EventLogのフィールド }`

## 画面フロー

1. 言語選択（日本語 / 한국어）
2. 基本情報入力
3. 体型タイプ（BMI に基づく表示）
4. 商品詳細（8 パターン固定順）
5. カート追加後の一時画面（任意）
6. 実験終了後のログ確認（CSV 出力・localStorage 一覧）

## 商品画像

`public/product-main.jpg` を配置すると商品画像として表示されます。未配置時はプレースホルダーに切り替わります。

## ライセンス

研究・プロトタイプ用途を想定しています。
