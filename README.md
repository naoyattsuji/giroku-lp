# Giroku LP / API

Girokuの公開サイトと、有料AI機能を提供するNext.js Route Handlerです。

- `/api/polish`: 文字起こしの誤字・句読点補正とタイトル生成
- `/api/summarize`: AI議事録の生成、質問、書き直し
- LemonSqueezyでGiroku商品・アクティベーション済みキーを検証
- IPおよびライセンス単位の回数制限、入力長制限、外部通信タイムアウトを適用

## 開発

```bash
npm run dev
npm run lint
npm run build
```

`GEMINI_API_KEY` はVercelの環境変数で管理し、リポジトリやアプリへ保存しません。

## 公開

GitHubの`main`へpush後、Vercelへ本番デプロイします。macOS版は署名・Apple公証済みのDMGを`naoyattsuji/giroku-releases`から配布します。未公開のOSはダウンロード導線を「準備中」にします。
