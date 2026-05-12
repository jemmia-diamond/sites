import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowSquareOut, FilePdf } from "@phosphor-icons/react";
import { DiamondModel } from "../../../types";
import { cn } from "@/lib/utils";
import { formatPriceVND } from "./utils/formatters";

interface DiamondTableRowProps {
  diamond: DiamondModel;
  onGiaPdfClick: (url: string) => void;
  onImageClick: (url: string) => void;
}

export function DiamondTableRow({ diamond, onGiaPdfClick, onImageClick }: DiamondTableRowProps) {
  return (
    <tr className="border-primary-50 h-28 divide-x divide-primary-50 hover:bg-gray-50/50 transition-all group">
      <td className="px-4">
        <p className="text-[13px] font-black text-secondary-900 tracking-tight uppercase">GIA{diamond.attributes.giaId}</p>
        <div className="flex flex-col mt-1 gap-0.5">
          <p className="text-[9px] text-primary-300 font-bold uppercase tracking-wider">Barcode: {diamond.barcode}</p>
        </div>
      </td>

      <td className="px-4">
        <div className="h-16 w-16 mx-auto flex items-center justify-center">
          {diamond.attributes.shape?.toUpperCase() === "ROUND" && (
            <img
              src="https://cdn.hstatic.net/files/200000355853/file/salesaya_image_131__1_.png"
              className="h-full w-full object-contain"
              alt="Illustration"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </td>

      <td className="px-4">
        <div className="h-16 w-16 mx-auto rounded-none overflow-hidden border border-primary-50 bg-white p-1">
          {diamond.images?.[0] ? (
            <img
              src={diamond.images[0].url}
              className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110 cursor-pointer"
              alt="Real"
              referrerPolicy="no-referrer"
              onClick={() => onImageClick(diamond.images[0].url)}
            />
          ) : (
            <div className="h-full w-full bg-primary-50 flex items-center justify-center text-[8px] text-primary-300 font-bold uppercase">No image</div>
          )}
        </div>
      </td>

      <td className="px-4 text-center">
        <p className="text-[12px] font-black text-secondary-900 tracking-tight">
          {diamond.attributes.edgeSize1} x {diamond.attributes.edgeSize2} mm
        </p>
      </td>

      <td className="px-4 text-center">
        <span className="text-[11px] font-black text-secondary-900 tracking-widest">{diamond.attributes.carat} CT</span>
      </td>

      <td className="px-4 text-center">
        <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{diamond.attributes.shape}</span>
      </td>

      <td className="px-4 text-center">
        <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{diamond.attributes.color}</span>
      </td>

      <td className="px-4 text-center">
        <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{diamond.attributes.clarity}</span>
      </td>

      <td className="px-4 text-center">
        <p className="text-[9px] font-bold text-primary-300 uppercase tracking-[0.1em]">
          {diamond.attributes.fluorescence || "NONE"}
        </p>
      </td>

      <td className="px-4 text-right">
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] text-primary-200 font-bold line-through opacity-60 leading-none">{formatPriceVND(diamond.basePrice)}</p>
          <p className="text-[14px] font-black text-secondary-900 tracking-tight">{formatPriceVND(diamond.salePrice)}</p>
          {diamond.discountValue && (
            <span className="text-[9px] font-black text-critical bg-critical/5 px-1 py-0.5 self-end mt-1">
              -{diamond.discountValue}%
            </span>
          )}
        </div>
      </td>

      <td className="px-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            diamond.attributes.isInComing ? "bg-amber-400" : "bg-success"
          )} />
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            diamond.attributes.isInComing ? "text-amber-500" : "text-success"
          )}>
            {diamond.attributes.isInComing ? "ĐANG VỀ" : "SẴN CÓ"}
          </span>
        </div>
      </td>

      <td className="px-4">
        <div className="flex flex-col gap-1">
          {diamond.warehouses.map((wh, idx) => (
            <Badge key={idx} className="bg-primary-50 text-secondary-900 hover:bg-primary-100 border-none rounded-none px-2 py-1 text-[9px] font-black uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
              {wh.name}
            </Badge>
          ))}
        </div>
      </td>

      <td className="px-4">
        <div className="flex flex-col items-center justify-center">
          {diamond.attributes.giaPdfUrl ? (
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-none border-primary-100 text-[10px] font-black tracking-widest hover:bg-secondary-900 hover:text-white hover:border-secondary-900 transition-all uppercase group"
              onClick={() => {
                const url = diamond.attributes.giaPdfUrl;
                if (url) onGiaPdfClick(url);
              }}
            >
              <FilePdf size={16} weight="bold" className="mr-2 text-critical group-hover:text-white transition-colors" />
              XEM GIA
            </Button>
          ) : (
            <span className="text-[10px] text-primary-200 font-bold uppercase italic opacity-50">N/A</span>
          )}
        </div>
      </td>

      <td className="px-4">
        <a
          href={`https://admin.haravan.com/admin/products/${diamond.attributes.productId}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center text-[9px] font-black text-primary-300 hover:text-secondary-900 transition-colors group tracking-widest uppercase"
        >
          HARAVAN <ArrowSquareOut size={12} className="ml-1 opacity-50 group-hover:opacity-100" />
        </a>
      </td>
    </tr>
  );
}