export function formatPriceVND(price: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

/**
 * Floors a number to a specified number of decimal places (default 1 decimal place).
 */
export function floorToDecimal(value: number, decimals: number = 1): number {
  if (value === undefined || value === null || isNaN(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}