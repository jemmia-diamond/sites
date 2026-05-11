
import React, { useState } from "react";
import { ProductModel } from "../../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CaretDown,
  Camera,
  Plus,
  X,
  DownloadSimple,
  CaretLeft,
  CaretRight,
  Info,
  Tag,
  Eye
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface JewelryTableProps {
  jewelries: ProductModel[];
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
      <DialogTrigger>
        <div className="flex items-center gap-1 text-primary-300 hover:text-secondary-900 cursor-pointer transition-colors group/stone">
          <Info size={14} className="text-primary-200 group-hover/stone:text-secondary-900" />
          <span className="text-[11px] font-semibold border-b border-transparent group-hover:border-secondary-900 leading-none">
            Xem chi tiết
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl border-none shadow-2xl p-0 overflow-hidden outline-none">
        <DialogHeader className="bg-secondary-900 text-white p-8">
          <DialogTitle className="text-xl font-bold tracking-tight uppercase">Chi tiết đá tấm</DialogTitle>
        </DialogHeader>
        <div className="p-8">
          <div className="grid grid-cols-2 gap-4">
            {fourView.map((stone, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-primary-50/50 rounded-xl border border-primary-100/50">
                <span className="text-sm font-bold text-secondary-900">{formatLySize(stone.round)}</span>
                <span className="text-[11px] font-bold text-primary-500 bg-white px-2 py-1 rounded-md border border-primary-100 shadow-sm">
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

function SerialListModal({ variants, sku }: { variants: any[]; sku: string }) {
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
      <DialogTrigger>
        <Button variant="outline" size="sm">
          Xem Serials
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] gap-0 bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden outline-none flex flex-col max-h-[75vh]">
        <DialogHeader className="px-8 py-5 border-b border-gray-100 bg-white sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-[16px] font-bold tracking-tight text-secondary-900 uppercase">Danh sách Serials</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-0 bg-white pb-3">
          <div className="grid grid-cols-1 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-center px-8 py-3">
              <span className="w-[120px] text-[10px] font-bold text-primary-300 uppercase tracking-wider">Thông tin Serial</span>
              <span className="w-[180px] text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Vị trí kho</span>
              <span className="w-[110px] text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Trọng lượng</span>
              <span className="w-[110px] text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Viên chủ</span>
              <span className="flex-1 text-center text-[10px] font-bold text-primary-300 uppercase tracking-wider">Chính sách Thu mua - Thu đổi</span>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {activeSerials.length > 0 ? (
              activeSerials.map((v, index) => (
                <div key={v.id || index} className="flex items-center px-8 py-4 transition-all hover:bg-primary-50/40 group">
                  <div className="w-[120px]">
                    <span className="text-[14px] font-bold text-secondary-900 tracking-tight leading-none group-hover:text-primary-600 transition-colors">
                      {v.attributes?.serialNumber || "N/A"}
                    </span>
                  </div>
                  <div className="w-[180px] text-center">
                    <Badge className="rounded-full bg-secondary-900/5 hover:bg-secondary-900/10 text-secondary-900 border-none text-[10px] px-3 py-1 font-bold h-6 uppercase tracking-wider">
                      {v.stockAt || "Kho tổng"}
                    </Badge>
                  </div>
                  <div className="w-[110px] text-center">
                    <span className="text-xs font-semibold text-secondary-600 leading-none tracking-tight">
                      {v.attributes?.goldWeight ? `${v.attributes.goldWeight}g` : "--"}
                    </span>
                  </div>
                  <div className="w-[110px] text-center">
                    <span className="text-xs font-semibold text-secondary-600 leading-none tracking-tight">
                      {v.attributes?.storageSize1 && v.attributes?.storageSize2 ? `${v.attributes.storageSize1}-${v.attributes.storageSize2}` : v.attributes?.storageSize1 || v.attributes?.storageSize2 || "--"}
                    </span>
                  </div>
                  <div className="flex-1 text-center border-l border-gray-50/50">
                    <div className="text-[11px] text-primary-400 font-medium tracking-tight">{formatPolicy(v.policy)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Tag size={24} className="text-primary-200" />
                </div>
                <p className="text-[11px] text-primary-300 font-bold uppercase tracking-widest italic">Không có dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProductCodes({ product }: { product: ProductModel }) {
  const otherCodes = Array.from(new Set([
    product.attributes?.erpCode,
    product.attributes?.code,
    product.attributes?.backupCode
  ].filter(Boolean))).filter(c => c !== product.attributes?.designCode);

  return (
    <div className="relative group/codes inline-flex flex-col items-center">
      <div className="flex items-center gap-1.5 cursor-pointer transition-all duration-300 border border-transparent">
        <Badge className="w-fit rounded-full bg-secondary-900 text-white px-2 py-0.5 text-[10px] font-black tracking-widest border-none shadow-sm uppercase">
          {product.attributes?.designCode || "N/A"}
        </Badge>
        {otherCodes.length > 0 && (
          <div className="flex items-center justify-center w-4 h-4 rounded-full bg-secondary-900/10 group-hover/codes:bg-secondary-900 text-white transition-all duration-300">
            <CaretDown size={10} weight="bold" className="group-hover/codes:rotate-180 transition-transform duration-300" />
          </div>
        )}
      </div>

      {otherCodes.length > 0 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[60] opacity-0 invisible group-hover/codes:opacity-100 group-hover/codes:visible transition-all duration-300 transform -translate-y-2 group-hover/codes:translate-y-0">
          <div className="bg-white/95 backdrop-blur-md border border-primary-100 shadow-2xl p-2 flex flex-col gap-2 min-w-[150px] items-center">
            {otherCodes.map((c, i) => (
              <Badge key={i} className="w-full justify-center bg-white text-secondary-900 px-3 py-2 text-[9px] font-bold tracking-widest whitespace-nowrap">
                {c}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function JewelryTable({ jewelries }: JewelryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewList, setPreviewList] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageError = (url: string) => {
    setBrokenImages((prev) => new Set(prev).add(url));
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const handlePreview = (images: string[], index: number) => {
    setPreviewList(images);
    setPreviewIndex(index);
    setPreviewUrl(images[index]);
    setSelectedMedia(null);
  };

  const closeMediaDialog = () => {
    setPreviewUrl(null);
    setSelectedMedia(null);
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

  const handleDownloadAll = async (images: string[]) => {
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


  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$|^blob:|^data:video/i);
  };

  const renderCompactGallery = (images: string[], showUpload: boolean = false) => {
    const validImages = images.filter(url => !brokenImages.has(url));
    const displayCount = 4;
    const items = validImages.slice(0, displayCount);
    const totalCount = validImages.length;

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {items.map((url, idx) => {
            const isVid = isVideo(url);
            return (
              <div
                key={idx}
                className="relative h-10 w-10 overflow-hidden cursor-pointer bg-white border border-primary-50 shadow-sm hover:z-10 transition-all hover:scale-110"
                onClick={(e) => { e.stopPropagation(); handlePreview(validImages, idx); }}
              >
                {isVid ? (
                  <div className="h-full w-full bg-secondary-900 flex items-center justify-center relative">
                    <video src={url} className="h-full w-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                        <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={url}
                    className="h-full w-full object-cover"
                    alt=""
                    onError={() => handleImageError(url)}
                  />
                )}
                {idx === displayCount - 1 && totalCount > displayCount && (
                  <div className="absolute inset-0 bg-secondary-900/70 flex items-center justify-center z-10">
                    <span className="text-[9px] text-white font-bold">+{totalCount - displayCount}</span>
                  </div>
                )}
              </div>
            );
          })}
          {validImages.length === 0 && (
            <div className="h-10 w-10 border border-dashed border-primary-200 flex items-center justify-center bg-gray-50/50">
              <Camera size={14} className="text-primary-200" />
            </div>
          )}
        </div>
        {showUpload && (
          <div className="flex flex-col gap-0.5 ml-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-200 hover:text-secondary-900 hover:bg-primary-50 rounded-full"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              <Plus size={12} weight="bold" />
              <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,video/*" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Table className="bg-white rounded-none border border-primary-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        <TableHeader className="bg-primary-50">
          <TableRow className="border-primary-100 divide-x divide-primary-100 border-b">
            <TableHead className=" bg-primary-50 h-10 py-0 text-[10px] font-black text-secondary-900 px-2 text-center uppercase tracking-[0.2em]  border-primary-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Mã sản phẩm</TableHead>
            <TableHead className=" bg-primary-50 h-10 py-0 text-[10px] font-black text-secondary-900 px-2 text-center uppercase tracking-[0.2em]  border-primary-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Viên tấm</TableHead>
            <TableHead className=" bg-primary-50 h-10 py-0 text-[10px] font-black text-secondary-900 px-2 text-center uppercase tracking-[0.2em]  border-primary-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Ảnh website</TableHead>
            <TableHead className=" bg-primary-50 h-10 py-0 text-[10px] font-black text-secondary-900 px-2 text-center uppercase tracking-[0.2em]  border-primary-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Ảnh thực tế</TableHead>
            <TableHead className=" bg-primary-50 h-10 py-0 text-[10px] font-black text-secondary-900 px-2 text-center uppercase tracking-[0.2em]  border-primary-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Trạng thái</TableHead>
            <TableHead className=" bg-primary-50 w-12  border-primary-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jewelries.map((product) => {
            const isExpanded = expandedId === product.id;
            const isEarring = product.type?.toLowerCase().includes("bông tai") || product.type?.toLowerCase().includes("earring");
            const webImages = product.thumbnails?.map(t => t.url) || [];
            const actualImages = [
              ...(product.images?.map(img => img.url) || []),
              ...(product.videos?.map(v => v.url) || [])
            ];
            const variants = (product.variants || []) as any[];

            const stockBySKU: Record<string, { variants: any[], totalQuantity: number, firstVariant: any }> = {};
            variants.forEach(v => {
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

            return (
              <React.Fragment key={product.id}>
                <TableRow
                  className={cn(
                    "border-primary-50 h-8 divide-x divide-primary-50 transition-all cursor-pointer group",
                    isExpanded ? "bg-primary-50/30" : "hover:bg-gray-50/50"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : product.id)}
                >
                  <TableCell className="px-2 py-2 text-center">
                    <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                      <ProductCodes product={product} />
                    </div>
                  </TableCell>

                  <TableCell className="px-2 py-2 text-center">
                    {fourView && Array.isArray(fourView) && fourView.length > 0 ? (
                      <div className="inline-flex" onClick={(e) => e.stopPropagation()}>
                        <SideStoneModal fourView={fourView as any} />
                      </div>
                    ) : (
                      <span className="text-primary-100 text-[10px] font-black italic">--</span>
                    )}
                  </TableCell>

                  <TableCell className="px-2 py-2">
                    <div className="flex justify-center">
                      {renderCompactGallery(webImages, false)}
                    </div>
                  </TableCell>

                  <TableCell className="px-2 py-2">
                    <div className="flex justify-center">
                      {renderCompactGallery(actualImages, true)}
                    </div>
                  </TableCell>

                  <TableCell className="px-2 py-2 text-center">
                    <Badge
                      className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-black tracking-widest border-none shadow-sm transition-all",
                        hasStock
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-primary-50 text-primary-300"
                      )}
                    >
                      {hasStock ? "Có hàng" : "Hết hàng"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-2 text-center">
                    <div className="flex flex-col gap-0.5 ml-1">
                      <Button
                        size="icon"
                        className="h-5 w-5 bg-primary-50 text-secondary-900 rounded-full hover:bg-primary-50"
                      >
                        <div className={cn("p-1 transition-all duration-500 text-secondary-900", isExpanded ? "rotate-180" : "")}>
                          <CaretDown size={12} weight="bold" />
                        </div>
                      </Button>
                    </div>
                    {/* <div className={cn("p-2 transition-all duration-500", isExpanded ? "rotate-180 text-secondary-900" : "text-primary-100")}>
                      <CaretDown size={14} weight="bold" />
                    </div> */}
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow className="bg-primary-50/10 border-none hover:bg-primary-50/15 transition-colors">
                    <TableCell colSpan={8} className="p-0 border-none relative overflow-hidden">
                      <div className="px-6 py-4 relative">

                        <div className="bg-white border border-primary-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                          {/* SKU Items List */}
                          <div className="divide-y divide-primary-50 bg-white/40 backdrop-blur-sm">
                            {Object.entries(stockBySKU).map(([sku, group]) => {
                              const variant = group.firstVariant;
                              const hasSale = variant.basePrice > 0 && variant.basePrice !== variant.salePrice;

                              return (
                                <div
                                  key={sku}
                                  className="grid grid-cols-[1.5fr_2fr_1fr_1.5fr_1fr] gap-4 px-6 py-4 items-center hover:bg-primary-50/40 transition-all group/sku"
                                >
                                  <div className="flex flex-col gap-1">
                                    <p className="text-xs font-black text-secondary-900 tracking-tight leading-none transition-colors">
                                      SKU: {sku}
                                    </p>
                                    <p className="text-xs font-bold text-primary-500 font-mono tracking-tighter uppercase">
                                      Barcode: {variant.barcode || "No Barcode"}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-center gap-2 flex-wrap">
                                    {variant.attributes?.fineness && (
                                      <Badge variant="outline" className="rounded-full border-primary-100 bg-white text-secondary-900 text-xs font-black px-2 py-3 shadow-sm">
                                        {variant.attributes?.fineness}
                                      </Badge>
                                    )}
                                    {variant.attributes?.materialColor && (
                                      <Badge variant="outline" className="rounded-full border-primary-100 bg-white text-secondary-900 text-xs font-black px-2 py-3 shadow-sm">
                                        {variant.attributes?.materialColor}
                                      </Badge>
                                    )}
                                    {variant.attributes?.ringSize !== 0 && (
                                      <Badge variant="outline" className="rounded-full border-primary-100 bg-white text-secondary-900 text-xs font-black px-2 py-3 shadow-sm">
                                        Ni {variant.attributes?.ringSize}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex justify-center items-center">
                                    <Badge className="rounded-full border-primary-100 bg-secondary-900 text-white text-xs font-black px-2 py-3 shadow-sm">
                                      Tồn: {isEarring ? Math.floor(group.totalQuantity / 2) : group.totalQuantity}
                                    </Badge>
                                  </div>

                                  <div className="text-right">
                                    <div className="flex flex-col items-end gap-1">
                                      {hasSale && (
                                        <p className="text-xs font-bold text-primary-200 line-through leading-none">
                                          {formatPrice(isEarring ? variant.basePrice * 2 : variant.basePrice)}
                                        </p>
                                      )}
                                      <p className="text-base font-black text-secondary-900 tracking-tight leading-none group-hover/sku:text-primary-600 transition-colors">
                                        {formatPrice(isEarring ? (variant.salePrice || 0) * 2 : (variant.salePrice || 0))}
                                      </p>
                                      {!product.showOnWebsite && (
                                        <Badge className="bg-blue-50 text-blue-500 rounded-full border-none text-[8px] font-black uppercase px-1.5 py-0 tracking-tighter mb-0.5">
                                          Giá tham khảo
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                                    <SerialListModal variants={group.variants} sku={sku} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && closeMediaDialog()}>
        <DialogContent
          className="sm:max-w-[1200px]! w-full max-h-[90vh] bg-white rounded-3xl border-none p-0 overflow-hidden shadow-2xl flex flex-col outline-none"
        >
          {(() => {
            const validPreviewList = previewList.filter(url => !brokenImages.has(url));

            if (selectedMedia) {
              const isVid = isVideo(selectedMedia);
              const validPreviewList = previewList.filter(url => !brokenImages.has(url));
              const currentIndex = validPreviewList.indexOf(selectedMedia);

              const handleNext = (e: React.MouseEvent) => {
                e.stopPropagation();
                const nextIndex = (currentIndex + 1) % validPreviewList.length;
                setSelectedMedia(validPreviewList[nextIndex]);
              };

              const handlePrev = (e: React.MouseEvent) => {
                e.stopPropagation();
                const prevIndex = (currentIndex - 1 + validPreviewList.length) % validPreviewList.length;
                setSelectedMedia(validPreviewList[prevIndex]);
              };

              return (
                <div className="flex flex-col h-full bg-secondary-900">
                  <div className="flex items-center justify-between px-8 py-4 bg-secondary-900/50 backdrop-blur-md sticky top-0 z-50">
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-white/10 font-bold"
                      onClick={() => setSelectedMedia(null)}
                    >
                      <CaretLeft size={20} className="mr-2" />
                      Quay lại thư viện
                    </Button>
                    <div className="flex items-center gap-3">
                      <div className="text-white/60 text-[11px] font-bold tracking-widest mr-4">
                        {currentIndex + 1} / {validPreviewList.length}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadSingle(selectedMedia)}
                        className="bg-white/10 hover:bg-white/20 text-white border-none rounded-xl"
                      >
                        <DownloadSimple size={18} className="mr-2" />
                        Tải về
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={closeMediaDialog}
                        className="text-white hover:bg-white/10 rounded-xl"
                      >
                        <X size={20} />
                      </Button>
                    </div>
                  </div>

                  <div className="h-[80vh] relative flex items-center justify-center p-4 sm:p-12 bg-white overflow-hidden group/viewer">
                    {validPreviewList.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-black/10 hover:bg-black/20 text-secondary-900 rounded-full opacity-0 group-hover/viewer:opacity-100 transition-opacity z-30"
                          onClick={handlePrev}
                        >
                          <CaretLeft size={32} weight="bold" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-black/10 hover:bg-black/20 text-secondary-900 rounded-full opacity-0 group-hover/viewer:opacity-100 transition-opacity z-30"
                          onClick={handleNext}
                        >
                          <CaretRight size={32} weight="bold" />
                        </Button>
                      </>
                    )}

                    {isVid ? (
                      <video
                        key={selectedMedia}
                        src={selectedMedia}
                        controls
                        autoPlay
                        className="max-w-full max-h-full object-contain rounded-xl"
                      />
                    ) : (
                      <img
                        key={selectedMedia}
                        src={selectedMedia}
                        className="max-w-full max-h-full object-contain rounded-xl animate-in zoom-in-95 duration-500"
                        alt="Preview"
                      />
                    )}
                  </div>
                </div>
              );
            }

            return (
              <>
                <div className="flex items-center justify-between px-8 py-6 border-b border-primary-50 bg-white sticky top-0 z-20">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-black text-secondary-900 uppercase tracking-tight">Thư viện hình ảnh/video</h3>
                    <p className="text-xs text-primary-300 font-bold">Tổng cộng {validPreviewList.length} tệp tin</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-4 border-primary-100 font-bold text-xs uppercase tracking-widest hover:bg-secondary-900 hover:text-white transition-all"
                      onClick={() => handleDownloadAll(validPreviewList)}
                    >
                      <DownloadSimple size={16} className="mr-2" />
                      Tải về tất cả
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 bg-primary-50 text-secondary-90 rounded-full hover:bg-critical/10 hover:text-critical"
                      onClick={closeMediaDialog}
                    >
                      <X size={20} />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                  <div className="grid grid-cols-3 gap-4">
                    {validPreviewList.map((url, i) => {
                      const isVid = isVideo(url);
                      return (
                        <div
                          key={i}
                          className="group relative aspect-square overflow-hidden bg-primary-50 border border-primary-100 hover:border-secondary-900 transition-all duration-500 cursor-pointer"
                          onClick={() => setSelectedMedia(url)}
                        >
                          {isVid ? (
                            <video
                              src={url}
                              className="h-full w-full object-cover"
                              controls={false}
                              muted
                              preload="metadata"
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                          ) : (
                            <img
                              src={url}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              alt={`Media ${i}`}
                              loading="lazy"
                              onError={() => handleImageError(url)}
                            />
                          )}

                          {isVid && (
                            <div className="absolute top-3 left-3 bg-secondary-900/80 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1.5 border border-white/10 z-10 pointer-events-none">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              <span className="text-[10px] font-black text-white uppercase tracking-wider">Video</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-secondary-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                            <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-500">
                              {isVid ? <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" /> : <Eye size={24} className="text-white" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}

