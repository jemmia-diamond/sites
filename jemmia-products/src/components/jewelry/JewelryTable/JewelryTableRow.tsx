import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductModel } from "../../../types";
import { cn } from "@/lib/utils";
import { ProductCodes } from "./ProductCodes";
import { SideStoneTooltip } from "./SideStoneTooltip";
import { CompactGallery } from "./CompactGallery";
import { TableCell, TableRow } from "@/components/ui/table";
import { CaretDown, ArrowSquareOut } from "@phosphor-icons/react";
import { formatPriceMillion, formatDateTime } from "./utils/formatters";

interface JewelryTableRowProps {
  product: ProductModel;
  warehouseIds?: string[];
  isExpanded: boolean;
  expandedId: string | null;
  brokenImages: Set<string>;
  onImageError: (url: string) => void;
  onPreview: (images: string[], index: number, config?: any) => void;
  onToggleExpand: (id: string) => void;
  onOpenSerialModal: (variants: any[], sku: string, totalQuantity?: number, totalHaravanQuantity?: number) => void;
  onUploadSuccess?: () => void;
  key: string;
}

const WAREHOUSE_ID_TO_NAMES: Record<string, string[]> = {
  "1592770": ["[HCM] Cửa Hàng HCM"],
  "1582708": ["[HCM] Kế Toán", "[HCM] Kho Hàng Khách Đặt"],
  "1110168": ["[HCM] Admin"],
  "1592778": ["[HN] Cửa Hàng HN"],
  "1593276": ["[CT] Cửa Hàng CT", "[CT] Cửa Hàng Cần Thơ"],
};

