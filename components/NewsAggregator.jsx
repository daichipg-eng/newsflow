"use client";

import { useState, useEffect } from "react";
import NewsCard from "./NewsCard";
import { CATEGORIES } from "@/lib/constants";
import { isToday, isThisWeek } from "@/lib/utils";

export default function NewsAggregator() {
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [viewMode, setViewMode] = useState("week");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState("");
  const [lastFetched, setLastFetched] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        let data;
        try {
          const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
          const res = await fetch(`${base}/data.json`);
          if (res.ok) {
            data = await res.json();
            data.source = "cache";
          }
        } catch {}

        if (!data || !data.articles || data.articles.length === 0) {
          try {
            const res = await fetch("/api/news");
            data = await res.json();
          } catch {}
        }

        if (data) {
          setArticles(data.articles || []);
          setDataSource(data.source || "unknown");
          setLastFetched(data.lastFetched || null);
        }
      } catch {
        setArticles([]);
      }
      setLoading(false);
    }
    fetchNews();

    async function fetchStats() {
      try {
        const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
        const res = await fetch(`${base}/api-stats.json`);
        if (res.ok) setApiStats(await res.json());
      } catch {}
    }
    fetchStats();
  }, []);

  const filtered = articles.filter((a) => {
    const catMatch = activeCategory === "すべて" || a.category === activeCategory;
    const timeMatch = viewMode === "today" ? isToday(a.publishedAt) : isThisWeek(a.publishedAt);
    const searchMatch = searchQuery === "" || a.title.includes(searchQuery) || a.description.includes(searchQuery);
    return catMatch && timeMatch && searchMatch;
  });

  const categoryCounts = {};
  CATEGORIES.forEach((cat) => {
    const timeFiltered = articles.filter((a) =>
      viewMode === "today" ? isToday(a.publishedAt) : isThisWeek(a.publishedAt)
    );
    categoryCounts[cat] = cat === "すべて" ? timeFiltered.length : timeFiltered.filter((a) => a.category === cat).length;
  });

  return (
    <>
      {/* Header */}
      <header
        style={{
          padding: "16px 20px 0",
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(242, 242, 247, 0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#1c1c1e", letterSpacing: "-0.02em" }}>
              ニュース
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Time toggle */}
              <div style={{
                display: "flex",
                background: "#e5e5ea",
                borderRadius: "8px",
                padding: "2px",
              }}>
                {["today", "week"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: "6px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      border: "none",
                      borderRadius: "7px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      backgroundColor: viewMode === mode ? "#fff" : "transparent",
                      color: viewMode === mode ? "#1c1c1e" : "#8e8e93",
                      boxShadow: viewMode === mode ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    }}
                  >
                    {mode === "today" ? "今日" : "今週"}
                  </button>
                ))}
              </div>
              {/* Stats toggle */}
              {apiStats && (
                <button
                  onClick={() => setShowStats(!showStats)}
                  title={`API ${apiStats.todayRemaining}/100`}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: showStats ? "#e5e5ea" : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    color: "#8e8e93",
                    transition: "background 0.2s",
                  }}
                >
                  ⚙
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 16px",
                fontSize: "16px",
                border: "none",
                borderRadius: "12px",
                backgroundColor: "#e5e5ea",
                color: "#1c1c1e",
                outline: "none",
                transition: "box-shadow 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.boxShadow = "0 0 0 3px rgba(0,122,255,0.3)")}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>

          {/* Category tabs - horizontal scroll */}
          <div style={{
            display: "flex",
            gap: "4px",
            overflowX: "auto",
            paddingBottom: "12px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "7px 16px",
                  fontSize: "14px",
                  fontWeight: activeCategory === cat ? 700 : 500,
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  backgroundColor: activeCategory === cat ? "#1c1c1e" : "#e5e5ea",
                  color: activeCategory === cat ? "#fff" : "#6e6e73",
                }}
              >
                {cat}
                {categoryCounts[cat] > 0 && (
                  <span style={{ marginLeft: "5px", fontSize: "12px", opacity: 0.7 }}>
                    {categoryCounts[cat]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Stats panel */}
          {showStats && apiStats && (
            <div
              style={{
                padding: "14px 16px",
                background: "#fff",
                borderRadius: "12px",
                fontSize: "13px",
                color: "#6e6e73",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px 20px",
                marginBottom: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div>
                <span style={{ color: "#8e8e93", fontSize: "11px" }}>NewsAPI</span>
                <div style={{ color: "#1c1c1e", fontWeight: 600, fontSize: "15px" }}>
                  {apiStats.todayRemaining}
                  <span style={{ color: "#8e8e93", fontWeight: 400, fontSize: "12px" }}> / 100</span>
                </div>
              </div>
              <div>
                <span style={{ color: "#8e8e93", fontSize: "11px" }}>記事数</span>
                <div style={{ color: "#1c1c1e", fontWeight: 600, fontSize: "15px" }}>
                  {apiStats.articlesTotal}
                </div>
              </div>
              <div>
                <span style={{ color: "#8e8e93", fontSize: "11px" }}>最終取得</span>
                <div style={{ color: "#1c1c1e", fontWeight: 600, fontSize: "15px" }}>
                  {new Date(apiStats.lastFetched).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <div>
                <span style={{ color: "#8e8e93", fontSize: "11px" }}>Gemini</span>
                <div style={{ color: "#1c1c1e", fontWeight: 600, fontSize: "15px" }}>
                  {typeof window !== "undefined" ? localStorage.getItem("gemini_today_count") || "0" : "0"}
                  <span style={{ color: "#8e8e93", fontWeight: 400, fontSize: "12px" }}> / 1500</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* News list */}
      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "0 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#8e8e93" }}>
            <p style={{ fontSize: "15px", fontWeight: 500 }}>読み込み中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#8e8e93" }}>
            <p style={{ fontSize: "17px", fontWeight: 600, marginBottom: "8px" }}>記事が見つかりません</p>
            <p style={{ fontSize: "14px", color: "#aeaeb2" }}>カテゴリや期間を変更してみてください</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((article, i) => (
              <NewsCard
                key={article.id}
                article={article}
                index={i}
                featured={i === 0}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "32px 20px 24px" }}>
        <p style={{ fontSize: "12px", color: "#aeaeb2" }}>
          {filtered.length}件の記事
          {lastFetched && ` · ${new Date(lastFetched).toLocaleString("ja-JP", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })} 更新`}
        </p>
      </footer>
    </>
  );
}
