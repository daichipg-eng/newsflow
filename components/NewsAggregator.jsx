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

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        // まず静的data.jsonを試す、なければAPI Route
        let data;
        try {
          const res = await fetch("/data.json");
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
          borderBottom: "1px solid #1a1a2e",
          padding: "20px 32px",
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(8, 8, 15, 0.92)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "#f1f5f9",
                }}
              >
                NewsFlow
              </h1>
              {dataSource === "mock" && (
                <span style={{ fontSize: "11px", color: "#475569", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                  MOCK
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "2px", background: "#0f0f1a", borderRadius: "8px", padding: "3px", border: "1px solid #1a1a2e" }}>
              {["today", "week"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: "6px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    backgroundColor: viewMode === mode ? "#1e293b" : "transparent",
                    color: viewMode === mode ? "#e2e8f0" : "#64748b",
                  }}
                >
                  {mode === "today" ? "今日" : "今週"}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="ニュースを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 16px",
                fontSize: "14px",
                border: "1px solid #1a1a2e",
                borderRadius: "8px",
                backgroundColor: "#0f0f1a",
                color: "#e2e8f0",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
              onBlur={(e) => (e.target.style.borderColor = "#1a1a2e")}
            />
          </div>

          {/* Category tabs */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "5px 14px",
                  fontSize: "13px",
                  fontWeight: activeCategory === cat ? 700 : 500,
                  border: `1px solid ${activeCategory === cat ? "#2563eb" : "#1a1a2e"}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  backgroundColor: activeCategory === cat ? "#1e3a5f" : "transparent",
                  color: activeCategory === cat ? "#38bdf8" : "#64748b",
                }}
              >
                {cat}
                <span style={{ marginLeft: "6px", fontSize: "11px", opacity: 0.7 }}>
                  {categoryCounts[cat]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* News list */}
      <main style={{ maxWidth: "960px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#475569" }}>
            <p style={{ fontSize: "15px", fontWeight: 500 }}>読み込み中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#475569" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <p style={{ fontSize: "15px", fontWeight: 500 }}>該当するニュースがありません</p>
            <p style={{ fontSize: "13px", color: "#334155" }}>カテゴリや期間を変更してみてください</p>
          </div>
        ) : (
          filtered.map((article, i) => <NewsCard key={article.id} article={article} index={i} />)
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "40px 20px 24px", borderTop: "1px solid #1a1a2e", marginTop: "20px" }}>
        <p style={{ fontSize: "11px", color: "#334155", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
          NewsFlow • {filtered.length} articles
          {lastFetched && ` • 最終取得: ${new Date(lastFetched).toLocaleString("ja-JP")}`}
        </p>
      </footer>
    </>
  );
}
