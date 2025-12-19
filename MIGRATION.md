# プロジェクトのVite + Node.js化 完了

## 実施した変更

### 1. プロジェクト構成の変更

#### フォルダ構造
```
変更前:
├── dist/                       # ソースコードが配置されていた
│   ├── turntable-viewer.js
│   └── turntable-viewer.css
├── src/                        # 空のフォルダ
├── tests/                      # テストページ
└── docs/                       # 埋め込みコード作成ツール

変更後:
├── src/                        # ソースコードを移動
│   ├── turntable-viewer.js    # ESモジュール形式に変換
│   └── turntable-viewer.css
├── dist/                       # ビルド出力先（gitignore対象）
├── tests/                      # Vite開発サーバー対応
├── docs/                       # 埋め込みコード作成ツール
├── node_modules/               # 依存関係（gitignore対象）
├── package.json                # 新規作成
├── vite.config.js              # 新規作成
└── index.html                  # 開発用トップページ
```

### 2. 作成したファイル

#### package.json
- プロジェクトの依存関係とスクリプトを定義
- Vite v5.4.11をdevDependencyとして追加
- ESモジュール形式に対応（`"type": "module"`）

#### vite.config.js
- ライブラリモードでのビルド設定
- ES、UMD形式の両方で出力
- CSSを別ファイルとして出力
- 開発サーバーの設定（port: 3000）

#### index.html
- 開発環境用のトップページ
- テストページと埋め込みコード作成ツールへのリンク

### 3. ソースコードの変更

#### src/turntable-viewer.js
- ESモジュール形式に変換
- CSSのインポートを追加（`import './turntable-viewer.css'`）
- `export { TurntableViewer }` を追加
- 後方互換性のため `window.TurntableViewer` も維持

#### tests/test.html
- スクリプトの読み込みを変更:
  - 変更前: `<script src="../dist/turntable-viewer.js"></script>`
  - 変更後: `<script type="module" src="/src/turntable-viewer.js"></script>`
- CSSのリンクタグを削除（JSから自動インポート）

### 4. .gitignoreの更新
- `node_modules/` を追加
- `dist/` を追加（ビルド出力は配布時のみコミット）
- その他開発環境関連のファイルを追加

### 5. README.mdの更新
- 開発環境のセクションを追加
- セットアップ手順を記載
- npmスクリプトの説明を追加

## 使用方法

### 開発環境の起動

```bash
# 依存関係のインストール（初回のみ）
npm install

# 開発サーバーの起動
npm run dev
```

開発サーバーが http://localhost:3000 で起動します。

### ウィジェットのビルド

```bash
# 本番用ビルド
npm run build
```

ビルド結果は `dist/` フォルダに出力されます:
- `turntable-viewer.js` - ESモジュール形式
- `turntable-viewer.umd.cjs` - UMD形式（後方互換性）
- `turntable-viewer.css` - スタイルシート

### ビルド結果のプレビュー

```bash
npm run preview
```

## 利点

1. **モダンな開発環境**: Viteによる高速な開発体験
2. **ホットモジュールリプレースメント**: コード変更が即座に反映
3. **最適化されたビルド**: 本番用に最適化されたコードを出力
4. **モジュール形式**: ESモジュールとUMDの両方をサポート
5. **依存関係管理**: npmによる明確な依存関係管理

## 注意事項

- `dist/` フォルダはgitignoreに追加されているため、ビルド後に配布する場合は別途コミットが必要
- 開発時は常に `src/` フォルダのファイルを編集してください
- Vimeo Player APIは外部依存として扱われ、CDNから読み込まれる想定です
