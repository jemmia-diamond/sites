/**
 * Serial state: the one definition of whether a physical piece is on a shop floor, held
 * elsewhere, or sold.
 *
 * This exists because the modal used to derive "Đã bán" from `quantity === 0`. That quantity is a
 * variant-wide total summed across every warehouse, so a ring in transit between stores summed to
 * zero and read as sold — while a stale `stock_at` string pointed at a shelf that was empty. Two
 * staff comparing the same serial reached opposite conclusions and neither was right.
 *
 * OFF_RETAIL is deliberately vague, because the data is. Production keeps live stock in at least
 * 12 non-retail locations -- Hàng Mượn, Hàng Khách Đặt, Bảo Hành, Kiểm Định, Xưởng, Kho trung
 * gian -- which mean borrowed, reserved, under warranty, being appraised, in the workshop and in
 * transit respectively. Naming the bucket "Đang chuyển" would assert a movement nobody recorded,
 * which is the same mistake as calling a zero quantity "Đã bán". The row names the real warehouse.
 *
 * Same contract as STOCK_STATUS in types.ts: mutually exclusive, jointly exhaustive, and never
 * derived from a quantity.
 */

export const SERIAL_STATE = {
  IN_STOCK: "IN_STOCK",
  OFF_RETAIL: "OFF_RETAIL",
  SOLD: "SOLD",
} as const;

export type SerialState = typeof SERIAL_STATE[keyof typeof SERIAL_STATE];

/** The only place a serial state is turned into Vietnamese. */
export const SERIAL_STATE_LABELS: Record<SerialState, string> = {
  [SERIAL_STATE.IN_STOCK]: "Có hàng",
  [SERIAL_STATE.OFF_RETAIL]: "Kho khác",
  [SERIAL_STATE.SOLD]: "Đã bán",
};

/** Badge colours, keyed the same way so a new state cannot be added without one. */
export const SERIAL_STATE_BADGE_CLASSES: Record<SerialState, string> = {
  [SERIAL_STATE.IN_STOCK]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [SERIAL_STATE.OFF_RETAIL]: "bg-amber-50 text-amber-700 border-amber-200",
  [SERIAL_STATE.SOLD]: "bg-gray-100 text-gray-500 border-gray-200",
};

/** Tab order, also the precedence for picking which tab to open on. */
export const TAB_ORDER: SerialState[] = [
  SERIAL_STATE.IN_STOCK,
  SERIAL_STATE.OFF_RETAIL,
  SERIAL_STATE.SOLD,
];

export interface SerialStockLocation {
  id: number;
  name: string | null;
  qty_available: number;
}

function isSerialState(value: unknown): value is SerialState {
  return typeof value === "string" && value in SERIAL_STATE_LABELS;
}

/**
 * Prefer the server's state. The fallback runs only against a backend that has not shipped
 * `serialState` yet, and is deliberately narrower than the rule it replaced: an order link means
 * sold, and nothing else does. `quantity` is never consulted.
 */
export function getSerialState(v: any): SerialState {
  if (isSerialState(v?.serialState)) return v.serialState;
  if (v?.orderReference) return SERIAL_STATE.SOLD;
  return v?.atRetail ? SERIAL_STATE.IN_STOCK : SERIAL_STATE.OFF_RETAIL;
}

/**
 * Live stock sitting somewhere other than where the piece was last counted.
 *
 * A non-empty result means the two sources disagree and the user must be shown both rather than
 * one of them posing as the truth. Empty means they agree, or there is nothing to compare.
 *
 * The server sends it as `locationMismatch` -- the same field the Salesaya extension renders, so
 * both show the same note. The rule below is only for a backend that does not send it yet.
 */
export function getStockMismatch(v: any): SerialStockLocation[] {
  if (Array.isArray(v?.locationMismatch)) return v.locationMismatch;
  const locations: SerialStockLocation[] = Array.isArray(v?.stockLocations) ? v.stockLocations : [];
  if (locations.length === 0) return [];

  const countedAt = String(v?.lastCountedAt ?? v?.stockAt ?? "").trim().toLowerCase();
  if (!countedAt) return locations;

  const agrees = locations.some((l) => (l.name ?? "").trim().toLowerCase() === countedAt);
  return agrees ? [] : locations;
}
