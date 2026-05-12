import React, { useState, useRef, useCallback } from "react";
import { ProductModel } from "../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CaretDown,
  Camera,
  Plus,
  X,
  DownloadSimple,
  CaretLeft,
  CaretRight,
  Tag,
  Eye,
  Copy,
  Check,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface JewelryTableProps {
  jewelries: ProductModel[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Hover popover hook – dùng delay để không tắt khi chuột di chuyển giữa
// trigger và popover (fix vấn đề "popover tắt trước khi kịp copy")
// ─────────────────────────────────────────────────────────────────────────────
function useHoverPopover(delay = 120) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onEnter = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  }, []);

  const onLeave = useCallback(() => {
    timer.current = setTimeout(() => setOpen(false), delay);
  }, [delay]);

  return { open, onEnter, onLeave };
}

function ProductCodes({ product, isExpanded }: { product: ProductModel, isExpanded: boolean }) {
  const { open, onEnter, onLeave } = useHoverPopover();

  const otherCodes = Array.from(
    new Set(
      [
        product.attributes?.erpCode,
        product.attributes?.code,
        product.attributes?.backupCode,
      ].filter(Boolean)
    )
  ).filter((c) => c !== product.attributes?.designCode);

  const hasOther = otherCodes.length > 0;

  return (
    // Wrapper: inline-block để không kéo dài full width cell
    <div className="relative inline-block" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {/* Badge luôn là element duy nhất trong flow – không có icon kề cạnh */}
      <Badge className="rounded-full bg-secondary-900 text-white px-2 py-0.5 text-[10px] font-black tracking-widest border-none shadow-sm uppercase whitespace-nowrap">
        {product.attributes?.designCode || "N/A"}
      </Badge>

      {/* Icon caret: absolute, nằm ngoài flow, không đẩy badge */}
      {hasOther && (
        <div
          className={cn(
            "absolute -right-5 top-1/2 -translate-y-1/2",
            "flex items-center justify-center w-4 h-4 rounded-full transition-all duration-200",

          )}
        >
          <CaretDown
            size={10}
            weight="bold"
            className={cn(
              "transition-all duration-200",
              isExpanded ?
                open ? "text-white rotate-180" : "text-white"
                : open ? "text-secondary-900 rotate-180" : "text-primary-400"
            )}
          />
        </div>
      )}

      {/* Popover – chung onMouseEnter/Leave với wrapper */}
      {hasOther && open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[80]">
          <div className="bg-white border border-primary-100 shadow-xl p-1.5 flex flex-col gap-1 min-w-[160px] items-center">
            {otherCodes.map((c, i) => (
              <Badge
                key={i}
                className="w-full justify-center bg-primary-50 text-secondary-900 px-3 py-1.5 text-[9px] font-bold tracking-widest whitespace-nowrap border border-primary-100 rounded-md"
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 2 – SideStoneTooltip
// Dùng useState + hover delay → giữ popover mở khi chuột di chuyển vào
// ─────────────────────────────────────────────────────────────────────────────
function SideStoneTooltip({
  fourView,
  isExpanded
}: {
  fourView: { round: string; diamondCount: string }[];
  isExpanded: boolean;
}) {
  const { open, onEnter, onLeave } = useHoverPopover();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const formatLySize = (round: string) => {
    const parts = round.split("x");
    const size = parseFloat(parts[0].trim());
    return isNaN(size) ? round : `${size} ly`;
  };

  const handleCopy = (e: React.MouseEvent, text: string, idx: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    });
  };

  const handleCopyAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = fourView
      .map((s) => `${formatLySize(s.round)}: ${s.diamondCount} viên`)
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    });
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Trigger chip */}
      <div className="flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md hover:bg-primary-50 transition-colors">
        <span
          className={cn(
            "text-[11px] font-semibold leading-none transition-colors",
            isExpanded ?
              open ? "text-secondary-900" : "text-white"
              : open ? "text-secondary-900" : "text-primary-400"
          )}
        >
          {fourView.length} loại
        </span>
        <CaretDown
          size={10}
          weight="bold"
          className={cn(
            "transition-all duration-200",
            isExpanded ?
              open ? "text-secondary-900 rotate-180" : "text-white"
              : open ? "text-secondary-900 rotate-180" : "text-primary-400"
          )}
        />
      </div>

      {/* Popover – shared hover area via parent wrapper */}
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[80]">
          <div className="bg-white border border-primary-100 shadow-xl overflow-hidden min-w-[140px]">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-secondary-900/5 border-b border-primary-100">
              <span className="text-[10px] font-black text-secondary-900 tracking-wider">
                Đá tấm
              </span>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1 text-[10px] font-bold text-primary-400 hover:text-secondary-900 transition-colors"
              >
                {copiedAll ? (
                  <Check size={11} className="text-emerald-500" />
                ) : (
                  <Copy size={11} />
                )}
                {copiedAll ? "Đã copy" : "Copy"}
              </button>
            </div>

            {/* Rows */}
            <div className="p-1.5 flex flex-col gap-0.5">
              {fourView.map((stone, idx) => {
                return (
                  <div
                    key={idx}
                    className="group/item flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <span className="text-[11px] font-semibold text-secondary-900 whitespace-nowrap">
                      {formatLySize(stone.round)}
                    </span>
                    <span className="text-[11px] text-primary-400 font-medium flex-1 text-right whitespace-nowrap">
                      {stone.diamondCount} viên
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SerialListModal – controlled open/close
// ─────────────────────────────────────────────────────────────────────────────
function SerialListModal({
  variants,
  sku,
  open,
  onClose,
}: {
  variants: any[];
  sku: string;
  open: boolean;
  onClose: () => void;
}) {
  const formatPolicy = (val?: string) => {
    if (!val) return null;
    if (val === "Không TM-TĐ") return "Không Thu mua - Thu đổi";
    const match = val.match(/^(\d+)%-(\d+)%$/);
    if (match) {
      return (
        <span className="flex items-center gap-1.5 justify-center">
          <span>
            Thu mua:{" "}
            <span className="font-bold text-secondary-900">{match[1]}%</span>
          </span>
          <span className="text-primary-200">|</span>
          <span>
            Thu đổi:{" "}
            <span className="font-bold text-secondary-900">{match[2]}%</span>
          </span>
        </span>
      );
    }
    return val;
  };

  const activeSerials = variants.filter((v) => (v.quantity || 0) > 0);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[800px] gap-0 bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden outline-none flex flex-col max-h-[75vh]">
        <DialogHeader className="px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 flex flex-row justify-between flex-shrink-0">
          <DialogTitle className="text-[16px] block font-bold tracking-tight text-secondary-900 uppercase">
            Danh sách Serials
          </DialogTitle>
          <DialogClose className="cursor-pointer">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto bg-white pb-3">
          <div className="flex items-center px-8 py-3 border-b border-gray-100 bg-gray-50/30">
            <span className="w-[120px] text-[10px] font-bold text-primary-300 uppercase tracking-wider">Serial</span>
            <span className="w-[180px] text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Vị trí kho</span>
            <span className="w-[110px] text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Trọng lượng</span>
            <span className="w-[110px] text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Viên chủ</span>
            <span className="flex-1 text-center text-[10px] font-bold text-primary-300 uppercase tracking-wider">Chính sách TM - TĐ</span>
          </div>
          <div className="divide-y divide-gray-50">
            {activeSerials.length > 0 ? (
              activeSerials.map((v, index) => (
                <div
                  key={v.id || index}
                  className="flex items-center px-8 py-4 hover:bg-primary-50/40 transition-all"
                >
                  <div className="w-[120px]">
                    <span className="text-[14px] font-bold text-secondary-900 tracking-tight leading-none">
                      {v.attributes?.serialNumber || "N/A"}
                    </span>
                  </div>
                  <div className="w-[180px] text-center">
                    <Badge className="rounded-full bg-secondary-900/5 text-secondary-900 border-none text-[10px] px-3 py-1 font-bold h-6 uppercase tracking-wider">
                      {v.stockAt || "Kho tổng"}
                    </Badge>
                  </div>
                  <div className="w-[110px] text-center">
                    <span className="text-xs font-semibold text-secondary-600 leading-none">
                      {v.attributes?.goldWeight ? `${v.attributes.goldWeight}g` : "--"}
                    </span>
                  </div>
                  <div className="w-[110px] text-center">
                    <span className="text-xs font-semibold text-secondary-600 leading-none">
                      {v.attributes?.storageSize1 && v.attributes?.storageSize2
                        ? `${v.attributes.storageSize1}-${v.attributes.storageSize2}`
                        : v.attributes?.storageSize1 || v.attributes?.storageSize2 || "--"}
                    </span>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-[11px] text-primary-400 font-medium">
                      {formatPolicy(v.policy)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Tag size={24} className="text-primary-200" />
                </div>
                <p className="text-[11px] text-primary-300 font-bold uppercase tracking-widest italic">
                  Không có dữ liệu
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main table
// ─────────────────────────────────────────────────────────────────────────────
export function JewelryTable({ jewelries }: JewelryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [serialModal, setSerialModal] = useState<{ variants: any[]; sku: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewList, setPreviewList] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageError = (url: string) =>
    setBrokenImages((prev) => new Set(prev).add(url));

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

  const handleDownloadSingle = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = (images: string[]) => {
    images.forEach((imageUrl) => {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = imageUrl.split("/").pop() || "image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const isVideo = (url: string) =>
    !!url.match(/\.(mp4|webm|ogg|mov)$|^blob:|^data:video/i);

  const renderCompactGallery = (images: string[], showUpload = false) => {
    const validImages = images.filter((url) => !brokenImages.has(url));
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
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                        <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img src={url} className="h-full w-full object-cover" alt="" onError={() => handleImageError(url)} />
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
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-200 hover:text-secondary-900 hover:bg-primary-50 rounded-full"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            <Plus size={12} weight="bold" />
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,video/*" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <Table className="bg-white rounded-none border border-primary-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        <TableHeader className="bg-primary-50">
          <TableRow className="border-primary-100 divide-x divide-primary-100 border-b">
            {["Mã sản phẩm", "Viên tấm", "Ảnh website", "Ảnh thực tế", "Trạng thái", ""].map((h, i) => (
              <TableHead
                key={i}
                className={cn(
                  "bg-primary-50 h-10 py-0 text-[10px] font-black text-secondary-900 px-2 text-center uppercase tracking-[0.2em] border-primary-100",
                  i === 5 && "w-12"
                )}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {jewelries.map((product) => {
            const isExpanded = expandedId === product.id;
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
            const displayCode = product.attributes?.designCode || product.id || "N/A";

            return (
              <React.Fragment key={product.id}>
                {/* ── Main row ── */}
                <TableRow
                  className={cn(
                    "divide-x transition-all cursor-pointer group h-14 relative",
                    isExpanded
                      ? "bg-secondary-700 divide-secondary-700 hover:bg-secondary-700 border-b border-secondary-700"
                      : "border-primary-50 hover:bg-primary-50 divide-primary-200"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : product.id)}
                >
                  {/* Mã sản phẩm – FIX 1: badge căn giữa độc lập, icon absolute */}
                  <TableCell className="px-3 py-2 text-center">
                    {/* pr-6 để dành chỗ cho icon absolute không bị clip */}
                    <div className="flex justify-center">
                      <ProductCodes product={product} isExpanded={isExpanded} />
                    </div>
                  </TableCell>

                  {/* Viên tấm */}
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
                    <div className="flex justify-center">{renderCompactGallery(webImages, false)}</div>
                  </TableCell>

                  <TableCell className="px-2 py-2">
                    <div className="flex justify-center">{renderCompactGallery(actualImages, true)}</div>
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

                {/* ── FIX 3: Expanded panel – card style ── */}
                {isExpanded && (
                  <TableRow className="hover:bg-transparent border-none">
                    <TableCell colSpan={6} className="p-0 bg-primary-50">
                      {/* Container that completes the "Card" shape */}
                      <div className="px-0 border-t border-x-2 border-b-2 border-secondary-700 animate-in fade-in slide-in-from-top-1 duration-200">
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

                                  {/* Thuộc tính */}
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

                                  {/* Tồn kho */}
                                  <div className="px-4 py-3.5 flex justify-center">
                                    <Badge className="rounded-full bg-secondary-900 text-white text-[11px] font-black px-3 py-1 shadow-sm">
                                      Tồn: {isEarring ? Math.floor(group.totalQuantity / 2) : group.totalQuantity}
                                    </Badge>
                                  </div>

                                  {/* Giá bán */}
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

                                  {/* Serial */}
                                  <div
                                    className="px-4 py-3.5 flex justify-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-[10px] font-bold h-7 px-3 border-secondary-900/20 text-secondary-900 hover:bg-secondary-900 hover:text-white transition-colors rounded-none"
                                      onClick={() => setSerialModal({ variants: group.variants, sku })}
                                    >
                                      Xem Serials
                                    </Button>
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

      {/* Serial modal */}
      {serialModal && (
        <SerialListModal
          variants={serialModal.variants}
          sku={serialModal.sku}
          open={!!serialModal}
          onClose={() => setSerialModal(null)}
        />
      )}

      {/* Image / Video preview dialog */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && closeMediaDialog()}>
        <DialogContent className="sm:max-w-[1200px]! w-full max-h-[90vh] bg-white rounded-3xl border-none p-0 overflow-hidden shadow-2xl flex flex-col outline-none">
          {(() => {
            const validPreviewList = previewList.filter((url) => !brokenImages.has(url));

            if (selectedMedia) {
              const isVid = isVideo(selectedMedia);
              const currentIndex = validPreviewList.indexOf(selectedMedia);
              const handleNext = (e: React.MouseEvent) => { e.stopPropagation(); setSelectedMedia(validPreviewList[(currentIndex + 1) % validPreviewList.length]); };
              const handlePrev = (e: React.MouseEvent) => { e.stopPropagation(); setSelectedMedia(validPreviewList[(currentIndex - 1 + validPreviewList.length) % validPreviewList.length]); };

              return (
                <div className="flex flex-col h-full bg-secondary-900">
                  <div className="flex items-center justify-between px-8 py-4 bg-secondary-900/50 backdrop-blur-md sticky top-0 z-50">
                    <Button variant="ghost" className="text-white hover:bg-white/10 font-bold" onClick={() => setSelectedMedia(null)}>
                      <CaretLeft size={20} className="mr-2" />
                      Quay lại thư viện
                    </Button>
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 text-[11px] font-bold tracking-widest">{currentIndex + 1} / {validPreviewList.length}</span>
                      <Button variant="secondary" size="sm" onClick={() => handleDownloadSingle(selectedMedia)} className="bg-white/10 hover:bg-white/20 text-white border-none rounded-xl">
                        <DownloadSimple size={18} className="mr-2" />Tải về
                      </Button>
                      <Button variant="ghost" size="icon" onClick={closeMediaDialog} className="text-white hover:bg-white/10 rounded-xl">
                        <X size={20} />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 relative flex items-center justify-center p-4 sm:p-12 bg-white overflow-hidden group/viewer">
                    {validPreviewList.length > 1 && (
                      <>
                        <Button variant="ghost" size="icon" className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-black/10 hover:bg-black/20 text-secondary-900 rounded-full opacity-0 group-hover/viewer:opacity-100 transition-opacity z-30" onClick={handlePrev}>
                          <CaretLeft size={32} weight="bold" />
                        </Button>
                        <Button variant="ghost" size="icon" className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-black/10 hover:bg-black/20 text-secondary-900 rounded-full opacity-0 group-hover/viewer:opacity-100 transition-opacity z-30" onClick={handleNext}>
                          <CaretRight size={32} weight="bold" />
                        </Button>
                      </>
                    )}
                    {isVid ? (
                      <video key={selectedMedia} src={selectedMedia} controls autoPlay className="max-w-full max-h-full object-contain rounded-xl" />
                    ) : (
                      <img key={selectedMedia} src={selectedMedia} className="max-w-full max-h-full object-contain rounded-xl animate-in zoom-in-95 duration-500" alt="Preview" />
                    )}
                  </div>
                </div>
              );
            }

            return (
              <>
                <div className="flex items-center justify-between px-8 py-6 border-b border-primary-50 bg-white sticky top-0 z-20">
                  <div>
                    <h3 className="text-lg font-black text-secondary-900 uppercase tracking-tight">Thư viện hình ảnh/video</h3>
                    <p className="text-xs text-primary-300 font-bold">Tổng cộng {validPreviewList.length} tệp tin</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-10 px-4 border-primary-100 font-bold text-xs uppercase tracking-widest hover:bg-secondary-900 hover:text-white transition-all" onClick={() => handleDownloadAll(validPreviewList)}>
                      <DownloadSimple size={16} className="mr-2" />Tải về tất cả
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 bg-primary-50 text-secondary-900 rounded-full hover:bg-red-50 hover:text-red-500" onClick={closeMediaDialog}>
                      <X size={20} />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                  <div className="grid grid-cols-3 gap-4">
                    {validPreviewList.map((url, i) => {
                      const isVid = isVideo(url);
                      return (
                        <div key={i} className="group relative aspect-square overflow-hidden bg-primary-50 border border-primary-100 hover:border-secondary-900 transition-all duration-500 cursor-pointer" onClick={() => setSelectedMedia(url)}>
                          {isVid ? (
                            <video src={url} className="h-full w-full object-cover" controls={false} muted preload="metadata"
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                          ) : (
                            <img src={url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Media ${i}`} loading="lazy" onError={() => handleImageError(url)} />
                          )}
                          {isVid && (
                            <div className="absolute top-3 left-3 bg-secondary-900/80 px-2 py-1 rounded-full flex items-center gap-1.5 z-10 pointer-events-none">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              <span className="text-[10px] font-black text-white uppercase tracking-wider">Video</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-secondary-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-500">
                              {isVid ? (
                                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                              ) : (
                                <Eye size={24} className="text-white" />
                              )}
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