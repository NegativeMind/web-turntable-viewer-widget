バージョンアップとリリース手順を実行します。

引数としてバージョン番号が渡された場合（例: `/release 0.2.0-beta`）はそのバージョンに更新します。
バージョン番号がない場合は現在のバージョンを確認して指示を仰ぎます。

## 実行手順

**Step 1: 現在のバージョンを確認**

以下の4ファイルのバージョン番号が一致しているか確認します：
- `package.json` の `"version"` フィールド
- `README.md` の CDN URL（`@vX.X.X-beta/` 部分）
- `embed-generator/script.ts` の CDN URL
- `tests/test-cdn.html` の CDN URL とバージョン表示

**Step 2: 新バージョンが指定された場合、4ファイルを一括更新**

各ファイルのバージョン文字列をすべて新バージョンに置換します。
変更後、4ファイルすべてが同じバージョンになっていることを確認します。

**Step 3: 変更をコミットしてプッシュ**

```bash
git add package.json README.md embed-generator/script.ts tests/test-cdn.html
git commit -m "chore: bump version to vX.X.X-beta"
git push origin main
```

**Step 4: GitHub Actions の完了を待機**

`build-and-commit.yml` が `dist/` をビルドして main にコミットするまで待ちます。
（jsDelivr CDN はタグ時点の git ツリーから直接配信するため、この手順は必須です）

完了の確認方法を案内し、ユーザーに待機を促します。

**Step 5: ユーザーの確認後、タグを作成してプッシュ**

```bash
git pull origin main
git tag vX.X.X-beta -m "Release vX.X.X-beta"
git push origin vX.X.X-beta
```

完了したら GitHub Release の URL と jsDelivr CDN URL を表示します：
- CDN URL: `https://cdn.jsdelivr.net/gh/NegativeMind/web-turntable-viewer-widget@vX.X.X-beta/dist/turntable-viewer.js`
