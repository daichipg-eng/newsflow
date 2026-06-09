# 参照ソース一覧

NovelAI 変換キットの根拠とした参照元。タグ辞書・変換ルールはこれらを基に再構成している
（生データの大量転載ではなく、要約・対訳表として整理）。

## 公式ドキュメント (docs.novelai.net)

- [Tags（タグの書き方）](https://docs.novelai.net/en/image/tags/) — タグはコンマ区切り・小文字、
  自然言語は通常の英文法。`_` はスペース化。データセットタグは先頭配置が有効。
- [Add Quality Tags Toggle（品質タグ）](https://docs.novelai.net/en/image/qualitytags/) — モデル別の
  自動付与タグ:
  - V4.5 Full / V4 Full: `no text, best quality, very aesthetic, absurdres`
  - V4.5 Curated: `location, masterpiece, no text, -0.8::feet::, rating:general`
  - V4 Curated: `rating:general, amazing quality, very aesthetic, absurdres`
  - aesthetic 系: `very aesthetic` / `aesthetic` / `displeasing` / `very displeasing`
- [Image Generation Basics](https://docs.novelai.net/en/image/basics/)
- [Prompting for Unique Artstyles](https://docs.novelai.net/en/image/tutorial-artstyles/)
- [Character Creation チュートリアル](https://docs.novelai.net/en/image/tutorial-charactercreation/)

> 注: 公式ページは直接の自動取得が 403 でブロックされるため、検索サマリ経由で要点を記録。

## 非公式 ナレッジベース / タグ実験

- [NovelAI Unofficial Knowledge Base (tapwavezodiac)](https://tapwavezodiac.github.io/novelaiUKB/Image-Generation.html)
  — タグ運用・強調記法・構図タグの解説。
- [nax.moe — NovelAI Tag Experiments](https://nax.moe/) — タグの効きを実験的に比較。
- [Danbooru Pose & Camera Tags — Moescape](https://moescape.ai/posts/danbooru-pose-and-camera-tags) —
  ポーズ・カメラ/構図タグ（`from above`, `cowboy shot`, `dutch angle`, `fisheye` 等）。

## Danbooru タググループ（カテゴリ語彙の元）

- 髪色・髪型、瞳、表情、服飾（Attire）、構図（Image Composition）、ポーズ&カメラ の
  各 Tag Group を語彙収集の基礎に使用。
- データセット例: Hugging Face `CaptionEmporium/danbooru-2021-sfw-*`, `X779/Danbooruwildcards`。

## 日本語タグ辞書・呪文集

- [Taskhub — NovelAI プロンプト完全ガイド](https://taskhub.jp/useful/novelai-prompt/)
- [るんるんスケッチ — プロンプトのコツ](https://runrunsketch.net/novelai-prompt/)
- [あきとのぶろぐ — 画風/髪型/表情/体型/構図の呪文](https://henmi-hiro.com/novelai-recommendation-all-prompt)
- [NovelAI 5ch Wiki (seesaawiki)](https://seesaawiki.jp/nai_ch/)
- [GIGAZINE — Danbooru タグまとめ](https://gigazine.net/gsc_news/en/20221119-danbooru-tag-novelai-waifu-diffusion/)
- [aituts — The Complete NovelAI Prompt Guide](https://aituts.com/novelai-anime-prompt-techniques/)

## 補足

- 上記は 2026-06 時点で参照。リンク切れや仕様更新があり得るため、変換時に不足語が出たら
  最新情報を都度調べて [`tag-dictionary.json`](./tag-dictionary.json) を更新する。
