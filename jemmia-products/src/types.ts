
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
  stockStatus: "IN_STOCK" | "INCOMING" | "OUT_OF_STOCK" | "REAL_OUT_OF_STOCK";
  quantity: number;
  warehouses: { name: string }[];
  thumbnails: { url: string }[];
  images: { url: string }[];
  videos: { url: string }[];
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

export type StockStatusFilter = "all" | "IN_STOCK" | "OUT_OF_STOCK" | "REAL_OUT_OF_STOCK";

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
}

export interface JewelryVariant {
  sku: string;
  barcode: string;
  variantId: string;
  material: string;
  size: number;
  weight: string;
  status: "HÀNG SẴN" | "HẾT HÀNG";
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

export interface DiamondFilter {
  salePriceFrom?: number;
  salePriceTo?: number;
  edgeSizes?: (number | string)[];
  edgeLongFrom?: number;
  edgeLongTo?: number;
  edgeShortFrom?: number;
  edgeShortTo?: number;
  warehouseIds?: string[];
  stockStatus?: "REAL_INCOMING" | "IN_STOCK";
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
