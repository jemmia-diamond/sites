import { use, useEffect, useState } from "react";
import { TryOnContext, ImageTab } from "../context/TryOnContext";
import { extractUrls } from "@/lib/media";
import { FullscreenGallery } from "./FullscreenGallery";
import { ProductModel } from "../../../../types";
import { RingHeader } from "./RingHeader";
import { MediaTabBar } from "./MediaTabBar";
import { MediaGrid } from "./MediaGrid";

export const getRingUrls = (
  selectedRing: ProductModel | null | undefined,
  tab: ImageTab,
): string[] => {
  if (!selectedRing) return [];
  const isBundle = selectedRing.products && selectedRing.products.length > 0;

  if (tab === ImageTab.TRY_ON) {
    return [
      ...extractUrls(selectedRing.try_on_images),
      ...extractUrls(selectedRing.attributes?.try_on_images),
      ...(isBundle
        ? (selectedRing.products || []).flatMap((p: ProductModel) => [
          ...extractUrls(p.try_on_images),
          ...extractUrls(p.attributes?.try_on_images),
        ])
        : []),
    ];
  }

  if (tab === ImageTab.WEBSITE) {
    return isBundle
      ? (selectedRing.products || []).flatMap((p: ProductModel) => extractUrls(p.thumbnails))
      : extractUrls(selectedRing.thumbnails);
  }

  // actual
  return isBundle
    ? (selectedRing.products || []).flatMap((p: ProductModel) => [
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

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(
    null,
  );

  // Auto-detect and set default preview image when selectedRing changes
  useEffect(() => {
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

  const activeImages = getRingUrls(selectedRing, activeTab);

  return (
    <div className="border border-primary-100 rounded p-4 bg-white flex flex-col w-full shadow-sm max-h-full min-h-0">
      <div className="flex flex-col text-start flex-1 min-h-0">
        <RingHeader
          selectedRing={selectedRing}
          previewImage={previewImage}
          onPreviewClick={() => previewImage && setFullscreenImage(previewImage)}
        />

        <MediaTabBar activeTab={activeTab} onTabChange={handleTabChange} />

        <MediaGrid activeImages={activeImages} onThumbnailClick={setFullscreenImage} />
      </div>

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
