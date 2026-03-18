#!/usr/bin/env node
/**
 * ニュース取得 + 日本語翻訳スクリプト
 * NewsAPI.orgからニュースを取得し、Google翻訳（無料）で日本語に翻訳してキャッシュに保存する。
 * 使い方: node scripts/fetch-news.js
 */

const fs = require("fs");
const path = require("path");
const translate = require("google-translate-api-x");

// .env.localからAPIキーを読み込む
const envPath = path.join(__dirname, "..", ".env.local");
let NEWS_API_KEY = process.env.NEWS_API_KEY;

if (!NEWS_API_KEY && fs.existsSync(envPath)) {
  const match = fs.readFileSync(envPath, "utf-8").match(/NEWS_API_KEY=(.+)/);
  if (match) NEWS_API_KEY = match[1].trim();
}

if (!NEWS_API_KEY) {
  console.error("ERROR: NEWS_API_KEY が設定されていません");
  process.exit(1);
}

const BASE_URL = "https://newsapi.org/v2";
const CACHE_PATH = path.join(__dirname, "..", "data", "news-cache.json");
const STATS_PATH = path.join(__dirname, "..", "data", "api-stats.json");

// カテゴリ分類
function categorize(text) {
  const t = text.toLowerCase();
  if (/\bai\b|tech|software|gpu|chip|semiconductor|apple|google|microsoft|github|robot|quantum|cyber|app\b|iphone|android|programming|テック|アプリ|ソフト|半導体|開発/.test(t)) return "テック";
  if (/econom|stock|market|bank|invest|gdp|inflat|interest rate|trade|business|financ|経済|株|為替|企業|決算|市場|金利/.test(t)) return "経済";
  if (/japan|tokyo|岸田|国内|政府|東京/.test(t)) return "国内";
  return "海外";
}

function isJapanese(text) {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Google翻訳（無料・APIキー不要）で翻訳
async function translateArticles(articles) {
  const needsTranslation = articles.filter((a) => !isJapanese(a.title));
  if (needsTranslation.length === 0) return articles;

  console.log(`  ${needsTranslation.length}件の記事を日本語に翻訳中...`);

  let translated = 0;
  for (let i = 0; i < needsTranslation.length; i++) {
    const article = needsTranslation[i];
    try {
      // タイトル翻訳
      const titleResult = await translate(article.title, { from: "auto", to: "ja" });
      article.titleOriginal = article.title;
      article.title = titleResult.text;

      // 説明文翻訳
      if (article.description && article.description.length > 0) {
        const descResult = await translate(article.description, { from: "auto", to: "ja" });
        article.descriptionOriginal = article.description;
        article.description = descResult.text;
      }

      article.translated = true;
      translated++;

      // 進捗表示（10件ごと）
      if (translated % 10 === 0 || translated === needsTranslation.length) {
        console.log(`  翻訳: ${translated}/${needsTranslation.length}件完了`);
      }

      // レート制限対策: 少し待つ
      if (i < needsTranslation.length - 1) {
        await sleep(300);
      }
    } catch (err) {
      console.error(`  翻訳エラー (${i + 1}): ${err.message}`);
      // エラーが続く場合はスキップして続行
      await sleep(1000);
    }
  }

  console.log(`  ✓ ${translated}件翻訳完了`);
  return articles;
}

// US top headlines
async function fetchTopHeadlines() {
  const url = `${BASE_URL}/top-headlines?country=us&pageSize=40&apiKey=${NEWS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "ok" || !data.articles) {
    console.error("top-headlines エラー:", data.message || data.code || "不明なエラー");
    return [];
  }

  return data.articles
    .filter((a) => a.title && a.title !== "[Removed]")
    .map((a, i) => ({
      id: `us-${Date.now()}-${i}`,
      title: a.title,
      source: a.source?.name || "Unknown",
      category: categorize(a.title + " " + (a.description || "")),
      publishedAt: a.publishedAt || new Date().toISOString(),
      description: a.description || "",
      url: a.url || "#",
      imageUrl: a.urlToImage || null,
      translated: false,
    }));
}

// テック系ニュース
async function fetchTechNews() {
  const url = `${BASE_URL}/everything?q=technology OR AI OR software&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "ok" || !data.articles) return [];

  return data.articles
    .filter((a) => a.title && a.title !== "[Removed]")
    .map((a, i) => ({
      id: `tech-${Date.now()}-${i}`,
      title: a.title,
      source: a.source?.name || "Unknown",
      category: "テック",
      publishedAt: a.publishedAt || new Date().toISOString(),
      description: a.description || "",
      url: a.url || "#",
      imageUrl: a.urlToImage || null,
      translated: false,
    }));
}

