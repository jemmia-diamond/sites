
/**
 * The three canonical stock states. Mutually exclusive and jointly exhaustive: every product is
 * in exactly one, so the three filters partition the catalogue.
 *
 * The backend computes this and returns it as `stockStatus`; nothing in the UI should derive it
 * from quantities or warehouse arrays. Doing so is what let one sold diamond read "Đang về" on
 * the row while matching no filter at all.
 *
 * Retired: REAL_INCOMING and REAL_OUT_OF_STOCK (prefixed only because INCOMING and OUT_OF_STOCK
 * were broken server-side) and UNAVAILABLE (stock held in a non-retail warehouse, now folded
 * into OUT_OF_STOCK). The backend still accepts the old names for one release.
 */
export const STOCK_STATUS = {
  IN_STOCK: "IN_STOCK",
  INCOMING: "INCOMING",
  OUT_OF_STOCK: "OUT_OF_STOCK",
} as const;

export type StockStatus = typeof STOCK_STATUS[keyof typeof STOCK_STATUS];

/** The only place a status is turned into Vietnamese. */
export const STOCK_LABELS: Record<StockStatus, string> = {
  [STOCK_STATUS.IN_STOCK]: "Có hàng",
  [STOCK_STATUS.INCOMING]: "Đang về",
  [STOCK_STATUS.OUT_OF_STOCK]: "Chưa có sẵn",
};

/** Badge colours, keyed the same way so a new state cannot be added without one. */
export const STOCK_BADGE_CLASSES: Record<StockStatus, string> = {
  [STOCK_STATUS.IN_STOCK]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [STOCK_STATUS.INCOMING]: "bg-blue-50 text-blue-700 border-blue-200",
  [STOCK_STATUS.OUT_OF_STOCK]: "bg-gray-100 text-gray-500 border-gray-200",
};

export interface Bookmark {
  id: string;
  createdAt: string;
}

export interface HaravanVariant {
  variant_id: number;
  qty_available: number;
  qty_onhand: number;
  qty_incoming: number;
  qty_comitted: number;
}

export interface ProductModel {
  id: string;
  title: string;
  type: string | null;
  basePrice: number | null;
  salePrice: number | null;
  discountType: string | null;
  discountValue: number | null;
  stockStatus: StockStatus;
  quantity: number;
  warehouses: { name: string }[];
  thumbnails: { url: string }[];
  images: { url: string }[];
  videos: { url: string }[];
  try_on_images?: { url: string }[] | string[] | null;
  attributes: Record<string, any>;
  collections: {
    id: string;
    name: string;
  }[];
  isBookmarked: boolean;
  bookmark: Bookmark | null;
  barcode?: string;
  showOnWebsite?: boolean;
  lastRfidScanTime?: string;
  variants?: ProductModel[];
  products?: ProductModel[];
  haravanVariants?: HaravanVariant[];
}

export interface PaginateMeta {
  totalRows: number;
  totalItems: number;
  offset: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginateResponse<T> {
  data: T[];
  meta: PaginateMeta;
}

/** `undefined` means "no stock filter" — never send a sentinel value to mean "all". */
export type StockStatusFilter = StockStatus;

export interface Warehouse {
  id: string;
  name: string;
}

export interface ProductType {
  id: string;
  name: string;
}



export interface JewelryFilter {
  type?: string;
  types?: string[];
  styles?: string[];
  stockStatus?: StockStatusFilter;
  warehouseIds?: string[];
  storageSize1?: string[];
  collectionIds?: string[];
  salePriceFrom?: number;
  salePriceTo?: number;
  sortBySalePrice?: "ASC" | "DESC";
  designCode?: string;
  page?: number;
  searchQuery?: string;
  ringHeadStyles?: string[];
  ringBandStyles?: string[];
  fineness?: string;
  missingMedia?: boolean;
  limit?: number;
}

export interface JewelryVariant {
  sku: string;
  barcode: string;
  variantId: string;
  material: string;
  size: number;
  weight: string;
  quantity: number;
  originalPrice: number;
  salePrice: number;
}

export interface JewelryDesign {
  id: string;
  name: string;
  skuPrefix: string;
  collection: string;
  gender: "Nam" | "Nữ";
  mainStone: string;
  sideStone: string;
  status: "CHÍNH THỨC" | "GIÁ THAM KHẢO";
  promotion?: string;
  productCodes: string[];
  media: {
    web: string[];
    actual: string[];
    feedback: string[];
  };
  variants: JewelryVariant[];
}

/** Diamonds and jewelry now share one vocabulary. Kept as an alias for call sites. */
export type DiamondStockStatus = StockStatus;

export interface DiamondFilter {
  salePriceFrom?: number;
  salePriceTo?: number;
  edgeSizes?: (number | string)[];
  edgeLongFrom?: number;
  edgeLongTo?: number;
  edgeShortFrom?: number;
  edgeShortTo?: number;
  warehouseIds?: string[];
  stockStatus?: DiamondStockStatus;
  color?: string[];
  clarity?: string[];
  fluorescence?: string[];
  shapes?: string[];
  caratFrom?: number;
  caratTo?: number;
  sortBySalePrice?: "ASC" | "DESC";
  page?: number;
  limit?: number;
  searchQuery?: string;
}

export interface DiamondHistory {
  errors: string;
  note: string;
  stage: string;
  status: string;
  attachment?: string[] | null;
}

export interface DiamondAttribute {
  edgeSize1: number;
  edgeSize2: number;
  color: string;
  clarity: string;
  fluorescence: string;
  shape: string;
  cut: string;
  carat: string;
  giaPdfUrl: string | null;
  expectedArrivalDate: string | null;
  giaId: string;
  productId: string;
  variantId: string;
  giaImageUrl: string | null;
  isInComing: boolean | null;
  qty_incoming?: number;
  qty_available?: number;
  diamondHistory?: DiamondHistory;
}

export interface DiamondModel {
  discountType: string | null;
  discountValue: number | null;
  barcode: string;
  id: string;
  title: string;
  type: "diamond";
  stockStatus: StockStatus;
  warehouses: {
    name: string;
  }[];
  basePrice: number;
  salePrice: number;
  thumbnails: { url: string }[];
  images: { url: string }[];
  videos: { url: string }[];
  attributes: DiamondAttribute;
  variants: any[];
  quantity: number;
  isBookmarked: boolean;
  inCombo?: boolean;
  collections: {
    id: string;
    name: string;
  }[];
}
