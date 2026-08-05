export function formatPriceVND(price: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

/**
 * Floors a number to a specified number of decimal places and formats it with fixed decimal places (e.g. 5.0).
 */
export function floorToDecimal(value: number, decimals: number = 1): string {
  if (Number.isNaN(value)) return (0).toFixed(decimals);
  const factor = Math.pow(10, decimals);
  return (Math.floor(value * factor) / factor).toFixed(decimals);
}
