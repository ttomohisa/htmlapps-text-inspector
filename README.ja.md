# Text Inspector

[![GitHub Pages](https://github.com/ttomohisa/htmlapps-text-inspector/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/ttomohisa/htmlapps-text-inspector/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Single HTML](https://img.shields.io/badge/distribution-single%20HTML-0ea5e9)](https://ttomohisa.github.io/htmlapps-text-inspector/)

[English README](README.md)

文字数を数えるだけでなく、文章の構成・頻出語・長い文・文章のクセまで、入力した文章を外部へ送らずブラウザ内だけで確認できる単一HTMLの文章分析ツールです。

## 🚀 デモ

### [GitHub PagesでText Inspectorを開く](https://ttomohisa.github.io/htmlapps-text-inspector/)

GitHub Pagesから最初のHTMLを読み込んだ後、文字数集計、文章構成の分析、頻出語抽出、X-Ray表示、文章チェックはすべて端末内で処理されます。入力した文章がアプリからサーバーへ送信されることはありません。

[![Text Inspector の画面](assets/screenshot.png)](https://ttomohisa.github.io/htmlapps-text-inspector/)

スマートフォン表示: [screenshot-mobile.png](assets/screenshot-mobile.png)

## 主な機能

- **文章の量をひと目で確認** — 文字数、空白除外文字数、単語数、文、段落、行数、読了時間、音読時間、原稿用紙換算を入力中にリアルタイム集計します。
- **文章の構成を見える化** — 漢字・ひらがな・カタカナ・英数字・記号などの割合をシンプルなグラフで確認できます。
- **使いすぎている言葉を発見** — 頻出語をランキング表示し、選んだ単語が本文のどこにあるか X-Ray でまとめて強調します。
- **気になる箇所へすぐ移動** — 長い文、同じ単語の連続、連続空白、連続する句読点・記号を検出し、文章チェックから該当箇所へ直接ジャンプできます。
- **文字数制限を意識して書ける** — 140 / 400 / 800文字などの目標や自由な文字数を設定し、残り・超過をスマホのミニメーターでも常時確認できます。
- **編集を安心して試せる** — サンプル・クリアは確認ダイアログ付き。元に戻す / やり直すはボタン、ショートカット、スマホ固定バーから操作できます。
- **文章を外へ出さない単一HTML** — 実行時の外部ライブラリやCDNはなく、生成済みHTMLを1ファイルだけで利用できます。

## すぐに使う

### Webで使う

[デモを開く](https://ttomohisa.github.io/htmlapps-text-inspector/)だけで利用できます。インストールやアカウント登録は不要です。

### ダウンロードして使う

1. [`dist/index.html`](dist/index.html) をダウンロードします。
2. 最新のChromium系ブラウザ、Firefox、Safariで開きます。
3. 調べたい文章を入力または貼り付けます。

HTMLファイルを入手した後は、ローカルWebサーバーやインターネット接続は不要です。

### 小さい自己解凍版を使う

`dist/index.self-extract.html` は、同じアプリをgzip圧縮して内包した小さい単一HTML版です。`DecompressionStream` に対応したモダンブラウザで直接開けます。

## 使い方

1. 調べたい文章を入力欄へ入力または貼り付けます。
2. 文字数、単語数、文、段落、行、読了時間などがリアルタイムで更新されます。
3. **構成** では、漢字・ひらがな・カタカナ・英数字・記号などのバランスを確認します。
4. **頻出語** で単語を選ぶと **X-Ray** に切り替わり、その単語が本文中で強調されます。
5. **文章チェック** では長い文、重複語、連続空白、連続記号などを確認できます。「該当箇所を見る」を押すと最初の該当位置へ直接移動します。
6. 140 / 400 / 800文字などのプリセット、または自由入力で目標文字数を設定すると、残りまたは超過文字数を確認できます。
7. 入力欄の一部を選択すると、その範囲だけの文字数・単語数も確認できます。

### スマートフォンでの操作

スマートフォンでは画面下に固定バーを表示し、長い文章を扱っていてもよく使う情報と操作へすぐアクセスできます。

- 現在の文字数と目標までの進捗
- **入力** へ移動
- **分析** へ移動
- **元に戻す**
- **やり直す**

文字数ミニメーターをタップすると、通常の集計欄へ戻れます。

### キーボード操作

| ショートカット | 操作 |
| --- | --- |
| `Ctrl` / `⌘` + `Z` | 元に戻す |
| `Ctrl` / `⌘` + `Shift` + `Z` | やり直す |
| `Ctrl` + `Y` | Windowsでやり直す |
| `Esc` | 開いているダイアログを閉じる |

## 分析内容

### 文字数・時間の集計

Unicodeを考慮した文字数をブラウザ内で計算し、単語数や文数などを簡易集計します。読了時間、音読時間、原稿用紙換算は文章量を把握するための目安です。

### 頻出語と X-Ray

利用できるブラウザではブラウザ標準の `Intl.Segmenter` を優先して頻出語を抽出します。頻出語を押すと X-Ray が開き、本文中の出現箇所をまとめて確認できます。文章チェックからジャンプした問題箇所も X-Ray 上で強調されます。

### 文章チェック

分かりやすく説明できる軽量なルールに限定しています。現在は主に以下を確認します。

- 80文字を超える長い文
- 同じ単語の連続
- 連続する空白
- 連続する句読点・記号
- 「です・ます」調 / 「だ・である」調の簡易的な傾向

文章チェックは推敲のきっかけを提示する機能で、文法校正やAIによる文章書き換えではありません。

## GitHub Pagesで公開する

このリポジトリには、単一HTMLをビルド・検証してGitHub Pagesへ自動公開するworkflowが含まれています。

1. リポジトリ名を `htmlapps-text-inspector` としてGitHubへプッシュします。
2. **Settings → Pages → Build and deployment → Source** で **GitHub Actions** を選択します。
3. `main` ブランチへプッシュするか、Actions画面から **Deploy standalone app to GitHub Pages** を手動実行します。
4. ビルド成功後、`https://ttomohisa.github.io/htmlapps-text-inspector/` で公開されます。

`main` へのpushでは `.github/workflows/deploy-pages.yml` が `scripts/check-repository.ps1` を実行してから `dist/` をPagesへ公開します。Pull Requestでは `.github/workflows/build-standalone.yml` が同じビルド・検証を実行し、生成HTMLをActions artifactとして保存します。

Pagesがまだ有効になっていない場合、deploy workflowはビルドだけを完了して公開をスキップし、Workflow Summaryに初回設定手順を表示します。

## プライバシーと通信防止

入力した文章の解析はすべてブラウザ内で行われます。

- 入力文章をアプリから外部へ送信しません。
- アカウント、アクセス解析、テレメトリ、サーバー保存はありません。
- 実行時のContent Security Policyに `connect-src 'none'` を設定しています。
- 再読み込み後に復元できるよう、現在の文章をブラウザの `localStorage` に保存します。
- ブラウザのサイトデータを削除すると、ローカル保存した文章も消える場合があります。

GitHub Pages版では最初のHTML配信だけ通信が発生しますが、入力文章はアプリから送信されません。完全にネットワークを切って使う場合は `dist/index.html` をローカルから直接開いてください。

## 単一HTML / オフライン

Text Inspectorは実行時の外部依存を持たず、以下の2種類の単一HTMLを生成します。

| ファイル | 用途 |
| --- | --- |
| `dist/index.html` | 読みやすい通常の単一HTML版 |
| `dist/index.self-extract.html` | gzip自己解凍式の小さい単一HTML版 |

どちらもローカルWebサーバーなしで直接開ける構成です。

## 開発とビルド

```text
.
├─ .github/workflows/
│  ├─ build-standalone.yml       # Pull Request / 手動実行時のビルド検証
│  └─ deploy-pages.yml           # mainからGitHub Pagesへ自動公開
├─ src/index.template.html       # アプリ本体のソーステンプレート
├─ app.config.json               # アプリ情報・サイズ上限
├─ dependencies.json             # 内包依存の定義（現在は依存なし）
├─ build-standalone.bat          # Windows用ビルド入口
├─ build-standalone.ps1          # 単一HTMLビルダー
├─ assets/
│  ├─ screenshot.png             # PC表示のREADME用スクリーンショット
│  └─ screenshot-mobile.png      # スマートフォン表示のスクリーンショット
├─ dist/
│  ├─ index.html                 # 通常版の生成物
│  ├─ index.self-extract.html    # gzip自己解凍版
│  ├─ build-size-report.json     # ビルドサイズレポート
│  └─ .nojekyll                  # GitHub Pages用
└─ scripts/                      # ビルド・単一HTML検証スクリプト
```

### Windowsでビルドする

`build-standalone.bat` をダブルクリックするか、ターミナルから実行します。

生成物は `dist/` に出力され、単一HTMLとして成立しているか、自己解凍版が元のHTMLへ復元できるかなどの検査も行われます。Text Inspectorは現在ブラウザ標準APIだけで実装しているため、実行時のパッケージ取得はありません。

### リポジトリ検証

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

このコマンドは単一HTMLを再ビルドし、検証スクリプトを実行します。GitHub Actionsでも同じ入口を使用します。

## 対応ブラウザ・端末

現在のChromium系ブラウザ、Firefox、Safariのデスクトップ版・モバイル版を主な対象としています。PCとスマートフォンの両方を前提にし、スマートフォンではSafe Areaを考慮した固定操作バーを表示します。

## 制限事項

- 単語の区切り方は簡易的で、ブラウザや言語によって結果が異なる場合があります。
- 読了時間、音読時間、原稿用紙換算は目安です。
- 長文判定は80文字を基準にした機械的なルールです。
- 「です・ます」調 / 「だ・である」調は簡易判定であり、完全な文法解析ではありません。
- 形態素解析用の専用辞書やAIモデルは内包していません。
- 自動保存した文章はブラウザの `localStorage` に保存されるため、サイトデータを削除すると失われます。

## 使用ライブラリ

Text Inspectorは現在、**実行時の外部ライブラリを使用していません**。文章分析とUIはブラウザ標準のJavaScript APIで実装しています。

依存関係に関する情報は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) を確認してください。

## コントリビューション

バグ報告や機能提案はGitHub Issuesからお願いします。実装を変更する場合は [AGENTS.md](AGENTS.md) と [APP_SPEC.md](APP_SPEC.md) を確認してください。

## ライセンス

Copyright © 2026 ttomohisa

このプロジェクトは [MIT License](LICENSE) で公開されています。
