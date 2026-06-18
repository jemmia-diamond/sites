import React from "react";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, ImageSquare, Sparkle, X } from "@phosphor-icons/react";
import { ProductModel } from "../../../../types";
import { MobileProgressBar } from "./MobileProgressBar";
import { RingSkeleton } from "./RingSkeleton";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { formatPrice } from "../../JewelryTable/utils/formatters";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

const extractUrls = (arr: any): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map((item: any) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && typeof item.url === 'string') return item.url;
    return null;
  }).filter(Boolean) as string[];
};

interface MobileStep3Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoadingRings: boolean;
  isLoadingMore: boolean;
  rings: ProductModel[];
  selectedRing: ProductModel | null;
  handleSelectRing: (ring: ProductModel) => void;
  mobileSentinelRef: React.RefObject<HTMLDivElement>;
  setToastMessage: (msg: string | null) => void;
  handleTryOn: () => void;
  isTryingOn?: boolean;
  setStep?: (s: number) => void;
  maxStep?: number;
}

export function MobileStep3({
  searchQuery,
  setSearchQuery,
  isLoadingRings,
  isLoadingMore,
  rings,
  selectedRing,
  handleSelectRing,
  mobileSentinelRef,
  setToastMessage,
  handleTryOn,
  isTryingOn,
  setStep,
  maxStep,
}: MobileStep3Props) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = React.useState(!!selectedRing);
  const [activeTab, setActiveTab] = React.useState<'try_on' | 'website' | 'actual'>('try_on');
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(null);

  // Auto-detect and set active tab when selectedRing changes
  React.useEffect(() => {
    if (selectedRing) {
      setActiveTab('try_on');
    }
  }, [selectedRing]);

  // Set previewImage to always be the first try-on image when selectedRing changes
  React.useEffect(() => {
    if (selectedRing) {
      const websiteUrls = extractUrls(selectedRing.thumbnails);

      // Always show the first try-on image; fall back to website or actual if not available
      const defaultImage = websiteUrls[0] || null
      setPreviewImage(defaultImage);
    } else {
      setPreviewImage(null);
    }
  }, [selectedRing]);

  // Helper to detect video URLs
  const isVideoUrl = (url: string) => {
    return /\.(mp4|webm|ogg|mov)(?:\?|$)/i.test(url);
  };

  // Construct attribute description string
  const attributesList: string[] = [];
  if (selectedRing?.attributes?.fineness) {
    attributesList.push(selectedRing.attributes.fineness);
  }
  if (selectedRing?.attributes?.materialColor) {
    attributesList.push(selectedRing.attributes.materialColor);
  }
  if (selectedRing?.attributes?.ringSize && selectedRing.attributes.ringSize !== 0) {
    attributesList.push(`Ni ${selectedRing.attributes.ringSize}`);
  }
  const erpCode = selectedRing?.attributes?.erpCode || selectedRing?.attributes?.code;
  if (erpCode) {
    attributesList.push(erpCode);
  }
  const attributesString = attributesList.join(" - ");

  // Extract all media categories
  const tryOnUrls = selectedRing
    ? [
        ...extractUrls(selectedRing.try_on_images),
        ...extractUrls(selectedRing.attributes?.try_on_images),
      ]
    : [];
  const websiteUrls = selectedRing ? extractUrls(selectedRing.thumbnails) : [];
  const actualUrls = selectedRing ? [
    ...extractUrls(selectedRing.images),
    ...extractUrls(selectedRing.videos)
  ] : [];

  const activeImages =
    activeTab === 'try_on'
      ? tryOnUrls
      : activeTab === 'website'
      ? websiteUrls
      : actualUrls;

  const tabs = [
    { id: 'try_on' as const, label: 'Ảnh thử nhẫn' },
    { id: 'website' as const, label: 'Ảnh website' },
    { id: 'actual' as const, label: 'Ảnh/video thực tế' },
  ];

  return (
    <div className="grow flex flex-col justify-between gap-4 min-h-0 overflow-hidden">
      {/* Progress Bar & Info */}
      <div className="space-y-3">
        <MobileProgressBar activeCount={3} onStepClick={setStep} maxStep={maxStep} />
        <div className="space-y-1 text-start">
          <h4 className="text-primary-900 font-bold text-base tracking-tight leading-tight">
            Chọn trang sức của bạn
          </h4>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative shrink-0">
        <input
          type="text"
          placeholder="Tìm theo mã sản phẩm, SKU, tên sản phẩm ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 text-xs font-semibold pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-full focus:outline-none focus:border-[#004B49] placeholder-[#7A869A]"
        />
        <MagnifyingGlass
          size={16}
          className="absolute right-4 top-3 text-[#7A869A]"
        />
      </div>

      {/* Catalog list area */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {isLoadingRings ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <RingSkeleton key={i} />
            ))}
          </div>
        ) : rings.length === 0 ? (
          <div className="h-full flex items-center justify-center text-primary-400 text-xs font-semibold">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {rings.map((ring) => {
              const isSelected = selectedRing?.id === ring.id;
              return (
                <div
                  key={ring.id}
                  onClick={() => {
                    handleSelectRing(ring);
                    setIsBottomSheetOpen(true);
                  }}
                  className={`bg-white border flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-300 hover:shadow-md ${
                    isSelected
                      ? "border-secondary-800"
                      : "border-primary-100 hover:border-primary-300"
                  }`}
                >
                  {ring.thumbnails?.[0]?.url ? (
                    <img
                      src={ring.thumbnails?.[0]?.url}
                      className="w-full aspect-square object-cover"
                      alt={ring.title}
                    />
                  ) : (
                    <div className="w-full aspect-square flex flex-col items-center justify-center bg-slate-100 text-[9px] font-bold text-slate-400 gap-1 select-none">
                      <ImageSquare size={20} className="text-slate-400" />
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="w-full p-1 text-start">
                    <p className="text-xs text-primary-600 truncate">
                      {ring.type || "Loại nhẫn"}
                    </p>
                    <p className="text-xs text-primary-900 truncate leading-snug mt-0.5">
                      {ring.attributes?.designCode || "--"}
                    </p>
                  </div>
                </div>
              );
            })}
            {/* Scroll Sentinel */}
            <div
              ref={mobileSentinelRef}
              className="col-span-3 h-10 flex items-center justify-center"
            >
              {isLoadingMore && (
                <div className="grid grid-cols-3 gap-2 w-full mt-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <RingSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet Detail View */}
      <BottomSheet
        open={isBottomSheetOpen}
        onOpenChange={setIsBottomSheetOpen}
        title="Trang sức được lựa chọn"
        contentClassName="overflow-y-hidden pt-0"
      >
        {selectedRing && (
          <div className="flex flex-col text-start justify-between h-full max-h-[75vh] overflow-hidden">
            {/* Top Content Area: Image, Text, Tabs, Gallery */}
            <div className="flex flex-col min-h-0">
              {/* Large Preview Image */}
              <div
                onClick={() => previewImage && setFullscreenImage(previewImage)}
                className="w-full flex justify-center items-center py-2 bg-white select-none shrink-0 cursor-pointer"
              >
                {previewImage ? (
                  isVideoUrl(previewImage) ? (
                    <div className="relative h-36 aspect-square w-auto">
                      <video src={previewImage} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-secondary-900 border-b-[4px] border-b-transparent ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={previewImage}
                      className="h-60 object-contain w-auto aspect-square"
                      alt={selectedRing.title}
                    />
                  )
                ) : (
                  <div className="w-full h-60 aspect-square flex flex-col items-center justify-center bg-slate-100 text-xs text-slate-400 gap-2">
                    <ImageSquare size={32} className="text-slate-400" />
                    <span>Chưa có hình ảnh</span>
                  </div>
                )}
              </div>

              {/* Header Product Metadata */}
              <div className="shrink-0 mt-1">
                <h3 className="text-secondary-900 text-center font-bold text-sm leading-tight">
                  {selectedRing.type || "Loại nhẫn"} - {selectedRing.attributes?.designCode || "--"}
                </h3>
              </div>

              {/* Media Gallery Tab Bar */}
              <div className="flex border-b border-primary-100 mt-2.5 shrink-0">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex-1 text-center pb-1.5 text-xs font-medium border-b-2 transition-all duration-200 cursor-pointer",
                        isActive
                          ? "text-secondary-800 border-secondary-800"
                          : "text-[#7A869A] border-transparent hover:text-secondary-800/80"
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Horizontal Scroll Gallery */}
              <div className="flex gap-1.5 overflow-x-auto py-2.5 no-scrollbar scroll-smooth shrink-0">
                {activeImages.map((url, idx) => {
                  const isVideo = isVideoUrl(url);
                  return (
                    <div
                      key={idx}
                      onClick={() => setFullscreenImage(url)}
                      className="w-[62px] h-[62px] min-w-[62px] min-h-[62px] border border-slate-200 hover:border-slate-300 cursor-pointer overflow-hidden transition-all duration-200 relative"
                    >
                      <img
                        src={url}
                        className="w-full h-full object-cover"
                        alt={`Thumbnail ${idx}`}
                      />
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-5 h-5 rounded-full bg-white/80 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-secondary-900 border-b-[3px] border-b-transparent ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {activeImages.length === 0 && (
                  <div className="w-full h-15.5 flex items-center justify-center text-center py-2 text-xs text-slate-400">
                    Không có hình ảnh nào
                  </div>
                )}
              </div>
            </div>

            {/* Try On Button inside Bottom Sheet */}
            <div className="mt-2 shrink-0">
              <Button
                disabled={isTryingOn}
                onClick={() => {
                  handleTryOn();
                }}
                className="w-full bg-secondary-800 hover:bg-secondary-700 text-white font-semibold text-sm h-12 flex items-center justify-center gap-2 rounded-none cursor-pointer border-none shadow-none"
              >
                {isTryingOn ? "Đang xử lý" : "Thử Nhẫn"}
                <Sparkle size={16} />
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Fullscreen Image/Video Overlay Viewer */}
      {fullscreenImage && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 cursor-pointer bg-white/10 rounded-full transition-colors z-[10000]"
          >
            <X size={24} />
          </button>

          {/* Media Content */}
          <div className="max-w-[95%] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {isVideoUrl(fullscreenImage) ? (
              <video
                src={fullscreenImage}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <img
                src={fullscreenImage}
                className="max-w-full max-h-[90vh] object-contain select-none"
                alt="Fullscreen preview"
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

interface DesktopStep3LeftProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoadingRings: boolean;
  isLoadingMore: boolean;
  rings: ProductModel[];
  selectedRing: ProductModel | null;
  handleSelectRing: (ring: ProductModel) => void;
  desktopSentinelRef: React.RefObject<HTMLDivElement>;
}

export function DesktopStep3Left({
  searchQuery,
  setSearchQuery,
  isLoadingRings,
  isLoadingMore,
  rings,
  selectedRing,
  handleSelectRing,
  desktopSentinelRef,
}: DesktopStep3LeftProps) {
  return (
    <div className="grow flex flex-col min-h-0 gap-3">
      <div>
        <p className="text-primary-900 font-bold text-base tracking-tight leading-tight">
          Chọn trang sức của bạn
        </p>
      </div>
      <div className="relative shrink-0 w-[400px] max-w-full">
        <input
          type="text"
          placeholder="Tìm theo mã sản phẩm, SKU, tên sản phẩm ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 text-xs font-semibold pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-full focus:outline-none focus:border-[#004B49] placeholder-[#7A869A]"
        />
        <MagnifyingGlass
          size={16}
          className="absolute right-4 top-3.5 text-primary-400"
        />
      </div>

      {/* Catalog list inside left panel */}
      <div className="flex-1 h-[200px] md:h-[260px] overflow-y-auto pr-1">
        {isLoadingRings ? (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <RingSkeleton key={i} />
            ))}
          </div>
        ) : rings.length === 0 ? (
          <div className="h-full flex items-center justify-center text-primary-400 text-xs font-semibold">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-0.5">
            {rings.map((ring) => {
              const isSelected = selectedRing?.id === ring.id;
              return (
                <div
                  key={ring.id}
                  onClick={() => handleSelectRing(ring)}
                  className={`bg-white border flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "border-secondary-800"
                      : "border-[#E0E0E0] hover:border-primary-300"
                  }`}
                >
                  {ring.thumbnails?.[0]?.url ? (
                    <img
                      src={ring.thumbnails?.[0]?.url}
                      className="w-full aspect-square object-cover"
                      alt={ring.title}
                    />
                  ) : (
                    <div className="w-full aspect-square flex flex-col items-center justify-center bg-slate-100 text-[9px] font-bold text-slate-400 gap-1 select-none">
                      <ImageSquare size={20} className="text-slate-400" />
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="w-full p-2 text-start">
                    <p className="text-xs text-primary-600 truncate">
                      {ring.type || "Loại nhẫn"}
                    </p>
                    <p className="text-xs text-primary-900 truncate leading-snug mt-0.5">
                      {ring.attributes?.designCode || "--"}
                    </p>
                  </div>
                </div>
              );
            })}
            {/* Scroll Sentinel */}
            <div
              ref={desktopSentinelRef}
              className="col-span-3 md:col-span-5 h-10 flex items-center justify-center"
            >
              {isLoadingMore && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 w-full mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <RingSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface DesktopStep3RightProps {
  selectedRing: ProductModel | null;
  handleTryOn: () => void;
  isTryingOn?: boolean;
}

export function DesktopStep3Right({
  selectedRing,
  handleTryOn,
  isTryingOn = false,
}: DesktopStep3RightProps) {
  const [activeTab, setActiveTab] = React.useState<'try_on' | 'website' | 'actual'>('try_on');
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(null);

  // Auto-detect and set active tab when selectedRing changes
  React.useEffect(() => {
    if (selectedRing) {
      setActiveTab('try_on');
    }
  }, [selectedRing]);

  // Set previewImage to always be the first website image when selectedRing changes
  // Set previewImage to always be the first try-on image when selectedRing changes
  React.useEffect(() => {
    if (selectedRing) {
      const websiteUrls = extractUrls(selectedRing.thumbnails);
      const tryOnUrls = [
        ...extractUrls(selectedRing.try_on_images),
        ...extractUrls(selectedRing.attributes?.try_on_images),
      ];
      const actualUrls = [
        ...extractUrls(selectedRing.images),
        ...extractUrls(selectedRing.videos),
      ];

      // Always show first try-on image; fallback to website or actual if not available
      const defaultImage = websiteUrls[0] || null;
      setPreviewImage(defaultImage);
    } else {
      setPreviewImage(null);
    }
  }, [selectedRing]);

  // Helper to detect video URLs
  const isVideoUrl = (url: string) => {
    return /\.(mp4|webm|ogg|mov)(?:\?|$)/i.test(url);
  };

  // Construct attribute description string
  const attributesList: string[] = [];
  if (selectedRing?.attributes?.fineness) {
    attributesList.push(selectedRing.attributes.fineness);
  }
  if (selectedRing?.attributes?.materialColor) {
    attributesList.push(selectedRing.attributes.materialColor);
  }
  if (selectedRing?.attributes?.ringSize && selectedRing.attributes.ringSize !== 0) {
    attributesList.push(`Ni ${selectedRing.attributes.ringSize}`);
  }
  const erpCode = selectedRing?.attributes?.erpCode || selectedRing?.attributes?.code;
  if (erpCode) {
    attributesList.push(erpCode);
  }
  const attributesString = attributesList.join(" - ");

  // Extract all media categories
  const tryOnUrls = selectedRing
    ? [
        ...extractUrls(selectedRing.try_on_images),
        ...extractUrls(selectedRing.attributes?.try_on_images),
      ]
    : [];
  const websiteUrls = selectedRing ? extractUrls(selectedRing.thumbnails) : [];
  const actualUrls = selectedRing ? [
    ...extractUrls(selectedRing.images),
    ...extractUrls(selectedRing.videos)
  ] : [];

  const activeImages =
    activeTab === 'try_on'
      ? tryOnUrls
      : activeTab === 'website'
      ? websiteUrls
      : actualUrls;

  const tabs = [
    { id: 'try_on' as const, label: 'Ảnh Thử Nhẫn' },
    { id: 'website' as const, label: 'Ảnh website' },
    { id: 'actual' as const, label: 'Ảnh/video thực tế' },
  ];

  return (
    <div className="grow h-full flex flex-col justify-between items-center min-w-0 overflow-y-auto">
      <div className="w-full flex flex-col justify-between grow pl-0 py-6 pr-6">
        <div className="border border-primary-100 rounded p-4 bg-white flex flex-col">
          {/* Title */}
          <h3 className="text-primary-900 font-bold text-base select-none border-b border-primary-50 pb-2">
            Trang sức được lựa chọn
          </h3>

          {/* Selected product detail content */}
          {selectedRing ? (
            <div className="flex flex-col text-start mt-3">
              {/* Large Preview Image */}
              <div
                onClick={() => previewImage && setFullscreenImage(previewImage)}
                className="w-full flex justify-center items-center py-4 bg-white select-none cursor-pointer border border-primary-50 hover:opacity-95"
              >
                {previewImage ? (
                  isVideoUrl(previewImage) ? (
                    <div className="relative h-64 aspect-square w-auto">
                      <video src={previewImage} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[12px] border-l-secondary-900 border-b-[6px] border-b-transparent ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={previewImage}
                      className="h-64 object-contain aspect-square w-auto"
                      alt={selectedRing.title}
                    />
                  )
                ) : (
                  <div className="w-full h-64 flex flex-col items-center justify-center bg-slate-100 text-xs text-slate-400 gap-2">
                    <ImageSquare size={48} className="text-slate-400" />
                    <span>Chưa có hình ảnh</span>
                  </div>
                )}
              </div>

              {/* Header Product Metadata */}
              <div className="mt-3">
                <h3 className="text-secondary-900 font-bold text-base leading-tight text-center">
                  {selectedRing.type || "Loại nhẫn"} - {selectedRing.attributes?.designCode || "--"}
                </h3>
              </div>

              {/* Media Gallery Tab Bar */}
              <div className="flex border-b border-primary-100 mt-4">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex-1 text-center pb-2 text-xs font-bold border-b-2 transition-all duration-200 cursor-pointer",
                        isActive
                          ? "text-[#004B49] border-[#004B49]"
                          : "text-[#7A869A] border-transparent hover:text-[#004B49]/80"
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Horizontal Scroll Gallery */}
              <div className="flex gap-2 overflow-x-auto pt-3 no-scrollbar scroll-smooth">
                {activeImages.map((url, idx) => {
                  const isVideo = isVideoUrl(url);
                  return (
                    <div
                      key={idx}
                      onClick={() => setFullscreenImage(url)}
                      className="w-[62px] h-[62px] min-w-[62px] min-h-[62px] border border-slate-200 hover:border-slate-300 cursor-pointer overflow-hidden transition-all duration-200 relative"
                    >
                      <img
                        src={url}
                        className="w-full h-full object-cover"
                        alt={`Thumbnail ${idx}`}
                      />
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-secondary-900 border-b-[4px] border-b-transparent ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {activeImages.length === 0 && (
                  <div className="w-full text-center py-4 text-xs text-slate-400 italic">
                    Không có hình ảnh nào
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-4 text-[#004B49]">
                <Sparkle size={32} />
              </div>
              <p className="text-sm font-semibold text-primary-500">
                Vui lòng chọn một trang sức để xem chi tiết và bắt đầu thử nghiệm.
              </p>
            </div>
          )}
        </div>

        {/* Try On Button */}
        <Button
          onClick={handleTryOn}
          disabled={!selectedRing || isTryingOn}
          className="w-full bg-secondary-800 hover:bg-secondary-700 text-white font-semibold text-sm h-12 flex items-center justify-center gap-2 rounded-none cursor-pointer border-none shadow-none"
        >
          Thử Nhẫn
          <Sparkle size={16} />
        </Button>
      </div>

      {/* Fullscreen Image/Video Overlay Viewer */}
      {fullscreenImage && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 cursor-pointer bg-white/10 rounded-full transition-colors z-[10000]"
          >
            <X size={24} />
          </button>

          {/* Media Content */}
          <div className="max-w-[95%] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {isVideoUrl(fullscreenImage) ? (
              <video
                src={fullscreenImage}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <img
                src={fullscreenImage}
                className="max-w-full max-h-[90vh] object-contain select-none"
                alt="Fullscreen preview"
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
