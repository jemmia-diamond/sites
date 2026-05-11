import { useState } from "react";
import { DiamondModel } from "../../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ArrowSquareOut, FilePdf, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface DiamondTableProps {
  diamonds: DiamondModel[];
}

export function DiamondTable({ diamonds }: DiamondTableProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const formatPriceVND = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="bg-white rounded-none border border-primary-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <Table>
        <TableHeader className="bg-primary-50">
          <TableRow className="border-primary-100 divide-x divide-primary-100">
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Định danh</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 text-center uppercase tracking-[0.2em]">Hình minh họa</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 text-center uppercase tracking-[0.2em]">Hình thực tế</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Kích thước</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Trọng lượng (carat)</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Hình dạng</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Nước màu</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Độ sạch</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Huỳnh quang</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 text-right uppercase tracking-[0.2em]">Giá (VND)</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Trạng thái</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Vị trí kho</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 text-center uppercase tracking-[0.2em]">Chứng nhận GIA</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Haravan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diamonds.map((diamond) => (
            <TableRow key={diamond.id} className="border-primary-50 h-28 divide-x divide-primary-50 hover:bg-gray-50/50 transition-all group">
              <TableCell className="px-4">
                <p className="text-[13px] font-black text-secondary-900 tracking-tight uppercase">GIA{diamond.attributes.giaId}</p>
                <div className="flex flex-col mt-1 gap-0.5">
                  <p className="text-[9px] text-primary-300 font-bold uppercase tracking-wider">Barcode: {diamond.barcode}</p>
                </div>
              </TableCell>

              <TableCell className="px-4">
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
              </TableCell>

              <TableCell className="px-4">
                <div className="h-16 w-16 mx-auto rounded-none overflow-hidden border border-primary-50 bg-white p-1">
                  {diamond.images?.[0] ? (
                    <img
                      src={diamond.images[0].url}
                      className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                      alt="Real"
                      referrerPolicy="no-referrer"
                      onClick={() => setImagePreviewUrl(diamond.images[0].url)}
                    />
                  ) : (
                    <div className="h-full w-full bg-primary-50 flex items-center justify-center text-[8px] text-primary-300 font-bold uppercase">No image</div>
                  )}
                </div>
              </TableCell>

              <TableCell className="px-4 text-center">
                <p className="text-[12px] font-black text-secondary-900 tracking-tight">
                  {diamond.attributes.edgeSize1} x {diamond.attributes.edgeSize2} mm
                </p>
              </TableCell>

              <TableCell className="px-4 text-center">
                <span className="text-[11px] font-black text-secondary-900 tracking-widest">{diamond.attributes.carat} CT</span>
              </TableCell>

              <TableCell className="px-4 text-center">
                <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{diamond.attributes.shape}</span>
              </TableCell>

              <TableCell className="px-4 text-center">
                <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{diamond.attributes.color}</span>
              </TableCell>

              <TableCell className="px-4 text-center">
                <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{diamond.attributes.clarity}</span>
              </TableCell>

              <TableCell className="px-4 text-center">
                <p className="text-[9px] font-bold text-primary-300 uppercase tracking-[0.1em]">
                  {diamond.attributes.fluorescence || "NONE"}
                </p>
              </TableCell>

              <TableCell className="px-4 text-right">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-primary-200 font-bold line-through opacity-60 leading-none">{formatPriceVND(diamond.basePrice)}</p>
                  <p className="text-[14px] font-black text-secondary-900 tracking-tight">{formatPriceVND(diamond.salePrice)}</p>
                  {diamond.discountValue && (
                    <span className="text-[9px] font-black text-critical bg-critical/5 px-1 py-0.5 self-end mt-1">
                      -{diamond.discountValue}%
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4">
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
              </TableCell>

              <TableCell className="px-4">
                <div className="flex flex-col gap-1">
                  {diamond.warehouses.map((wh, idx) => (
                    <Badge key={idx} className="bg-primary-50 text-secondary-900 hover:bg-primary-100 border-none rounded-none px-2 py-1 text-[9px] font-black uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                      {wh.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>

              <TableCell className="px-4">
                <div className="flex flex-col items-center justify-center">
                  {diamond.attributes.giaPdfUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 rounded-none border-primary-100 text-[10px] font-black tracking-widest hover:bg-secondary-900 hover:text-white hover:border-secondary-900 transition-all uppercase group"
                      onClick={() => {
                        const url = diamond.attributes.giaPdfUrl;
                        if (url) setPreviewUrl(url);
                      }}
                    >
                      <FilePdf size={16} weight="bold" className="mr-2 text-critical group-hover:text-white transition-colors" />
                      XEM GIA
                    </Button>
                  ) : (
                    <span className="text-[10px] text-primary-200 font-bold uppercase italic opacity-50">N/A</span>
                  )}
                </div>
              </TableCell>

              <TableCell className="px-4">
                <a
                  href={`https://admin.haravan.com/admin/products/${diamond.attributes.productId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center text-[9px] font-black text-primary-300 hover:text-secondary-900 transition-colors group tracking-widest uppercase"
                >
                  HARAVAN <ArrowSquareOut size={12} className="ml-1 opacity-50 group-hover:opacity-100" />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="w-[80vw]! max-w-[1200px]! h-[80vh] p-0 overflow-hidden border-none bg-white shadow-2xl rounded-none outline-none">
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0">
              <DialogTitle className="text-sm font-bold uppercase tracking-widest text-secondary-900">
                Chứng Nhận GIA Preview
              </DialogTitle>
            </div>
            <div className="flex-1 bg-gray-100 overflow-hidden">
              {previewUrl && (
                <iframe
                  src={`${previewUrl}#zoom=page-width`}
                  className="w-full h-full border-none"
                  title="GIA Certificate Preview"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!imagePreviewUrl} onOpenChange={(open) => !open && setImagePreviewUrl(null)}>
        <DialogContent className="w-auto max-w-[550px]! h-[80vh] p-0 overflow-hidden border-none bg-white shadow-2xl rounded-none outline-none">
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0">
              <DialogTitle className="text-sm font-bold uppercase tracking-widest text-secondary-900">
                Hình Ảnh Thực Tế
              </DialogTitle>
            </div>
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 overflow-hidden">
              {imagePreviewUrl && (
                <img 
                  src={imagePreviewUrl} 
                  className="h-full w-auto object-cover shadow-md"
                  alt="Real Diamond Preview"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
