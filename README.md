# Web Turntable Viewer Widget (Beta)

> ⚠️ まだバージョン1未満のベータ版です。仕様が予告なく変更される可能性があります。

模型や3DCGモデルを360度回転させたターンテーブル動画をWebブラウザ上でドラッグ操作して自由な角度から鑑賞できるウィジェットスクリプトです。
Vimeoの動画埋め込みをラップするもので、動画のアップロード・公開にはVimeoを利用します。

<h1 align="center">
<a href="https://negativemind.com/web-turntable-viewer-widget/" target="_blank">
  <img src="assets/demo.gif" alt="Web Turntable Viewer Widget Demo" width="760">
</a>
</h1>

デモページは[こちら](https://negativemind.com/web-turntable-viewer-widget/)

## 使い方

### 1. Vimeoにターンテーブル動画をアップロード

1. **動画の作成**
   - 模型などを一定の角度ずつ回転させながら撮影した動画、または3DCGモデルのターンテーブル動画
   - 動画の仕様：360度1回転の動画 (1フレームごとに1度ずつ回転させた360フレームの動画が最小構成)

2. **Vimeoへアップロード**
   - [Vimeo](https://vimeo.com)に360度1回転の動画をアップロード・公開
   - アップロードした動画のIDを取得（例：`https://vimeo.com/1114427944` → ID: `1114427944`）

### 2. コード埋め込み

このウィジェットをブログ記事などに貼りつける場合、以下のコードのvimeo-video-id="1114427944"の数字を使用したいVimeoの動画IDに書き換えて埋め込んでください。(以下の例では1114427944の動画を使用)

```html
<script src="https://player.vimeo.com/api/player.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/NegativeMind/web-turntable-viewer-widget@v0.1.3-beta/dist/turntable-viewer.css">
<div class="turntable-wrapper">
    <div vimeo-video-id="1114427944" clockwise-rotation>
        <iframe width="480" frameborder="0" allowfullscreen></iframe>
        <div class="drag-overlay"></div>
        <div class="loading-overlay">
            <div class="loading-content">
                <div class="loading-text">Loading turntable...</div>
                <div class="progress-container">
                    <div class="progress-bar"><div class="progress-fill"></div></div>
                    <div class="progress-text">0%</div>
                </div>
            </div>
        </div>
    </div>
    <a class="vimeo-link" href="#" target="_blank">View on Vimeo</a>
</div>
<script src="https://cdn.jsdelivr.net/gh/NegativeMind/web-turntable-viewer-widget@v0.1.3-beta/dist/turntable-viewer.js"></script>
```

### 設定オプション

| 属性 | 必須 | 値 | 説明 |
|------|------|-----|------|
| `vimeo-video-id` | ✅ | 数値 | Vimeoの動画ID |
| `clockwise-rotation` | ❌ | ブール値 | ターンテーブルの回転方向<br><br>時計回り(デフォルト)：`clockwise-rotation` または `clockwise-rotation="true"` または `clockwise-rotation="1"`:<br>反時計回り：`clockwise-rotation="false"` または `clockwise-rotation="0"` |

#### 埋め込みサイズ設定

ウィジェットの動画サイズは、iframeの`width`または`height`属性のどちらかで指定してください。指定されなかった方の寸法は動画のアスペクト比に基づいて自動的に計算されます。

```html
<!-- 幅を指定(高さは動画のアスペクト比で自動計算) -->
<iframe width="480" frameborder="0" allowfullscreen></iframe>

<!-- 高さを指定(幅は動画のアスペクト比で自動計算) -->
<iframe height="300" frameborder="0" allowfullscreen></iframe>

<!-- 両方指定も可能(動画のアスペクト比は無視される) -->
<iframe width="640" height="480" frameborder="0" allowfullscreen></iframe>
```

## 利用上の注意

このウィジェットはVimeoの公式埋め込み機能およびAPIを利用しています。ご利用の際は、必ずVimeoの[利用規約](https://vimeo.com/legal/terms/ja)を遵守してください。

アップロード・公開する動画は必ずご自身が権利を有するコンテンツをご利用ください。商用利用や大量アクセスの場合はVimeoの有料プランや追加規約もご確認ください。

## ライセンス

[MIT License](./LICENSE)
