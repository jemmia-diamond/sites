import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductModel } from "../../../types";
import { cn } from "@/lib/utils";
import { ProductCodes } from "./ProductCodes";
import { SideStoneTooltip } from "./SideStoneTooltip";
import { CompactGallery } from "./CompactGallery";
import { TableCell, TableRow } from "@/components/ui/table";
import { CaretDown } from "@phosphor-icons/react";

interface JewelryTableRowProps {
  product: ProductModel;
  isExpanded: boolean;
  expandedId: string | null;
  brokenImages: Set<string>;
  onImageError: (url: string) => void;
  onPreview: (images: string[], index: number) => void;
  onToggleExpand: (id: string) => void;
  onOpenSerialModal: (variants: any[], sku: string) => void;
  key: string;
}

export function JewelryTableRow({
  product,
  isExpanded,
  brokenImages,
  onImageError,
  onPreview,
  onToggleExpand,
  onOpenSerialModal,
}: JewelryTableRowProps) {
  const isEarring =
    product.type?.toLowerCase().includes("bông tai") ||
    product.type?.toLowerCase().includes("earring");

  const webImages = product.thumbnails?.map((t) => t.url) || [];
  const actualImages = [
    ...(product.images?.map((img) => img.url) || []),
    ...(product.videos?.map((v) => v.url) || []),
  ];
  const variants = (product.variants || []) as any[];

  const stockBySKU: Record<string, { variants: any[]; totalQuantity: number; firstVariant: any }> = {};
  variants.forEach((v) => {
    const sku = v.attributes?.sku || v.sku || product.attributes?.sku || "N/A";
    if (!stockBySKU[sku]) stockBySKU[sku] = { variants: [], totalQuantity: 0, firstVariant: v };
    stockBySKU[sku].variants.push(v);
    stockBySKU[sku].totalQuantity += v.quantity || 0;
  });

  const totalStockCount = Object.values(stockBySKU).reduce((acc, curr) => acc + curr.totalQuantity, 0);
  const hasStock = totalStockCount > 0;
  const fourView = product.attributes?.["4view"];

  return (
    <>
      <TableRow
        className={cn(
          "divide-x transition-all cursor-pointer group h-14 relative",
          isExpanded
            ? "bg-secondary-700 divide-secondary-700 hover:bg-secondary-700 border-b border-secondary-700"
            : "border-primary-50 hover:bg-primary-50/30 divide-primary-50"
        )}
        onClick={() => onToggleExpand(product.id)}
      >
        <TableCell className="px-3 py-2 text-center">
          <div className="flex justify-center">
            <ProductCodes product={product} isExpanded={isExpanded} />
          </div>
        </TableCell>

        <TableCell className="px-2 py-2 text-center">
          {fourView && Array.isArray(fourView) && fourView.length > 0 ? (
            <div className="flex justify-center">
              <SideStoneTooltip fourView={fourView as any} isExpanded={isExpanded} />
            </div>
          ) : (
            <span className="text-primary-100 text-[10px] font-black italic">--</span>
          )}
        </TableCell>

        <TableCell className="px-2 py-2">
          <div className="flex justify-center">
            <CompactGallery
              images={webImages}
              showUpload={false}
              brokenImages={brokenImages}
              onImageError={onImageError}
              onPreview={onPreview}
            />
          </div>
        </TableCell>

        <TableCell className="px-2 py-2">
          <div className="flex justify-center">
            <CompactGallery
              images={actualImages}
              showUpload={true}
              brokenImages={brokenImages}
              onImageError={onImageError}
              onPreview={onPreview}
            />
          </div>
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
          <TableCell colSpan={6} className="p-0 bg-primary-50">
            <div className="px-0 border-t border-x-2 border-b-2 border-secondary-700 animate-in fade-in slide-in-from-top-1 duration-200">
              <ExpandedPanel
                stockBySKU={stockBySKU}
                isEarring={isEarring}
                product={product}
                onOpenSerialModal={onOpenSerialModal}
              />
            </div>
          </TableCell>
        </tr>
      )}
    </>
  );
}

interface ExpandedPanelProps {
  stockBySKU: Record<string, { variants: any[]; totalQuantity: number; firstVariant: any }>;
  isEarring: boolean;
  product: ProductModel;
  onOpenSerialModal: (variants: any[], sku: string) => void;
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

          return (
            <div
              key={sku}
              className={cn(
                "grid grid-cols-[1.5fr_2fr_1fr_1.5fr_1fr] items-center transition-colors",
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

              <div className="px-4 py-3.5 flex justify-center">
                <Badge className="rounded-full bg-secondary-900 text-white text-[11px] font-black shadow-sm">
                  Tồn: {isEarring ? Math.floor(group.totalQuantity / 2) : group.totalQuantity}
                </Badge>
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
                  onClick={() => onOpenSerialModal(group.variants, sku)}
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