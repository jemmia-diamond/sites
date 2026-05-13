export function formatPrice(price: number | null): string {
  if (!price) return "N/A";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function formatPriceMillion(price: number): string {
  const million = price / 1000000;
  if (million % 1 === 0) {
    return `${million}tr`;
  }
  return `${million.toFixed(1).replace(/\.0$/, "")}tr`;
}

export function formatLySize(round: string): string {
  const parts = round.split("x");
  const size = parseFloat(parts[0].trim());
  return isNaN(size) ? round : `${size} ly`;
}