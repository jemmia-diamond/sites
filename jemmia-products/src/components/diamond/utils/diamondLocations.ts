import { formatWarehouseName } from "@/lib/utils";
import { STOCK_STATUS, type StockStatus } from "@/src/types";

/**
 * The warehouses to show for a diamond. One rule for every screen: an INCOMING stone has no
 * location yet, otherwise every warehouse holding it. The diamond table and the combo page used
 * to differ — the combo page showed only the first warehouse, and showed it even when incoming.
 */
export const diamondLocationNames = (diamond: {
  stockStatus?: StockStatus | null;
  warehouses?: { name: string }[] | null;
}): string[] =>
  diamond.stockStatus === STOCK_STATUS.INCOMING
    ? []
    : (diamond.warehouses ?? []).map((w) => formatWarehouseName(w.name)).filter(Boolean);
