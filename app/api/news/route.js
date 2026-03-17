import { MOCK_NEWS } from "@/data/mock-news";
import fs from "fs";
import path from "path";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = "https://newsapi.org/v2";
const CACHE_PATH = path.join(process.cwd(), "data", "news-cache.json");

// dev時のみ動的に動作（static export時はAPI Routeは使われない）
export const dynamic = "force-dynamic";
export const dynamicParams = true;

// カテゴリ分類（英語・日本語両対応）
function categorize(text) {
  const t = text.toLowerCase();
  if (/\bai\b|tech|software|gpu|chip|semiconductor|apple|google|microsoft|github|robot|quantum|cyber|app\b|iphone|android|programming|テック|アプリ|ソフト|半導体|開発/.test(t)) return "テック";
  if (/econom|stock|market|bank|invest|gdp|inflat|interest rate|trade|business|financ|経済|株|為替|企業|決算|市場|金利/.test(t)) return "経済";
  if (/japan|tokyo|japan|岸田|国内|政府|東京/.test(t)) return "国内";
  return "海外";
}

// キャッシュJSONから読み込み
function readCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const data = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
      if (data.articles && data.articles.length > 0) {
        return { articles: data.articles, source: "cache", lastFetched: data.lastFetched };
      }
    }
  } catch {}
  return null;
}

// NewsAPI.org から直接取得（キャッシュがない場合のフォールバック）
async function fetchFromAPI() {
  if (!NEWS_API_KEY) return null;

  const url = `${BASE_URL}/top-headlines?country=jp&pageSize=40&apiKey=${NEWS_API_KEY}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (data.status === "ok" && data.articles) {
    return data.articles
      .filter((a) => a.title && a.title !== "[Removed]")
      .map((a, i) => ({
        id: `headline-${i}`,
        title: a.title,
        source: a.source?.name || "不明",
        category: categorize(a.title + " " + (a.description || "")),
        publishedAt: a.publishedAt || new Date().toISOString(),
        description: a.description || "",
        url: a.url || "#",
        imageUrl: a.urlToImage || null,
      }));
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const id = searchParams.get("id");

  // 1. キャッシュから読み込み
  const cached = readCache();

  // 2. キャッシュがなければAPI直接取得
  let articles;
  let source;
  let lastFetched;

  if (cached) {
    articles = cached.articles;
    source = cached.source;
    lastFetched = cached.lastFetched;
  } else {
    const apiArticles = await fetchFromAPI();
    if (apiArticles && apiArticles.length > 0) {
      articles = apiArticles;
      source = "api";
      lastFetched = new Date().toISOString();
    } else {
      articles = MOCK_NEWS;
      source = "mock";
      lastFetched = null;
    }
  }

  // 個別記事の取得
  if (id) {
    const article = articles.find((a) => a.id === id);
    if (article) {
      return Response.json({ article, source });
    }
    return Response.json({ error: "記事が見つかりません" }, { status: 404 });
  }

  // カテゴリフィルタ
  if (category && category !== "すべて") {
    articles = articles.filter((a) => a.category === category);
  }

  return Response.json({ articles, source, lastFetched });
}
