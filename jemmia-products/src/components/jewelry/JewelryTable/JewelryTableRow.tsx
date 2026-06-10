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
import { Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ReferencePriceTooltipProps {
  isExpanded: boolean;
  size?: number;
}

function ReferencePriceTooltip({ isExpanded, size = 12 }: ReferencePriceTooltipProps) {
  const [show, setShow] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [show]);

  // Check if device supports hover (true if it's a touch screen without fine pointer hover)
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  const handleMouseEnter = () => {
    if (!isTouch) setShow(true);
  };

  const handleMouseLeave = () => {
    if (!isTouch) setShow(false);
  };

  return (
    <div
      ref={tooltipRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShow((prev) => !prev);
        }}
        className="focus:outline-none flex items-center justify-center pt-1 md:p-0.5 cursor-help"
      >
        <Info
          size={size}
          className={cn(
            "transition-colors",
            isExpanded
              ? "text-white/80 hover:text-white"
              : "text-blue-500 hover:text-blue-600"
          )}
        />
      </button>

      {show && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[9px] font-black text-white bg-secondary-900 rounded shadow-xl whitespace-nowrap z-[1000] border border-secondary-800 animate-in fade-in zoom-in-95 duration-100",
            // Arrow indicator
            "after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-secondary-900"
          )}
        >
          Giá tham khảo
        </div>
      )}
    </div>
  );
}

interface JewelryTableRowProps {
  product: ProductModel;
  warehouseIds?: string[];
  stockStatus?: string;
  isExpanded: boolean;
  expandedId: string | null;
  brokenImages: Set<string>;
  onImageError: (url: string) => void;
  onPreview: (images: string[], index: number, config?: any) => void;
  onToggleExpand: (id: string) => void;
  onOpenSerialModal: (
    variants: any[],
    sku: string,
    totalQuantity?: number,
    totalHaravanQuantity?: number,
  ) => void;
  onUploadSuccess?: () => void;
  key?: string | number;
}

const WAREHOUSE_ID_TO_NAMES: Record<string, string[]> = {
  "1592770": ["[HCM] Cửa Hàng HCM"],
  "1582708": ["[HCM] Kế Toán"],
  "1110168": ["[HCM] Admin"],
  "1592778": ["[HN] Cửa Hàng HN"],
  "1593276": ["[CT] Cửa Hàng CT", "[CT] Cửa Hàng Cần Thơ"],
};

