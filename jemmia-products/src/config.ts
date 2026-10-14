export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://salesaya-api.jemmia.vn";

export const WAREHOUSE_ID_TO_NAMES: Record<string, string[]> = {
  "1592770": ["[HCM] Admin"],
  "1582708": ["[HCM] Cửa Hàng HCM"],
  "1110168": ["[HCM] Kế Toán"],
  "1592778": ["[HN] Cửa Hàng HN"],
  "1593276": ["[CT] Cửa Hàng Cần Thơ"],
  "1619562": ["[HN] Admin"],
  "1710693": ["[CT] Admin"],
};

// Deliberately retail-only. Production holds live stock in at least 12 further locations
// (Hàng Mượn, Hàng Khách Đặt, Bảo Hành, Kiểm Định, Xưởng, Kho trung gian, ...) totalling ~474
// units. They are NOT listed here: these keys feed DEFAULT_WAREHOUSE_IDS, so adding one makes
// its stock count toward product listings. Names for those locations come from the server on
// each serial (`stockLocations`), which is the only list that stays correct as warehouses change.

export const WAREHOUSES_LIST = [
  { id: "1582708", name: "Hồ Chí Minh", ids: ["1592770", "1582708", "1110168"] },
  { id: "1592778", name: "Hà Nội", ids: ["1592778", "1619562"] },
  { id: "1593276", name: "Cần Thơ", ids: ["1593276", "1710693"] },
];

export const DEFAULT_WAREHOUSE_IDS = Object.keys(WAREHOUSE_ID_TO_NAMES);
