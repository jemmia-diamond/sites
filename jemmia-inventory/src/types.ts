
export interface Bookmark {
  id: string;
  createdAt: string;
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
  variants?: ProductModel[];
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
  edgeSizes?: number[];
  warehouseIds?: string[];
  stockStatus?: "INCOMING" | "IN_STOCK" | "all";
  color?: string[];
  clarity?: string[];
  fluorescence?: string[];
  sortBySalePrice?: "ASC" | "DESC";
  page?: number;
  limit?: number;
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
  collections: {
    id: string;
    name: string;
  }[];
}
