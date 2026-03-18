"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryBadge from "./CategoryBadge";
import { timeAgo } from "@/lib/utils";

export default function NewsCard({ article, index, featured }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  function handleClick(e) {
    e.preventDefault();
    router.push(`/article?id=${encodeURIComponent(article.id)}`);
  }

  // Featured card (first article) - large image on top
  if (featured) {
    return (
      <div
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          backgroundColor: "#fff",
          cursor: "pointer",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          transform: hovered ? "translateY(-2px)" : "none",
          boxShadow: hovered
            ? "0 8px 30px rgba(0,0,0,0.12)"
            : "0 1px 3px rgba(0,0,0,0.06)",
          animation: `fadeSlideIn 0.4s ease both`,
        }}
      >
        {article.imageUrl && (
          <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
            <img
              src={article.imageUrl}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        )}
        <div style={{ padding: "16px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <CategoryBadge category={article.category} />
            <span style={{ fontSize: "12px", color: "#8e8e93" }}>
              {timeAgo(article.publishedAt)}
            </span>
          </div>
          <h2
            style={{
              margin: "0 0 8px 0",
              fontSize: "20px",
              fontWeight: 700,
              lineHeight: 1.5,
              color: "#1c1c1e",
            }}
          >
            {article.title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              lineHeight: 1.7,
              color: "#6e6e73",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.description}
          </p>
          <div style={{ marginTop: "12px" }}>
            <span style={{ fontSize: "12px", color: "#8e8e93", fontWeight: 500 }}>
              {article.source}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Regular card - horizontal layout with thumbnail
  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        gap: "14px",
        padding: "16px",
        borderRadius: "14px",
        backgroundColor: "#fff",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered
          ? "0 4px 20px rgba(0,0,0,0.1)"
          : "0 1px 2px rgba(0,0,0,0.04)",
        animation: `fadeSlideIn 0.3s ease ${Math.min(index * 0.03, 0.3)}s both`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: "#8e8e93", fontWeight: 500 }}>
            {article.source}
          </span>
          <span style={{ fontSize: "11px", color: "#aeaeb2" }}>
            {timeAgo(article.publishedAt)}
          </span>
        </div>
        <h3
          style={{
            margin: "0 0 4px 0",
            fontSize: "15px",
            fontWeight: 700,
            lineHeight: 1.5,
            color: "#1c1c1e",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
          <CategoryBadge category={article.category} />
        </div>
      </div>
      {article.imageUrl && (
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "10px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={article.imageUrl}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      )}
    </div>
  );
}
