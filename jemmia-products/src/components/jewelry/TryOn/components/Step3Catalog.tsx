import React, { use } from "react";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, ImageSquare, Sparkle, X, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { MobileProgressBar } from "./MobileProgressBar";
import { RingSkeleton } from "./RingSkeleton";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { TryOnContext } from "../context/TryOnContext";
import { isVideo } from "@/lib/media";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const extractUrls = (arr: any): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map((item: any) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && typeof item.url === 'string') return item.url;
    return null;
  }).filter(Boolean) as string[];
};

const getRingUrls = (
  selectedRing: any,
  tab: "try_on" | "website" | "actual",
): string[] => {
  if (!selectedRing) return [];
  const isBundle = selectedRing.products && selectedRing.products.length > 0;

  if (tab === "try_on") {
    return [
      ...extractUrls(selectedRing.try_on_images),
      ...extractUrls(selectedRing.attributes?.try_on_images),
      ...(isBundle
        ? selectedRing.products.flatMap((p: any) => [
          ...extractUrls(p.try_on_images),
          ...extractUrls(p.attributes?.try_on_images),
        ])
        : []),
    ];
  }

  if (tab === "website") {
    return isBundle
      ? selectedRing.products.flatMap((p: any) => extractUrls(p.thumbnails))
      : extractUrls(selectedRing.thumbnails);
  }

  // actual
  return isBundle
    ? selectedRing.products.flatMap((p: any) => [
      ...extractUrls(p.images),
      ...extractUrls(p.videos),
    ])
    : [
      ...extractUrls(selectedRing.images),
      ...extractUrls(selectedRing.videos),
    ];
};

