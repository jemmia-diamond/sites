import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchCombos, ComboFilter } from "../services/comboService";
import { LayoutShell } from "../components/layout/LayoutShell";
import { PageHeader } from "../components/layout/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DiamondModel, ProductModel } from "../types";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

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
      <div className="flex flex-col h-full bg-white w-full px-4 lg:px-6 pt-4 pb-6 gap-4 min-w-0 overflow-hidden min-h-0">
        <PageHeader
          title="Sản phẩm nguyên chiếc"
          description={`Hiển thị ${data?.pages[0]?.meta.totalItems || 0} kết quả`}
        />

        <div className="flex-1 bg-white flex flex-col min-h-0 w-full max-w-full overflow-hidden">
          <div className="relative border border-primary-100 bg-white shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-auto min-w-0 w-full relative">
              <table className="w-full border-collapse">
                <TableHeader>
                  <TableRow className="border-b border-primary-100 hover:bg-transparent">
                    <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-4 py-0 text-left text-[10px] sm:text-xs font-black text-secondary-900 whitespace-nowrap uppercase">Trang sức (Vỏ)</TableHead>
                    <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-4 py-0 text-left text-[10px] sm:text-xs font-black text-secondary-900 whitespace-nowrap uppercase">Kim cương (Chủ)</TableHead>
                    <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-4 py-0 text-right text-[10px] sm:text-xs font-black text-secondary-900 whitespace-nowrap uppercase">Tổng giá bán</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-primary-300 text-xs">
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : !allCombos.length ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-primary-300 text-xs">
                        Không tìm thấy combo nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    allCombos.map((combo) => (
                      <ComboTableRow key={`${combo.variant_serials_id}-${combo.diamonds_id}`} combo={combo} />
                    ))
                  )}
                </TableBody>
              </table>
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
  const vAttributes = variant.attributes || {};

  const totalBasePrice = (variant?.basePrice || jewelry.basePrice || 0) + (diamond.basePrice || 0);
  const totalSalePrice = (variant?.salePrice || jewelry.salePrice || 0) + (diamond.salePrice || 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <TableRow className="divide-x transition-all group py-2 relative border-primary-50 hover:bg-primary-50/30 divide-primary-50">
      <TableCell className="px-4 py-3 align-top">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 shrink-0 rounded-md overflow-hidden border border-primary-50 bg-white p-0.5">
            <img
              src={jewelry.thumbnails?.[0]?.url || jewelry.images?.[0]?.url}
              className="h-full w-full object-cover rounded-sm"
              alt="Jewelry"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-black text-secondary-900 tracking-tight">
                {jewelry.type || "TRANG SỨC"} - {jewelry.attributes?.designCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-primary-500 font-medium">
              <p>SKU: <span className="font-semibold text-secondary-900">{variant?.sku || "-"}</span></p>
              <p>Barcode: <span className="font-semibold text-secondary-900">{variant?.barcode || "-"}</span></p>
              <p>Serial Number: <span className="font-semibold text-secondary-900">{vAttributes.serialNumber || "-"}</span></p>
              <p>Ni: <span className="font-semibold text-secondary-900">{vAttributes.ringSize || "-"}</span></p>
              <p>TL Vàng: <span className="font-semibold text-secondary-900">{formatGoldWeight(vAttributes.serialNumber?.goldWeight || vAttributes.goldWeight)}</span></p>
              <p>Chất liệu: <span className="font-semibold text-secondary-900">{vAttributes.fineness || "-"}</span></p>
              <p>Màu sắc: <span className="font-semibold text-secondary-900">{vAttributes.materialColor || "-"}</span></p>
              <p>Kho: <span className="font-semibold text-secondary-900">{variant?.stockAt || jewelry.warehouses?.[0]?.name || "-"}</span></p>
            </div>

            <div className="flex items-center gap-2 mt-1">
              {(variant?.basePrice || jewelry.basePrice) > (variant?.salePrice || jewelry.salePrice || 0) && (
                <span className="text-[11px] font-semibold text-primary-200 line-through">
                  {formatPrice(variant?.basePrice || jewelry.basePrice || 0)}
                </span>
              )}
              <span className="text-[13px] font-black text-secondary-900">
                {formatPrice(variant?.salePrice || jewelry.salePrice || 0)}
              </span>
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3 align-top">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 shrink-0 rounded-md overflow-hidden border border-primary-50 bg-white p-0.5">
            <img
              src={getDiamondShapeImage(diamond.attributes?.shape || "Round")}
              className="h-full w-full object-contain rounded-sm"
              alt="Diamond Shape"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-black text-secondary-900 tracking-tight uppercase">
                GIA{diamond.attributes?.giaId}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-primary-500 font-medium">
              <p>Hình dạng: <span className="font-semibold text-secondary-900">{diamond.attributes?.shape || "-"}</span></p>
              <p>Kích thước: <span className="font-semibold text-secondary-900">{diamond.attributes?.edgeSize1 ? Number(diamond.attributes.edgeSize1).toFixed(1) : "-"}{diamond.attributes?.edgeSize2 ? `x${Number(diamond.attributes.edgeSize2).toFixed(1)}` : ''}</span></p>
              <p>Trọng lượng: <span className="font-semibold text-secondary-900">{diamond.attributes?.carat || "-"} ct</span></p>
              <p>Màu sắc: <span className="font-semibold text-secondary-900">{diamond.attributes?.color || "-"}</span></p>
              <p>Độ tinh khiết: <span className="font-semibold text-secondary-900">{diamond.attributes?.clarity || "-"}</span></p>
              <p>Giác cắt: <span className="font-semibold text-secondary-900">{diamond.attributes?.cut || "-"}</span></p>
              <p>Huỳnh quang: <span className="font-semibold text-secondary-900">{diamond.attributes?.fluorescence || "-"}</span></p>
              <p>Kho: <span className="font-semibold text-secondary-900">{diamond.warehouses?.[0]?.name || "-"}</span></p>
            </div>

            <div className="flex items-center gap-2 mt-1">
              {diamond.basePrice > (diamond.salePrice || 0) && (
                <span className="text-[11px] font-semibold text-primary-200 line-through">
                  {formatPrice(diamond.basePrice)}
                </span>
              )}
              <span className="text-[13px] font-black text-secondary-900">
                {formatPrice(diamond.salePrice || 0)}
              </span>
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3 text-right">
        <div className="flex flex-col items-end justify-end h-full gap-1.5">
          {totalBasePrice > totalSalePrice && (
            <p className="text-[11px] font-semibold text-primary-200 line-through opacity-70">
              {formatPrice(totalBasePrice)}
            </p>
          )}
          <p className="text-[16px] font-black text-secondary-900 tracking-tighter">
            {formatPrice(totalSalePrice)}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}
