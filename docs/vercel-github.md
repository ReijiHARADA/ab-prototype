# GitHub 連携で Vercel に自動デプロイする

## 前提

- コードが GitHub の **`main`**（または運用ブランチ）に push されていること
- リポジトリは **モノレポ**で、このアプリは **`ab-prototype/` サブフォルダ**にある

## 1. Vercel でプロジェクトを作成

1. [Vercel Dashboard](https://vercel.com/dashboard) にログインする  
2. **Add New… → Project**  
3. **Import Git Repository** で `Collaborative-project-SocialProof`（または該当リポジトリ）を選択する  
4. **Configure Project** で次を設定する  

| 項目 | 設定値 |
|------|--------|
| **Root Directory** | `ab-prototype` に変更（「Edit」を押してサブフォルダを指定） |
| Framework Preset | Next.js（自動検出でよい） |
| Build Command | 既定の `npm run build` または空欄（`vercel.json` と同じでも可） |
| **Output Directory** | **空欄のまま**（Next.js では **絶対に** `out` や `.next` を手入力しない） |
| Install Command | 既定の `npm install` のまま |

Next.js は **静的エクスポート（`next export`）を使っていない限り**、Output Directory を空にして Vercel に任せる必要があります。ここを誤ると **デプロイは成功に見えてトップが 404** になりやすいです。

プロジェクト直下の **`ab-prototype/vercel.json`** で framework を固定しています。**Root Directory を `ab-prototype` にした場合、Vercel はこのファイルを読みます。**

5. **Environment Variables** に必要なら **`LOG_ENDPOINT`**（GAS の URL）を追加する  
6. **Deploy** を実行する  

以後、**指定したブランチ（例: `main`）へ push するたび**に、Vercel が自動でビルド・本番デプロイする（Production Branch の設定に従う）。

## 2. 自動デプロイの動き

- **`main` へ merge / push** → 本番（Production）デプロイが走る想定  
- **プルリクエスト** → 多くの場合プレビュー URL が付く（Vercel の Git 連携の既定）

Production Branch は **Settings → Git → Production Branch** で `main` などに合わせる。

## 3. トラブルシュート

- **ビルドがルートを誤る**: Root Directory が **`ab-prototype`** になっているか確認する  
- **`LOG_ENDPOINT` 未設定**: ログは localStorage フォールバックのみ（アプリは動く）  

### デプロイは Ready なのにブラウザが 404（NOT_FOUND）になる

次を **Settings → General** および **Build & Development Settings** で確認する。

1. **Root Directory** が **`ab-prototype`** になっているか（リポジトリ直下のままだと Next アプリがビルドされない／別物になる）  
2. **Output Directory** が **空**か（`out` `.next` `dist` などが入っていないか）。入っていたら **削除して保存**し、再デプロイする  
3. 開いている URL が **ダッシュボードの Production の Visit ボタン**と同じドメインか（古いプレビュー URL や別プロジェクトの URL になっていないか）  

変更後は **Deployments → … → Redeploy** でやり直す。
