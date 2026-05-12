import React, { useState } from "react";
import { ProductModel } from "../../../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CaretDown,
  Globe,
  FileArrowUp,
  Camera,
  Plus,
  CaretLeft,
  CaretRight,
  X,
  DownloadSimple
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { MediaSection } from "./MediaSection";
import { SideStoneModal } from "./SideStoneModal";
import { DesignCardTable } from "./DesignCardTable";

interface JewelryDesignCardProps {
  product: ProductModel;
  key?: string | number;
}

export function JewelryDesignCard({ product }: JewelryDesignCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewList, setPreviewList] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const webImages = product.thumbnails?.map(t => t.url) || [];
  const actualImages = [
    ...(product.images?.map(img => img.url) || []),
    ...(product.videos?.map(v => v.url) || [])
  ];
  const feedbackImages: string[] = [];

  const isEarring = product.title?.toUpperCase().includes('BÔNG TAI') || product.type?.toUpperCase().includes('BÔNG TAI');

  const cleanFineness = (f: string | undefined) => {
    if (!f) return "N/A";
    return f.replace(/Vàng/g, '').replace(/\s/g, '');
  };

  const variants = (product.variants || []) as any[];

  const stockBySKU: Record<string, { variants: any[], totalQuantity: number, firstVariant: any }> = {};
  variants.filter(v => (v.quantity || 0) > 0).forEach(v => {
    const sku = v.attributes?.sku || v.sku || product.attributes?.sku || "N/A";
    if (!stockBySKU[sku]) {
      stockBySKU[sku] = { variants: [], totalQuantity: 0, firstVariant: v };
    }
    stockBySKU[sku].variants.push(v);
    stockBySKU[sku].totalQuantity += (v.quantity || 0);
  });

  const totalStockCount = Object.values(stockBySKU).reduce((acc, curr) => acc + curr.totalQuantity, 0);
  const hasStock = totalStockCount > 0;
  const fourView = product.attributes?.["4view"];

  const handlePreview = (images: string[], index: number) => {
    setPreviewList(images);
    setPreviewIndex(index);
    setPreviewUrl(images[index]);
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (previewIndex + 1) % previewList.length;
    setPreviewIndex(nextIndex);
    setPreviewUrl(previewList[nextIndex]);
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIndex = (previewIndex - 1 + previewList.length) % previewList.length;
    setPreviewIndex(prevIndex);
    setPreviewUrl(previewList[prevIndex]);
  };

  const handleDownloadSingle = async (url: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = url.split('/').pop() || 'design-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="group/card bg-white border border-primary-100 rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div
        className="cursor-pointer hover:bg-gray-50/50 transition-colors py-3 px-6 flex items-center gap-8 h-20"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-52 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-[12px] font-black text-secondary-900 uppercase tracking-tight truncate">
              {product.type}
            </h3>
            <Badge variant="outline" className={cn(
              "rounded-full text-[8px] font-black px-1.5 py-0 border-none shrink-0",
              hasStock ? "bg-success/10 text-success" : "bg-primary-50 text-primary-300"
            )}>
              {hasStock ? "SẴN" : "HẾT"}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">
              {product.attributes?.designCode || "N/A"}
            </span>
            {product.showOnWebsite && (
              <Globe size={10} className="text-secondary-900" weight="bold" />
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center gap-10 border-x border-primary-50 px-8 h-full">
          <div className="flex flex-col gap-0.5 min-w-[100px]">
            <span className="text-[8px] font-black text-primary-200 uppercase tracking-[0.15em]">Thân nhẫn</span>
            <span className="text-[11px] font-bold text-secondary-900 truncate">
              {product.attributes?.ringBandStyle?.split(" - ").pop() || "--"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-[100px]">
            <span className="text-[8px] font-black text-primary-200 uppercase tracking-[0.15em]">Đầu nhẫn</span>
            <span className="text-[11px] font-bold text-secondary-900 truncate">
              {product.attributes?.ringHeadStyle?.split(" - ").pop() || "--"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-[100px]">
            <span className="text-[8px] font-black text-primary-200 uppercase tracking-[0.15em]">Ổ chủ</span>
            <span className="text-[11px] font-bold text-secondary-900 truncate">
              {product.attributes?.diamondHolder || "--"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
            <span className="text-[8px] font-black text-primary-200 uppercase tracking-[0.15em]">Viên tấm</span>
            {fourView && Array.isArray(fourView) && fourView.length > 0 ? (
              <SideStoneModal fourView={fourView as any} />
            ) : (
              <span className="text-[11px] font-bold text-primary-200">--</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 h-full pl-2">
          <MediaGroupCompact
            title="WEB"
            images={webImages}
            icon={<Globe size={10} weight="bold" />}
            onPreview={handlePreview}
          />
          <MediaGroupCompact
            title="THỰC TẾ"
            images={actualImages}
            icon={<Camera size={10} weight="bold" />}
            onPreview={handlePreview}
          />
          <MediaGroupCompact
            title="PHẢN HỒI"
            images={feedbackImages}
            icon={<FileArrowUp size={10} weight="bold" />}
            onPreview={handlePreview}
          />

          <div className="h-8 w-px bg-primary-50 mx-2" />

          <div className={cn("p-2 rounded-none transition-all duration-500", isExpanded ? "rotate-180 text-secondary-900" : "text-primary-200")}>
            <CaretDown size={14} weight="bold" />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 bg-gray-50/30 border-t border-primary-50" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white border-x border-b border-primary-50 overflow-hidden">
            <DesignCardTable
              stockBySKU={stockBySKU}
              isEarring={isEarring}
              product={product}
            />
          </div>
        </div>
      )}

      <GlobalPreviewDialog
        previewUrl={previewUrl}
        previewList={previewList}
        previewIndex={previewIndex}
        onClose={() => setPreviewUrl(null)}
        onShowNext={showNext}
        onShowPrev={showPrev}
        onDownloadSingle={handleDownloadSingle}
      />
    </div>
  );
}

interface MediaGroupCompactProps {
  title: string;
  images: string[];
  icon: React.ReactNode;
  onPreview: (images: string[], index: number) => void;
}

function MediaGroupCompact({ title, images, icon, onPreview }: MediaGroupCompactProps) {
  const hasMore = images.length > 1;

  if (images.length === 0) {
    return (
      <div className="flex flex-col gap-1 items-center">
        <div className="flex items-center gap-1 text-[8px] font-black text-primary-200 uppercase tracking-widest">
          {icon}
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-10 w-10 border border-dashed border-primary-100 rounded-sm flex items-center justify-center bg-gray-50/30">
            <Plus size={12} className="text-primary-100" />
          </div>
          {title !== "WEB" && (
            <button className="h-10 w-6 text-primary-200 hover:text-secondary-900 hover:bg-primary-50 rounded-none border-l border-primary-50 flex items-center justify-center">
              <FileArrowUp size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 items-center">
      <div className="flex items-center gap-1 text-[8px] font-black text-primary-200 uppercase tracking-widest">
        {icon}
        <span>{title}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="relative h-10 w-10 border border-primary-100 rounded-sm overflow-hidden cursor-pointer group/thumb bg-white"
          onClick={() => onPreview(images, 0)}
        >
          <img src={images[0]} className="h-full w-full object-cover transition-transform group-hover/thumb:scale-110" alt={title} />
          {hasMore && (
            <div className="absolute inset-0 bg-secondary-900/40 flex items-center justify-center">
              <span className="text-[10px] text-white font-black">+{images.length - 1}</span>
            </div>
          )}
        </div>
        {title !== "WEB" && (
          <button className="h-10 w-6 text-primary-200 hover:text-secondary-900 hover:bg-primary-50 rounded-none border-l border-primary-50 flex items-center justify-center">
            <FileArrowUp size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

interface GlobalPreviewDialogProps {
  previewUrl: string | null;
  previewList: string[];
  previewIndex: number;
  onClose: () => void;
  onShowNext: (e: React.MouseEvent) => void;
  onShowPrev: (e: React.MouseEvent) => void;
  onDownloadSingle: (url: string) => void;
}

export function GlobalPreviewDialog({
  previewUrl,
  previewList,
  previewIndex,
  onClose,
  onShowNext,
  onShowPrev,
  onDownloadSingle,
}: GlobalPreviewDialogProps) {
  return (
    <Dialog open={!!previewUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[70vw]! w-auto h-max bg-white rounded-none border-none p-0 overflow-hidden shadow-2xl flex flex-col outline-none"
      >
        <div className="flex-1 relative bg-primary-50 flex items-center justify-center pt-4 pb-16 px-20 group">
          {previewUrl && (
            <>
              <img
                src={previewUrl}
                className="w-[550px] h-auto aspect-square object-cover animate-in fade-in zoom-in duration-500 scale-95 shadow-2xl"
                alt="Xem thử"
              />

              {previewList.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={onShowPrev}
                    className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-white/80 hover:bg-white text-secondary-900 rounded-none shadow-xl cursor-pointer border-none"
                  >
                    <CaretLeft size={32} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={onShowNext}
                    className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-white/80 hover:bg-white text-secondary-900 rounded-none shadow-xl cursor-pointer border-none"
                  >
                    <CaretRight size={32} />
                  </Button>
                </>
              )}

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <div className="bg-secondary-900 text-white px-5 py-2 rounded-none text-xs font-bold shadow-xl tracking-widest uppercase">
                  {previewIndex + 1} / {previewList.length}
                </div>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => onDownloadSingle(previewUrl)}
                  className="h-10 w-10 bg-white hover:bg-primary-50 text-secondary-900 rounded-none shadow-xl cursor-pointer border-none"
                >
                  <DownloadSimple size={20} />
                </Button>
              </div>
            </>
          )}

          <div className="absolute top-6 right-6 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 bg-white/80 text-primary-400 rounded-none hover:bg-critical/10 hover:text-critical shadow-lg cursor-pointer"
              onClick={onClose}
            >
              <X size={24} />
            </Button>
          </div>
        </div>

        <div className="h-28 bg-white border-t border-primary-100 px-8 flex items-center gap-4 overflow-x-auto scrollbar-hide">
          {previewList.map((img, i) => (
            <div
              key={i}
              className={cn(
                "relative h-16 w-16 rounded-none overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0",
                previewIndex === i
                  ? "ring-2 ring-secondary-900 ring-offset-2 scale-110 shadow-lg"
                  : "opacity-40 hover:opacity-100 grayscale hover:grayscale-0"
              )}
              onClick={() => onShowNext({ stopPropagation: () => {} } as React.MouseEvent)}
            >
              <img src={img} className="h-full w-full object-cover" alt={`Thumb ${i}`} />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}