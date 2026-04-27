# ナレッジベース：トップページ・ロゴアニメーションの最適化

## 概要
UMIACK Coffee等のトップページにおけるロゴアニメーション（豆の転がり等）を、従来の `top/left` 制御から `transform: translate()` 制御へとリファクタリングしました。これにより、描画パフォーマンスの向上とレスポンシブ対応の簡略化を実現しています。

## 技術的詳細

### 1. 座標系の正規化
CSSで以下の設定を行うことで、要素を「コンテナの中央」に固定し、`translate(0, 0)` が常に中央を指すようにしました。

```css
#img_2 {
    top: 0; left: 0; right: 0; bottom: 0;
    margin: auto;
    position: absolute;
}
```

### 2. 中央基準の計算ロジック
基準点が左端から中央に移動したため、初期位置や限界値の計算を以下のように調整しました。

*   **初期位置 (`BEAN_INITIAL_X`)**:
    *   以前の `left: -97px; margin: auto;` は実質的に中央から `-48.5px` のオフセットでした。
    *   新システムでは `BEAN_INITIAL_X: -48` と設定することで、以前と同一の見た目を維持しています。
*   **右端の限界値 (`cachedMaxAllowedX`)**:
    *   計算式：`(window.innerWidth / 2) - (beanWidth / 2) - (OFFSET_VALUE * widthRatio)`
    *   画面中央からの相対距離として計算することで、レスポンシブな制限を正確に行えます。

### 3. レスポンシブ対応の徹底
画面サイズ（`widthRatio`）に応じたスケーリングを、以下のすべての項目に適用しました。
*   初期位置 (X, Y)
*   水平移動速度
*   フェードアウト区間 (`HORIZONTAL_FADE_RANGE`)
*   右端の余白 (`OFFSET_VALUE`)

### 4. 動作の堅牢性（境界値リセット）
スクロールを高速で戻した際の「戻りきらない」問題を解決するため、`update` 関数の冒頭に明示的なリセット処理を追加しました。

```javascript
if (scrollPosition <= delay) {
    imageBean.style.transform = `translate(${INITIAL_X * ratio}px, ${INITIAL_Y * ratio}px) rotate(0rad)`;
    return;
}
```

## 今後の開発への教訓
*   アニメーション要素は可能な限り `transform` を使用する。
*   CSSの `margin: auto` を使って基準点を中央に持ってくる手法は、レスポンシブ設計において非常に強力。
*   マジックナンバー（-97px等）の背景にある計算（半分が実質値等）を常に意識する。
