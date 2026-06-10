# NovelAI 変換ガイド (V4 / V4.5)

自然言語 → NovelAI Diffusion V4/V4.5 プロンプトへ変換する際の中核ルール。
辞書本体は [`tag-dictionary.json`](./tag-dictionary.json)、変換手順は [`CONVERTER.md`](./CONVERTER.md)。

## 1. タグの基本形式

- すべて **小文字**（英語）で書く。
- タグ区切りは **`, `（カンマ + 半角スペース）**。
- Danbooru の `_`（アンダースコア）は **スペース**に置き換える（パーサが自動変換するため可読性優先）。
  例: `looking_at_viewer` → `looking at viewer`。
- 「画面に写っているものだけ」をタグ化する（"tag what you see"）。写っていない設定は書かない。

## 2. タグの順序（推奨）

NovelAI では先頭側のタグほど強く効く。本キットの並び順:

1. **被写体 / 作品・キャラID**（例: `1girl, sinomiya runa, vspo`）
2. **外見の主要特徴**（髪・目・表情・象徴的な衣装。重要なものは `{{...}}` で強調）
3. **固定品質ブロック**（後述）
4. **服飾・小物などの追加外見**
5. **ポーズ（可変配列 `||...||`）**
6. **アングル / カメラ（可変配列 `||...||`）**
7. （必要なら）背景・光・画風・レーティング

## 3. 強調・重み記法

- `{tag}` … 強調を上げる（V4系で約 +5%）。`{{tag}}` のように **多重で強める**。
- `[tag]` … 強調を下げる（約 -5%）。`[[tag]]` で更に弱める。
- `数値::tag::` … 数値で重み付け。例 `1.3::tag::`（強）/ `0.8::tag::`（弱）。
- ネガティブ側では `[tag:1.5]` のような旧記法もユーザー定型に含まれるため**そのまま踏襲**する。

## 4. 固定品質ブロック（毎回必ず付与）

```
{{masterpiece}}, {{best quality}}, {{ultra-detailed}}, {{finely detailed beautiful eyes}}, {{detailed skin}}
```

- これは**固定**。生成のたびに同一文字列を必ず挿入する。
- 参考: 公式 "Add Quality Tags" 相当（モデル別）。必要に応じ併用可。
  - V4.5 Full / V4 Full: `no text, best quality, very aesthetic, absurdres`
  - V4.5 Curated: `location, masterpiece, no text, -0.8::feet::, rating:general`
  - V4 Curated: `rating:general, amazing quality, very aesthetic, absurdres`
  - aesthetic 系: `very aesthetic` / `aesthetic` / `displeasing` / `very displeasing`

## 5. 可変配列記法 `||A|B|C||`（ポーズ・アングル）

- `||` で囲み、候補を `|` で区切る。**候補の中から1つが選ばれる**ユーザー運用の記法。
- ポーズとアングルは**固定にしない**。毎回 [`tag-dictionary.json`](./tag-dictionary.json) の
  `pose_candidates` / `angle_candidates` から複数を選んで配列化する。
- 既定の出力数: **ポーズ 6 件・アングル 5 件**程度（指定があれば調整）。
- 例:
  ```
  ||standing with hands on hips|sitting with legs crossed|leaning against wall|kneeling|lying down|crouching||,
  ||from below|from above|dutch angle|from side|three-quarter view||
  ```

## 6. 固定ネガティブプロンプト（基本固定・必要に応じ加減）

```
lowres, worst quality, low quality, normal quality, bad anatomy, bad hands, bad proportions, extra digits, fewer digits, missing fingers, fused fingers, one hand with more than 5 fingers, mutated hands and fingers, blurry, jpeg artifacts, signature, watermark, username, text, monochrome, greyscale, halftone, comic, sketch, spot color, limited palette, colored sclera, spiral, concentric circles, psychedelic, op art, retro artstyle, 1980s (style), loli, monster girl, simple background, white background, grey background, plain background, empty background, no background, transparent background, void
```

- NovelAI V4/V4.5 用ネガ。SD 旧記法（`[tag:1.5]` / `(tag)`）は NovelAI で効かないため使わない。重みが要る時は `1.3::tag::` 形式。
- **画風・色の矯正語（`monochrome, greyscale, halftone, comic, sketch, spot color, limited palette` ＋ 渦/レトロ系 `spiral, concentric circles, psychedelic, op art, retro artstyle, 1980s (style)`）は必須**。
  これらを抜くと、**網点デュオトーン＋渦背景のレトロ催眠同人調**（肌が一色に潰れ、背景が同心円/縞）に転ぶ。
- ⚠️ **最大の原因はネガではなくポジ側 `hypnosis` タグ**。`hypnosis` は渦背景・網点・レトロ画風を概念ごと引き込むため、
  ネガで矯正しても勝てないことが多い。**催眠目を出したい時は `hypnosis` を使わず**、
  `empty eyes, {{black pupils}}, blank stare, dilated pupils, expressionless, half-closed eyes` の組み合わせで虚ろ目を作る。
  どうしても使うなら `[hypnosis]`（弱化）にし、背景を `indoors, detailed background` 等で具体指定して渦に埋めさせない。
- NovelAI は**ネガ盛りすぎが逆効果**だが、上の画風矯正は残す。手指・解剖系は最小限に保つ。
- 末尾の空背景抑制（`simple background`〜`void`）はキットの背景ルール用の固定分。

## 7. レーティング

`rating:general` / `rating:sensitive` / `rating:questionable` / `rating:explicit` を必要に応じ付与。
本キットの既定は健全寄り（ネガに `loli` を含むユーザー定型を尊重）。

## 8. 出典

主要ルールの出典は [`SOURCES.md`](./SOURCES.md) を参照。
