import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowSquareOut, FilePdf } from "@phosphor-icons/react";
import { DiamondModel } from "../../../types";
import { cn, getDiamondShapeImage } from "@/lib/utils";
import { formatPriceVND } from "./utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";

interface DiamondTableRowProps {
  diamond: DiamondModel;
  onGiaPdfClick: (url: string) => void;
  onImageClick: (url: string) => void;
  key: string;
}

export function DiamondTableRow({ diamond, onGiaPdfClick, onImageClick }: DiamondTableRowProps) {
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

  return (
    <TableRow className="divide-x transition-all cursor-pointer group h-14 relative border-primary-50 hover:bg-primary-50/30 divide-primary-50">
      <TableCell className="px-3 py-2">
        <div className="flex flex-col items-start">
          <p className="text-[11px] font-black text-secondary-900 tracking-tight uppercase">GIA{diamond.attributes.giaId}</p>
          <p className="text-[9px] text-primary-300 font-bold uppercase tracking-wider leading-none mt-0.5">BC:{diamond.barcode}</p>
        </div>
      </TableCell>
      <TableCell className="px-2 py-2 text-center">
        <div className="h-10 w-10 mx-auto rounded-none overflow-hidden border border-primary-50 bg-white p-0.5">
          {diamond.images?.[0] ? (
            <img
              src={diamond.images[0].url}
              className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110 cursor-pointer"
              alt="Real"
              referrerPolicy="no-referrer"
              onClick={() => onImageClick(diamond.images[0].url)}
            />
          ) : (
            <div className="h-full w-full bg-primary-50 flex items-center justify-center text-[7px] text-primary-300 font-bold uppercase">N/A</div>
          )}
        </div>
      </TableCell>
      <TableCell className="px-2 py-2 text-center">
        <div className="h-10 w-10 mx-auto rounded-none overflow-hidden border border-primary-50 bg-white p-0.5">
          <img
            src={getDiamondShapeImage(diamond.attributes.shape)}
            className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110 cursor-pointer"
            alt="Illustration"
            referrerPolicy="no-referrer"
            onClick={() => onImageClick(getDiamondShapeImage(diamond.attributes.shape))}
          />
        </div>
      </TableCell>

      <TableCell className="px-2 py-2 text-center">
        <p className="text-[11px] font-black text-secondary-900 tracking-tight whitespace-nowrap">
          {diamond.attributes.edgeSize1.toFixed(1)}x{diamond.attributes.edgeSize2.toFixed(1)}
        </p>
      </TableCell>

      <TableCell className="px-2 py-2 text-center">
        <span className="text-[11px] font-black text-secondary-900 tracking-tight whitespace-nowrap">{diamond.attributes.carat} CT</span>
      </TableCell>

      <TableCell className="px-2 py-2 text-center">
        <span className="text-[10px] font-bold text-primary-400 uppercase tracking-tight whitespace-nowrap">{diamond.attributes.shape}</span>
      </TableCell>

      <TableCell className="px-2 py-2 text-center">
        <span className="text-[10px] font-bold text-primary-400 uppercase tracking-tight">{diamond.attributes.color}</span>
      </TableCell>

      <TableCell className="px-2 py-2 text-center">
        <span className="text-[10px] font-bold text-primary-400 uppercase tracking-tight">{diamond.attributes.clarity}</span>
      </TableCell>

      <TableCell className="px-2 py-2 text-center">
        <p className="text-[9px] font-bold text-primary-300 uppercase tracking-tight">
          {diamond.attributes.fluorescence || "NONE"}
        </p>
      </TableCell>

      <TableCell className="px-3 py-2 text-right">
        <div className="flex flex-col items-end leading-none">
          {diamond.basePrice > diamond.salePrice && (
            <p className="text-[9px] font-bold text-primary-200 line-through opacity-60 mb-0.5">{formatPriceVND(diamond.basePrice)}</p>
          )}
          <p className="text-[13px] font-black text-secondary-900 tracking-tight">{formatPriceVND(diamond.salePrice)}</p>
        </div>
      </TableCell>

      <TableCell className="px-2 py-2 text-center">
        <Badge
          className={cn(
            "rounded-full px-3 py-1 text-[10px] font-black tracking-widest border-none shadow-sm whitespace-nowrap",
            hasStock 
              ? "bg-emerald-50 text-emerald-600" 
              : (isIncoming ? "bg-blue-50 text-blue-600" : "bg-primary-50 text-primary-300")
          )}
        >
          {isIncoming ? "Đang về" : (hasStock ? "Có hàng" : "Hết hàng")}
        </Badge>
      </TableCell>

      <TableCell className="px-2 py-2 text-center">
        <div className="flex flex-wrap justify-center gap-1">
          {isIncoming || realWarehouses.length === 0 ? (
            <span className="text-[9px] font-bold text-primary-300 italic">Chưa có kho</span>
          ) : (
            realWarehouses.map((wh, idx) => (
              <Badge key={idx} className="bg-primary-50 text-secondary-900 hover:bg-primary-100 border-none rounded-none px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight whitespace-nowrap">
                {wh.name}
              </Badge>
            ))
          )}
        </div>
      </TableCell>

      <TableCell className="px-2 py-2 text-center">
        <div className="flex justify-center">
          {diamond.attributes.giaPdfUrl ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 rounded-none border-primary-100 text-[10px] font-black tracking-tight hover:bg-secondary-900 hover:text-white hover:border-secondary-900 transition-all uppercase group"
              onClick={() => {
                const url = diamond.attributes.giaPdfUrl;
                if (url) onGiaPdfClick(url);
              }}
            >
              Xem giấy GIA
            </Button>
          ) : (
            <span className="text-[10px] text-primary-200 font-bold uppercase italic opacity-50">N/A</span>
          )}
        </div>
      </TableCell>

      <TableCell className="px-2 py-2 text-center">
        <div className="flex justify-center">
          <a
            href={`https://jemmiavn.myharavan.com/admin/products/${diamond.attributes.productId}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center text-[9px] font-black text-primary-300 hover:text-secondary-900 transition-colors group tracking-tight uppercase"
          >
            HRA <ArrowSquareOut size={12} className="ml-1 opacity-50 group-hover:opacity-100" />
          </a>
        </div>
      </TableCell>
    </TableRow>
  );
}