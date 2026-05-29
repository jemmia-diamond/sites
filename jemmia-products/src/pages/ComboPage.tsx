
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchCombos, ComboFilter } from "../services/comboService";
import { LayoutShell } from "../components/layout/LayoutShell";
import { PageHeader } from "../components/layout/PageHeader";

import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { DiamondModel, ProductModel } from "../types";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function ComboPage() {
  const [filters, setFilters] = useState<Omit<ComboFilter, 'page'>>({ limit: 100 });

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["combos", filters],
    queryFn: ({ pageParam = 1 }) => fetchCombos({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPageParam < (lastPage?.meta?.totalPages || 1)) {
        return lastPageParam + 1;
      }
      return undefined;
    },
  });

  const allCombos = data?.pages.flatMap(page => page.data) || [];

  const lastElementRef = useInfiniteScroll(
    () => {
      fetchNextPage();
    },
    hasNextPage,
    isFetchingNextPage
  );

  return (
    <LayoutShell searchPlaceholder="Nhập mã để bắt đầu tìm kiếm">
      <div className="flex flex-col h-full bg-white w-full px-4 lg:px-6 pt-4 pb-6 gap-2 min-w-0 overflow-hidden min-h-0">
        <PageHeader
          title="Sản phẩm nguyên chiếc"
          description={`Hiển thị ${data?.pages[0]?.meta.totalItems || 0} kết quả`}
        />

        <div className="flex-1 bg-white flex flex-col min-h-0 w-full max-w-full overflow-hidden">
          <div className="flex-1 overflow-y-auto min-w-0 w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-primary-300 text-xs">Đang tải dữ liệu...</p>
              </div>
            ) : !allCombos.length ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-primary-300 text-xs">Không tìm thấy combo nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allCombos.map((combo) => (
                  <ComboTableRow key={`${combo.variant_serials_id}-${combo.diamonds_id}`} combo={combo} />
                ))}
              </div>
            )}
            <div ref={lastElementRef} className="h-4 w-full" />
            {isFetchingNextPage && (
              <div className="py-6 flex justify-center items-center w-full">
                <div className="h-6 w-6 relative">
                  <div className="absolute inset-0 border-2 border-primary-50 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-t-secondary-900 rounded-full animate-spin"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

import { cn, getDiamondShapeImage } from "@/lib/utils";

function formatGoldWeight(weightInChi: number | null | undefined): string {
  if (weightInChi === undefined || weightInChi === null || isNaN(weightInChi) || weightInChi <= 0) return "-";

  const roundedChi = Math.round(weightInChi * 100) / 100;
  const chiPart = Math.floor(roundedChi);
  const remainder = Math.round((roundedChi - chiPart) * 100);
  const phanPart = Math.floor(remainder / 10);
  const lyPart = remainder % 10;

  if (chiPart === 0) {
    if (phanPart === 0 && lyPart === 0) return "0p";
    return lyPart > 0 ? `${phanPart}p${lyPart}` : `${phanPart}p`;
  } else {
    if (phanPart === 0 && lyPart === 0) return `${chiPart}c`;
    return lyPart > 0 ? `${chiPart}c${phanPart}${lyPart}` : `${chiPart}c${phanPart}`;
  }
}

function ComboTableRow({ combo }: { combo: any; key?: string | number }) {
  const jewelry: ProductModel = combo.jewelry;
  const diamond: DiamondModel = combo.diamond;
  const variant: any = jewelry.variants?.[0] || {};
  const isMobile = useIsMobile();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const totalBasePrice = (variant?.basePrice || jewelry.basePrice || 0) + (diamond.basePrice || 0);
  const totalSalePrice = (variant?.salePrice || jewelry.salePrice || 0) + (diamond.salePrice || 0);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("vi-VN")} ₫`;
  };

  const jewelryPrice = variant?.salePrice || jewelry.salePrice || 0;
  const jewelryOriginalPrice = variant?.basePrice || jewelry.basePrice || 0;
  const diamondPrice = diamond.salePrice || 0;
  const diamondOriginalPrice = diamond.basePrice || 0;
  const products = [
    {
      type: "jewelry" as const,
      product: jewelry,
      variant: variant,
      image: jewelry.thumbnails?.[0]?.url || jewelry.images?.[0]?.url,
      title: `${jewelry.type || ""} ${isMobile ? "" : "-"} ${jewelry.attributes?.designCode || ""}`.trim(),
      sku: variant?.sku,
      barcode: variant?.barcode,
      price: jewelryPrice,
      originalPrice: jewelryOriginalPrice
    },
    {
      type: "diamond" as const,
      product: diamond,
      variant: undefined,
      image: getDiamondShapeImage(diamond.attributes?.shape || "Round"),
      title: `GIA${diamond.attributes?.giaId}`,
      sku: undefined,
      barcode: undefined,
      price: diamondPrice,
      originalPrice: diamondOriginalPrice
    }
  ];

  const handleDetailsOpenChange = (open: boolean) => {
    setDetailsOpen(open);
  };

  return (
    <>
      <div className="border border-gray-200 bg-white flex flex-col overflow-hidden">
        {products.map((product, idx) => (
          <div key={idx} className={cn(
            "flex items-center p-2 sm:p-4",
            idx !== products.length - 1 && "border-b border-gray-100"
          )}>
            {/* Product thumbnail */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className={cn(
                    "w-full h-full object-cover",
                    product.type === "diamond" && "object-contain w-8 h-8 sm:w-9 sm:h-9"
                  )}
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </div>

            {/* Product info */}
            <div className="flex-1 ml-2 sm:ml-3 min-w-0">
              <div className="font-bold text-sm text-gray-900 leading-tight flex items-center gap-2">
                {product.title}
              </div>

              {/* Additional info - only visible on desktop */}
              <div className="mt-1 hidden sm:grid sm:grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                {product.sku && (
                  <div className="text-gray-500">
                    SKU: <span className="text-gray-700">{product.sku}</span>
                  </div>
                )}
                {product.barcode && (
                  <div className="text-gray-500">
                    Barcode: <span className="text-gray-700">{product.barcode}</span>
                  </div>
                )}
                {product.type === 'jewelry' ? (
                  <>
                    {product.variant?.attributes?.serialNumber && (
                      <div className="text-gray-500">
                        Serial: <span className="text-gray-700">{product.variant.attributes.serialNumber}</span>
                      </div>
                    )}
                    {product.variant?.attributes?.ringSize && (
                      <div className="text-gray-500">
                        Ni nhẫn: <span className="text-gray-700">{product.variant.attributes.ringSize}</span>
                      </div>
                    )}
                    {product.variant?.attributes?.fineness && (
                      <div className="text-gray-500">
                        Chất liệu: <span className="text-gray-700">{product.variant.attributes.fineness}</span>
                      </div>
                    )}
                    <div className="text-gray-500">
                      TL vàng: <span className="text-gray-700">{formatGoldWeight(product.variant?.attributes?.serialNumber?.goldWeight || product.variant?.attributes?.goldWeight)}</span>
                    </div>
                    {product.variant?.stockAt && (
                      <div className="text-gray-500 col-span-2">
                        Kho: <span className="text-gray-700">{product.variant.stockAt}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-gray-500">
                      Kích thước: <span className="text-gray-700">{product.product.attributes?.edgeSize1 ? `${Number(product.product.attributes.edgeSize1).toFixed(1)}${product.product.attributes?.edgeSize2 ? `x${Number(product.product.attributes.edgeSize2).toFixed(1)}` : ''}` : ''}</span>
                    </div>
                    <div className="text-gray-500">
                      Thông số 4Cs: <span className="text-gray-700">{product.product.attributes.color} - {product.product.attributes.clarity} - {product.product.attributes.carat}ct - {product.product.attributes.fluorescence}</span>
                    </div>
                    {product.product.warehouses?.[0]?.name && (
                      <div className="text-gray-500 col-span-2">
                        Kho: <span className="text-gray-700">{product.product.warehouses[0].name}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="ml-2 sm:ml-3 text-right flex flex-col items-end min-w-[100px]">
              {product.originalPrice > product.price && (
                <div className="text-[10px] sm:text-xs text-gray-400 line-through truncate w-full text-right">
                  {formatPrice(product.originalPrice)}
                </div>
              )}
              <div className="text-sm font-bold text-gray-900">
                {formatPrice(product.price)}
              </div>
            </div>
          </div>
        ))}

        {isMobile && (
          <div className="px-2 pb-1 sm:hidden border-b border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-[11px] font-bold text-secondary-900 hover:bg-primary-50"
              onClick={() => setDetailsOpen(true)}
            >
              Xem chi tiết
            </Button>
          </div>
        )}

        {/* Total section */}
        <div className="flex justify-between items-center px-3 py-2 border-t border-gray-100">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">TỔNG CỘNG</span>
          <div className="flex flex-col items-end">
            <div className="text-[10px] text-gray-400 line-through">
              {formatPrice(totalBasePrice)}
            </div>
            <span className="text-sm font-bold text-gray-900">
              {formatPrice(totalSalePrice)}
            </span>
          </div>
        </div>
      </div>

      {isMobile && (
        <BottomSheet
          open={detailsOpen}
          onOpenChange={handleDetailsOpenChange}
          title="Chi tiết nguyên chiếc"
          className="max-h-[92vh]"
          contentClassName="px-0"
        >
          <ComboDetailsSheetContent
            jewelry={jewelry}
            diamond={diamond}
            variant={variant}
            totalBasePrice={totalBasePrice}
            totalSalePrice={totalSalePrice}
            formatPrice={formatPrice}
          />
        </BottomSheet>
      )}
    </>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2 py-px text-[11px] leading-snug">
      <span className="text-primary-400 shrink-0">{label}</span>
      <span className="font-medium text-secondary-900 text-right break-all">{value}</span>
    </div>
  );
}

function CompactPrice({
  className,
  sale,
  base,
  formatPrice,
}: {
  className?: string;
  sale: number;
  base?: number;
  formatPrice: (price: number) => string;
}) {
  const showStrike = (base ?? 0) > sale;
  return (
    <div className="text-right shrink-0">
      {showStrike && (
        <div className="text-[10px] text-primary-300 line-through leading-none">{formatPrice(base!)}</div>
      )}
      <div className={cn("text-xs font-bold text-secondary-900 leading-tight", className)}>{formatPrice(sale)}</div>
    </div>
  );
}

function ComboDetailsSheetContent({
  jewelry,
  diamond,
  variant,
  totalBasePrice,
  totalSalePrice,
  formatPrice,
}: {
  jewelry: ProductModel;
  diamond: DiamondModel;
  variant: any;
  totalBasePrice: number;
  totalSalePrice: number;
  formatPrice: (price: number) => string;
}) {
  const vAttributes = variant?.attributes || {};
  const jewelryImage = jewelry.thumbnails?.[0]?.url || jewelry.images?.[0]?.url;
  const jewelrySale = variant?.salePrice || jewelry.salePrice || 0;
  const jewelryBase = variant?.basePrice || jewelry.basePrice || 0;

  const d = diamond.attributes;
  const fourCs = [d?.color, d?.clarity, d?.carat ? `${d.carat}ct` : null, d?.fluorescence]
    .filter(Boolean)
    .join(" · ");
  const diamondSize =
    d?.edgeSize1
      ? `${Number(d.edgeSize1).toFixed(1)}${d?.edgeSize2 ? `×${Number(d.edgeSize2).toFixed(1)}` : ""}mm`
      : null;

  return (
    <div className="px-3 pb-1 space-y-2">
      {/* Nhẫn */}
      <div className="rounded-lg border border-primary-100 bg-primary-50/40 p-2.5">
        <div className="flex gap-2.5">
          <div className="size-11 shrink-0 border border-primary-100 bg-white overflow-hidden flex items-center justify-center">
            {jewelryImage ? (
              <img src={jewelryImage} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
            ) : null}
          </div>
          <div className="flex-1 min-w-0 flex justify-between items-center gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-primary-400 uppercase tracking-wider">Nhẫn</p>
              <p className="text-[12px] font-bold text-secondary-900 truncate leading-tight">
                {[jewelry.type, jewelry.attributes?.designCode].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
            <CompactPrice sale={jewelrySale} base={jewelryBase} formatPrice={formatPrice} />
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-primary-100/80 space-y-0">
          <DetailRow label="SKU" value={variant?.sku} />
          <DetailRow label="Serial" value={vAttributes.serialNumber} />
          <DetailRow label="Ni nhẫn" value={vAttributes.ringSize} />
          <DetailRow
            label="Vàng"
            value={[
              vAttributes.fineness,
              formatGoldWeight(vAttributes.serialNumber?.goldWeight || vAttributes.goldWeight) !== "-"
                ? formatGoldWeight(vAttributes.serialNumber?.goldWeight || vAttributes.goldWeight)
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          />
          <DetailRow label="Kho" value={variant?.stockAt} />
        </div>
      </div>

      {/* Kim cương */}
      <div className="rounded-lg border border-primary-100 bg-primary-50/40 p-2.5">
        <div className="flex gap-2.5">
          <div className="size-11 shrink-0 border border-primary-100 bg-white overflow-hidden flex items-center justify-center p-1">
            <img
              src={getDiamondShapeImage(d?.shape || "Round")}
              alt=""
              className="size-8 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0 flex justify-between items-center gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-primary-400 uppercase tracking-wider">Kim cương</p>
              <p className="text-[12px] font-bold text-secondary-900 truncate leading-tight">
                GIA {d?.giaId || "—"}
                {d?.shape ? ` · ${d.shape}` : ""}
              </p>
            </div>
            <CompactPrice sale={diamond.salePrice || 0} base={diamond.basePrice} formatPrice={formatPrice} />
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-primary-100/80 space-y-0">
          {fourCs && <DetailRow label="4Cs" value={fourCs} />}
          <DetailRow label="Giác cắt" value={d?.cut} />
          <DetailRow label="Kích thước" value={diamondSize} />
          <DetailRow label="Kho" value={diamond.warehouses?.[0]?.name} />
        </div>
      </div>

      {/* Tổng */}
      <div className="flex justify-between items-center py-2 px-1">
        <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider">Tổng cộng</span>
        <CompactPrice className="text-sm" sale={totalSalePrice} base={totalBasePrice} formatPrice={formatPrice} />
      </div>
    </div>
  );
}
