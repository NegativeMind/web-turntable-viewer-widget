# CLAUDE.md - Web Turntable Viewer Widget

## プロジェクト概要

Vimeoの360度ターンテーブル動画をインタラクティブに操作できるWeb Componentウィジェット。
ユーザーがドラッグすることでフレームごとに回転操作が可能。

- **バージョン:** 0.1.9-beta
- **ライセンス:** MIT
- **配布:** jsDelivr CDN経由（GitHubリリースから自動）

## 重要ルール（違反禁止）

### dist/ フォルダの管理
- **`dist/` は絶対にコミットしない**
- `dist/` はGitHub Actionsが自動生成・管理する
- ローカルの `npm run build` は開発テスト用のみ

### アーキテクチャ
- **Web Component専用** — レガシーな初期化コードは不要
- Shadow DOMによる完全なCSS分離を維持する
- 以下のレガシーパターンは削除済み。復活させないこと:
  ```typescript
  // ❌ 追加禁止
  function initializeTurntableViewers() { ... }
  document.addEventListener('DOMContentLoaded', ...);
  window.turntableViewerInstances = new Set();
  ```

### CSS戦略
- Shadow DOM CSS: `src/turntable-viewer.css`（Viteの `?inline` でインライン注入）
- `:host` には `!important` を使用（外部スタイル保護のため）
- Shadow DOM内部では `!important` 不要
- **`all: unset` は使用禁止**（iframeのレンダリングが壊れる）

### 属性仕様

| 属性 | 値 | 説明 |
|------|-----|------|
| `vimeo-video-id` | 数値文字列 | VimeoのビデオID（必須） |
| `width` | 数値（px） | 幅（デフォルト: 480） |
| `height` | 数値（px） | 高さ（省略時は自動計算） |
| `clockwise-rotation` | `"true"` / `"false"` | 回転方向（デフォルト: 時計回り） |
| `show-angle` | 値なし | 回転角度のデバッグ表示 |

`clockwise-rotation` の注意点:
- 属性なし = 時計回り（デフォルト）
- `clockwise-rotation="true"` = 時計回り
- `clockwise-rotation="false"` = 反時計回り
- `clockwise-rotation`（値なし）= 非推奨・使用禁止

## ディレクトリ構成

```
src/
├── index.ts                    # エントリーポイント、Web Component登録
├── turntable-viewer-element.ts # Web Componentラッパー（Shadow DOM）
├── turntable-viewer.ts         # コアロジック・オーケストレーション
├── turntable-viewer.css        # Shadow DOM CSS（インライン注入）
├── types.ts                    # TypeScript型定義
├── utils.ts                    # ユーティリティ関数
├── progress-manager.ts         # ローディングオーバーレイ管理
├── ui-manager.ts               # UI状態管理
├── drag-handler.ts             # ドラッグインタラクション
├── player-initializer.ts       # Vimeoプレーヤー初期化
└── video-config-manager.ts     # 動画品質・サイズ設定

tests/
├── test-local.html             # ローカルビルドのテスト
└── test-cdn.html               # CDN配布のテスト

embed-generator/
├── index.html                  # 埋め込みコード生成ツールUI
├── script.ts                   # 生成ロジック
└── style.css                   # スタイル

dist/                           # ⚠️ 自動生成 - コミット禁止
.github/
├── workflows/
│   ├── release.yml             # タグpush時にGitHubリリース作成
│   ├── build-and-commit.yml    # mainブランチのdist/を自動更新
│   └── deploy.yml              # GitHub Pagesへのデプロイ
└── copilot-instructions.md     # 開発ガイドライン
```

## 開発コマンド

```bash
npm run dev          # Vite開発サーバー起動（http://localhost:3001）
npm run build        # TypeScript型チェック + Viteビルド
npm run build:docs   # 埋め込みジェネレーターをGitHub Pages用にビルド
npm run preview      # プロダクションビルドのプレビュー
```

### テスト
- ローカルビルド: `http://localhost:3001/tests/test-local.html`
- CDNバージョン: `http://localhost:3001/tests/test-cdn.html`
- 埋め込みジェネレーター: `http://localhost:3001/embed-generator/`

## リリースプロセス

バージョンを更新する必要があるファイル（4箇所）:
1. `package.json`
2. `README.md`（CDN URL）
3. `embed-generator/script.ts`（CDN URL）
4. `tests/test-cdn.html`（CDN URLとバージョン表示）

```bash
git tag vX.X.X-beta -m "Release message"
git push origin vX.X.X-beta
# → GitHub Actionsが自動でリリースを作成しdist/ファイルを添付
```

## 技術スタック

- **TypeScript 5.7+** (strict: 一部無効、`strictNullChecks: false`)
- **Vite 5.4+** — ビルドツール
- **Web Components** — フレームワークなし、純粋なブラウザAPI
- **Vimeo Player API** — ピア依存（ユーザーが別途ロード）

**使用しないもの:** React, Vue, Angular, jQuery、その他重いフレームワーク

## コードパターン

### エラーハンドリング
```typescript
// 常にgetErrorMessage()ユーティリティを使用
import { getErrorMessage } from './utils';
progressManager.showError(getErrorMessage(error));
```

### ドラッグスロットリング
- 100ms最小間隔でVimeo APIコールをスロットリング
- `requestAnimationFrame` でスムーズな更新
- 高速操作中は保留中のAPIコールをキャンセル

### Web Componentの使用例
```html
<script src="https://player.vimeo.com/api/player.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/gh/NegativeMind/web-turntable-viewer-widget@v0.1.9-beta/dist/turntable-viewer.js"></script>

<turntable-viewer
  vimeo-video-id="1118303126"
  width="480"
  clockwise-rotation="true">
</turntable-viewer>
```

## ブラウザ対応

| ブラウザ | 対応状況 |
|---------|---------|
| Chrome/Edge | ✅ 完全対応 |
| Firefox | ✅ 完全対応 |
| Safari (iOS 12+) | ✅ 完全対応 |
| IE11 | ❌ 非対応 |

## CI/CDパイプライン

| ワークフロー | トリガー | 内容 |
|------------|---------|------|
| `release.yml` | `v*.*.*` タグのpush | GitHubリリース作成、dist/添付 |
| `build-and-commit.yml` | mainへのpush（src/等変更時） | dist/を自動ビルド・コミット |
| `deploy.yml` | mainへのpush | embed-generatorをGitHub Pagesにデプロイ |

## やること / やらないこと

### ✅ やること
- Shadow DOMアーキテクチャを維持する
- `:host` への `!important` によるCSS分離戦略を維持する
- 既存のエラーハンドリングパターンに従う
- ローカルビルドとCDNビルドの両方でテストする

### ❌ やらないこと
- `dist/` フォルダをコミットする
- レガシーな初期化コードを復活させる
- Shadow DOMのカプセル化を破る
- CSSで `all: unset` を使う（iframeが壊れる）
- Shadow DOM内部で不要な `!important` を使う
- jQueryや重いフレームワークを提案する
