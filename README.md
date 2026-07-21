# Giroku LP / API

Girokuの公開サイトと、有料AI機能を提供するNext.js Route Handlerです。

- `/api/polish`: 文字起こしの誤字・句読点補正とタイトル生成
- `/api/summarize`: AI議事録の生成、質問、書き直し
- `/download/mac`: GitHub画面を挟まず、最新の公証済みmacOS版DMGを直接ダウンロード
- LemonSqueezyでGiroku商品・アクティベーション済みキーを検証
- IPおよびライセンス単位の回数制限、入力長制限、外部通信タイムアウトを適用
- `/api/license` でデスクトップ購入キーをiPhone・Androidへ登録・確認・解除し、Mac・Windowsと同じ最大2台のLemonSqueezy端末枠を共有
- `/api/app-version` でiOS・Androidの最新版とストア導線を配信し、公開済みアプリを再ビルドせず更新案内を切り替え
- モバイルからの有料AI利用は購入キーだけでなく登録済み端末IDも検証し、端末数制限の迂回を防止

## 開発

```bash
npm run dev
npm run lint
npm run build
```

`GEMINI_API_KEY` はVercelの環境変数で管理し、リポジトリやアプリへ保存しません。

モバイル公開後は、`MOBILE_IOS_LATEST_VERSION` / `MOBILE_ANDROID_LATEST_VERSION` と
`IOS_APP_STORE_ID` / `ANDROID_PLAY_PACKAGE`（必要なら各`*_STORE_URL`）をVercelへ設定します。
未設定中はアプリ内の現在版と同じ`1.0.0`を返し、公開前に誤って更新を促しません。

## 公開

GitHubの`main`へpush後、Vercelへ本番デプロイします。macOS版は署名・Apple公証済みのDMGを`naoyattsuji/giroku-releases`から配布します。未公開のOSはダウンロード導線を「準備中」にします。
