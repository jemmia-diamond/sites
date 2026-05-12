export function formatPrice(price: number | null): string {
  if (!price) return "N/A";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function formatLySize(round: string): string {
  const parts = round.split("x");
  const size = parseFloat(parts[0].trim());
  return isNaN(size) ? round : `${size} ly`;
}

export function cleanFineness(f: string | undefined): string {
  if (!f) return "N/A";
  return f.replace(/Vàng/g, "").replace(/\s/g, "");
}