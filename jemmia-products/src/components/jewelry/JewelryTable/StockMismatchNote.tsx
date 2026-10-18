import { WarningCircle } from "@phosphor-icons/react";
import { formatWarehouseName } from "@/lib/utils";
import type { SerialStockLocation } from "./utils/serialState";

/**
 * Live stock sitting somewhere other than where a serial was last counted. Shown under the
 * counted location wherever a serial's location appears (serial modal, combo page), so the two
 * sources are seen side by side instead of one posing as the truth.
 */
export function StockMismatchNote({ locations }: { locations: SerialStockLocation[] }) {
  if (locations.length === 0) return null;
  return (
    <span className="flex items-start gap-1 text-[9px] font-semibold text-amber-600 leading-tight mt-0.5">
      <WarningCircle size={10} weight="fill" className="shrink-0 mt-[1px]" />
      <span>
        Tồn kho:{" "}
        {locations
          .map((l) => `${formatWarehouseName(l.name) || "Không rõ"} (${l.qty_available})`)
          .join(", ")}
      </span>
    </span>
  );
}
