import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowSquareOut, FilePdf } from "@phosphor-icons/react";
import { DiamondModel } from "../../../types";
import { cn, getDiamondShapeImage } from "@/lib/utils";
import { formatPriceVND } from "./utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import { CompactGallery } from "../../jewelry/JewelryTable/CompactGallery";

interface DiamondTableRowProps {
  diamond: DiamondModel;
  onGiaPdfClick: (url: string) => void;
  brokenImages: Set<string>;
  onImageError: (url: string) => void;
  onPreview: (images: string[], index: number, config?: any) => void;
  onUploadSuccess?: () => void;
  key?: string | number;
}

export function DiamondTableRow({
  diamond,
  onGiaPdfClick,
  brokenImages,
  onImageError,
  onPreview,
  onUploadSuccess
}: DiamondTableRowProps) {
  // Filter out intermediate warehouses (Kho trung gian)
  const realWarehouses = diamond.warehouses.filter(wh =>
    !wh.name.toLowerCase().includes("trung gian")
  );

  // Prioritize incoming status:
  // 1. If explicitly has incoming quantity (even if qty_available > 0)
  // 2. If it's only in intermediate warehouses
  // 3. Fallback to isInComing flag or quantity 0
  const isIncoming =
    (diamond.attributes.qty_incoming ?? 0) > 0 ||
    realWarehouses.length === 0 ||
    diamond.attributes.isInComing ||
    diamond.quantity === 0;

  // Has stock if it's not considered incoming AND has real warehouses AND has quantity
  const hasAvailableQty = (diamond.attributes.qty_available ?? diamond.quantity) > 0;
  const hasStock = !isIncoming && realWarehouses.length > 0 && hasAvailableQty;

  const actualImages = [
    ...(diamond.images?.map((img) => img.url) || []),
    ...(diamond.videos?.map((v) => v.url) || []),
  ];

  return (
    <TableRow className={cn(
      "divide-x transition-all group min-h-[3.5rem] relative border-primary-50 hover:bg-primary-50/30 divide-primary-50",
      diamond.inCombo && "bg-amber-50/30 hover:bg-amber-50/50"
    )}>
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
        <div className="h-8 w-8 sm:h-10 sm:w-10 mx-auto rounded-none overflow-hidden border border-primary-50 bg-white p-0.5">
          <img
            src={getDiamondShapeImage(diamond.attributes.shape)}
            className="h-full w-full object-contain"
            alt="Illustration"
            referrerPolicy="no-referrer"
          />
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
              onClick={() => {
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
  );
}
