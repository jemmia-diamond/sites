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

export const VALID_WAREHOUSE_NAMES = Object.values(WAREHOUSE_ID_TO_NAMES).flat();

export const WAREHOUSES_LIST = [
  { id: "1582708", name: "Hồ Chí Minh", ids: ["1592770", "1582708", "1110168"] },
  { id: "1592778", name: "Hà Nội", ids: ["1592778", "1619562"] },
  { id: "1593276", name: "Cần Thơ", ids: ["1593276", "1710693"] },
];

export const DEFAULT_WAREHOUSE_IDS = Object.keys(WAREHOUSE_ID_TO_NAMES);
