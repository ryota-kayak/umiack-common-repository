# Kayak Tours Project

Umiackのカヤックツアー用Webコンテンツ管理リポジトリです。各ツアーごとのHTML、CSS、関連データをフォルダ別に管理しています。

## ディレクトリ構成

- `Ohanami/`: お花見カヤックツアーのコンテンツ
- `Tokyo Skytree/`: スカイツリーカヤックツアーのコンテンツ
- `Onagi River/`: 小名木川カヤックツアーのコンテンツ
- `Nihonbashi/`: 日本橋カヤックツアーのコンテンツ
- `template_tour_main.html`: 新規ツアー作成用テンプレート
- `custom.js`: WordPress用ローダースニペット

## 画像管理（サブフォルダ方式）

各ツアーフォルダ内の `img/` の下にサブフォルダを作り、それぞれに `images.json` と画像ファイルを配置します。

```
[Tour Name]/
├── img/
│   ├── main/              ← メインスライダー用
│   │   ├── images.json    ← 画像の表示順序とalt
│   │   ├── photo1.jpg
│   │   └── photo2.jpg
│   ├── bridges/           ← 2つ目のスライダー（例）
│   │   ├── images.json
│   │   └── bridge.jpg
│   └── ...
├── tour_main_Japan.html
└── tour_main_Global.html
```

### images.json の書式

```json
[
  { "file": "photo1.jpg", "alt": "写真の説明", "order": 1 },
  { "file": "photo2.jpg", "alt": "写真の説明", "order": 2 }
]
```

### HTML でのスライダー設置

HTMLに必要なのは1行だけです。ボタン・ドット・モーダル等は全て `umiack-slider.js` (v4.0) が自動生成します。

```html
<div class="umiack-slider-wrap" data-tour="ツアー名" data-slider="サブフォルダ名"></div>
```

- `data-tour`: ツアーフォルダ名（自動Slug化される。例: `Tokyo Skytree` → `tokyo-skytree`）
- `data-slider`: `img/` 直下のサブフォルダ名（例: `main`, `bridges`）
- 同一ページ内に複数のスライダーを設置する場合はこの div を複製して `data-slider` の値を変更
- フルスクリーンモーダルはJSが `document.body` に自動追加（HTMLに書く必要なし）

## 管理方法

各フォルダ内の `tour_main_Japan.html` と `tour_main_Global.html` を編集し、GitHubにプッシュすることでコンテンツを同期・管理します。ビルドスクリプト (`scripts/build.sh`) が画像の最適化（WebP変換・リサイズ）とマニフェスト生成を自動で行います。
