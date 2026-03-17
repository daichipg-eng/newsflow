"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryBadge from "./CategoryBadge";
import { timeAgo, formatDate } from "@/lib/utils";

export default function NewsCard({ article, index }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  function handleClick(e) {
    e.preventDefault();
    router.push(`/article?id=${encodeURIComponent(article.id)}`);
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        padding: "16px 20px",
        borderBottom: "1px solid #1a1a2e",
        cursor: "pointer",
        transition: "all 0.2s ease",
        backgroundColor: hovered ? "#0d0d1a" : "transparent",
        animation: `fadeSlideIn 0.4s ease ${index * 0.05}s both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
        <CategoryBadge category={article.category} />
        <span style={{ fontSize: "12px", color: "#4a5568", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
          {formatDate(article.publishedAt)}
        </span>
        <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 500, marginLeft: "auto" }}>
          {timeAgo(article.publishedAt)}
        </span>
      </div>
      <h3
        style={{
          margin: "0 0 6px 0",
          fontSize: "15px",
          fontWeight: 700,
          lineHeight: 1.5,
          color: hovered ? "#e2e8f0" : "#cbd5e1",
          transition: "color 0.2s ease",
        }}
      >
        {article.title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: "13px",
          lineHeight: 1.7,
          color: "#64748b",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {article.description}
      </p>
      <div style={{ marginTop: "6px" }}>
        <span style={{ fontSize: "11px", color: "#475569" }}>
          {article.source}
        </span>
      </div>
    </div>
  );
}
