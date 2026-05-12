export function formatPrice(price: number | null): string {
  if (!price) return "N/A";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function formatLySize(round: string): string {
  const parts = round.split("x");
  const size = parseFloat(parts[0].trim());
  return isNaN(size) ? round : `${size} ly`;
}