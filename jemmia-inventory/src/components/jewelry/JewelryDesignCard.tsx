
import React, { useState } from "react";
import { ProductModel } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CaretDown,
  Globe,
  FileArrowUp,
  Camera,
  Plus,
  Info,
  CaretLeft,
  CaretRight,
  X,
  DownloadSimple
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface JewelryDesignCardProps {
  product: ProductModel;
  key?: string | number;
}

interface MediaSectionProps {
  title: string;
  icon: React.ReactNode;
  images: string[];
}

function MediaSection({ title, icon, images }: MediaSectionProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isWeb = title === "WEB";

  const handleDownloadAll = async () => {
    if (!images || images.length === 0) return;
    for (const imageUrl of images) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = imageUrl.split('/').pop() || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewIndex !== null) {
      setPreviewIndex((previewIndex + 1) % images.length);
    }
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewIndex !== null) {
      setPreviewIndex((previewIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="text-secondary-900">{icon}</div>
        <span className="text-[11px] font-bold text-secondary-900 tracking-tight uppercase">{title}</span>
        {images.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-secondary-900 hover:bg-primary-50 rounded-none cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadAll();
            }}
          >
            <DownloadSimple size={14} />
          </Button>
        )}
      </div>

      <div className="flex gap-2 min-h-[56px] items-center">
        {images.length === 0 && isWeb ? (
          <span className="text-[10px] font-medium text-primary-300 italic uppercase">Không có dữ liệu</span>
        ) : (
          <>
            {images.slice(0, 2).map((img, i) => (
              <div
                key={i}
                className="h-14 w-14 rounded-none border border-primary-100 overflow-hidden relative group cursor-pointer bg-white flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex(i);
                }}
              >
                <img src={img} className="h-full w-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" alt={`Media ${i}`} />
              </div>
            ))}
            {images.length > 2 && (
              <div
                className="h-14 w-14 rounded-none border border-primary-100 overflow-hidden relative group cursor-pointer bg-white flex items-center justify-center flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex(2);
                }}
              >
                <img
                  src={images[2]}
                  className="absolute inset-0 w-full h-full object-cover blur-[1px] opacity-60 transition-all group-hover:scale-110"
                  alt="Xem thêm"
                />
                <div className="absolute inset-0 bg-secondary-900/40 flex flex-col items-center justify-center group-hover:bg-secondary-900/30 transition-colors">
                  <span className="text-white text-xs font-black drop-shadow-sm">+{images.length - 2}</span>
                </div>
              </div>
            )}

            {!isWeb && (
              <div
                className="h-14 w-14 rounded-none border-2 border-dashed border-primary-100 flex items-center justify-center text-primary-300 cursor-pointer hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50 transition-all bg-white flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Plus size={16} />
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,video/*" />
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={previewIndex !== null} onOpenChange={(open) => !open && setPreviewIndex(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[70vw]! w-auto h-max bg-white rounded-none border-none p-0 overflow-hidden shadow-2xl flex flex-col outline-none"
        >
          <div className="flex-1 relative bg-primary-50 flex items-center justify-center pt-4 pb-16 px-20 group">
            {previewIndex !== null && images[previewIndex] && (
              <>
                <img
                  src={images[previewIndex]}
                  className="w-[550px] h-auto aspect-square object-cover animate-in fade-in zoom-in duration-500 scale-95"
                  alt="Xem thử"
                />

                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={showPrev}
                      className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-white/80 hover:bg-white text-secondary-900 rounded-none shadow-xl cursor-pointer border-none"
                    >
                      <CaretLeft size={32} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={showNext}
                      className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-white/80 hover:bg-white text-secondary-900 rounded-none shadow-xl cursor-pointer border-none"
                    >
                      <CaretRight size={32} />
                    </Button>
                  </>
                )}

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <div className="bg-secondary-900 text-white px-5 py-2 rounded-none text-xs font-bold shadow-xl tracking-widest uppercase">
                    {previewIndex + 1} / {images.length}
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => images[previewIndex!] && handleDownloadSingle(images[previewIndex!])}
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
                onClick={() => setPreviewIndex(null)}
              >
                <X size={24} />
              </Button>
            </div>
          </div>

          <div className="h-28 bg-white border-t border-primary-100 px-8 flex items-center gap-4 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <div
                key={i}
                className={cn(
                  "relative h-16 w-16 rounded-none overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0",
                  previewIndex === i
                    ? "ring-2 ring-secondary-900 ring-offset-2 scale-110 shadow-lg"
                    : "opacity-40 hover:opacity-100 grayscale hover:grayscale-0"
                )}
                onClick={() => setPreviewIndex(i)}
              >
                <img src={img} className="h-full w-full object-cover" alt={`Thumb ${i}`} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SideStoneModalProps {
  fourView: { round: string; diamondCount: string }[];
}

function SideStoneModal({ fourView }: SideStoneModalProps) {
  const formatLySize = (round: string) => {
    const parts = round.split('x');
    const size = parseFloat(parts[0].trim());
    return isNaN(size) ? round : `${size} ly`;
  };

  return (
    <Dialog>
      <DialogTrigger className="flex items-center hover:opacity-70 transition-opacity text-inherit cursor-pointer">
        <span className="text-secondary-900 flex items-center font-bold underline decoration-dotted underline-offset-4"><Info size={14} className="mr-1 text-secondary-900" /> Thông tin viên tấm</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="bg-secondary-900 text-white p-8">
          <DialogTitle className="text-xl font-bold tracking-tight uppercase">Chi tiết đá tấm</DialogTitle>
        </DialogHeader>
        <div className="p-8">
          <div className="grid grid-cols-2 gap-4">
            {fourView.map((stone, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-primary-50 rounded-none border border-primary-100">
                <span className="text-sm font-bold text-secondary-900">{formatLySize(stone.round)}</span>
                <span className="text-[11px] font-bold text-primary-500 bg-white px-2 py-1 rounded-none border border-primary-100 shadow-sm">
                  {stone.diamondCount} viên
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SerialListModalProps {
  variants: any[];
  sku: string;
}

function SerialListModal({ variants, sku }: SerialListModalProps) {
  const formatPolicy = (val?: string) => {
    if (!val) return null;
    if (val === "Không TM-TĐ") return "Không Thu mua - Thu đổi";
    const match = val.match(/^(\d+)%-(\d+)%$/);
    if (match) {
      return (
        <span className="flex items-center gap-1.5 justify-center">
          <span>Thu mua: <span className="font-bold text-secondary-900">{match[1]}%</span></span>
          <span className="text-primary-200">|</span>
          <span>Thu đổi: <span className="font-bold text-secondary-900">{match[2]}%</span></span>
        </span>
      );
    }
    return val;
  };

  const activeSerials = variants.filter(v => (v.quantity || 0) > 0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-none border-primary-200">
          Chi tiết
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] gap-1! bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden outline-none flex flex-col max-h-[75vh]">
        <DialogHeader className="px-6 py-3 border-b border-gray-100 bg-white sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-sm font-black tracking-widest text-secondary-900 uppercase">Danh sách Serials</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-0 bg-white pb-3">
          <div className="grid grid-cols-1 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center px-6 py-2 border-b border-gray-100">
              <span className="w-[110px] text-[10px] font-black text-primary-300 uppercase tracking-widest">Thông tin Serial</span>
              <span className="w-[180px] text-[10px] font-black text-primary-300 uppercase tracking-widest text-center">Vị trí</span>
              <span className="w-[110px] text-[10px] font-black text-primary-300 uppercase tracking-widest text-center">Trọng lượng</span>
              <span className="w-[110px] text-[10px] font-black text-primary-300 uppercase tracking-widest text-center">Viên chủ</span>
              <span className="flex-1 text-center text-[10px] font-black text-primary-300 uppercase tracking-widest">Chính sách Thu mua - Thu đổi</span>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {activeSerials.length > 0 ? (
              activeSerials.map((v, index) => (
                <div
                  key={v.id || index}
                  className="flex items-center px-6 py-2.5 transition-all hover:bg-primary-50/40 hover:pl-7 group"
                >
                  <div className="w-[110px]">
                    <span className="text-[14px] font-bold text-secondary-900 tracking-tight leading-none group-hover:text-primary-600 transition-colors">
                      {v.attributes?.serialNumber || "N/A"}
                    </span>
                  </div>

                  <div className="w-[180px] text-center">
                    <Badge className="rounded-none bg-secondary-900/5 hover:bg-secondary-900/5 text-secondary-900 border-none text-[10px] px-2 py-0.5 font-black h-5 uppercase tracking-wider">
                      {v.stockAt || "Kho tổng"}
                    </Badge>
                  </div>

                  <div className="w-[110px] text-center">
                    <span className="text-xs font-bold text-secondary-600 leading-none tracking-tight">
                      {v.attributes?.goldWeight ? `${v.attributes.goldWeight}g` : "--"}
                    </span>
                  </div>

                  <div className="w-[110px] text-center">
                    <span className="text-xs font-bold text-secondary-600 leading-none tracking-tight">
                      {v.attributes?.storageSize1 && v.attributes?.storageSize2
                        ? `${v.attributes.storageSize1}-${v.attributes.storageSize2}`
                        : v.attributes?.storageSize1 ||
                        v.attributes?.storageSize2 ||
                        "--"}
                    </span>
                  </div>

                  <div className="flex-1 text-center border-l border-gray-50">
                    <div className="text-xs text-primary-400 font-bold tracking-tight">
                      {formatPolicy(v.policy)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center">
                <p className="text-[10px] text-primary-300 font-black uppercase tracking-widest italic">Không có dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
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

  // Grouping stock variants by SKU
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

  const renderMediaGroup = (title: string, images: string[], icon: React.ReactNode) => {
    const displayImages = images.slice(0, 1);
    const hasMore = images.length > 1;

    return (
      <div className="flex flex-col gap-1 items-center">
        <div className="flex items-center gap-1 text-[8px] font-black text-primary-200 uppercase tracking-widest">
          {icon}
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {images.length > 0 ? (
            <div 
              className="relative h-10 w-10 border border-primary-100 rounded-sm overflow-hidden cursor-pointer group/thumb bg-white"
              onClick={() => handlePreview(images, 0)}
            >
              <img src={images[0]} className="h-full w-full object-cover transition-transform group-hover/thumb:scale-110" alt={title} />
              {hasMore && (
                <div className="absolute inset-0 bg-secondary-900/40 flex items-center justify-center">
                  <span className="text-[10px] text-white font-black">+{images.length - 1}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-10 w-10 border border-dashed border-primary-100 rounded-sm flex items-center justify-center bg-gray-50/30">
              <Plus size={12} className="text-primary-100" />
            </div>
          )}
          {title !== "WEB" && (
            <Button variant="ghost" size="icon" className="h-10 w-6 text-primary-200 hover:text-secondary-900 hover:bg-primary-50 rounded-none border-l border-primary-50">
              <FileArrowUp size={14} />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="group/card bg-white border border-primary-100 rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div
        className="cursor-pointer hover:bg-gray-50/50 transition-colors py-3 px-6 flex items-center gap-8 h-20"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* LEFT: BASIC INFO */}
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

        {/* MIDDLE: METADATA */}
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

        {/* RIGHT: UNIFIED GALLERY */}
        <div className="flex items-center gap-6 h-full pl-2">
          {renderMediaGroup("WEB", webImages, <Globe size={10} weight="bold" />)}
          {renderMediaGroup("THỰC TẾ", actualImages, <Camera size={10} weight="bold" />)}
          {renderMediaGroup("PHẢN HỒI", feedbackImages, <FileArrowUp size={10} weight="bold" />)}
          
          <div className="h-8 w-px bg-primary-50 mx-2" />
          
          <div className={cn("p-2 rounded-none transition-all duration-500", isExpanded ? "rotate-180 text-secondary-900" : "text-primary-200")}>
            <CaretDown size={14} weight="bold" />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 bg-gray-50/30 border-t border-primary-50" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white border-x border-b border-primary-50 overflow-hidden">
            <Table>
              <TableHeader className="bg-primary-50/50">
                <TableRow className="border-b border-primary-50 hover:bg-transparent">
                  <TableHead className="text-[9px] font-black text-primary-300 py-2.5 uppercase pl-8 tracking-widest">Sản phẩm (SKU/Barcode)</TableHead>
                  <TableHead className="text-[9px] font-black text-primary-300 py-2.5 uppercase tracking-widest">Cấu hình (Vàng/Màu/Ni)</TableHead>
                  <TableHead className="text-[9px] font-black text-primary-300 py-2.5 uppercase tracking-widest text-center">Tồn kho</TableHead>
                  <TableHead className="text-[9px] font-black text-primary-300 py-2.5 uppercase tracking-widest text-right pr-8">Giá bán</TableHead>
                  <TableHead className="text-[9px] font-black text-primary-300 py-2.5 uppercase tracking-widest text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(stockBySKU).map(([sku, group]) => {
                  const variant = group.firstVariant;
                  return (
                    <TableRow key={sku} className="border-b border-primary-50 last:border-none group/row hover:bg-primary-50/20 transition-colors">
                      <TableCell className="py-2 pl-8">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-bold text-secondary-900">SKU: {sku}</p>
                          <p className="text-[9px] font-black text-primary-200 tracking-wider">BC: {variant.barcode || "N/A"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="rounded-full text-[10px] font-bold px-1.5 py-0.5 bg-white border-primary-100 text-primary-600">
                            {cleanFineness(variant.attributes?.fineness || product.attributes?.fineness)}
                          </Badge>
                          <span className="text-[11px] font-bold text-secondary-900">{variant.attributes?.materialColor || "N/A"}</span>
                          <span className="text-primary-100">/</span>
                          <span className="text-[11px] font-black text-secondary-900">{variant.attributes?.ringSize ? `Ni ${variant.attributes.ringSize}` : "--"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-secondary-900 text-white rounded-full text-[11px] font-black h-6 w-10 flex items-center justify-center">
                          {isEarring ? Math.floor(group.totalQuantity / 2) : group.totalQuantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex flex-col items-end">
                          {variant.basePrice > 0 && variant.basePrice !== variant.salePrice && (
                            <p className="text-[10px] font-medium text-primary-200 line-through">
                              {formatPrice(isEarring ? variant.basePrice * 2 : variant.basePrice)}
                            </p>
                          )}
                          <p className="text-sm font-black text-secondary-900">
                            {formatPrice(isEarring ? (variant.salePrice || 0) * 2 : (variant.salePrice || 0))}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center" onClick={(e) => e.stopPropagation()}>
                          <SerialListModal variants={group.variants} sku={sku} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* GLOBAL PREVIEW DIALOG */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
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
                      onClick={showPrev}
                      className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-white/80 hover:bg-white text-secondary-900 rounded-none shadow-xl cursor-pointer border-none"
                    >
                      <CaretLeft size={32} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={showNext}
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
                    onClick={() => handleDownloadSingle(previewUrl)}
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
                onClick={() => setPreviewUrl(null)}
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
                onClick={() => {
                  setPreviewIndex(i);
                  setPreviewUrl(img);
                }}
              >
                <img src={img} className="h-full w-full object-cover" alt={`Thumb ${i}`} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
