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
          const res = await fetch("/data.json");
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
      if (data.summary) setSummary(data.summary);
      else setSummaryError(data.error || "要約に失敗しました");
    } catch {
      setSummaryError("要約はローカル環境でのみ利用できます");
    }
    setSummarizing(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#475569" }}>読み込み中...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <p style={{ color: "#475569", fontSize: "18px" }}>記事が見つかりません</p>
        <button onClick={() => router.push("/")} style={backButtonStyle}>← トップに戻る</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "0 16px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", paddingTop: "20px" }}>
        <button onClick={() => router.push("/")} style={backButtonStyle}>← ニュース一覧</button>
      </div>

      <article style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 0 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          <CategoryBadge category={article.category} />
          <span style={{ fontSize: "13px", color: "#4a5568", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
            {formatDate(article.publishedAt)}
          </span>
          <span style={{ fontSize: "13px", color: "#38bdf8" }}>{timeAgo(article.publishedAt)}</span>
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: 900, lineHeight: 1.5, color: "#f1f5f9", marginBottom: "12px" }}>
          {article.title}
        </h1>

        {article.titleOriginal && (
          <p style={{ fontSize: "13px", color: "#475569", marginBottom: "12px", fontStyle: "italic" }}>
            原文: {article.titleOriginal}
          </p>
        )}

        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
          ソース: <span style={{ color: "#94a3b8" }}>{article.source}</span>
          {article.translated && <span style={{ marginLeft: "8px", fontSize: "11px", color: "#38bdf8" }}>🌐 翻訳済み</span>}
        </p>

        {article.imageUrl && (
          <div style={{ marginBottom: "24px", borderRadius: "8px", overflow: "hidden", border: "1px solid #1a1a2e" }}>
            <img src={article.imageUrl} alt={article.title} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        )}

        <div style={{
          fontSize: "16px", lineHeight: 1.8, color: "#cbd5e1", padding: "20px",
          backgroundColor: "#0d0d1a", borderRadius: "8px", border: "1px solid #1a1a2e", marginBottom: "24px",
        }}>
          {article.description || "説明文がありません。"}
          {article.descriptionOriginal && (
            <p style={{ fontSize: "13px", color: "#475569", marginTop: "12px", borderTop: "1px solid #1a1a2e", paddingTop: "12px", fontStyle: "italic" }}>
              原文: {article.descriptionOriginal}
            </p>
          )}
        </div>

        <div style={{
          padding: "20px", backgroundColor: "#0a0f1a", borderRadius: "8px",
          border: "1px solid #1e3a5f", marginBottom: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: summary ? "12px" : "0" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#38bdf8" }}>✨ AI要約</span>
            {!summary && (
              <button onClick={handleSummarize} disabled={summarizing} style={{
                padding: "6px 16px", fontSize: "13px", fontWeight: 600, border: "1px solid #2563eb",
                borderRadius: "6px", cursor: summarizing ? "wait" : "pointer",
                backgroundColor: summarizing ? "#1e293b" : "#1e3a5f", color: "#38bdf8",
                opacity: summarizing ? 0.6 : 1,
              }}>
                {summarizing ? "要約中..." : "要約する"}
              </button>
            )}
          </div>
          {summary && <p style={{ fontSize: "14px", lineHeight: 1.8, color: "#94a3b8", margin: 0 }}>{summary}</p>}
          {summaryError && <p style={{ fontSize: "13px", color: "#f87171", margin: "8px 0 0" }}>{summaryError}</p>}
        </div>

        <a href={article.url} target="_blank" rel="noopener noreferrer" style={{
          display: "block", padding: "14px 20px", textAlign: "center", fontSize: "14px", fontWeight: 600,
          color: "#38bdf8", backgroundColor: "#0f172a", border: "1px solid #1e3a5f",
          borderRadius: "8px", textDecoration: "none",
        }}>
          元記事を読む →
        </a>
      </article>
    </div>
  );
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#475569" }}>読み込み中...</p></div>}>
      <ArticleContent />
    </Suspense>
  );
}

const backButtonStyle = {
  padding: "8px 16px", fontSize: "13px", fontWeight: 600, border: "1px solid #1a1a2e",
  borderRadius: "6px", cursor: "pointer", backgroundColor: "transparent", color: "#64748b",
};
