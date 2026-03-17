export function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "たった今";
  if (diffH < 24) return `${diffH}時間前`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "昨日";
  return `${diffD}日前`;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function isToday(dateStr) {
  const d = new Date(dateStr);
  return d.toDateString() === new Date().toDateString();
}

export function isThisWeek(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return d >= weekAgo;
}
