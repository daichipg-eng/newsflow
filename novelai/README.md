# NovelAI 自然言語→プロンプト変換キット

自分が入力する**自然言語（日本語中心）**を、**NovelAI Diffusion V4 / V4.5** で使える
**Danbooru系タグのプロンプト**へ変換するための参照資産一式。

## 使い方（この対話で変換する）

1. このチャットに、作りたい絵を**自然言語**で貼る。
   （例:「夕暮れの海辺で笑っている黒髪ロングの女の子、セーラー服、こちらを見ている」）
2. Claude が [`tag-dictionary.json`](./tag-dictionary.json)・[`conversion-guide.md`](./conversion-guide.md)・
   [`CONVERTER.md`](./CONVERTER.md) を参照して、**Positive / Negative の2ブロック**を返す。
3. 返ってきたプロンプトを NovelAI にそのまま貼る。

> **既定は即出力**: 速さ優先で、返るのは2ブロックだけ（前置き・変更点まとめ・解説は付かない）。
> 差分や理由など解説がほしい時だけ「**詳しく**」と添える。入力のしかた（自然言語を貼る）は従来どおり。

## 恒常ルール

- **品質ブロックは固定**（毎回同じ）:
  `{{masterpiece}}, {{best quality}}, {{ultra-detailed}}, {{finely detailed beautiful eyes}}, {{detailed skin}}`
- **ポーズ・アングルは候補からの可変配列** `||A|B|C||`（毎回ランダムに変わるよう固定しない）。
- **ネガティブは固定**（[`conversion-guide.md`](./conversion-guide.md) の定型。必要に応じ加減）。

## ファイル構成

| ファイル | 役割 |
|---|---|
| [`tag-dictionary.json`](./tag-dictionary.json) | 日本語→Danbooruタグ 対訳辞書 + 固定ブロック + ポーズ/アングル候補プール |
| [`conversion-guide.md`](./conversion-guide.md) | V4/V4.5 のタグ形式・順序・強調記法・固定品質/ネガの中核ルール |
| [`CONVERTER.md`](./CONVERTER.md) | Claude がこの場で変換する手順書 + 模範例 |
| [`SOURCES.md`](./SOURCES.md) | 参照ソース一覧（公式ドキュメント・タグ辞書サイト等） |

## 辞書の拡張

- 現在 **約 750 エントリ**（31カテゴリ）+ ポーズ/アングル候補を収録。
  アクセサリーは部位別に網羅（`hair_ornament` / `headwear` / `eyewear` / `earrings_and_piercings` /
  `neckwear` / `hand_arm_accessories` / `body_waist_accessories` / `leg_accessories` /
  `face_accessories` / `held_carried_items` / `tech_wearable` ＋ 旧 `accessories` / `clothing_decoration`）。
- **足りない語は都度調べて [`tag-dictionary.json`](./tag-dictionary.json) に追記**して育てる方針。
  変換時に辞書に無い語が出たら、Claude がその場で Danbooru タグを調べて追加する。
- JSON は `カテゴリ → [{ "ja": [...同義語], "tag": "danbooru tag" }, ...]` の単純構造で追記が容易。

## 出力例

入力:「VSPoの sinomiya runa、白セーラー服に紫の大リボン、薄紫の髪、紫の瞳で虚ろ、室内」

→ `CONVERTER.md` の模範例を参照（Positive に固定品質ブロックと `||...||` 配列、Negative に固定ブロック）。
