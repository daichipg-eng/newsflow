"use client";

import { CATEGORY_COLORS } from "@/lib/constants";

export default function CategoryBadge({ category }) {
  const c = CATEGORY_COLORS[category] || { bg: "#f2f2f7", text: "#8e8e93", border: "#d1d1d6" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        borderRadius: "12px",
        backgroundColor: c.bg,
        color: c.text,
        border: "none",
      }}
    >
      {category}
    </span>
  );
}
