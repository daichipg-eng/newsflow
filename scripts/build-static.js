#!/usr/bin/env node
/**
 * 静的ビルド用スクリプト
 * 1. news-cache.json を public/data.json にコピー
 * 2. API Route ファイルを一時的に無害化
 * 3. next build で静的エクスポート
 * 4. 全て元に戻す
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const CACHE_PATH = path.join(ROOT, "data", "news-cache.json");
const PUBLIC_DATA = path.join(ROOT, "public", "data.json");
const CONFIG_PATH = path.join(ROOT, "next.config.mjs");

const API_FILES = [
  path.join(ROOT, "app", "api", "news", "route.js"),
  path.join(ROOT, "app", "api", "summarize", "route.js"),
];

// 1. キャッシュを public にコピー
if (fs.existsSync(CACHE_PATH)) {
  fs.copyFileSync(CACHE_PATH, PUBLIC_DATA);
  const data = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
  console.log(`✓ ${data.totalArticles}件の記事を public/data.json にコピー`);
} else {
  fs.writeFileSync(PUBLIC_DATA, JSON.stringify({ articles: [], lastFetched: null }), "utf-8");
  console.log("⚠ キャッシュなし。空の data.json を作成");
}

// 2. API Route の元データを保存し、静的互換に置換
const backups = {};
for (const filePath of API_FILES) {
  if (fs.existsSync(filePath)) {
    backups[filePath] = fs.readFileSync(filePath, "utf-8");
    fs.writeFileSync(filePath, "export const dynamic = 'force-static';\nexport async function GET() { return new Response('static'); }\n");
  }
}
console.log("✓ API Routes を一時無害化");

// 3. next.config.mjs を export モードに
const originalConfig = fs.readFileSync(CONFIG_PATH, "utf-8");
const exportConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
};
export default nextConfig;
`;
fs.writeFileSync(CONFIG_PATH, exportConfig, "utf-8");

try {
  // 4. Next.js ビルド
  console.log("Next.js 静的ビルド開始...");
  execSync("npx next build", { stdio: "inherit", cwd: ROOT });
  console.log("\n✓ ビルド完了！out/ ディレクトリに静的ファイルが生成されました。");
} finally {
  // 5. 全て元に戻す
  fs.writeFileSync(CONFIG_PATH, originalConfig, "utf-8");
  for (const [filePath, content] of Object.entries(backups)) {
    fs.writeFileSync(filePath, content, "utf-8");
  }
  console.log("✓ 設定を復元");
}

console.log("\n--- デプロイ方法 ---");
console.log("Cloudflare Pages: npx wrangler pages deploy out");
console.log("GitHub Pages:     out/ を gh-pages ブランチにプッシュ");
console.log("Netlify:          out/ をドラッグ&ドロップ (https://app.netlify.com/drop)");
