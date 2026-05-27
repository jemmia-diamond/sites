import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowSquareOut, CaretDown } from "@phosphor-icons/react";
import { DiamondModel } from "../../../types";
import { cn, getDiamondShapeImage } from "@/lib/utils";
import { formatPriceVND } from "./utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import { CompactGallery } from "../../jewelry/JewelryTable/CompactGallery";

interface DiamondTableRowProps {
  diamond: DiamondModel;
  isExpanded: boolean;
  onGiaPdfClick: (url: string) => void;
  brokenImages: Set<string>;
  onImageError: (url: string) => void;
  onPreview: (images: string[], index: number, config?: any) => void;
  onUploadSuccess?: () => void;
  onToggleExpand: (id: string) => void;
  key?: string | number;
}

export function DiamondTableRow({
  diamond,
  isExpanded,
  onGiaPdfClick,
  brokenImages,
  onImageError,
  onPreview,
  onUploadSuccess,
  onToggleExpand
}: DiamondTableRowProps) {
  const realWarehouses = diamond.warehouses.filter(wh =>
    !wh.name.toLowerCase().includes("trung gian")
  );

  const isIncoming =
    (diamond.attributes.qty_incoming ?? 0) > 0 ||
    realWarehouses.length === 0 ||
    diamond.attributes.isInComing ||
    diamond.quantity === 0;

  const hasAvailableQty = (diamond.attributes.qty_available ?? diamond.quantity) > 0;
  const hasStock = !isIncoming && realWarehouses.length > 0 && hasAvailableQty;

  const actualImages = [
    ...(diamond.images?.map((img) => img.url) || []),
    ...(diamond.videos?.map((v) => v.url) || []),
  ];

  return (
    <>
      {/* Desktop Table View */}
      <TableRow
        className={cn(
          "divide-x transition-all group min-h-[3.5rem] relative hidden sm:table-row border-primary-50 hover:bg-primary-50/30 divide-primary-50",
          diamond.inCombo && "bg-amber-50/30 hover:bg-amber-50/50"
        )}
      >
        <TableCell className="px-2 sm:px-3 py-2">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] sm:text-[11px] font-black text-secondary-900 tracking-tight uppercase leading-none">GIA{diamond.attributes.giaId}</p>
              {diamond.inCombo && (
                <Badge className="bg-amber-500 text-white text-[8px] px-1 py-0 h-3.5 leading-none border-none font-black rounded-sm tracking-tighter">
                  Không bán lẻ
                </Badge>
              )}
            </div>
            <p className="text-[8px] sm:text-[9px] text-primary-300 font-bold uppercase tracking-wider leading-none mt-1">BC:{diamond.barcode}</p>
          </div>
        </TableCell>
        <TableCell className="px-1 sm:px-2 py-2 text-center">
          <p className="text-[10px] sm:text-[11px] font-black text-secondary-900 tracking-tight whitespace-nowrap">
            {diamond.attributes.edgeSize1.toFixed(1)}x{diamond.attributes.edgeSize2.toFixed(1)}
          </p>
        </TableCell>

        <TableCell className="px-1 sm:px-2 py-2 text-center">
          <span className="text-[10px] sm:text-[11px] font-black text-secondary-900 tracking-tight whitespace-nowrap">{diamond.attributes.carat} ct</span>
        </TableCell>

        <TableCell className="px-1 sm:px-2 py-2 text-center">
          <span className="text-[10px] sm:text-[11px] font-bold text-primary-400 tracking-tight whitespace-nowrap">{diamond.attributes.shape}</span>
        </TableCell>

        <TableCell className="px-1 sm:px-2 py-2 text-center">
          <span className="text-[10px] sm:text-[11px] font-bold text-primary-400 uppercase tracking-tight">{diamond.attributes.color}</span>
        </TableCell>

        <TableCell className="px-1 sm:px-2 py-2 text-center">
          <span className="text-[10px] sm:text-[11px] font-bold text-primary-400 uppercase tracking-tight">{diamond.attributes.clarity}</span>
        </TableCell>

        <TableCell className="px-1 sm:px-2 py-2 text-center">
          <p className="text-[10px] sm:text-[11px] font-bold text-primary-400 tracking-tight">
            {diamond.attributes.fluorescence || "NONE"}
          </p>
        </TableCell>

        <TableCell className="px-1 sm:px-2 py-2 text-left">
          <span className="text-[9px] sm:text-[10px] font-bold text-secondary-900 tracking-tight block w-40" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            {diamond.attributes.diamondHistory?.errors ? `${diamond.attributes.diamondHistory.errors}${diamond.attributes.diamondHistory.note ? ` - ${diamond.attributes.diamondHistory.note}` : ""}` : ""}
          </span>
        </TableCell>

        <TableCell className="px-1 sm:px-2 py-2 text-center">
          <span className="text-[9px] sm:text-[10px] font-bold text-secondary-900 tracking-tight">
            {diamond.attributes.diamondHistory?.status === "Bình thường (pass)" ? diamond.attributes.diamondHistory.stage : ""}
          </span>
        </TableCell>

        <TableCell className="px-1 sm:px-2 py-2 text-center">
          <div className="flex justify-center">
            <CompactGallery
              images={actualImages}
              showUpload={true}
              brokenImages={brokenImages}
              onImageError={onImageError}
              onPreview={(images, index, config) => onPreview(images, index, { ...config, diamondId: diamond.id })}
              designCode={`GIA${diamond.attributes.giaId}`}
              onUploadSuccess={onUploadSuccess}
              uploadEndpoint={`/files/upload-diamond-images-multiple?barcode=${diamond.barcode}`}
              displayCount={3}
            />
          </div>
        </TableCell>
        <TableCell className="px-2 sm:px-3 py-2 text-right">
          <div className="flex flex-col items-end leading-none">
            {diamond.basePrice > diamond.salePrice && (
              <p className="text-[8px] sm:text-[9px] font-bold text-primary-200 line-through opacity-60 mb-0.5">{formatPriceVND(diamond.basePrice)}</p>
            )}
            <p className="text-[11px] sm:text-[13px] font-black text-secondary-900 tracking-tight">{formatPriceVND(diamond.salePrice)}</p>
          </div>
        </TableCell>

        <TableCell className="px-1 sm:px-2 py-2 text-center">
          <Badge
            className={cn(
              "rounded-full px-2 sm:px-3 py-1 text-[8px] sm:text-[10px] font-black tracking-widest border-none shadow-sm whitespace-nowrap",
              hasStock
                ? "bg-emerald-50 text-emerald-600"
                : (isIncoming ? "bg-blue-50 text-blue-600" : "bg-primary-50 text-primary-300")
            )}
          >
            {isIncoming ? "Về" : (hasStock ? "Có hàng" : "Hết hàng")}
          </Badge>
        </TableCell>

        <TableCell className="px-1 sm:px-2 py-2 text-center">
          <div className="flex flex-wrap justify-center gap-1">
            {isIncoming || realWarehouses.length === 0 ? (
              <span className="text-[8px] sm:text-[9px] font-bold text-primary-300 italic">N/A</span>
            ) : (
              realWarehouses.map((wh, idx) => (
                <Badge key={idx} className="bg-primary-50 text-secondary-900 hover:bg-primary-100 border-none rounded-none px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-tight whitespace-nowrap">
                  {wh.name}
                </Badge>
              ))
            )}
          </div>
        </TableCell>

        <TableCell className="px-1 sm:px-2 py-2 text-center">
          <div className="flex justify-center">
            {diamond.attributes.giaPdfUrl ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 sm:px-3 rounded-none border-primary-100 text-[9px] sm:text-[10px] font-black tracking-tight hover:bg-secondary-900 hover:text-white hover:border-secondary-900 transition-all uppercase group"
                onClick={(e) => {
                  e.stopPropagation();
                  const url = diamond.attributes.giaPdfUrl;
                  if (url) onGiaPdfClick(url);
                }}
              >
                GIA
              </Button>
            ) : (
              <span className="text-[9px] sm:text-[10px] text-primary-200 font-bold uppercase italic opacity-50">N/A</span>
            )}
          </div>
        </TableCell>

        <TableCell className="px-1 sm:px-2 py-2 text-center">
          <div className="flex justify-center">
            <a
              href={`https://jemmiavn.myharavan.com/admin/products/${diamond.attributes.productId}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center text-[8px] sm:text-[9px] font-black text-primary-300 hover:text-secondary-900 transition-colors group tracking-tight uppercase"
            >
              HRA <ArrowSquareOut size={10} className="ml-1 opacity-50 group-hover:opacity-100" />
            </a>
          </div>
        </TableCell>
      </TableRow>

      {/* Mobile Card View */}
      <TableRow
        className={cn(
          "transition-all cursor-pointer group relative sm:hidden",
          isExpanded
            ? "bg-secondary-700 hover:bg-secondary-700 border-b border-secondary-700"
            : "border-primary-50 hover:bg-primary-50/30",
          diamond.inCombo && !isExpanded && "bg-amber-50/20"
        )}
        onClick={() => onToggleExpand(diamond.id)}
      >
        <TableCell className="px-3 py-1.5">
          <div className="flex items-center gap-3 w-full">
            {/* Left Section: All Info */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              {/* Top Row: In Combo Badge + Size */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "text-[9px] font-bold tracking-tight",
                  isExpanded ? "text-white/90" : "text-secondary-900"
                )}>
                  {diamond.attributes.edgeSize1.toFixed(1)}x{diamond.attributes.edgeSize2.toFixed(1)}
                </span>
                {diamond.inCombo && (
                  <Badge className="bg-amber-500 text-white text-[8px] px-1 py-0 h-3 leading-none border-none font-black rounded-sm tracking-tighter">
                    Không bán lẻ
                  </Badge>
                )}
                {realWarehouses.length > 0 && !isIncoming && realWarehouses.map((wh, idx) => (
                  <Badge key={idx} className={cn(
                    "border-none rounded-none px-1 py-0 text-[8px] font-black tracking-tight whitespace-nowrap",
                    isExpanded ? "bg-white/20 text-white" : "bg-primary-50 text-secondary-900"
                  )}>
                    {wh.name}
                  </Badge>
                ))}
              </div>

              {/* Bottom Row: 4Cs, Shape, Warehouses */}
              <div className="flex flex-wrap items-center gap-1">
                <span className={cn(
                  "text-[9px] font-bold tracking-tight",
                  isExpanded ? "text-white/90" : "text-primary-400"
                )}>
                  {diamond.attributes.carat} ct
                </span>
                <span className={cn(
                  "text-[9px] font-bold tracking-tight",
                  isExpanded ? "text-white/90" : "text-primary-400"
                )}>
                  {diamond.attributes.color}
                </span>
                <span className={cn(
                  "text-[9px] font-bold tracking-tight",
                  isExpanded ? "text-white/90" : "text-primary-400"
                )}>
                  {diamond.attributes.clarity}
                </span>
                <span className={cn(
                  "text-[9px] font-bold tracking-tight",
                  isExpanded ? "text-white/90" : "text-primary-400"
                )}>
                  {diamond.attributes.fluorescence || "NONE"}
                </span>
                <span className={cn(
                  "text-[9px] font-bold tracking-tight",
                  isExpanded ? "text-white/90" : "text-primary-400"
                )}>
                  {diamond.attributes.shape}
                </span>

                {(isIncoming || realWarehouses.length === 0) && (
                  <span className={cn(
                    "text-[9px] font-bold italic",
                    isExpanded ? "text-white/60" : "text-primary-300"
                  )}>N/A</span>
                )}
              </div>
            </div>

            {/* Middle Section: Price Stack */}
            <div className="flex flex-col items-end gap-1 leading-none flex-shrink-0">
              {diamond.basePrice > diamond.salePrice && (
                <p className={cn(
                  "text-[9px] font-bold line-through",
                  isExpanded ? "text-white/60" : "text-primary-200 opacity-60"
                )}>{formatPriceVND(diamond.basePrice)}</p>
              )}
              <p className={cn(
                "text-[11px] font-black tracking-tight",
                isExpanded ? "text-white" : "text-secondary-900"
              )}>{formatPriceVND(diamond.salePrice)}</p>
            </div>

            {/* Right Section: Chevron Button (Far Right) */}
            <Button
              size="icon"
              className={cn(
                "h-4 w-4 rounded-full transition-all duration-300 flex items-center justify-center flex-shrink-0",
                isExpanded
                  ? "bg-white text-secondary-900"
                  : "bg-primary-50 text-secondary-900 hover:bg-primary-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(diamond.id);
              }}
            >
              <CaretDown
                size={10}
                weight="bold"
                className={cn("transition-transform duration-300", isExpanded && "rotate-180")}
              />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded Panel */}
      {isExpanded && (
        <tr className="hover:bg-transparent border-none">
          <TableCell colSpan={15} className="p-0">
            <div className="px-3 py-2 border-t border-x-2 border-b-2 border-secondary-700 animate-in fade-in slide-in-from-top-1 duration-200 space-y-1">
              {/* Row 1: Identification + Illustration + Shape */}
              <div className="flex items-center gap-3">
                {/* Identification */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-secondary-900 tracking-tight uppercase">GIA{diamond.attributes.giaId}</span>
                    {diamond.inCombo && (
                      <Badge className="bg-amber-500 text-white text-[7px] px-1 py-0 h-3 leading-none border-none font-black rounded-sm tracking-tighter">
                        Không bán lẻ
                      </Badge>
                    )}
                  </div>
                  <span className="text-[8px] text-primary-300 font-bold uppercase tracking-wider">BC:{diamond.barcode}</span>
                </div>
                {/* Status */}
                <Badge
                  className={cn(
                    "rounded-full px-2 py-1 text-[8px] font-black tracking-widest border-none shadow-sm whitespace-nowrap",
                    hasStock
                      ? "bg-emerald-50 text-emerald-600"
                      : (isIncoming ? "bg-blue-50 text-blue-600" : "bg-primary-50 text-primary-300")
                  )}
                >
                  {isIncoming ? "Về" : (hasStock ? "Có hàng" : "Hết hàng")}
                </Badge>
                {/* GIA */}
                {diamond.attributes.giaPdfUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 rounded-none border-primary-100 text-[9px] font-black tracking-tight hover:bg-secondary-900 hover:text-white hover:border-secondary-900 transition-all uppercase"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = diamond.attributes.giaPdfUrl;
                      if (url) onGiaPdfClick(url);
                    }}
                  >
                    GIA
                  </Button>
                ) : (
                  <span className="text-[9px] text-primary-200 font-bold uppercase italic opacity-50">N/A</span>
                )}
                {/* Haravan */}
                <a
                  href={`https://jemmiavn.myharavan.com/admin/products/${diamond.attributes.productId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center text-[7px] font-bold text-blue-500 hover:text-blue-600 transition-colors gap-0.5 tracking-tight"
                >
                  <span>Haravan</span>
                  <ArrowSquareOut size={8} />
                </a>
              </div>
              {/* Row 2: Diamond History */}
              {diamond.attributes.diamondHistory?.errors && (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-bold text-primary-300 tracking-wider">Ghi chú:</span>
                    <span className="text-[8px] font-bold text-secondary-900">
                      {diamond.attributes.diamondHistory.errors}
                      {diamond.attributes.diamondHistory.note ? ` - ${diamond.attributes.diamondHistory.note}` : ""}
                    </span>
                  </div>
                  {diamond.attributes.diamondHistory.status === "Bình thường (pass)" && (
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] font-bold text-primary-300 tracking-wider">Kiểm định:</span>
                      <span className="text-[9px] font-bold text-emerald-600">
                        {diamond.attributes.diamondHistory.stage}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {/* Actual Images */}
              {actualImages.length > 0 && (
                <div>
                  <p className="text-[8px] font-bold text-primary-300 tracking-wider mb-1">Ảnh/Video</p>
                  <div className="flex justify-start">
                    <CompactGallery
                      images={actualImages}
                      showUpload={true}
                      brokenImages={brokenImages}
                      onImageError={onImageError}
                      onPreview={(images, index, config) => onPreview(images, index, { ...config, diamondId: diamond.id })}
                      designCode={`GIA${diamond.attributes.giaId}`}
                      onUploadSuccess={onUploadSuccess}
                      uploadEndpoint={`/files/upload-diamond-images-multiple?barcode=${diamond.barcode}`}
                      displayCount={3}
                    />
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </tr>
      )}
    </>
  );
}
