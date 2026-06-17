import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowSquareOut, CaretDown, Image } from "@phosphor-icons/react";
import { DiamondModel, ProductModel } from "../../../types";
import { cn, formatWarehouseName } from "@/lib/utils";
import { formatPriceVND } from "./utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import { CompactGallery } from "../../jewelry/JewelryTable/CompactGallery";
import { ProductCodes } from "../../jewelry/JewelryTable/ProductCodes";
import { AlertCircle } from "lucide-react";

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
  const codeProduct = {
    id: diamond.id,
    attributes: {
      designCode: `GIA${diamond.attributes.giaId}`,
    },
    products: [],
  } as unknown as ProductModel;

  const [showBarcode, setShowBarcode] = useState(false);

  const realWarehouses = diamond.warehouses.filter(wh =>
    !wh.name.toLowerCase().includes("trung gian")
  );

  const isIncoming =  diamond.quantity === 0 && realWarehouses.length === 0;
  const hasAvailableQty = (diamond.attributes.qty_available ?? diamond.quantity) > 0;
  const hasStock = !isIncoming && realWarehouses.length > 0 && hasAvailableQty;

  const actualImages = [
    ...(diamond.images?.map((img) => img.url) || []),
    ...(diamond.videos?.map((v) => v.url) || []),
  ];

  const noteText = diamond.attributes.diamondHistory?.errors
    ? `${diamond.attributes.diamondHistory.errors}${diamond.attributes.diamondHistory.note ? ` - ${diamond.attributes.diamondHistory.note}` : ""
    }`
    : "";

  const normalPassStage =
    diamond.attributes.diamondHistory?.status === "Bình thường (pass)"
      ? diamond.attributes.diamondHistory.stage
      : "";

  const fullNoteText = [noteText, normalPassStage].filter(Boolean).join(" - ");

  return (
    <>
      {/* Desktop Table View */}
      <TableRow
        className={cn(
          "transition-all group min-h-[3.5rem] relative hidden md:table-row border-primary-100 hover:bg-primary-50/30 divide-primary-50",
          fullNoteText ? "border-b-white" : "border-primary-100",
        )}
      >
        <TableCell className="px-2 md:pl-3 md:pr-3 py-2 text-left w-[180px]">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center justify-start gap-2">
              <ProductCodes product={codeProduct} isExpanded={false} className="w-[130px] !justify-start align-caret-right" />
                  {diamond.inCombo && (
                  <Badge className="bg-amber-500 text-white text-[8px] px-1 py-0 h-3 leading-none border-none font-semibold rounded-sm tracking-tighter">
                    Không bán lẻ
                  </Badge>
                )}
            </div>
          </div>
        </TableCell>

        <TableCell className="px-1 md:px-1 py-2 text-center">
          <span className="text-[10px] font-semibold text-primary-500 tracking-tight whitespace-nowrap">
            {diamond.attributes.edgeSize1.toFixed(1)}x{diamond.attributes.edgeSize2.toFixed(1)} · {diamond.attributes.carat}ct · {diamond.attributes.shape} · {diamond.attributes.color} · {diamond.attributes.clarity} · {diamond.attributes.fluorescence || "NONE"}
          </span>
        </TableCell>

        <TableCell className="px-1 md:px-1 py-2 text-center">
          <div className="flex justify-center">
            {actualImages.length > 0 ? (
              <CompactGallery
                images={actualImages}
                showUpload={false}
                brokenImages={brokenImages}
                onImageError={onImageError}
                onPreview={(images, index, config) => onPreview(images, index, { ...config, diamondId: diamond.id })}
                designCode={`GIA${diamond.attributes.giaId}`}
                onUploadSuccess={onUploadSuccess}
                uploadEndpoint={`/site/files/upload-diamond-images-multiple?barcode=${diamond.barcode}`}
                displayCount={3}
                fixedWidth={false}
              />
            ) : null}
          </div>
        </TableCell>

        <TableCell className="px-2 md:px-2 py-2 text-right">
          <div className="flex flex-col items-end leading-none">
            {diamond.basePrice > diamond.salePrice && (
              <p className="text-[9px] font-semibold text-primary-300 line-through opacity-60 mb-0.5">{formatPriceVND(diamond.basePrice)}</p>
            )}
            <p className="text-xs font-semibold text-secondary-900 tracking-tight">{formatPriceVND(diamond.salePrice)}</p>
          </div>
        </TableCell>

        <TableCell className="px-1 md:px-1 py-2 text-center">
          <Badge
            className={cn(
              "rounded-full px-2 md:px-2 py-1 text-[8px] md:text-[10px] font-semibold tracking-widest border-none shadow-sm whitespace-nowrap",
              hasStock
                ? "bg-emerald-50 text-emerald-600"
                : (isIncoming ? "bg-blue-50 text-blue-600" : "bg-primary-50 text-primary-300")
            )}
          >
            {isIncoming ? "Đang Về" : (hasStock ? "Có hàng" : "Hết hàng")}
          </Badge>
        </TableCell>

        <TableCell className="px-1 md:px-1 py-2 text-center">
          <div className="flex flex-wrap justify-center gap-1">
            {isIncoming || realWarehouses.length === 0 ? (
              <span className="text-[8px] md:text-[9px] font-semibold text-primary-300 italic">N/A</span>
            ) : (
              realWarehouses.map((wh, idx) => (
                <span key={idx} className="text-secondary-900 text-[8px] md:text-[10px] font-black uppercase tracking-tight whitespace-nowrap">
                  {formatWarehouseName(wh.name)}
                </span>
              ))
            )}
          </div>
        </TableCell>

        <TableCell className="px-1 md:px-1 py-2 text-center">
          <div className="flex items-center justify-center gap-1.5">
            {diamond.attributes.giaPdfUrl ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 rounded-none border-primary-100 text-[9px] font-black tracking-tight hover:bg-secondary-900 hover:text-white hover:border-secondary-900 transition-all uppercase group"
                onClick={(e) => {
                  e.stopPropagation();
                  const url = diamond.attributes.giaPdfUrl;
                  if (url) onGiaPdfClick(url);
                }}
              >
                GIA
              </Button>
            ) : (
              <span className="text-[8px] text-primary-200 font-semibold uppercase italic opacity-50">N/A</span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 rounded-none border-primary-100 text-[9px] font-black tracking-tight hover:bg-secondary-900 hover:text-white hover:border-secondary-900 transition-all uppercase group flex items-center justify-center gap-0.5"
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://jemmiavn.myharavan.com/admin/products/${diamond.attributes.productId}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              HRA
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {fullNoteText && (
        <TableRow className="hidden md:table-row hover:bg-transparent border-b border-primary-100">
          <TableCell colSpan={7} className="px-0 py-0">
            <div className="relative px-3 py-2">
              <div
                className="absolute top-0 left-3 right-3 h-px"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to right, #d6d6d6 0 8px, white 8px 16px)",
                }}
              />

              <div className="flex items-center gap-2 text-amber-600 text-[10px] font-semibold">
                <AlertCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                <span>{fullNoteText}</span>
                {diamond.attributes.diamondHistory?.attachment && diamond.attributes.diamondHistory.attachment.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(diamond.attributes.diamondHistory!.attachment!, 0);
                    }}
                    className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100/70 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 text-[9px] font-bold cursor-pointer transition-all ml-1"
                  >
                    <Image size={10} weight="bold" />
                    Xem ảnh
                  </button>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}

      {/* Mobile Card View */}
      <TableRow
        className={cn(
          "transition-all cursor-pointer group relative md:hidden",
          isExpanded
            ? "bg-secondary-700 hover:bg-secondary-700 border-b border-secondary-700"
            : "border-primary-100 hover:bg-primary-50/30"
        )}
        onClick={() => onToggleExpand(diamond.id)}
      >
        <TableCell className="px-2 py-2">
          <div className="flex items-center gap-2 w-full">
            {/* Left Section: All Info */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              {/* Top Row: GIA ID and Badge */}
              <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                <ProductCodes
                  product={codeProduct}
                  isExpanded={isExpanded}
                  className={cn(
                    "w-[125px] !justify-start align-caret-right",
                    isExpanded && "[&_button]:bg-white/20 [&_button]:text-white"
                  )}
                />
                {diamond.inCombo && (
                  <Badge className="bg-amber-500 text-white text-[8px] px-1 py-0 h-3 leading-none border-none font-semibold rounded-sm tracking-tighter">
                    Không bán lẻ
                  </Badge>
                )}
                {realWarehouses.length > 0 && !isIncoming && realWarehouses.map((wh, idx) => (
                  <span key={idx} className={cn(
                    "text-[10px] px-0.5 font-semibold tracking-tight whitespace-nowrap",
                    isExpanded ? "text-white bg-secondary-600" : "bg-primary-50 text-secondary-900",
                  )}>
                    {formatWarehouseName(wh.name)}
                  </span>
                ))}
              </div>

              {/* Bottom Row: 4Cs, Shape, Dimensions */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={cn(
                  "text-[10px] font-semibold tracking-tight",
                  isExpanded ? "text-white/90" : "text-primary-500"
                )}>
                  {diamond.attributes.edgeSize1.toFixed(1)}x{diamond.attributes.edgeSize2.toFixed(1)} · {diamond.attributes.carat}ct · {diamond.attributes.color} · {diamond.attributes.clarity} · {diamond.attributes.shape}
                </span>

                {(isIncoming || realWarehouses.length === 0) && (
                  <span className={cn(
                    "text-xs font-semibold italic",
                    isExpanded ? "text-white/60" : "text-primary-300"
                  )}>N/A</span>
                )}
              </div>
            </div>

            {/* Middle Section: Price Stack */}
            <div className="flex flex-col items-end gap-0.5 leading-none flex-shrink-0">
              {diamond.basePrice > diamond.salePrice && (
                <p className={cn(
                  "text-[10px] font-semibold line-through",
                  isExpanded ? "text-white/60" : "text-primary-300 opacity-60"
                )}>{formatPriceVND(diamond.basePrice)}</p>
              )}
              <p className={cn(
                "text-sm font-semibold tracking-tight",
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
          <TableCell colSpan={9} className="p-0">
            <div className="px-3 py-2 border-t border-x-2 border-b-2 border-secondary-700 animate-in fade-in slide-in-from-top-1 duration-200 space-y-1">
              {/* Row 1: Identification + Illustration + Shape */}
              <div className="flex items-center gap-3">
                {/* Identification */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    {diamond.inCombo && (
                      <Badge className="bg-amber-500 text-white text-[7px] px-1 py-0 h-3 leading-none border-none font-black rounded-sm tracking-tighter">
                        Không bán lẻ
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-primary-500 font-semibold">Barcode: <span className="text-[10px] text-primary-700 font-semibold">{`${diamond.barcode}`}</span></span>
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
                  {isIncoming ? "Đang Về" : (hasStock ? "Có hàng" : "Hết hàng")}
                </Badge>
                {/* GIA */}
                {diamond.attributes.giaPdfUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 rounded-none border-primary-100 text-[9px] font-black hover:bg-secondary-900 hover:text-white hover:border-secondary-900 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = diamond.attributes.giaPdfUrl;
                      if (url) onGiaPdfClick(url);
                    }}
                  >
                    Hình GIA
                  </Button>
                ) : (
                  <span className="text-[9px] text-primary-200 font-semibold uppercase italic opacity-50">N/A</span>
                )}
              </div>
              {/* Row 2: Diamond History */}
              {diamond.attributes.diamondHistory && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-primary-500 font-semibold">Ghi chú:</span>
                  <span className="text-[10px] text-primary-700 font-semibold min-w-0 whitespace-break-spaces">
                    {diamond.attributes.diamondHistory.errors}
                    {diamond.attributes.diamondHistory.note ? ` - ${diamond.attributes.diamondHistory.note}` : ""}
                    {diamond.attributes.diamondHistory.status === "Bình thường (pass)" && `${diamond.attributes.diamondHistory.stage}`}
                  </span>
                  {diamond.attributes.diamondHistory.attachment && diamond.attributes.diamondHistory.attachment.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(diamond.attributes.diamondHistory!.attachment!, 0);
                      }}
                      className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100/70 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 text-[9px] font-bold cursor-pointer transition-all"
                    >
                      <Image size={10} weight="bold" />
                      Xem ảnh
                    </button>
                  )}
                </div>
              )}
              {/* Actual Images */}
              {actualImages.length > 0 && (
                <div className="flex items-center gap-1">
                  <p className="text-[10px] font-semibold text-primary-500 mb-1">Ảnh/Video: </p>
                  <div className="flex justify-start">
                    <CompactGallery
                      images={actualImages}
                      showUpload={false}
                      brokenImages={brokenImages}
                      onImageError={onImageError}
                      onPreview={(images, index, config) => onPreview(images, index, { ...config, diamondId: diamond.id })}
                      designCode={`GIA${diamond.attributes.giaId}`}
                      onUploadSuccess={onUploadSuccess}
                      uploadEndpoint={`/site/files/upload-diamond-images-multiple?barcode=${diamond.barcode}`}
                      displayCount={3}
                      fixedWidth={false}
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
