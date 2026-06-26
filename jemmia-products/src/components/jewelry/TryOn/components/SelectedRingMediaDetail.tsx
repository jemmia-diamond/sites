import React, { use } from "react";
import { ImageSquare } from "@phosphor-icons/react";
import { TryOnContext, ImageTab } from "../context/TryOnContext";
import { isVideo, extractUrls } from "@/lib/media";
import { cn } from "@/lib/utils";
import { FullscreenGallery } from "./FullscreenGallery";

export const getRingUrls = (
  selectedRing: any,
  tab: ImageTab,
): string[] => {
  if (!selectedRing) return [];
  const isBundle = selectedRing.products && selectedRing.products.length > 0;

  if (tab === ImageTab.TRY_ON) {
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

  if (tab === ImageTab.WEBSITE) {
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

export function SelectedRingMediaDetail() {
  const context = use(TryOnContext);
  const selectedRing = context?.state.selectedRing;
  const activeTab = context?.state.selectedRingMediaTab || ImageTab.TRY_ON;
  const setActiveTab = context?.actions.setSelectedRingMediaTab;

  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(
    null,
  );

  // Auto-detect and set default preview image when selectedRing changes
  React.useEffect(() => {
    if (selectedRing) {
      const websiteUrls = getRingUrls(selectedRing, ImageTab.WEBSITE);
      setPreviewImage(websiteUrls[0] || null);
    } else {
      setPreviewImage(null);
    }
  }, [selectedRing]);

  const handleTabChange = (tabId: ImageTab) => {
    if (setActiveTab) setActiveTab(tabId);
  };

  if (!context || !selectedRing) return null;

  // Extract all media categories
  const tryOnUrls = getRingUrls(selectedRing, ImageTab.TRY_ON);
  const websiteUrls = getRingUrls(selectedRing, ImageTab.WEBSITE);
  const actualUrls = getRingUrls(selectedRing, ImageTab.ACTUAL);

  const activeImages =
    activeTab === ImageTab.TRY_ON
      ? tryOnUrls
      : activeTab === ImageTab.WEBSITE
        ? websiteUrls
        : actualUrls;

  const tabs = [
    { id: ImageTab.TRY_ON, label: "Hình thử nhẫn" },
    { id: ImageTab.WEBSITE, label: "Hình website" },
    { id: ImageTab.ACTUAL, label: "Hình thực tế" },
  ];

  return (
    <div className="border border-primary-100 rounded p-4 bg-white flex flex-col w-full shadow-sm max-h-full min-h-0">
      <div className="flex flex-col text-start flex-1 min-h-0">
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

        {/* Gallery Scroll Container */}
        <div className="overflow-y-auto pr-0.5 mt-3 flex-1 min-h-0">
          <div className="grid grid-cols-3 gap-2">
            {activeImages.map((url, idx) => {
              const isVid = url && isVideo(url);
              return (
                <div
                  key={idx}
                  onClick={() => setFullscreenImage(url)}
                  className={cn(
                    "w-full aspect-square cursor-pointer overflow-hidden transition-all duration-200 relative ",
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
          </div>
          {activeImages.length === 0 && (
            <div className="w-full text-center py-4 text-xs text-slate-400">
              Không có hình ảnh nào
            </div>
          )}
        </div>
      </div>

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