// 日本関連ニュース
async function fetchJapanNews() {
  const url = `${BASE_URL}/everything?q=Japan&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "ok" || !data.articles) return [];

  return data.articles
    .filter((a) => a.title && a.title !== "[Removed]")
    .map((a, i) => ({
      id: `jp-${Date.now()}-${i}`,
      title: a.title,
      source: a.source?.name || "Unknown",
      category: categorize(a.title + " " + (a.description || "")),
      publishedAt: a.publishedAt || new Date().toISOString(),
      description: a.description || "",
      url: a.url || "#",
      imageUrl: a.urlToImage || null,
      translated: false,
    }));
}

async function main() {
  console.log(`[${new Date().toLocaleString("ja-JP")}] ニュース取得開始...`);

  // 並列で取得（3リクエスト消費）
  const [headlines, tech, japan] = await Promise.all([
    fetchTopHeadlines(),
    fetchTechNews(),
    fetchJapanNews(),
  ]);

  let allArticles = [...headlines, ...tech, ...japan];
  console.log(`  取得: ${allArticles.length}件`);

  if (allArticles.length === 0) {
    console.log("取得できた記事が0件です。キャッシュは更新しません。");
    return;
  }

  // タイトルベースの重複排除
  const seen = new Set();
  allArticles = allArticles.filter((a) => {
    const key = a.title.replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 既存キャッシュと統合（翻訳済み記事を保持）
  let existing = [];
  if (fs.existsSync(CACHE_PATH)) {
    try {
      const cached = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
      existing = cached.articles || [];
    } catch {}
  }

  const existingMap = new Map();
  existing.forEach((a) => {
    const key = (a.titleOriginal || a.title).replace(/\s+/g, " ").trim();
    existingMap.set(key, a);
  });

  const newArticles = [];
  allArticles.forEach((a) => {
    const key = a.title.replace(/\s+/g, " ").trim();
    if (!existingMap.has(key)) {
      newArticles.push(a);
    }
  });

  console.log(`  新規: ${newArticles.length}件`);

  // 新しい記事を翻訳（Google翻訳・無料）
  if (newArticles.length > 0) {
    await translateArticles(newArticles);
  }

  // 統合: 新しい記事 + 既存記事、時系列ソート、最大300件
  const merged = [...newArticles, ...existing]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 300);

  const cacheData = {
    lastFetched: new Date().toISOString(),
    totalArticles: merged.length,
    newArticles: newArticles.length,
    articles: merged,
  };

  const dataDir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  fs.writeFileSync(CACHE_PATH, JSON.stringify(cacheData, null, 2), "utf-8");

  // public/data.json にもコピー（devモード + 静的ビルド両対応）
  const publicData = path.join(__dirname, "..", "public", "data.json");
  fs.copyFileSync(CACHE_PATH, publicData);

  // API使用量を記録
  let stats = { daily: [], totalRequests: 0 };
  if (fs.existsSync(STATS_PATH)) {
    try { stats = JSON.parse(fs.readFileSync(STATS_PATH, "utf-8")); } catch {}
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = stats.daily.find((d) => d.date === today);
  const requestsUsed = 3;

  if (todayEntry) {
    todayEntry.requests += requestsUsed;
    todayEntry.fetches += 1;
    todayEntry.articles += newArticles.length;
  } else {
    stats.daily.push({
      date: today,
      requests: requestsUsed,
      fetches: 1,
      articles: newArticles.length,
    });
  }

  // 直近30日分だけ保持
  stats.daily = stats.daily.slice(-30);
  stats.totalRequests = stats.daily.reduce((sum, d) => sum + d.requests, 0);
  stats.lastFetched = new Date().toISOString();
  stats.todayRemaining = 100 - (todayEntry ? todayEntry.requests : requestsUsed);
  stats.newsApiLimit = 100;
  stats.articlesTotal = merged.length;

  fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2), "utf-8");

  // public/api-stats.json にもコピー
  const publicStats = path.join(__dirname, "..", "public", "api-stats.json");
  fs.copyFileSync(STATS_PATH, publicStats);

  console.log(`\n✓ ${newArticles.length}件の新しい記事を追加（合計${merged.length}件）`);
  console.log(`  NewsAPI: ${requestsUsed}リクエスト消費（本日残り: ${stats.todayRemaining}/100）`);
  console.log(`  Google翻訳: 無料（制限なし）`);
  console.log(`  保存先: ${CACHE_PATH}`);
}

main().catch((err) => {
  console.error("エラー:", err.message);
  process.exit(1);
});