export function JewelryTableRow({
  product,
  warehouseIds,
  stockStatus,
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
    ? product.products
        ?.map((p) => p.attributes.designCode)
        .filter(Boolean)
        .join(" / ")
    : product.attributes?.designCode;

  const stockBySKU = !isBundle ? getGroupedStock(product, warehouseIds) : {};

  const totalStockCount = isBundle
    ? product.products!.reduce((acc, p) => {
        const subProductStockBySKU = getGroupedStock(p, warehouseIds);
        const subProductStockCount = Object.values(subProductStockBySKU).reduce(
          (subAcc, curr) => subAcc + curr.totalHaravanQuantity,
          0,
        );
        return acc + subProductStockCount;
      }, 0)
    : Object.values(stockBySKU).reduce(
        (acc, curr) => acc + curr.totalHaravanQuantity,
        0,
      );

  const allVariants = (product.variants || []) as any[];
  const allPrices = allVariants
    .map((v) => (isEarring ? (v.salePrice || 0) * 2 : v.salePrice || 0))
    .filter((p) => p > 0);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

  const hasStock = totalStockCount > 0;
  const fourView = !isBundle && product.attributes?.["4view"];
  const subProductNam = isBundle
    ? product.products?.find((p) => p.attributes?.gender === "Nam") ||
      product.products?.[0]
    : null;
  const subProductNu = isBundle
    ? product.products?.find((p) => p.attributes?.gender === "Nữ") ||
      (product.products && product.products.length > 1
        ? product.products[1]
        : null)
    : null;
  const fourViewNam = subProductNam?.attributes?.["4view"];
  const fourViewNu = subProductNu?.attributes?.["4view"];
  const hasSideStonesNam =
    fourViewNam && Array.isArray(fourViewNam) && fourViewNam.length > 0;
  const hasSideStonesNu =
    fourViewNu && Array.isArray(fourViewNu) && fourViewNu.length > 0;

  const uploadOptions = isBundle
    ? [
        ...(subProductNam?.attributes?.designCode
          ? [
              {
                label: "Nhẫn Nam",
                designCode: subProductNam.attributes.designCode,
              },
            ]
          : []),
        ...(subProductNu?.attributes?.designCode
          ? [
              {
                label: "Nhẫn Nữ",
                designCode: subProductNu.attributes.designCode,
              },
            ]
          : []),
      ]
    : undefined;

  const priceDisplay = isBundle
    ? product.salePrice && product.salePrice > 0
      ? formatPriceMillion(product.salePrice)
      : "Liên hệ"
    : minPrice === 0
      ? "Liên hệ"
      : minPrice === maxPrice
        ? formatPriceMillion(minPrice)
        : `${formatPriceMillion(minPrice)} - ${formatPriceMillion(maxPrice)}`;

  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1280);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const galleryDisplayWeb = 1;
  const galleryDisplayActual = isTablet ? 3 : 4;

  const firstImage =
    (webImages.length > 0 ? webImages[0] : actualImages[0]) || "";

  return (
    <>
      {/* Desktop Table View - Only visible on desktop */}
      <TableRow
        className={cn(
          "transition-all cursor-pointer group min-h-[3.5rem] relative hidden md:table-row",
          isExpanded
            ? "bg-secondary-700 divide-secondary-700 hover:bg-secondary-700 border-b border-secondary-700"
            : "border-primary-100 hover:bg-primary-50/30 divide-primary-50"
        )}
        onClick={() => onToggleExpand(product.id)}
      >
        <TableCell className="px-6 md:px-2 py-2">
          <div className="flex justify-center">
            <div
              className={cn(
                "w-12 h-12 flex-shrink-0 overflow-hidden border border-primary-100 bg-primary-50/40 flex items-center justify-center",
                firstImage
                  ? "cursor-pointer hover:scale-105 transition-transform"
                  : "cursor-default"
              )}
              onClick={(e) => {
                if (!firstImage) return;
                e.stopPropagation();
                const showActual = webImages.length === 0;
                onPreview(showActual ? actualImages : webImages, 0, {
                  productId: product.id,
                  isActual: showActual,
                  designCode: designCode || product.title,
                  showUpload: true,
                  uploadOptions,
                });
              }}
            >
              {firstImage ? (
                <img
                  src={firstImage}
                  alt={designCode || product.title}
                  className="w-full h-full object-cover"
                  onError={() => onImageError(firstImage)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-primary-300">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-[8px] mt-0.5">No image</span>
                </div>
              )}
            </div>
          </div>
        </TableCell>

        <TableCell className="px-6 md:px-3 py-2 text-left w-42.5">
          <div className="flex flex-col items-start justify-start gap-1">
            <ProductCodes product={product} isExpanded={isExpanded} className={`${isBundle ? "w-[140px]" : "w-[130px]"} md:gap-2 !justify-start`} />
          </div>
        </TableCell>

        <TableCell className="px-6 md:px-2 py-2">
          <div className="flex justify-center">
            <CompactGallery
              images={actualImages}
              showUpload={true}
              uploadOptions={uploadOptions}
              brokenImages={brokenImages}
              onImageError={onImageError}
              onPreview={(images, index, config) => {
                onPreview(images, index, {
                  ...config,
                  productId: product.id,
                  isActual: true,
                  uploadOptions,
                });
              }}
              designCode={designCode || product.title}
              onUploadSuccess={onUploadSuccess}
              displayCount={galleryDisplayActual}
            />
          </div>
        </TableCell>

        <TableCell className="px-6 md:px-2 py-2 text-center">
          <div className="flex flex-col items-center gap-1 justify-center">
            {isBundle ? (
              <>
                {hasSideStonesNam && (
                  <SideStoneTooltip
                    fourView={fourViewNam as any}
                    isExpanded={isExpanded}
                    label="Tấm Nam"
                  />
                )}
                {hasSideStonesNu && (
                  <SideStoneTooltip
                    fourView={fourViewNu as any}
                    isExpanded={isExpanded}
                    label="Tấm Nữ"
                  />
                )}
                {!hasSideStonesNam && !hasSideStonesNu && (
                  <span className="text-primary-100 text-[9px] md:text-[10px] font-black italic">
                    --
                  </span>
                )}
              </>
            ) : fourView && Array.isArray(fourView) && fourView.length > 0 ? (
              <div className="flex justify-center">
                <SideStoneTooltip
                  fourView={fourView as any}
                  isExpanded={isExpanded}
                />
              </div>
            ) : (
              <span className="text-primary-100 text-[9px] md:text-[10px] font-black italic">
                --
              </span>
            )}
          </div>
        </TableCell>

        <TableCell className="px-6 md:px-2 py-2 text-center">
          <div className="inline-flex items-center relative">
            <span
              className={cn(
                "text-xs md:text-sm font-bold tracking-tight",
                isExpanded ? "text-white" : "text-secondary-900",
              )}
            >
              {priceDisplay}
            </span>
            {!product.showOnWebsite && (
              <div className="absolute left-full ml-1 top-1/2 -translate-y-1/2">
                <ReferencePriceTooltip isExpanded={isExpanded} size={12} />
              </div>
            )}
          </div>
        </TableCell>

        <TableCell className="px-6 md:px-2 py-2 text-center">
          <Badge
            className={cn(
              "rounded-full px-2 md:px-3 py-1 text-[8px] md:text-[10px] font-black tracking-widest border-none shadow-sm",
              hasStock
                ? "bg-emerald-50 text-emerald-600"
                : "bg-primary-50 text-primary-300",
            )}
          >
            {hasStock ? "Có hàng" : "Hết hàng"}
          </Badge>
        </TableCell>
        <TableCell className="px-6 md:px-2 text-center">
          <div className="flex justify-center">
            <Button
              size="icon"
              className={cn(
                "h-5 w-5 rounded-full transition-all duration-300",
                isExpanded
                  ? "bg-secondary-900 text-white"
                  : "bg-primary-50 text-secondary-900 hover:bg-primary-100",
              )}
            >
              <CaretDown
                size={10}
                weight="bold"
                className={cn(
                  "transition-transform duration-300",
                  isExpanded && "rotate-180",
                )}
              />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Mobile Card View - Only visible on mobile */}
      <TableRow
        className={cn(
          "transition-all cursor-pointer group relative md:hidden",
          isExpanded
            ? "bg-secondary-700 hover:bg-secondary-700 border-b border-secondary-700"
            : "border-primary-100 hover:bg-primary-50/30"
        )}
        onClick={() => onToggleExpand(product.id)}
      >
        <TableCell className="px-3 py-2">
          <div className="flex items-center gap-3 w-full">
            {/* Image or Placeholder */}
            <div
              className={cn(
                "w-14 h-14 flex-shrink-0 overflow-hidden border border-primary-100 bg-primary-50/40 flex items-center justify-center",
                firstImage ? "cursor-pointer" : "cursor-default"
              )}
              onClick={(e) => {
                if (!firstImage) return;
                e.stopPropagation();
                const showActual = webImages.length === 0;
                onPreview(showActual ? actualImages : webImages, 0, {
                  productId: product.id,
                  isActual: showActual,
                  designCode: designCode || product.title,
                  showUpload: true,
                  uploadOptions,
                });
              }}
            >
              {firstImage ? (
                <img
                  src={firstImage}
                  alt={designCode || product.title}
                  className="w-full h-full object-cover"
                  onError={() => onImageError(firstImage)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-primary-300">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-[8px] mt-0.5">No image</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 w-full flex justify-between items-center gap-3">
              {/* Product Codes */}
              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center gap-1 justify-between w-full overflow-hidden">
                  <div className="flex-1 min-w-0">
                    <ProductCodes product={product} isExpanded={isExpanded} />
                  </div>
                </div>
                {/* Price */}
                <div className="inline-flex items-center relative w-fit">
                  <span
                    className={cn(
                      "text-sm font-bold tracking-tight",
                      isExpanded ? "text-white" : "text-secondary-900",
                    )}
                  >
                    {priceDisplay}
                  </span>
                  {!product.showOnWebsite && (
                    <div className="absolute left-full ml-1 top-1/2 -translate-y-1/2">
                      <ReferencePriceTooltip isExpanded={isExpanded} size={14} />
                    </div>
                  )}
                </div>
              </div>
              <Badge
                className={cn(
                  "rounded-full px-1.5 py-0 text-[8px] font-bold tracking-widest border-none shadow-sm",
                  hasStock
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-primary-50 text-primary-300",
                )}
              >
                {hasStock ? "Có hàng" : "Hết hàng"}
              </Badge>
              <Button
                size="icon"
                className={cn(
                  "h-6 w-6 rounded-full transition-all duration-300 flex-shrink-0 flex items-center justify-center",
                  isExpanded
                    ? "bg-white text-secondary-900"
                    : "bg-primary-50 text-secondary-900 hover:bg-primary-100",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(product.id);
                }}
              >
                <CaretDown
                  size={12}
                  weight="bold"
                  className={cn(
                    "transition-transform duration-300",
                    isExpanded && "rotate-180",
                  )}
                />
              </Button>
            </div>
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
                    const genderTitle =
                      subProduct.attributes?.gender === "Nam"
                        ? "Nhẫn Nam"
                        : subProduct.attributes?.gender === "Nữ"
                          ? "Nhẫn Nữ"
                          : `Món ${idx + 1}`;
                    const subWebImages =
                      subProduct.thumbnails?.map((t) => t.url) || [];
                    const subActualImages = [
                      ...(subProduct.images?.map((img) => img.url) || []),
                      ...(subProduct.videos?.map((v) => v.url) || []),
                    ];
                    const subFourView = subProduct.attributes?.["4view"];
                    const subHasSideStones =
                      Array.isArray(subFourView) && subFourView.length > 0;
                    return (
                      <div key={subProduct.id} className="p-3 md:p-4">
                        <div className="flex items-center gap-3 mb-0 overflow-hidden">
                          <span className="text-xs md:text-sm font-bold text-secondary-800 flex-shrink-0">
                            {genderTitle}
                          </span>
                          <div className="flex-1 min-w-0">
                            <ProductCodes
                              product={subProduct}
                              isExpanded={false}
                            />
                          </div>
                        </div>
                        <ExpandedPanel
                          stockBySKU={getGroupedStock(subProduct, warehouseIds)}
                          isEarring={
                            subProduct.type
                              ?.toLowerCase()
                              .includes("bông tai") || false
                          }
                          product={subProduct}
                          stockStatus={stockStatus}
                          onOpenSerialModal={onOpenSerialModal}
                          webImages={subWebImages}
                          actualImages={subActualImages}
                          fourView={subFourView}
                          hasSideStones={subHasSideStones}
                          isBundle={isBundle}
                          brokenImages={brokenImages}
                          onImageError={onImageError}
                          onPreview={onPreview}
                          designCode={subProduct.attributes?.designCode}
                          onUploadSuccess={onUploadSuccess}
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
                  stockStatus={stockStatus}
                  onOpenSerialModal={onOpenSerialModal}
                  webImages={webImages}
                  actualImages={actualImages}
                  fourView={fourView}
                  hasSideStones={Array.isArray(fourView) && fourView.length > 0}
                  isBundle={isBundle}
                  fourViewNam={fourViewNam}
                  fourViewNu={fourViewNu}
                  hasSideStonesNam={hasSideStonesNam}
                  hasSideStonesNu={hasSideStonesNu}
                  brokenImages={brokenImages}
                  onImageError={onImageError}
                  onPreview={onPreview}
                  designCode={designCode}
                  uploadOptions={uploadOptions}
                  onUploadSuccess={onUploadSuccess}
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
    const selectedWarehouseNames = warehouseIds
      .flatMap((id) => WAREHOUSE_ID_TO_NAMES[id] || [])
      .filter(Boolean);
    if (selectedWarehouseNames.length > 0) {
      const normalizedSelectedNames = selectedWarehouseNames.map((name) =>
        name.trim().toLowerCase(),
      );
      variants = variants.filter((v) => {
        if (!v.stockAt) return false;
        const normalizedStockAt = String(v.stockAt).trim().toLowerCase();
        return normalizedSelectedNames.some((selectedName) =>
          normalizedStockAt.includes(selectedName),
        );
      });
    }
  }

  const stockBySKU: Record<
    string,
    {
      variants: any[];
      totalQuantity: number;
      totalHaravanQuantity: number;
      firstVariant: any;
    }
  > = {};

  // Step 1: Group variants by SKU and sum internal quantities.
  variants.forEach((v) => {
    const hv = product.haravanVariants?.find(
      (h) => String(h.variant_id) === String(v.id),
    );
    const vWithHv = { ...v, haravanVariant: hv };
    const sku = v.sku || "N/A";

    if (!stockBySKU[sku]) {
      stockBySKU[sku] = {
        variants: [],
        totalQuantity: 0,
        totalHaravanQuantity: 0, // Will calculate in step 2
        firstVariant: vWithHv,
      };
    }

    stockBySKU[sku].variants.push(vWithHv);
    stockBySKU[sku].totalQuantity += v.quantity || 0;
  });

  // Step 2: Calculate Haravan quantity for each SKU.
  for (const sku in stockBySKU) {
    if (hasWarehouseFilter) {
      // Calculate the sum of physical internal stock (serials quantity)
      const sumOfSerials = stockBySKU[sku].variants.reduce(
        (acc, v) => acc + (v.quantity || 0),
        0,
      );

      if (sumOfSerials > 0) {
        // If sum of serials > 0, take sum of serials
        stockBySKU[sku].totalHaravanQuantity = sumOfSerials;
      } else {
        // If sum of serials is 0, display the Haravan quantity
        const uniqueVariantIds = new Set(
          stockBySKU[sku].variants.map((v) => v.id),
        );
        uniqueVariantIds.forEach((variantId) => {
          const hv = product.haravanVariants?.find(
            (h) => String(h.variant_id) === String(variantId),
          );
          if (hv) {
            stockBySKU[sku].totalHaravanQuantity += hv.qty_available || 0;
          }
        });
      }
    } else {
      // If not filtering, sum from the main haravanVariants source, ensuring uniqueness.
      const uniqueVariantIds = new Set(
        stockBySKU[sku].variants.map((v) => v.id),
      );
      uniqueVariantIds.forEach((variantId) => {
        const hv = product.haravanVariants?.find(
          (h) => String(h.variant_id) === String(variantId),
        );
        if (hv) {
          stockBySKU[sku].totalHaravanQuantity += hv.qty_available || 0;
        }
      });
    }
  }

  return stockBySKU;
}

interface ExpandedPanelProps {
  stockBySKU: Record<
    string,
    {
      variants: any[];
      totalQuantity: number;
      totalHaravanQuantity: number;
      firstVariant: any;
    }
  >;
  isEarring: boolean;
  product: ProductModel;
  stockStatus?: string;
  onOpenSerialModal: (
    variants: any[],
    sku: string,
    totalQuantity?: number,
    totalHaravanQuantity?: number,
  ) => void;
  webImages?: string[];
  actualImages?: string[];
  fourView?: any;
  hasSideStones?: boolean;
  isBundle?: boolean;
  fourViewNam?: any;
  fourViewNu?: any;
  hasSideStonesNam?: boolean;
  hasSideStonesNu?: boolean;
  brokenImages?: Set<string>;
  onImageError?: (url: string) => void;
  onPreview?: (images: string[], index: number, config?: any) => void;
  designCode?: string | undefined;
  uploadOptions?: any;
  onUploadSuccess?: () => void;
}

function ExpandedPanel({
  stockBySKU,
  isEarring,
  product,
  stockStatus,
  onOpenSerialModal,
  webImages = [],
  actualImages = [],
  fourView,
  hasSideStones,
  isBundle,
  fourViewNam,
  fourViewNu,
  hasSideStonesNam,
  hasSideStonesNu,
  brokenImages,
  onImageError,
  onPreview,
  designCode,
  uploadOptions,
  onUploadSuccess,
}: ExpandedPanelProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };
  return (
    <div className="bg-white overflow-hidden">
      {/* Mobile Only: Additional Info Section */}
      <div
        className={`px-3 ${isBundle ? "pb-2" : "py-2"} md:hidden border-b border-primary-100 space-y-2`}
      >
        {/* Product Codes */}
        <div className="flex items-center justify-between">
          {/* Side Stones */}
          {(hasSideStones || hasSideStonesNam || hasSideStonesNu) && (
            <div className="h-full gap-2 flex items-center mt-1">
              <p className="text-[9px] font-bold text-primary-300 uppercase tracking-wider">
                Viên Tấm
              </p>
              <div className="flex flex-wrap gap-1">
                {isBundle ? (
                  <>
                    {hasSideStonesNam && (
                      <SideStoneTooltip
                        fourView={fourViewNam as any}
                        isExpanded={false}
                        label="Tấm Nam"
                      />
                    )}
                    {hasSideStonesNu && (
                      <SideStoneTooltip
                        fourView={fourViewNu as any}
                        isExpanded={false}
                        label="Tấm Nữ"
                      />
                    )}
                  </>
                ) : (
                  fourView &&
                  Array.isArray(fourView) &&
                  fourView.length > 0 && (
                    <SideStoneTooltip
                      fourView={fourView as any}
                      isExpanded={false}
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Galleries */}
        <div className="space-y-2">
          {/* Actual Images */}
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-primary-300 uppercase tracking-wider">
              Ảnh/Video Thực Tế
            </p>
            <CompactGallery
              images={actualImages}
              showUpload={true}
              uploadOptions={uploadOptions}
              brokenImages={brokenImages || new Set()}
              onImageError={onImageError || (() => {})}
              onPreview={(images, index, config) => {
                if (onPreview) {
                  onPreview(images, index, {
                    ...config,
                    productId: product.id,
                    isActual: true,
                    uploadOptions,
                  });
                }
              }}
              designCode={designCode || product.title}
              onUploadSuccess={onUploadSuccess}
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-secondary-600">
        {Object.entries(stockBySKU).map(([sku, group], idx) => {
          const variant = group.firstVariant;
          const hasSale =
            variant.basePrice > 0 && variant.basePrice !== variant.salePrice;
          const isDimmed = group.totalHaravanQuantity === 0;

          return (
            <div
              key={sku}
              className={cn(
                idx % 2 === 1 ? "bg-primary-50/20" : "bg-white",
                "hover:bg-primary-50/50 transition-all",
              )}
            >
              {/* Desktop Grid View */}
              <div className="hidden md:grid grid-cols-[1.5fr_2fr_1.5fr_1.5fr_1.2fr] items-center">
                <div className={cn("px-4 md:px-5 py-2.5 md:py-3.5 flex flex-col gap-0.5", isDimmed && "opacity-50")}>
                  <p className="text-[10px] md:text-xs font-black text-secondary-900 tracking-tight leading-none uppercase">
                    SKU: {sku}
                  </p>
                  <p className="text-[9px] md:text-[10px] font-bold text-primary-400 font-mono tracking-tighter">
                    Barcode: {variant.barcode || "No Barcode"}
                  </p>
                </div>

                <div className={cn("px-4 py-2 md:py-3.5 flex items-center justify-start md:justify-center gap-1.5 flex-wrap", isDimmed && "opacity-50")}>
                  {variant.attributes?.fineness && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-primary-100 bg-white text-secondary-900 text-[9px] md:text-[10px] font-black px-2 py-0.5 md:py-1 shadow-sm"
                    >
                      {variant.attributes.fineness}
                    </Badge>
                  )}

                  {variant.attributes?.materialColor && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-primary-100 bg-white text-secondary-900 text-[9px] md:text-[10px] font-black px-2 py-0.5 md:py-1 shadow-sm"
                    >
                      {variant.attributes.materialColor}
                    </Badge>
                  )}

                  {variant.attributes?.ringSize !== 0 && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-primary-100 bg-white text-secondary-900 text-[9px] md:text-[10px] font-black px-2 py-0.5 md:py-1 shadow-sm"
                    >
                      Ni {variant.attributes?.ringSize}
                    </Badge>
                  )}
                </div>

                <div className={cn("px-4 py-2 md:py-3.5 flex items-center gap-2", isDimmed && "opacity-50")}>
                  <Badge className="rounded-full bg-secondary-800 text-white text-[10px] md:text-[11px] font-black shadow-sm px-2 py-0.5">
                    Khả dụng: {group.totalHaravanQuantity}
                  </Badge>
                  <a
                    href={`https://jemmiavn.myharavan.com/admin/products/${product.id}/variants/${variant.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center text-[9px] md:text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors gap-1 tracking-tight"
                  >
                    <span>Haravan</span>
                    <ArrowSquareOut size={10} />
                  </a>
                </div>

                <div className={cn("px-4 py-2 md:py-3.5 text-left md:text-right", isDimmed && "opacity-50")}>
                  <div className="flex flex-col items-start md:items-end gap-0.5">
                    {hasSale && (
                      <p className="text-[9px] md:text-[10px] font-bold text-primary-200 line-through leading-none">
                        {formatPrice(
                          isEarring ? variant.basePrice * 2 : variant.basePrice,
                        )}
                      </p>
                    )}

                    <p className="text-xs md:text-sm font-black text-secondary-900 tracking-tight leading-none group-hover/sku:text-primary-600 transition-colors">
                      {formatPrice(
                        isEarring
                          ? (variant.salePrice || 0) * 2
                          : variant.salePrice || 0,
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
                  className="px-4 py-3 md:py-3.5 flex justify-start md:justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      !group.variants ||
                      !group.variants.some(
                        (v) =>
                          v.attributes?.serialNumber !== null &&
                          v.attributes?.serialNumber !== undefined &&
                          v.attributes?.serialNumber !== "",
                      )
                    }
                    className="w-[110px] text-[9px] md:text-[10px] font-bold h-7 border-secondary-900/20 text-secondary-900 hover:bg-secondary-900 hover:text-white transition-all duration-300 rounded-none disabled:opacity-40 disabled:cursor-not-allowed group flex items-center justify-center gap-1.5"
                    onClick={() =>
                      onOpenSerialModal(
                        group.variants,
                        sku,
                        group.totalQuantity,
                        group.totalHaravanQuantity,
                      )
                    }
                  >
                    <span>Xem Serials</span>
                    {group.totalQuantity > 0 && (
                      <span className="flex items-center justify-center h-4 w-4 rounded-full text-[8px] md:text-[9px] font-black transition-all duration-300 bg-secondary-900/10 text-secondary-900 group-hover:bg-white/20 group-hover:text-white">
                        {group.totalQuantity}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Mobile Compact View */}
              <div
                className={
                  isBundle ? "py-2 md:hidden" : "px-3 py-2.5 md:hidden"
                }
              >
                <div className="flex flex-col gap-1.5 w-full">
                  {/* SKU + Barcode + Price + Haravan */}
                  <div className={cn("flex items-start justify-between gap-2", isDimmed && "opacity-50")}>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] font-black text-secondary-900 tracking-tight leading-none uppercase">
                        SKU: {sku}
                      </p>
                      <p className="text-[8px] font-bold text-primary-400 font-mono tracking-tighter">
                        Barcode: {variant.barcode || "No Barcode"}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge className="rounded-full bg-secondary-800 text-white text-[9px] font-black shadow-sm px-1.5 py-0">
                          Khả dụng: {group.totalHaravanQuantity}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-0.5">
                      {hasSale && (
                        <p className="text-[8px] font-bold text-primary-200 line-through leading-none">
                          {formatPrice(
                            isEarring
                              ? variant.basePrice * 2
                              : variant.basePrice,
                          )}
                        </p>
                      )}
                      <p className="text-[11px] font-black text-secondary-900 tracking-tight leading-none">
                        {formatPrice(
                          isEarring
                            ? (variant.salePrice || 0) * 2
                            : variant.salePrice || 0,
                        )}
                      </p>
                      {!product.showOnWebsite && (
                        <Badge className="bg-blue-50 text-blue-500 rounded-full border-none text-[7px] font-black uppercase px-1 py-0 tracking-tighter">
                          Giá tham khảo
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between gap-2">
                    {/* Badges */}
                    <div className={cn("flex items-center gap-1.5 flex-wrap", isDimmed && "opacity-50")}>
                      {variant.attributes?.fineness && (
                        <Badge
                          variant="outline"
                          className="rounded-full border-primary-100 bg-white text-secondary-900 text-[8px] font-black px-1.5 py-0 shadow-sm"
                        >
                          {variant.attributes.fineness}
                        </Badge>
                      )}
                      {variant.attributes?.materialColor && (
                        <Badge
                          variant="outline"
                          className="rounded-full border-primary-100 bg-white text-secondary-900 text-[8px] font-black px-1.5 py-0 shadow-sm"
                        >
                          {variant.attributes.materialColor}
                        </Badge>
                      )}
                      {variant.attributes?.ringSize !== 0 && (
                        <Badge
                          variant="outline"
                          className="rounded-full border-primary-100 bg-white text-secondary-900 text-[8px] font-black px-1.5 py-0 shadow-sm"
                        >
                          Ni {variant.attributes?.ringSize}
                        </Badge>
                      )}
                    </div>

                    {/* View Serials Button */}
                    <div
                      className="flex justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          !group.variants ||
                          !group.variants.some(
                            (v) =>
                              v.attributes?.serialNumber !== null &&
                              v.attributes?.serialNumber !== undefined &&
                              v.attributes?.serialNumber !== "",
                          )
                        }
                        className="w-[90px] text-[8px] font-bold h-6 border-secondary-900/20 text-secondary-900 hover:bg-secondary-900 hover:text-white transition-all duration-300 rounded-none disabled:opacity-40 disabled:cursor-not-allowed group flex items-center justify-center gap-1"
                        onClick={() =>
                          onOpenSerialModal(
                            group.variants,
                            sku,
                            group.totalQuantity,
                            group.totalHaravanQuantity,
                          )
                        }
                      >
                        <span>Xem Serials</span>
                        {group.totalQuantity > 0 && (
                          <span className="flex items-center justify-center h-3.5 w-3.5 rounded-full text-[7px] font-black transition-all duration-300 bg-secondary-900/10 text-secondary-900 group-hover:bg-white/20 group-hover:text-white">
                            {group.totalQuantity}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
