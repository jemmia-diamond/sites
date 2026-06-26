import React, { use } from "react";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, ImageSquare, Sparkle, X, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { MobileProgressBar } from "./MobileProgressBar";
import { RingSkeleton } from "./RingSkeleton";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { TryOnContext, ImageTab } from "../context/TryOnContext";
import { isVideo } from "@/lib/media";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FullscreenGallery } from "./FullscreenGallery";
import { SelectedRingMediaDetail, getRingUrls } from "./SelectedRingMediaDetail";
import { RING_MEDIA_TABS } from "./MediaTabBar";



export function MobileStep3() {
  const context = use(TryOnContext);
  const selectedRing = context?.state.selectedRing;

  const [isBottomSheetOpen, setIsBottomSheetOpen] = React.useState(!!selectedRing);
  const [activeTab, setActiveTab] = React.useState<ImageTab>(ImageTab.TRY_ON);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(null);

  // Auto-detect and set active tab / default preview image when selectedRing changes
  React.useEffect(() => {
    if (selectedRing) {
      setActiveTab(ImageTab.TRY_ON);
      const websiteUrls = getRingUrls(selectedRing, ImageTab.WEBSITE);
      setPreviewImage(websiteUrls[0] || null);
    } else {
      setPreviewImage(null);
    }
  }, [selectedRing]);

  const handleTabChange = (tabId: ImageTab) => {
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

  const activeImages = getRingUrls(selectedRing, activeTab);

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
                {RING_MEDIA_TABS.map((tab) => {
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
              : getRingUrls(selectedRing, ImageTab.WEBSITE)
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
        <div className="relative w-[200px] max-w-full h-full">
          <Select value={selectedType} onValueChange={(val) => { if (val) setSelectedType(val); }}>
            <SelectTrigger className="w-full h-full! text-xs font-semibold px-4 bg-white border border-slate-200 rounded-full focus:outline-none focus:border-[#004B49] text-[#004B49] justify-between">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-md border border-slate-200 shadow-lg text-[#004B49]">
              <SelectItem value="Nhẫn Nữ" className="text-xs py-2 font-medium">Nhẫn Nữ</SelectItem>
              <SelectItem value="Nhẫn Nam" className="text-xs py-2 font-medium">Nhẫn Nam</SelectItem>
              <SelectItem value="Nhẫn Nữ Nguyên Chiếc" className="text-xs py-2 font-medium">Nhẫn Nữ Nguyên Chiếc</SelectItem>
              <SelectItem value="Nhẫn Nam Nguyên Chiếc" className="text-xs py-2 font-medium">Nhẫn Nam Nguyên Chiếc</SelectItem>
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

  if (!context || !handleTryOn) return null;

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between items-center w-full">
      <div className="w-full flex flex-col justify-between flex-1 min-h-0 pl-0">
        {selectedRing ? (
          <SelectedRingMediaDetail />
        ) : (
          <div className="border border-primary-100 rounded p-4 bg-white flex flex-col w-full shadow-sm">
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-4 text-[#004B49]">
                <Sparkle size={32} />
              </div>
              <p className="text-sm font-semibold text-primary-500">
                Vui lòng chọn một trang sức để xem chi tiết và bắt đầu thử nghiệm.
              </p>
            </div>
          </div>
        )}

        {/* Try On Button */}
        <Button
          onClick={() => handleTryOn()}
          disabled={!selectedRing || isTryingOn}
          variant="secondary"
          className="w-full h-12 gap-2 font-semibold mt-4 shrink-0"
        >
          Thử nhẫn
          <Sparkle size={16} />
        </Button>
      </div>
    </div>
  );
}
