#!/usr/bin/env node
/**
 * 既存キャッシュの未翻訳記事を翻訳するスクリプト
 * 使い方: node scripts/translate-cache.js
 */

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
let GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY && fs.existsSync(envPath)) {
  const match = fs.readFileSync(envPath, "utf-8").match(/GEMINI_API_KEY=(.+)/);
  if (match) GEMINI_API_KEY = match[1].trim();
}

if (!GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY が設定されていません");
  process.exit(1);
}

const CACHE_PATH = path.join(__dirname, "..", "data", "news-cache.json");

function isJapanese(text) {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translate(batch) {
  const items = batch.map((a, i) => `[${i}] TITLE: ${a.title}\nDESC: ${a.description || "N/A"}`).join("\n\n");
  const prompt = `以下のニュース記事のタイトルと説明文を自然な日本語に翻訳してください。
各記事を番号で区切り、以下の形式で出力してください:

[番号]
TITLE_JA: 翻訳されたタイトル
DESC_JA: 翻訳された説明文

原文が日本語の場合はそのまま返してください。説明文がN/Aの場合はDESC_JAも「N/A」としてください。

---
${items}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
      }),
    }
  );

  const data = await res.json();
  if (data.error?.code === 429) return "rate_limited";
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

function applyTranslations(batch, responseText) {
  const blocks = responseText.split(/\[\d+\]/).filter((b) => b.trim());
  let count = 0;
  blocks.forEach((block, i) => {
    if (i >= batch.length) return;
    const titleMatch = block.match(/TITLE_JA:\s*(.+)/);
    const descMatch = block.match(/DESC_JA:\s*(.+)/);
    if (titleMatch) {
      batch[i].titleOriginal = batch[i].title;
      batch[i].title = titleMatch[1].trim();
      count++;
    }
    if (descMatch && descMatch[1].trim() !== "N/A") {
      batch[i].descriptionOriginal = batch[i].description;
      batch[i].description = descMatch[1].trim();
    }
    batch[i].translated = true;
  });
  return count;
}

async function main() {
  if (!fs.existsSync(CACHE_PATH)) {
    console.error("キャッシュファイルがありません。先に npm run fetch を実行してください。");
    process.exit(1);
  }

  const cacheData = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
  const untranslated = cacheData.articles.filter((a) => !a.translated && !isJapanese(a.title));

  if (untranslated.length === 0) {
    console.log("全ての記事が翻訳済みです。");
    return;
  }

  console.log(`${untranslated.length}件の未翻訳記事を翻訳します...`);

  const batchSize = 5;
  let totalTranslated = 0;

  for (let i = 0; i < untranslated.length; i += batchSize) {
    const batch = untranslated.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(untranslated.length / batchSize);

    const result = await translate(batch);

    if (result === "rate_limited") {
      console.log(`\nレート制限に達しました。${totalTranslated}件翻訳済み、${untranslated.length - i}件残り。`);
      console.log("しばらく待ってから再実行してください。");
      break;
    }

    if (result) {
      const count = applyTranslations(batch, result);
      totalTranslated += count;
      console.log(`  バッチ ${batchNum}/${totalBatches}: ${count}件翻訳完了`);
    } else {
      console.error(`  バッチ ${batchNum}: 翻訳失敗`);
    }

    // レート制限対策
    if (i + batchSize < untranslated.length) {
      await sleep(5000);
    }
  }

  // 保存
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cacheData, null, 2), "utf-8");
  console.log(`\n✓ ${totalTranslated}件の記事を翻訳してキャッシュを更新しました。`);
}

main().catch((err) => {
  console.error("エラー:", err.message);
  process.exit(1);
});
