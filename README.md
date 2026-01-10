# Web Turntable Viewer Widget (Beta)

> ⚠️ まだバージョン1未満のベータ版です。仕様が予告なく変更される可能性があります。

模型や3DCGモデルを360度回転させたターンテーブル動画をWebブラウザ上でドラッグ操作して自由な角度から鑑賞できるウィジェットスクリプトです。
Vimeoの動画埋め込みをラップするもので、動画のアップロード・公開にはVimeoを利用します。

<h1 align="center">
<a href="https://negativemind.com/web-turntable-viewer-widget/" target="_blank">
  <img src="assets/demo.gif" alt="Web Turntable Viewer Widget Demo" width="760">
</a>
</h1>

[埋め込みコード作成ツール](https://negativemind.com/web-turntable-viewer-widget/)を用意しています。

開発の経緯については[こちら](https://blog.negativemind.com/portfolio/web-turntable-viewer-widget/)

## 使い方

### 1. Vimeoにターンテーブル動画をアップロード

1. **動画の作成**
   - 模型などを一定の角度ずつ回転させながら撮影した動画、または3DCGモデルのターンテーブル動画
   - 動画の仕様：360度1回転の動画 (1フレームごとに1度ずつ回転させた360フレームの動画が最小構成)

2. **Vimeoへアップロード**
   - [Vimeo](https://vimeo.com)に360度1回転の動画をアップロード・公開
   - アップロードした動画のIDを取得（例：`https://vimeo.com/1118303126` → ID: `1118303126`）

### 2. コード埋め込み

このウィジェットをブログ記事などに貼りつける場合、以下のコードのvimeo-video-id="1118303126"の数字を使用したいVimeoの動画IDに書き換えて埋め込んでください。(以下の例では1118303126の動画を使用)

```html
<script src="https://player.vimeo.com/api/player.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/gh/NegativeMind/web-turntable-viewer-widget@v0.1.9-beta/dist/turntable-viewer.js"></script>

<turntable-viewer vimeo-video-id="1118303126" width="480"></turntable-viewer>
```

### 設定オプション

| 属性 | 必須 | 値 | 説明 |
|------|------|-----|------|
| `vimeo-video-id` | ✅ | 数値 | Vimeoの動画ID |
| `width` | ❌ | 数値 (px) | ウィジェットの幅（デフォルト: 480） |
| `height` | ❌ | 数値 (px) | ウィジェットの高さ（未指定時はアスペクト比で自動計算） |
| `clockwise-rotation` | ❌ | `true` / `false` | ターンテーブルの回転方向<br><br>**時計回り(デフォルト)**：属性なし<br>**時計回り(明示)**：`clockwise-rotation="true"`<br>**反時計回り**：`clockwise-rotation="false"` |
| `show-angle` | ❌ | - | 回転角度の表示（デバッグ用）<br><br>指定すると画面下部に現在の角度が表示されます |

#### 埋め込みサイズ設定

ウィジェットの動画サイズは、iframeの`width`または`height`属性のどちらかで指定してください。指定されなかった方の寸法は動画のアスペクト比に基づいて自動的に計算されます。

#### 使用例

```html
<!-- 基本的な使い方（幅480px、時計回り） -->
<turntable-viewer vimeo-video-id="1118303126" width="480"></turntable-viewer>

<!-- 時計回りを明示的に指定 -->
<turntable-viewer vimeo-video-id="1118303126" width="480" clockwise-rotation="true"></turntable-viewer>

<!-- 反時計回り -->
<turntable-viewer vimeo-video-id="1118303126" width="480" clockwise-rotation="false"></turntable-viewer>

<!-- 幅のみ指定（高さは動画のアスペクト比で自動計算） -->
<turntable-viewer vimeo-video-id="1118303126" width="640"></turntable-viewer>

<!-- 幅と高さを両方指定 -->
<turntable-viewer vimeo-video-id="1118303126" width="640" height="480"></turntable-viewer>

<!-- 角度表示を有効にする（デバッグ用） -->
<turntable-viewer vimeo-video-id="1118303126" width="480" show-angle></turntable-viewer>
```

## 利用上の注意

このウィジェットはVimeoの公式埋め込み機能およびAPIを利用しています。ご利用の際は、必ずVimeoの[利用規約](https://vimeo.com/legal/terms/ja)を遵守してください。

アップロード・公開する動画は必ずご自身が権利を有するコンテンツをご利用ください。商用利用や大量アクセスの場合はVimeoの有料プランや追加規約もご確認ください。

## ライセンス

[MIT License](./LICENSE)
