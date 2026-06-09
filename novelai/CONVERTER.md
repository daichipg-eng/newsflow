# CONVERTER — Claude 用 変換手順書

このファイルは、**この対話の中で Claude が自然言語を NovelAI プロンプトへ変換する**ための
手順書（システムプロンプト的役割）。ユーザーが自然言語を貼ったら、以下に従って変換する。

参照: [`tag-dictionary.json`](./tag-dictionary.json) / [`conversion-guide.md`](./conversion-guide.md)

## 入力

- 日本語または英語の自然言語（キャラ説明・作品名・衣装・シーン・雰囲気など）。
- 既存タグの混在も可（その場合は形式を整えて統合）。

## 変換手順

1. **被写体・作品/キャラID を抽出** — 人数（`1girl` 等）、固有名（キャラ名・作品名）。
   固有名は辞書に無くても Danbooru 表記（小文字・スペース）でそのまま採用。
2. **外見をカテゴリ抽出** — 髪・目・表情・顔の特徴・服飾・小物・露出状態などに分解し、
   `tag-dictionary.json` でマッピング。**辞書に無い語は調べて最近傍の Danbooru タグへ変換し、
   かつ辞書へ追記**（拡張ポリシー）。
3. **重要な衣装・特徴を `{{...}}` で強調** — 象徴的な衣装（例: `{{white sailor uniform}}`）や
   キービジュアル要素を二重括弧で強める。
4. **固定品質ブロックを挿入**（必ず同一文字列）:
   `{{masterpiece}}, {{best quality}}, {{ultra-detailed}}, {{finely detailed beautiful eyes}}, {{detailed skin}}`
5. **ポーズ配列を生成** — `pose_candidates` から **6 件程度**を選び `||A|B|C|...||` に。
   入力にポーズ指定があればそれを先頭に含めつつ、他候補も混ぜて固定化を避ける。
6. **アングル配列を生成** — `angle_candidates` から **5 件程度**を選び `||A|B|C|...||` に。
7. **背景・光・画風・レーティング**を必要に応じ付与。
8. **固定ネガティブを付与**（基本そのまま、必要なら加減）。

## 並び順（Positive）

```
[人数/ID] , [外見: 髪・目・表情・象徴衣装(強調)・小物] , [固定品質ブロック] ,
[追加の服飾・露出状態] , [ポーズ配列 ||...||] , [アングル配列 ||...||] ,
[背景・光・画風・rating(任意)]
```

## 出力フォーマット（必ずこの2ブロックで返す）

**Positive:**
```
（上記順に組み立てたタグ列）
```

**Negative:**
```
（固定ネガティブブロック。加減した場合はその旨を一言添える）
```

加えて、辞書に追記した新語があれば「追加した語」を箇条書きで報告する。

## 模範例（ユーザー実例ベース）

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
loli, multiple breasts, [mutated hands and fingers:1.5 ], [long body :1.3], [mutation, poorly drawn :1.2] ,(Multi foot),((Multifold)),(Multi fingering), lowers, bad anatomy, bad hands, missing fingers, pubic hair, extra digit, fewer digits, cropped, worst quality, low quality, colored sclera, monster girl, Black hands, multiple breasts, mutated hands and fingers:1.5 , long body :1.3, [mutation, poorly drawn :1.2] , black-white, bad anatomy, The background is incoherent, more than 2 thighs, huge thighs, huge calf, bad hands, fused hand, missing hand, disappearing arms, disappearing thigh, disappearing calf, disappearing legs, missing fingers, fused fingers, one hand with more than 5 fingers
```
