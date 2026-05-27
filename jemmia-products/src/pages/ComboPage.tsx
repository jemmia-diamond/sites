
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchCombos, ComboFilter } from "../services/comboService";
import { LayoutShell } from "../components/layout/LayoutShell";
import { PageHeader } from "../components/layout/PageHeader";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { DiamondModel, ProductModel } from "../types";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { X } from "lucide-react";

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

interface ProductDetails {
  product: ProductModel | DiamondModel;
  type: 'jewelry' | 'diamond';
  variant?: any;
}

function ComboTableRow({ combo }: { combo: any; key?: string | number }) {
  const jewelry: ProductModel = combo.jewelry;
  const diamond: DiamondModel = combo.diamond;
  const variant: any = jewelry.variants?.[0] || {};
  const vAttributes = variant.attributes || {};
  const [detailsDialog, setDetailsDialog] = useState<ProductDetails | null>(null);

  const totalBasePrice = (variant?.basePrice || jewelry.basePrice || 0) + (diamond.basePrice || 0);
  const totalSalePrice = (variant?.salePrice || jewelry.salePrice || 0) + (diamond.salePrice || 0);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("vi-VN")} ₫`;
  };

  const jewelryPrice = variant?.salePrice || jewelry.salePrice || 0;
  const jewelryOriginalPrice = variant?.basePrice || jewelry.basePrice || 0;
  const diamondPrice = diamond.salePrice || 0;
  const diamondOriginalPrice = diamond.basePrice || 0;
  const isMobile = window.innerWidth <= 768;
  const products = [
    {
      type: "jewelry",
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
      type: "diamond",
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

  return (
    <>
      <div className="border border-gray-200 bg-white flex flex-col overflow-hidden">
        {products.map((product, idx) => (
          <div key={idx} className={cn(
            "flex items-start p-2 sm:p-4",
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

            {/* Price and button section */}
            <div className="ml-2 sm:ml-3 text-right flex flex-col items-end gap-1">
              <div className="flex flex-col items-end min-w-[100px]">
                {product.originalPrice > product.price && (
                  <div className="text-[10px] sm:text-xs text-gray-400 line-through truncate w-full text-right">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
                <div className="text-sm font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>
              </div>
              {/* Button only visible on mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden h-6 px-2 text-[10px] font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setDetailsDialog({
                  product: product.product,
                  type: product.type as 'jewelry' | 'diamond',
                  variant: product.variant
                })}
              >
                Xem chi tiết
              </Button>
            </div>
          </div>
        ))}

        {/* Total section */}
        <div className="flex justify-between items-center px-3 py-2 border-t border-gray-100">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">TỔNG CỘNG</span>
          <div className="flex flex-col items-end">
            <div className="text-xs text-gray-400 line-through">
              {formatPrice(totalBasePrice)}
            </div>
            <span className="text-base font-bold text-gray-900">
              {formatPrice(totalSalePrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!detailsDialog} onOpenChange={() => setDetailsDialog(null)}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <DialogHeader className="px-4 py-3 border-b border-gray-100">
            <DialogTitle className="text-base font-bold">
              {detailsDialog?.type === 'jewelry' ? 'Chi tiết trang sức' : 'Chi tiết kim cương'}
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {detailsDialog && (
              <ProductDetailsContent
                product={detailsDialog.product}
                type={detailsDialog.type}
                variant={detailsDialog.variant}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProductDetailsContent({ product, type, variant }: ProductDetails) {
  const formatPrice = (price: number) => {
    return `${price.toLocaleString("vi-VN")} ₫`;
  };

  if (type === 'jewelry') {
    const jewelry = product as ProductModel;
    const vAttributes = variant?.attributes || {};

    return (
      <div className="space-y-3">
        {/* Image */}
        <div className="flex justify-center">
          <div className="w-24 h-24 border border-gray-200 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src={jewelry.thumbnails?.[0]?.url || jewelry.images?.[0]?.url}
              alt={jewelry.type || 'Trang sức'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Loại:</span>
            <p className="font-medium text-gray-900">{jewelry.type || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">Mã thiết kế:</span>
            <p className="font-medium text-gray-900">{jewelry.attributes?.designCode || '-'}</p>
          </div>
          {variant?.sku && (
            <div className="col-span-2">
              <span className="text-gray-500">SKU:</span>
              <p className="font-medium text-gray-900 break-all">{variant.sku}</p>
            </div>
          )}
          {variant?.barcode && (
            <div className="col-span-2">
              <span className="text-gray-500">Barcode:</span>
              <p className="font-medium text-gray-900 break-all">{variant.barcode}</p>
            </div>
          )}
          {vAttributes.serialNumber && (
            <div>
              <span className="text-gray-500">Serial:</span>
              <p className="font-medium text-gray-900">{vAttributes.serialNumber}</p>
            </div>
          )}
          {vAttributes.ringSize && (
            <div>
              <span className="text-gray-500">Ni nhẫn:</span>
              <p className="font-medium text-gray-900">{vAttributes.ringSize}</p>
            </div>
          )}
          {vAttributes.fineness && (
            <div>
              <span className="text-gray-500">Chất liệu:</span>
              <p className="font-medium text-gray-900">{vAttributes.fineness}</p>
            </div>
          )}
          {vAttributes.materialColor && (
            <div>
              <span className="text-gray-500">Màu sắc:</span>
              <p className="font-medium text-gray-900">{vAttributes.materialColor}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">TL vàng:</span>
            <p className="font-medium text-gray-900">
              {formatGoldWeight(vAttributes.serialNumber?.goldWeight || vAttributes.goldWeight)}
            </p>
          </div>
          {variant?.stockAt && (
            <div>
              <span className="text-gray-500">Kho:</span>
              <p className="font-medium text-gray-900">{variant.stockAt}</p>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Giá bán:</span>
            <div className="text-right">
              {(variant?.basePrice || jewelry.basePrice) > (variant?.salePrice || jewelry.salePrice || 0) && (
                <p className="text-sm text-gray-400 line-through">
                  {formatPrice(variant?.basePrice || jewelry.basePrice || 0)}
                </p>
              )}
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(variant?.salePrice || jewelry.salePrice || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    const diamond = product as DiamondModel;

    return (
      <div className="space-y-3">
        {/* Image */}
        <div className="flex justify-center">
          <div className="w-24 h-24 border border-gray-200 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src={getDiamondShapeImage(diamond.attributes?.shape || 'Round')}
              alt="Kim cương"
              className="w-20 h-20 object-contain"
            />
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">GIA ID:</span>
            <p className="font-medium text-gray-900">{diamond.attributes?.giaId || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">Hình dạng:</span>
            <p className="font-medium text-gray-900">{diamond.attributes?.shape || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">Trọng lượng:</span>
            <p className="font-medium text-gray-900">{diamond.attributes?.carat || '-'} ct</p>
          </div>
          <div>
            <span className="text-gray-500">Màu sắc:</span>
            <p className="font-medium text-gray-900">{diamond.attributes?.color || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">Độ tinh khiết:</span>
            <p className="font-medium text-gray-900">{diamond.attributes?.clarity || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">Giác cắt:</span>
            <p className="font-medium text-gray-900">{diamond.attributes?.cut || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">Huỳnh quang:</span>
            <p className="font-medium text-gray-900">{diamond.attributes?.fluorescence || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">Kích thước:</span>
            <p className="font-medium text-gray-900">
              {diamond.attributes?.edgeSize1 ? Number(diamond.attributes.edgeSize1).toFixed(1) : '-'}
              {diamond.attributes?.edgeSize2 ? ` x ${Number(diamond.attributes.edgeSize2).toFixed(1)}` : ''} mm
            </p>
          </div>
          {diamond.warehouses?.[0]?.name && (
            <div className="col-span-2">
              <span className="text-gray-500">Kho:</span>
              <p className="font-medium text-gray-900">{diamond.warehouses[0].name}</p>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Giá bán:</span>
            <div className="text-right">
              {diamond.basePrice > (diamond.salePrice || 0) && (
                <p className="text-sm text-gray-400 line-through">
                  {formatPrice(diamond.basePrice)}
                </p>
              )}
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(diamond.salePrice || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
