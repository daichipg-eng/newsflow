"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CategoryBadge from "@/components/CategoryBadge";
import { timeAgo, formatDate } from "@/lib/utils";

function ArticleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const articleId = searchParams.get("id");
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    async function fetchArticle() {
      if (!articleId) { setLoading(false); return; }
      try {
        let articles = [];
        try {
          const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
          const res = await fetch(`${base}/data.json`);
          if (res.ok) {
            const data = await res.json();
            articles = data.articles || [];
          }
        } catch {}

        if (articles.length === 0) {
          try {
            const res = await fetch("/api/news");
            const data = await res.json();
            articles = data.articles || [];
          } catch {}
        }

        const found = articles.find((a) => a.id === articleId);
        if (found) setArticle(found);
      } catch {}
      setLoading(false);
    }
    fetchArticle();
  }, [articleId]);

  async function handleSummarize() {
    if (!article) return;
    setSummarizing(true);
    setSummaryError(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: article.title, description: article.description, source: article.source }),
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
        const today = new Date().toISOString().slice(0, 10);
        const key = "gemini_usage";
        let usage = {};
        try { usage = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
        if (usage.date !== today) usage = { date: today, count: 0 };
        usage.count += 1;
        localStorage.setItem(key, JSON.stringify(usage));
        localStorage.setItem("gemini_today_count", String(usage.count));
      }
      else setSummaryError(data.error || "要約に失敗しました");
    } catch {
      setSummaryError("要約はローカル環境でのみ利用できます");
    }
    setSummarizing(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f2f2f7" }}>
        <p style={{ color: "#8e8e93" }}>読み込み中...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", backgroundColor: "#f2f2f7" }}>
        <p style={{ color: "#8e8e93", fontSize: "17px" }}>記事が見つかりません</p>
        <button onClick={() => router.push("/")} style={backBtnStyle}>戻る</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f2f2f7" }}>
      {/* Nav bar */}
      <nav style={{
        padding: "12px 20px",
        position: "sticky",
        top: 0,
        backgroundColor: "rgba(242, 242, 247, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: "680px",
        margin: "0 auto",
      }}>
        <button onClick={() => router.push("/")} style={backBtnStyle}>
          ← 戻る
        </button>
        <span style={{ fontSize: "12px", color: "#8e8e93" }}>
          {article.source}
        </span>
      </nav>

      <article style={{ maxWidth: "680px", margin: "0 auto", padding: "0 20px 60px" }}>
        {/* Hero image */}
        {article.imageUrl && (
          <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <img src={article.imageUrl} alt="" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        )}

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          <CategoryBadge category={article.category} />
          <span style={{ fontSize: "13px", color: "#8e8e93" }}>
            {formatDate(article.publishedAt)}
          </span>
          <span style={{ fontSize: "13px", color: "#0a84ff", fontWeight: 500 }}>
            {timeAgo(article.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "24px",
          fontWeight: 800,
          lineHeight: 1.5,
          color: "#1c1c1e",
          marginBottom: "8px",
        }}>
          {article.title}
        </h1>

        {article.titleOriginal && (
          <p style={{ fontSize: "13px", color: "#aeaeb2", marginBottom: "8px" }}>
            {article.titleOriginal}
          </p>
        )}

        <p style={{ fontSize: "13px", color: "#8e8e93", marginBottom: "24px" }}>
          {article.source}
          {article.translated && <span style={{ marginLeft: "8px", fontSize: "11px", color: "#0a84ff" }}>翻訳</span>}
        </p>

        {/* Description */}
        <div style={{
          fontSize: "16px",
          lineHeight: 1.9,
          color: "#3a3a3c",
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "14px",
          marginBottom: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          {article.description || "説明文がありません。"}
          {article.descriptionOriginal && (
            <p style={{ fontSize: "13px", color: "#aeaeb2", marginTop: "16px", borderTop: "1px solid #f2f2f7", paddingTop: "12px" }}>
              {article.descriptionOriginal}
            </p>
          )}
        </div>

        {/* AI Summary */}
        <div style={{
          padding: "16px 20px",
          backgroundColor: "#fff",
          borderRadius: "14px",
          marginBottom: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: summary ? "12px" : "0" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1e" }}>AI要約</span>
            {!summary && (
              <button onClick={handleSummarize} disabled={summarizing} style={{
                padding: "7px 18px",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                borderRadius: "20px",
                cursor: summarizing ? "wait" : "pointer",
                backgroundColor: summarizing ? "#e5e5ea" : "#0a84ff",
                color: summarizing ? "#8e8e93" : "#fff",
                transition: "all 0.2s",
              }}>
                {summarizing ? "要約中..." : "要約する"}
              </button>
            )}
          </div>
          {summary && <p style={{ fontSize: "14px", lineHeight: 1.8, color: "#3a3a3c", margin: 0 }}>{summary}</p>}
          {summaryError && <p style={{ fontSize: "13px", color: "#ff3b30", margin: "8px 0 0" }}>{summaryError}</p>}
        </div>

        {/* Source link */}
        <a href={article.url} target="_blank" rel="noopener noreferrer" style={{
          display: "block",
          padding: "16px 20px",
          textAlign: "center",
          fontSize: "15px",
          fontWeight: 600,
          color: "#0a84ff",
          backgroundColor: "#fff",
          borderRadius: "14px",
          textDecoration: "none",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          元記事を読む
        </a>
      </article>
    </div>
  );
}

export default function ArticlePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f2f2f7" }}>
        <p style={{ color: "#8e8e93" }}>読み込み中...</p>
      </div>
    }>
      <ArticleContent />
    </Suspense>
  );
}

const backBtnStyle = {
  padding: "8px 16px",
  fontSize: "14px",
  fontWeight: 600,
  border: "none",
  borderRadius: "20px",
  cursor: "pointer",
  backgroundColor: "#e5e5ea",
  color: "#1c1c1e",
};