interface FullscreenGalleryProps {
  mediaList: string[];
  currentUrl: string;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function FullscreenGallery({
  mediaList,
  currentUrl,
  onClose,
  onSelect,
}: FullscreenGalleryProps) {
  const currentIndex = mediaList.indexOf(currentUrl);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaList.length <= 1) return;
    const newIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
    onSelect(mediaList[newIndex]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaList.length <= 1) return;
    const newIndex = (currentIndex + 1) % mediaList.length;
    onSelect(mediaList[newIndex]);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        if (mediaList.length <= 1) return;
        const newIndex =
          (currentIndex - 1 + mediaList.length) % mediaList.length;
        onSelect(mediaList[newIndex]);
      } else if (e.key === "ArrowRight") {
        if (mediaList.length <= 1) return;
        const newIndex = (currentIndex + 1) % mediaList.length;
        onSelect(mediaList[newIndex]);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, mediaList, onSelect, onClose]);

  if (!currentUrl) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/30 backdrop-blur-md flex flex-col justify-between select-none"
      onClick={onClose}
    >
      {/* Top Bar: Close Button */}
      <div className="flex justify-end p-4 md:p-6 shrink-0">
        <Button
          onClick={onClose}
          className="text-white hover:text-secondary-700 p-2 md:p-3 cursor-pointer! bg-white/10 hover:bg-white rounded-full transition-all duration-200 z-[10000] border border-white/10 shadow-lg flex items-center justify-center"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" weight="bold" />
        </Button>
      </div>

      {/* Main Preview Area with Next/Prev Arrows */}
      <div className="flex-1 flex items-center justify-between px-3 md:px-6 min-h-0 relative">
        {/* Prev Arrow */}
        {mediaList.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-3 md:left-6 z-10 text-white hover:text-[#004B49] bg-white/10 hover:bg-white p-2 md:p-4 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center w-10 h-10 md:w-14 md:h-14 border border-white/10 shadow-xl"
          >
            <CaretLeft className="w-5 h-5 md:w-8 md:h-8" weight="bold" />
          </button>
        )}

        {/* Media Content */}
        <div
          className="mx-auto max-w-[85%] max-h-[50vh] md:max-h-[70vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {isVideo(currentUrl) ? (
            <video
              src={currentUrl}
              controls
              autoPlay
              className="max-w-full bg-white max-h-[50vh] md:max-h-[70vh] object-contain"
            />
          ) : (
            <img
              src={currentUrl}
              className="max-w-full bg-white max-h-[50vh] md:max-h-[70vh] object-contain"
              alt="Fullscreen preview"
            />
          )}
        </div>

        {/* Next Arrow */}
        {mediaList.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-3 md:right-6 z-10 text-white hover:text-[#004B49] bg-white/10 hover:bg-white p-2 md:p-4 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center w-10 h-10 md:w-14 md:h-14 border border-white/10 shadow-xl"
          >
            <CaretRight className="w-5 h-5 md:w-8 md:h-8" weight="bold" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails List */}
      <div
        className="w-full py-4 md:py-6 bg-slate-950/45 backdrop-blur-sm flex justify-center overflow-x-auto gap-2 px-4 no-scrollbar shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {mediaList.map((url, idx) => {
          const isVid = isVideo(url);
          const isSelected = url === currentUrl;
          return (
            <div
              key={idx}
              onClick={() => onSelect(url)}
              className={cn(
                "w-12 h-12 md:w-20 md:h-20 min-w-12 min-h-12 md:min-w-20 md:min-h-20 border-2 cursor-pointer overflow-hidden transition-all duration-200 relative rounded-sm",
                isSelected
                  ? "border-[#004B49] scale-105"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              {isVid ? (
                <div className="relative w-full h-full bg-slate-950">
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-3.5 h-3.5 md:w-5 md:h-5 rounded-full bg-white/80 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[2px] md:border-t-[3px] border-t-transparent border-l-[4px] md:border-l-[6px] border-l-secondary-900 border-b-[2px] md:border-b-[3px] border-b-transparent ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={url}
                  className="w-full h-full object-cover bg-slate-50"
                  alt={`Thumbnail ${idx}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}

export function MobileStep3() {
  const context = use(TryOnContext);
  const selectedRing = context?.state.selectedRing;

  const [isBottomSheetOpen, setIsBottomSheetOpen] = React.useState(!!selectedRing);
  const [activeTab, setActiveTab] = React.useState<'try_on' | 'website' | 'actual'>('try_on');
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(null);

  // Auto-detect and set active tab / default preview image when selectedRing changes
  React.useEffect(() => {
    if (selectedRing) {
      setActiveTab("try_on");
      const websiteUrls = getRingUrls(selectedRing, "website");
      setPreviewImage(websiteUrls[0] || null);
    } else {
      setPreviewImage(null);
    }
  }, [selectedRing]);

  const handleTabChange = (tabId: "try_on" | "website" | "actual") => {
    setActiveTab(tabId);
  };

  if (!context) return null;
  const {
    state: {
      searchQuery,
      selectedType,
      isLoadingRings,
      isLoadingMore,
      rings,
      isTryingOn,
      maxStep,
    },
    actions: { setSearchQuery, setSelectedType, handleSelectRing, handleTryOn, setStep },
    meta: { mobileSentinelRef },
  } = context;

  // Extract all media categories
  const tryOnUrls = getRingUrls(selectedRing, "try_on");
  const websiteUrls = getRingUrls(selectedRing, "website");
  const actualUrls = getRingUrls(selectedRing, "actual");

  const activeImages =
    activeTab === "try_on"
      ? tryOnUrls
      : activeTab === "website"
        ? websiteUrls
        : actualUrls;

  const tabs = [
    { id: "try_on" as const, label: "Ảnh thử nhẫn" },
    { id: "website" as const, label: "Ảnh website" },
    { id: "actual" as const, label: "Ảnh/video thực tế" },
  ];

  return (
    <div className="grow flex flex-col justify-between gap-4 min-h-0 overflow-hidden">
      {/* Progress Bar & Info */}
      <div className="space-y-3">
        <MobileProgressBar
          activeCount={3}
          onStepClick={setStep}
          maxStep={maxStep}
        />
        <div className="space-y-1 text-start">
          <h4 className="text-primary-900 font-bold text-base tracking-tight leading-tight">
            Chọn trang sức của bạn
          </h4>
        </div>
      </div>

      {/* Filters and Search Container */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Nhập mã để bắt đầu tìm kiếm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 text-xs font-semibold pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-full focus:outline-none focus:border-[#004B49] placeholder-[#7A869A]"
          />
          <MagnifyingGlass
            size={16}
            className="absolute right-4 top-3 text-[#7A869A]"
          />
        </div>
        <div className="relative w-full">
          <Select value={selectedType} onValueChange={(val) => { if (val) setSelectedType(val); }}>
            <SelectTrigger className="w-full h-10 text-xs font-semibold px-4 bg-white border border-slate-200 rounded-full focus:outline-none focus:border-[#004B49] text-[#004B49] justify-between">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-md border border-slate-200 shadow-lg text-secondary-900">
              <SelectGroup>
                <SelectItem value="Nhẫn Nữ" className="text-xs font-medium">Nhẫn Nữ</SelectItem>
                <SelectItem value="Nhẫn Nam" className="text-xs font-medium">Nhẫn Nam</SelectItem>
                <SelectItem value="Nhẫn Nữ Nguyên Chiếc" className="text-xs font-medium">Nhẫn Nữ Nguyên Chiếc</SelectItem>
                <SelectItem value="Nhẫn Nam Nguyên Chiếc" className="text-xs font-medium">Nhẫn Nam Nguyên Chiếc</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
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
                  className={`bg-white border flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-300 hover:shadow-md ${isSelected
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
            {/* Skeletons rendered directly in the grid */}
            {isLoadingMore && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <RingSkeleton key={`mobile-skeleton-${i}`} />
                ))}
              </>
            )}

            {/* Scroll Sentinel */}
            <div
              ref={mobileSentinelRef}
              className="col-span-3 h-2"
            />
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
                  isVideo(previewImage) ? (
                    <div className="relative h-36 aspect-square w-auto">
                      <video
                        src={previewImage}
                        className="h-full w-full object-cover"
                      />
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
              <div className="shrink-0 mt-1 text-center">
                <h4 className="text-slate-700 font-medium text-sm leading-snug">
                  {selectedRing.type || "Loại nhẫn"} - {selectedRing.attributes?.designCode || "--"}
                </h4>
              </div>

              {/* Media Gallery Tab Bar */}
              <div className="flex border-b border-primary-100 mt-2.5 shrink-0">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "flex-1 text-center pb-1.5 text-xs font-medium border-b-2 transition-all duration-200 cursor-pointer",
                        isActive
                          ? "text-secondary-800 border-secondary-800"
                          : "text-[#7A869A] border-transparent hover:text-secondary-800/80",
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
                  const isVid = url && isVideo(url);
                  return (
                    <div
                      key={idx}
                      onClick={() => setFullscreenImage(url)}
                      className={cn(
                        "w-[62px] h-[62px] min-w-[62px] min-h-[62px] border cursor-pointer overflow-hidden transition-all duration-200 relative rounded-sm",
                        fullscreenImage === url ||
                          (!fullscreenImage && previewImage === url)
                          ? "border-secondary-800 ring-2 ring-secondary-800/20"
                          : "border-slate-200 hover:border-slate-300",
                      )}
                    >
                      {isVid ? (
                        <video
                          src={url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={url}
                          className="w-full h-full object-cover"
                          alt={`Thumbnail ${idx}`}
                        />
                      )}
                      {isVid && (
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
                variant="secondary"
                className="w-full h-12 gap-2 font-semibold"
              >
                {isTryingOn ? "Đang xử lý" : "Thử nhẫn"}
                <Sparkle size={16} />
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Fullscreen Image/Video Overlay Viewer */}
      {fullscreenImage && (
        <FullscreenGallery
          mediaList={
            activeImages.includes(fullscreenImage)
              ? activeImages
              : getRingUrls(selectedRing, "website")
          }
          currentUrl={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
          onSelect={setFullscreenImage}
        />
      )}
    </div>
  );
}

export function DesktopStep3Right() {
  const context = use(TryOnContext);
  if (!context) return null;
  const {
    state: { searchQuery, selectedType, isLoadingRings, isLoadingMore, rings, selectedRing },
    actions: { setSearchQuery, setSelectedType, handleSelectRing },
    meta: { desktopSentinelRef },
  } = context;

  return (
    <div className="grow flex flex-col min-h-0 gap-3 bg-[#F8FAFC] p-6">
      <div>
        <p className="text-primary-900 font-bold text-base tracking-tight leading-tight">
          Chọn trang sức của bạn
        </p>
      </div>
      <div className="flex gap-3 shrink-0 items-center max-w-full">
        <div className="relative w-[300px] max-w-full">
          <input
            type="text"
            placeholder="Nhập mã để bắt đầu tìm kiếm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 text-xs font-semibold pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-full focus:outline-none focus:border-[#004B49] placeholder-[#7A869A]"
          />
          <MagnifyingGlass
            size={16}
            className="absolute right-4 top-3 text-primary-400"
          />
        </div>
        <div className="relative w-[200px] max-w-full">
          <Select value={selectedType} onValueChange={(val) => { if (val) setSelectedType(val); }}>
            <SelectTrigger className="w-full h-10 text-xs font-semibold px-4 bg-white border border-slate-200 rounded-full focus:outline-none focus:border-[#004B49] text-[#004B49] justify-between">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-md border border-slate-200 shadow-lg text-[#004B49]">
              <SelectItem value="Nhẫn Nữ" className="text-xs font-medium">Nhẫn Nữ</SelectItem>
              <SelectItem value="Nhẫn Nam" className="text-xs font-medium">Nhẫn Nam</SelectItem>
              <SelectItem value="Nhẫn Nữ Nguyên Chiếc" className="text-xs font-medium">Nhẫn Nữ Nguyên Chiếc</SelectItem>
              <SelectItem value="Nhẫn Nam Nguyên Chiếc" className="text-xs font-medium">Nhẫn Nam Nguyên Chiếc</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                  className={`bg-white border flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-300 ${isSelected
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
            {/* Skeletons rendered directly in the grid */}
            {isLoadingMore && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <RingSkeleton key={`desktop-skeleton-${i}`} />
                ))}
              </>
            )}

            {/* Scroll Sentinel */}
            <div
              ref={desktopSentinelRef}
              className="col-span-3 md:col-span-5 h-2"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function DesktopStep3Left() {
  const context = use(TryOnContext);
  const selectedRing = context?.state.selectedRing;
  const isTryingOn = context?.state.isTryingOn;
  const handleTryOn = context?.actions.handleTryOn;

  const [activeTab, setActiveTab] = React.useState<
    "try_on" | "website" | "actual"
  >("try_on");
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(
    null,
  );

  // Auto-detect and set active tab / default preview image when selectedRing changes
  React.useEffect(() => {
    if (selectedRing) {
      setActiveTab("try_on");
      const websiteUrls = getRingUrls(selectedRing, "website");
      setPreviewImage(websiteUrls[0] || null);
    } else {
      setPreviewImage(null);
    }
  }, [selectedRing]);

  const handleTabChange = (tabId: "try_on" | "website" | "actual") => {
    setActiveTab(tabId);
  };

  if (!context || !handleTryOn) return null;

  // Extract all media categories
  const tryOnUrls = getRingUrls(selectedRing, "try_on");
  const websiteUrls = getRingUrls(selectedRing, "website");
  const actualUrls = getRingUrls(selectedRing, "actual");

  const activeImages =
    activeTab === "try_on"
      ? tryOnUrls
      : activeTab === "website"
        ? websiteUrls
        : actualUrls;

  const tabs = [
    { id: "try_on" as const, label: "Hình thử nhẫn" },
    { id: "website" as const, label: "Hình website" },
    { id: "actual" as const, label: "Hình thực tế" },
  ];

  return (
    <div className="grow h-full flex flex-col justify-between items-center min-w-0 overflow-y-auto">
      <div className="w-full flex flex-col justify-between grow pl-0">
        <div className="border border-primary-100 rounded p-4 bg-white flex flex-col">

          {/* Selected product detail content */}
          {selectedRing ? (
            <div className="flex flex-col text-start">
              {/* Image & Metadata Side-by-Side Flex Container */}
              <div className="flex gap-4 items-center">
                {/* Large Preview Image */}
                <div
                  onClick={() => previewImage && setFullscreenImage(previewImage)}
                  className="w-1/3 flex justify-center items-center bg-white select-none cursor-pointer border border-primary-50 hover:opacity-95"
                >
                  {previewImage ? (
                    isVideo(previewImage) ? (
                      <div className="relative aspect-square w-auto">
                        <video
                          src={previewImage}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[12px] border-l-secondary-900 border-b-[6px] border-b-transparent ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={previewImage}
                        className="object-contain aspect-square w-auto"
                        alt={selectedRing.title}
                      />
                    )
                  ) : (
                    <div className="w-full h-full aspect-square flex flex-col items-center justify-center bg-slate-100 text-xs text-slate-400 gap-2">
                      <ImageSquare size={14} className="text-slate-400" />
                      <span>Chưa có hình ảnh</span>
                    </div>
                  )}
                </div>

                {/* Header Product Metadata */}
                <div className="flex-1 flex flex-col">
                  <h4 className="text-slate-700 font-medium text-base leading-snug">
                    {selectedRing.type || "Loại nhẫn"}
                  </h4>
                  <h4 className="text-slate-900 font-black text-base leading-snug">
                    {selectedRing.attributes?.designCode || "--"}
                  </h4>
                </div>
              </div>

              {/* Media Gallery Tab Bar */}
              <div className="flex border-b border-primary-100 mt-4">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "flex-1 text-center pb-2 text-xs font-medium border-b-2 transition-all duration-200 cursor-pointer",
                        isActive
                          ? "text-secondary-800 border-secondary-800 font-semibold"
                          : "text-slate-500 border-transparent hover:text-slate-700",
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
                  const isVid = url && isVideo(url);
                  return (
                    <div
                      key={idx}
                      onClick={() => setFullscreenImage(url)}
                      className={cn(
                        "w-20 h-20 2xl:h-25 2xl:w-25 min-w-20 min-h-20 2xl:min-w-25 2xl:min-h-25 border cursor-pointer overflow-hidden transition-all duration-200 relative rounded-sm",
                      )}
                    >
                      {isVid ? (
                        <video
                          src={url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={url}
                          className="w-full h-full object-cover"
                          alt={`Thumbnail ${idx}`}
                        />
                      )}
                      {isVid && (
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
                Vui lòng chọn một trang sức để xem chi tiết và bắt đầu thử
                nghiệm.
              </p>
            </div>
          )}
        </div>

        {/* Try On Button */}
        <Button
          onClick={() => handleTryOn()}
          disabled={!selectedRing || isTryingOn}
          variant="secondary"
          className="w-full h-12 gap-2 font-semibold"
        >
          Thử nhẫn
          <Sparkle size={16} />
        </Button>
      </div>

      {/* Fullscreen Image/Video Overlay Viewer */}
      {fullscreenImage && (
        <FullscreenGallery
          mediaList={
            activeImages.includes(fullscreenImage)
              ? activeImages
              : getRingUrls(selectedRing, "website")
          }
          currentUrl={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
          onSelect={setFullscreenImage}
        />
      )}
    </div>
  );
}
