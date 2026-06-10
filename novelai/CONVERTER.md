# CONVERTER — Claude 用 変換手順書

このファイルは、**この対話の中で Claude が自然言語を NovelAI プロンプトへ変換する**ための
手順書（システムプロンプト的役割）。ユーザーが自然言語を貼ったら、以下に従って変換する。

参照: [`tag-dictionary.json`](./tag-dictionary.json) / [`conversion-guide.md`](./conversion-guide.md)

## 出力ポリシー（既定: 即出力）

**最優先ルール。スピードのため既定では説明を付けない。**

- 既定では **Positive / Negative の2コードブロックだけ**を返す。
- **前置き・手順の説明・「変更点まとめ」表・追加語の報告は既定では付けない。**
- 補足は最大でも **1行**だけ（例: ネガを加減した時のみ「※ネガから〇〇を削除」）。不要なら省く。
- 連続修正（「もっと可愛く」「○○にして」等の追従指示）でも同様に、既定は2ブロックのみ返す。
- ユーザーが「**詳しく**」「説明して」「変更点」「なぜ」等と明示した時**だけ**、解説や差分表を付ける。
- 辞書に新語を追記した場合の報告も、既定では省く（「詳しく」指定時のみ列挙）。

## 入力

- 日本語または英語の自然言語（キャラ説明・作品名・衣装・シーン・雰囲気など）。
- 既存タグの混在も可（その場合は形式を整えて統合）。

## 変換手順（1パスで素早く）

頭から順に1回で組み立てる。各項のルール詳細は [`conversion-guide.md`](./conversion-guide.md) 参照。

1. **ID** — 人数（`1girl` 等）＋固有名（キャラ名・作品名）。固有名は辞書に無くても Danbooru 表記で採用。
   キャラ固有要素は **キャラブロック**で囲う（→「キャラブロック規約」）。
2. **外見** — 髪・目・表情・顔・服飾・小物・露出を `tag-dictionary.json` でマッピング。辞書に無い語は最近傍の Danbooru タグへ。象徴的な衣装・特徴は `{{...}}` で強調。
   ⚠️ **催眠目は `hypnosis` を使わない**（渦背景・網点・レトロ画風を概念ごと引き込み、ネガで矯正しても勝てない）。代わりに `empty eyes, {{black pupils}}, blank stare, dilated pupils, expressionless, half-closed eyes` で虚ろ目を作る。`hypnosis_caveat` 参照。
3. **固定品質ブロック** — `fixed_blocks.quality_fixed` をそのまま挿入（毎回同一）。
4. **追加の服飾・露出**を続ける。
5. **ポーズ配列** — `pose_candidates` から 6 件程度を `||A|B|C|...||` に（毎回変える。入力指定があれば先頭に）。
6. **アングル配列** — `angle_candidates` から 5 件程度を `||A|B|C|...||` に。
7. **背景・光・画風・rating** を必要時のみ。**場所は空背景（何もない空間）にしない**：
   未指定なら `fixed_blocks.background_default`（`scenery, detailed background`）を必ず付け、
   `fixed_blocks.location_candidates`（屋内/屋外混在）から場所の可変配列 `||...||` を作る。場所指定があればそれを優先。
8. **固定ネガティブ** — `fixed_blocks.negative_fixed` を付与（基本そのまま。末尾に空背景を弾く固定分を含む）。

## キャラブロック規約（キャラ差し替え用）

キャラを後から入れ替えても破綻しないよう、**そのキャラを定義する固有要素**を1か所にまとめて囲う。

- **囲い方**: 外見の先頭に `0::char start::` 〜 `0::char end::` で挟み、間にキャラ固有要素を入れる。
  `0::...::` は **重み0で NovelAI に無視される**ため、目印として残したままでもプロンプトとして成立する。
  ```
  1girl, 0::char start::, sinomiya runa, vspo!, light purple hair, purple eyes, ..., 0::char end::, （以降は共通要素）
  ```
- **キャラ要素に入れるもの**: キャラ名・作品名、髪色/髪型、目の色、そのキャラ固有のアクセサリ（例: 専用イヤリング・髪飾り）など **そのキャラを定義する見た目**。
- **入れないもの（共通要素として外に置く）**: 人数（`1girl`）、その日の衣装、ポーズ/アングル配列、背景・光、催眠などの**効果**、品質固定ブロック、固定ネガ。
- **キャラ変更の手順（厳守）**: `0::char start::`〜`0::char end::` の **中身を丸ごと削除** → 新キャラの固有要素一式を入れる。共通要素（衣装・ポーズ・背景・効果）はそのまま残す。
  これにより旧キャラの要素が混入しない。

## 並び順（Positive）

```
[人数/ID] , [0::char start:: キャラ固有要素 0::char end::] , [効果・表情] , [象徴衣装(強調)] , [固定品質ブロック] ,
[追加の服飾・露出状態] , [ポーズ配列 ||...||] , [アングル配列 ||...||] ,
[背景・光・画風・rating(任意)]
```

## 出力フォーマット（既定はこの2ブロックのみ）

**Positive:**
```
（上記順に組み立てたタグ列）
```

**Negative:**
```
（固定ネガティブブロック）
```

これ以外（解説・手順・変更点表・追加語の報告）は **既定では付けない**（→「出力ポリシー」）。
ネガを加減した時のみ1行で添える。差分や解説は「詳しく」等の明示要求時だけ出す。

## 模範例（ユーザー実例ベース）

※ 既定の返し方はこの2ブロックのみ（前置き・解説なし）。

入力（自然言語の例）:
> VSPo の sinomiya runa。白いセーラー服に紫の大きなリボン、長袖、薄紫＆紫のグラデ髪、
> 紫のグラデ目で虚ろ・催眠っぽい表情、こちらを見ている、室内。白いスカート、へそチラ、
> 左胸にエンブレム、ミニハット、フリル靴下、チョーカー。

**Positive:**
```
sinomiya runa, vspo, {{white sailor uniform}}, {{purple large ribbon}}, long sleeves, light purple hair, purple hair, gradient eyes, purple eyes, empty eyes, hypnosis, blank stare, looking at viewer, indoors, {{masterpiece}}, {{best quality}}, {{ultra-detailed}}, {{finely detailed beautiful eyes}}, {{detailed skin}}, white skirt, midriff peek, navel peek, emblem on chest left, mini hat, frilled socks, choker, ||standing with hands on hips|sitting with legs crossed|leaning against wall|arms outstretched|kneeling|lying down|crouching||, ||from below|from above|dutch angle|from side|three-quarter view||
```

**Negative:**
```
loli, multiple breasts, [mutated hands and fingers:1.5 ], [long body :1.3], [mutation, poorly drawn :1.2] ,(Multi foot),((Multifold)),(Multi fingering), lowers, bad anatomy, bad hands, missing fingers, pubic hair, extra digit, fewer digits, cropped, worst quality, low quality, colored sclera, monster girl, Black hands, multiple breasts, mutated hands and fingers:1.5 , long body :1.3, [mutation, poorly drawn :1.2] , black-white, bad anatomy, The background is incoherent, more than 2 thighs, huge thighs, huge calf, bad hands, fused hand, missing hand, disappearing arms, disappearing thigh, disappearing calf, disappearing legs, missing fingers, fused fingers, one hand with more than 5 fingers, monochrome, greyscale, halftone, comic, sketch, spot color, limited palette, spiral, concentric circles, psychedelic, op art, retro artstyle, 1980s (style), simple background, white background, grey background, plain background, empty background, no background, transparent background, void
```