export function JewelryTableRow({
  product,
  warehouseIds,
  isExpanded,
  brokenImages,
  onImageError,
  onPreview,
  onToggleExpand,
  onOpenSerialModal,
  onUploadSuccess,
}: JewelryTableRowProps) {
  const isBundle = product.products && product.products.length > 0;

  const isEarring =
    product.type?.toLowerCase().includes("bông tai") ||
    product.type?.toLowerCase().includes("earring");

  const webImages = isBundle
    ? product.products?.[0]?.thumbnails?.map((t) => t.url) || []
    : product.thumbnails?.map((t) => t.url) || [];

  const actualImages = isBundle
    ? product.products!.flatMap((p) => [
        ...(p.images?.map((img) => img.url) || []),
        ...(p.videos?.map((v) => v.url) || []),
      ])
    : [
        ...(product.images?.map((img) => img.url) || []),
        ...(product.videos?.map((v) => v.url) || []),
      ];

  const designCode = isBundle
    ? product.products?.map(p => p.attributes.designCode).filter(Boolean).join(" / ")
    : product.attributes?.designCode;
  
  const stockBySKU = !isBundle ? getGroupedStock(product, warehouseIds) : {};

  const totalStockCount = isBundle
    ? product.products!.reduce((acc, p) => {
        const subProductStockBySKU = getGroupedStock(p, warehouseIds);
        const subProductStockCount = Object.values(subProductStockBySKU).reduce((subAcc, curr) => subAcc + curr.totalHaravanQuantity, 0);
        return acc + subProductStockCount;
      }, 0)
    : Object.values(stockBySKU).reduce((acc, curr) => acc + curr.totalHaravanQuantity, 0);
    
  const allVariants = (product.variants || []) as any[];
  const allPrices = allVariants.map(v => isEarring ? (v.salePrice || 0) * 2 : (v.salePrice || 0)).filter(p => p > 0);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;
  
  const hasStock = totalStockCount > 0;
  const fourView = !isBundle && product.attributes?.["4view"];
  const subProductNam = isBundle ? (product.products?.find(p => p.attributes?.gender === 'Nam') || product.products?.[0]) : null;
  const subProductNu = isBundle ? (product.products?.find(p => p.attributes?.gender === 'Nữ') || (product.products && product.products.length > 1 ? product.products[1] : null)) : null;
  const fourViewNam = subProductNam?.attributes?.["4view"];
  const fourViewNu = subProductNu?.attributes?.["4view"];
  const hasSideStonesNam = fourViewNam && Array.isArray(fourViewNam) && fourViewNam.length > 0;
  const hasSideStonesNu = fourViewNu && Array.isArray(fourViewNu) && fourViewNu.length > 0;

  const priceDisplay = isBundle
    ? product.salePrice && product.salePrice > 0
      ? formatPriceMillion(product.salePrice)
      : "Liên hệ"
    : minPrice === 0
      ? "Liên hệ"
      : minPrice === maxPrice
        ? formatPriceMillion(minPrice)
        : `${formatPriceMillion(minPrice)} - ${formatPriceMillion(maxPrice)}`;

  return (
    <>
      <TableRow
        className={cn(
          "divide-x transition-all cursor-pointer group h-14 relative",
          isExpanded
            ? "bg-secondary-700 divide-secondary-700 hover:bg-secondary-700 border-b border-secondary-700"
            : "border-primary-50 hover:bg-primary-50/30 divide-primary-50",
          isBundle && !isExpanded && "bg-amber-50/20"
        )}
        onClick={() => onToggleExpand(product.id)}
      >
        <TableCell className="px-3 py-2 text-center">
          <div className="flex flex-col items-center justify-center gap-1">
            <ProductCodes product={product} isExpanded={isExpanded} />
          </div>
        </TableCell>

        <TableCell className="px-2 py-2">
          <div className="flex justify-center">
            <CompactGallery
              images={webImages}
              showUpload={false}
              brokenImages={brokenImages}
              onImageError={onImageError}
              onPreview={(images, index, config) => {
                onPreview(images, index, { ...config, productId: product.id, isActual: false });
              }}
              designCode={designCode || product.title}
            />
          </div>
        </TableCell>

        <TableCell className="px-2 py-2">
          <div className="flex justify-center">
            <CompactGallery
              images={actualImages}
              showUpload={!isBundle}
              brokenImages={brokenImages}
              onImageError={onImageError}
              onPreview={(images, index, config) => {
                onPreview(images, index, { ...config, productId: product.id, isActual: true });
              }}
              designCode={designCode || product.title}
              onUploadSuccess={onUploadSuccess}
            />
          </div>
        </TableCell>

        <TableCell className="px-2 py-2 text-center">
          {isBundle ? (
            <div className="flex flex-col items-center gap-1 justify-center">
              {hasSideStonesNam && (
                <SideStoneTooltip fourView={fourViewNam as any} isExpanded={isExpanded} label="Tấm Nam" />
              )}
              {hasSideStonesNu && (
                <SideStoneTooltip fourView={fourViewNu as any} isExpanded={isExpanded} label="Tấm Nữ" />
              )}
              {!hasSideStonesNam && !hasSideStonesNu && (
                <span className="text-primary-100 text-[10px] font-black italic">--</span>
              )}
            </div>
          ) : (
            fourView && Array.isArray(fourView) && fourView.length > 0 ? (
              <div className="flex justify-center">
                <SideStoneTooltip fourView={fourView as any} isExpanded={isExpanded} />
              </div>
            ) : (
              <span className="text-primary-100 text-[10px] font-black italic">--</span>
            )
          )}
        </TableCell>

        <TableCell className="px-2 py-2 text-center">
          <span className={cn(
            "text-[11px] font-black tracking-tight",
            isExpanded ? "text-white" : "text-secondary-900"
          )}>
            {priceDisplay}
          </span>
        </TableCell>

        <TableCell className="px-2 py-2 text-center">
          <Badge
            className={cn(
              "rounded-full px-3 py-1 text-[10px] font-black tracking-widest border-none shadow-sm",
              hasStock ? "bg-emerald-50 text-emerald-600" : "bg-primary-50 text-primary-300"
            )}
          >
            {hasStock ? "Có hàng" : "Hết hàng"}
          </Badge>
        </TableCell>
        <TableCell className="px-2 text-center">
          <div className="flex justify-center">
            <Button
              size="icon"
              className={cn(
                "h-5 w-5 rounded-full transition-all duration-300",
                isExpanded
                  ? "bg-secondary-900 text-white"
                  : "bg-primary-50 text-secondary-900 hover:bg-primary-100"
              )}
            >
              <CaretDown
                size={12}
                weight="bold"
                className={cn("transition-transform duration-300", isExpanded && "rotate-180")}
              />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <tr className="hover:bg-transparent border-none">
          <TableCell colSpan={9} className="p-0 bg-primary-50">
            <div className="px-0 border-t border-x-2 border-b-2 border-secondary-700 animate-in fade-in slide-in-from-top-1 duration-200">
              {isBundle ? (
                <div className="bg-white divide-y divide-primary-100">
                  {product.products!.map((subProduct, idx) => {
                    const genderTitle = subProduct.attributes?.gender === 'Nam' ? 'Nhẫn Nam' : subProduct.attributes?.gender === 'Nữ' ? 'Nhẫn Nữ' : `Món ${idx + 1}`;
                    return (
                      <div key={subProduct.id} className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-secondary-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            {genderTitle}: {subProduct.title}
                          </Badge>
                          <span className="text-[10px] font-bold text-primary-400">ID: {subProduct.id}</span>
                        </div>
                        <ExpandedPanel
                          stockBySKU={getGroupedStock(subProduct, warehouseIds)}
                          isEarring={subProduct.type?.toLowerCase().includes("bông tai") || false}
                          product={subProduct}
                          onOpenSerialModal={onOpenSerialModal}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ExpandedPanel
                  stockBySKU={stockBySKU}
                  isEarring={isEarring}
                  product={product}
                  onOpenSerialModal={onOpenSerialModal}
                />
              )}
            </div>
          </TableCell>
        </tr>
      )}
    </>
  );
}

// Helper to group stock for sub-products
function getGroupedStock(product: ProductModel, warehouseIds?: string[]) {
  let variants = (product.variants || []) as any[];
  const hasWarehouseFilter = warehouseIds && warehouseIds.length > 0;

  if (hasWarehouseFilter) {
    const selectedWarehouseNames = warehouseIds.flatMap(id => WAREHOUSE_ID_TO_NAMES[id] || []).filter(Boolean);
    if (selectedWarehouseNames.length > 0) {
      const normalizedSelectedNames = selectedWarehouseNames.map(name => name.trim().toLowerCase());
      variants = variants.filter(v => {
        if (!v.stockAt) return false;
        const normalizedStockAt = String(v.stockAt).trim().toLowerCase();
        return normalizedSelectedNames.some(selectedName => normalizedStockAt.includes(selectedName));
      });
    }
  }

  const stockBySKU: Record<string, { variants: any[]; totalQuantity: number; totalHaravanQuantity: number; firstVariant: any }> = {};
  
  // Step 1: Group variants by SKU and sum internal quantities.
  variants.forEach((v) => {
    const hv = product.haravanVariants?.find(h => String(h.variant_id) === String(v.id));
    const vWithHv = { ...v, haravanVariant: hv };
    const sku = v.barcode || v.attributes?.sku || v.sku || "N/A";

    if (!stockBySKU[sku]) {
      stockBySKU[sku] = {
        variants: [],
        totalQuantity: 0,
        totalHaravanQuantity: 0, // Will calculate in step 2
        firstVariant: vWithHv
      };
    }
    
    stockBySKU[sku].variants.push(vWithHv);
    stockBySKU[sku].totalQuantity += (v.quantity || 0);
  });

  // Step 2: Calculate Haravan quantity for each SKU.
  for (const sku in stockBySKU) {
    // Sum from the main haravanVariants source, ensuring uniqueness.
    const uniqueVariantIds = new Set(stockBySKU[sku].variants.map((v) => v.id));
    uniqueVariantIds.forEach((variantId) => {
      const hv = product.haravanVariants?.find((h) => String(h.variant_id) === String(variantId));
      if (hv) {
        stockBySKU[sku].totalHaravanQuantity += (hv.qty_available || 0);
      }
    });
  }

  return stockBySKU;
}

interface ExpandedPanelProps {
  stockBySKU: Record<string, { variants: any[]; totalQuantity: number; totalHaravanQuantity: number; firstVariant: any }>;
  isEarring: boolean;
  product: ProductModel;
  onOpenSerialModal: (variants: any[], sku: string, totalQuantity?: number, totalHaravanQuantity?: number) => void;
}

function ExpandedPanel({ stockBySKU, isEarring, product, onOpenSerialModal }: ExpandedPanelProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="bg-white overflow-hidden">
      <div className="divide-y divide-secondary-600">
        {Object.entries(stockBySKU).map(([sku, group], idx) => {
          const variant = group.firstVariant;
          const hasSale = variant.basePrice > 0 && variant.basePrice !== variant.salePrice;
          const haravanLink = `https://jemmiavn.myharavan.com/admin/products/${product.id}/variants/${variant.id}`;

          return (
            <div
              key={sku}
              className={cn(
                "grid grid-cols-[1.5fr_2fr_1.5fr_1.5fr_1.2fr] items-center transition-colors",
                idx % 2 === 1 ? "bg-primary-50/20" : "bg-white",
                "hover:bg-primary-50/50"
              )}
            >
              <div className="px-5 py-3.5 flex flex-col gap-0.5">
                <p className="text-xs font-black text-secondary-900 tracking-tight leading-none">SKU: {sku}</p>
                <p className="text-[10px] font-bold text-primary-400 font-mono tracking-tighter">
                  Barcode: {variant.barcode || "No Barcode"}
                </p>
              </div>

              <div className="px-4 py-3.5 flex items-center justify-center gap-1.5 flex-wrap">
                {variant.attributes?.fineness && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary-100 bg-white text-secondary-900 text-[10px] font-black px-2 py-1 shadow-sm"
                  >
                    {variant.attributes.fineness}
                  </Badge>
                )}

                {variant.attributes?.materialColor && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary-100 bg-white text-secondary-900 text-[10px] font-black px-2 py-1 shadow-sm"
                  >
                    {variant.attributes.materialColor}
                  </Badge>
                )}

                {variant.attributes?.ringSize !== 0 && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary-100 bg-white text-secondary-900 text-[10px] font-black px-2 py-1 shadow-sm"
                  >
                    Ni {variant.attributes?.ringSize}
                  </Badge>
                )}
              </div>

              <div className="px-4 py-3.5 flex items-center gap-5">
                <Badge className="rounded-full bg-secondary-800 text-white text-[11px] font-black shadow-sm">
                  Khả dụng Haravan: {group.totalHaravanQuantity}
                </Badge>
                {/* <div className="flex justify-center hover:underline mt-px">
                  <a
                    href={haravanLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors group tracking-tight"
                  >
                    Haravan <ArrowSquareOut size={12} className="ml-1 -mt-px" />
                  </a>
                </div> */}
              </div>

              <div className="px-4 py-3.5 text-right">
                <div className="flex flex-col items-end gap-0.5">
                  {hasSale && (
                    <p className="text-[10px] font-bold text-primary-200 line-through leading-none">
                      {formatPrice(isEarring ? variant.basePrice * 2 : variant.basePrice)}
                    </p>
                  )}

                  <p className="text-sm font-black text-secondary-900 tracking-tight leading-none group-hover/sku:text-primary-600 transition-colors">
                    {formatPrice(
                      isEarring ? (variant.salePrice || 0) * 2 : variant.salePrice || 0
                    )}
                  </p>

                  {!product.showOnWebsite && (
                    <Badge className="bg-blue-50 text-blue-500 rounded-full border-none text-[8px] font-black uppercase px-1.5 py-0 tracking-tighter">
                      Giá tham khảo
                    </Badge>
                  )}
                </div>
              </div>

              <div
                className="px-4 py-3.5 flex justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={group.totalQuantity === 0}
                  className="text-[10px] font-bold h-7 px-3 border-secondary-900/20 text-secondary-900 hover:bg-secondary-900 hover:text-white transition-colors rounded-none disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => onOpenSerialModal(group.variants, sku, group.totalQuantity, group.totalHaravanQuantity)}
                >
                  Xem Serials
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}