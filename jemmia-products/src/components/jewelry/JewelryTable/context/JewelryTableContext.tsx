import { createContext, use } from "react";

export interface JewelryTableContextValue {
  warehouseIds?: string[];
  stockStatus?: string;
  expandedId: string | null;
  brokenImages: Set<string>;
  onToggleExpand: (id: string | null) => void;
  onImageError: (url: string) => void;
  onPreview: (images: string[], index: number, config?: any) => void;
  onOpenSerialModal: (
    variants: any[],
    sku: string,
    totalQuantity?: number,
    totalHaravanQuantity?: number
  ) => void;
  onUploadSuccess: (fromGallery?: boolean) => void | Promise<void>;
}

export const JewelryTableContext = createContext<JewelryTableContextValue | null>(null);

export function useJewelryTable() {
  const context = use(JewelryTableContext);
  if (!context) {
    throw new Error("useJewelryTable must be used within a JewelryTableProvider");
  }
  return context;
}
