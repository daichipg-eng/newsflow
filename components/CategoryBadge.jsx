"use client";

import { CATEGORY_COLORS } from "@/lib/constants";

export default function CategoryBadge({ category }) {
  const c = CATEGORY_COLORS[category] || { bg: "#1a1a2e", text: "#94a3b8", border: "#2a2a3e" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.05em",
        borderRadius: "4px",
        backgroundColor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        textTransform: "uppercase",
      }}
    >
      {category}
    </span>
  );
}
