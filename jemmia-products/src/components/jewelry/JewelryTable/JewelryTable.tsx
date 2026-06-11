import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ProductModel } from "../../../types";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CaretLeft,
  CaretRight,
  X,
  DownloadSimple,
  Copy,
  Checks,
  CircleNotch,
} from "@phosphor-icons/react";
import { JewelryTableHeader } from "./JewelryTableHeader";
import { JewelryTableRow } from "./JewelryTableRow";
import { SerialListModal } from "./SerialListModal";
import { MediaGallery } from "./MediaGallery";
import { API_BASE_URL } from "../../../config";
import { cn } from "@/lib/utils";

interface JewelryTableProps {
  jewelries: ProductModel[];
  warehouseIds?: string[];
  stockStatus?: string;
  lastElementRef?: (node: HTMLElement | null) => void;
  isFetchingNextPage?: boolean;
  expandedId: string | null;
  onToggleExpand: (id: string | null) => void;
}

export function JewelryTable({
  jewelries,
  warehouseIds,
  stockStatus,
  lastElementRef,
  isFetchingNextPage,
  expandedId,
  onToggleExpand,
}: JewelryTableProps) {
  const queryClient = useQueryClient();
  const [serialModal, setSerialModal] = useState<{ variants: any[]; sku: string; totalQuantity?: number; totalHaravanQuantity?: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewList, setPreviewList] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [uploadConfig, setUploadConfig] = useState<{ showUpload?: boolean; designCode?: string; uploadEndpoint?: string; productId?: string; isActual?: boolean; uploadOptions?: { label: string; designCode: string }[]; } | null>(null);
  const [activeTab, setActiveTab] = useState<'web' | 'actual'>('web');

  const activeProduct = uploadConfig?.productId
    ? jewelries.find((j) => j.id === uploadConfig.productId)
    : null;

  const isBundle = activeProduct
    ? activeProduct.products && activeProduct.products.length > 0
    : false;

  const allWebImages = activeProduct
    ? (isBundle
      ? activeProduct.products?.[0]?.thumbnails?.map((t) => t.url) || []
      : activeProduct.thumbnails?.map((t) => t.url) || [])
    : [];

  const allActualImages = activeProduct
    ? (isBundle
      ? activeProduct.products!.flatMap((p) => [
        ...(p.images?.map((img) => img.url) || []),
        ...(p.videos?.map((v) => v.url) || []),
      ])
      : [
        ...(activeProduct.images?.map((img) => img.url) || []),
        ...(activeProduct.videos?.map((v) => v.url) || []),
      ])
    : [];

  const displayList = activeProduct
    ? (activeTab === 'actual' ? allActualImages : allWebImages)
    : previewList;

  const handleImageError = (url: string) =>
    setBrokenImages((prev) => new Set(prev).add(url));

  const handlePreview = (images: string[], index: number, config?: any) => {
    setPreviewList(images);
    setPreviewIndex(index);
    setPreviewUrl(images[index]);
    setSelectedMedia(null);
    setUploadConfig(config || null);
    setActiveTab(config?.isActual ? 'actual' : 'web');
  };

  const closeMediaDialog = () => {
    setPreviewUrl(null);
    setSelectedMedia(null);
    setUploadConfig(null);
  };

  const handleDownloadSingle = async (url: string) => {
    try {
      const urlParts = url.split('/');
      let fileName = urlParts[urlParts.length - 1];
      if (fileName.includes('?')) {
        fileName = fileName.split('?')[0];
      }

      if (!fileName.includes('.')) {
        const ext = isVideo(url) ? 'mp4' : 'jpg';
        fileName = `media_${Date.now()}.${ext}`;
      }

      const cacheBusterUrl = url + (url.includes('?') ? '&' : '?') + 'cb=' + new Date().getTime();

      try {
        const response = await fetch(cacheBusterUrl, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-store'
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const blob = await response.blob();
        const { saveAs } = await import("file-saver");
        saveAs(blob, fileName);
      } catch (fetchError) {
        console.warn("Fetch failed, falling back to window.open", fetchError);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error("Lỗi khi tải file:", url, error);
    }
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
    !!url.match(/\.(mp4|webm|ogg|mov)(?:\?|$)|^blob:|^data:video/i);

  const handleOpenSerialModal = (variants: any[], sku: string, totalQuantity?: number, totalHaravanQuantity?: number) => {
    setSerialModal({ variants, sku, totalQuantity, totalHaravanQuantity });
  };

  const handleUploadSuccess = async (fromGallery?: boolean) => {
    await queryClient.invalidateQueries({ queryKey: ["jewelry-designs"] });
    if (!fromGallery) {
      closeMediaDialog();
    }
  };

  return (
    <>
      <div className="relative border border-primary-100 bg-white flex flex-col flex-1 min-h-0 w-full max-w-full xl:overflow-hidden">
        <div className="flex-1 xl:overflow-y-auto overflow-x-hidden md:overflow-x-auto min-w-0 w-full relative">
          <Table className="w-full xl:min-w-[1200px] border-collapse">
            <JewelryTableHeader />

            <TableBody>
              {jewelries.map((product) => (
                <JewelryTableRow
                  product={product}
                  warehouseIds={warehouseIds}
                  stockStatus={stockStatus}
                  isExpanded={expandedId === product.id}
                  expandedId={expandedId}
                  brokenImages={brokenImages}
                  onImageError={handleImageError}
                  onPreview={handlePreview}
                  onToggleExpand={(id) =>
                    onToggleExpand(expandedId === id ? null : id)
                  }
                  onOpenSerialModal={handleOpenSerialModal}
                  onUploadSuccess={handleUploadSuccess}
                  key={product.id}
                />
              ))}
            </TableBody>
          </Table>
          <div ref={lastElementRef} className="h-4 w-full" />
          {isFetchingNextPage && (
            <div className="py-6 flex justify-center items-center w-full">
              <div className="h-6 w-6 relative">
                <div className="absolute inset-0 border-2 border-primary-50 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-t-secondary-900 rounded-full animate-spin"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SerialListModal
        variants={serialModal?.variants || []}
        sku={serialModal?.sku || ""}
        totalQuantity={serialModal?.totalQuantity}
        totalHaravanQuantity={serialModal?.totalHaravanQuantity}
        stockStatus={stockStatus}
        open={!!serialModal}
        onClose={() => setSerialModal(null)}
      />

      <MediaPreviewDialog
        previewUrl={previewUrl}
        previewList={displayList}
        previewIndex={previewIndex}
        selectedMedia={selectedMedia}
        brokenImages={brokenImages}
        uploadConfig={uploadConfig}
        onImageError={handleImageError}
        onClose={closeMediaDialog}
        onPreview={handlePreview}
        onSelectMedia={setSelectedMedia}
        onDownloadSingle={handleDownloadSingle}
        onDownloadAll={handleDownloadAll}
        onUploadSuccess={() => handleUploadSuccess(true)}
        isVideo={isVideo}
        webImages={allWebImages}
        actualImages={allActualImages}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </>
  );
}

interface MediaPreviewDialogProps {
  previewUrl: string | null;
  previewList: string[];
  previewIndex: number;
  selectedMedia: string | null;
  brokenImages: Set<string>;
  uploadConfig?: { showUpload?: boolean; designCode?: string; uploadEndpoint?: string; productId?: string; isActual?: boolean; uploadOptions?: { label: string; designCode: string }[]; } | null;
  onImageError: (url: string) => void;
  onClose: () => void;
  onPreview: (images: string[], index: number, config?: any) => void;
  onSelectMedia: (url: string | null) => void;
  onDownloadSingle: (url: string) => void;
  onDownloadAll: (images: string[]) => void;
  onUploadSuccess?: (fromGallery?: boolean) => void | Promise<void>;
  isVideo: (url: string) => boolean;
  webImages: string[];
  actualImages: string[];
  activeTab: 'web' | 'actual';
  onTabChange: (tab: 'web' | 'actual') => void;
}

export function MediaPreviewDialog({
  previewUrl,
  previewList,
  previewIndex,
  selectedMedia,
  brokenImages,
  uploadConfig,
  onImageError,
  onClose,
  onSelectMedia,
  onDownloadSingle,
  onDownloadAll,
  onUploadSuccess,
  isVideo,
  webImages,
  actualImages,
  activeTab,
  onTabChange,
}: MediaPreviewDialogProps) {
  const validPreviewList = previewList.filter((url) => !brokenImages.has(url));

  return (
    <Dialog open={!!previewUrl || (validPreviewList.length === 0 && !!uploadConfig)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!w-[90%] md:max-w-[1200px] h-[85vh] bg-white rounded-none border-none p-0 overflow-hidden shadow-2xl flex flex-col outline-none" showCloseButton={false}>
        {selectedMedia && (
          <div className="flex-1 min-h-0 w-full h-full">
            <MediaViewer
              selectedMedia={selectedMedia}
              validPreviewList={validPreviewList}
              onClose={onClose}
              onSelectMedia={onSelectMedia}
              onDownloadSingle={onDownloadSingle}
              isVideo={isVideo}
            />
          </div>
        )}
        <div className={cn("flex-1 min-h-0 w-full h-full", selectedMedia ? "hidden" : "flex flex-col")}>
          <MediaGallery
            validPreviewList={validPreviewList}
            previewIndex={previewIndex}
            onClose={onClose}
            uploadConfig={uploadConfig}
            onSelectMedia={onSelectMedia}
            onDownloadAll={onDownloadAll}
            onImageError={onImageError}
            onUploadSuccess={onUploadSuccess}
            isVideo={isVideo}
            webImages={webImages}
            actualImages={actualImages}
            activeTab={activeTab}
            onTabChange={onTabChange}
            brokenImages={brokenImages}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SlideItemProps {
  url: string;
  isActive: boolean;
  isVideo: boolean;
  copyingUrl: string | null;
  copiedUrl: string | null;
  handleCopyImage: (url: string, e?: React.MouseEvent) => void;
}

function SlideItem({
  url,
  isActive,
  isVideo,
  copyingUrl,
  copiedUrl,
  handleCopyImage,
}: SlideItemProps) {
  const [aspectRatio, setAspectRatio] = React.useState<number | null>(null);

  return (
    <div className="w-full h-full flex items-center justify-center select-none pointer-events-none p-3 md:p-4 relative">
      {isVideo ? (
        <video
          src={url}
          controls
          autoPlay={isActive}
          playsInline
          preload="metadata"
          className="max-w-full max-h-full object-contain pointer-events-auto"
        />
      ) : (
        <div
          className="relative max-w-full max-h-full flex items-center justify-center"
          style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : undefined }}
        >
          <img
            src={url.match(/\.(heic|heif)(?:\?|$)/i) ? `${API_BASE_URL}/site/files/cloudflare-transform?url=${encodeURIComponent(url)}` : url}
            className="max-w-full max-h-full object-contain"
            alt=""
            draggable={false}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                setAspectRatio(img.naturalWidth / img.naturalHeight);
              }
            }}
          />
          {isActive && (
            <button
              onClick={(e) => { e.stopPropagation(); handleCopyImage(url, e); }}
              disabled={copyingUrl === url}
              className="absolute bottom-4 right-4 md:bottom-6 md:right-6 h-10 w-10 md:h-12 md:w-12 bg-white/90 hover:bg-secondary-900 rounded-full flex items-center justify-center border border-primary-200 hover:border-transparent z-40 transition-colors duration-200 group/copy disabled:opacity-50 shadow-md pointer-events-auto cursor-pointer"
              title="Copy image"
            >
              {copyingUrl === url ? (
                <CircleNotch size={18} className="text-secondary-900 animate-spin group-hover/copy:text-white" />
              ) : copiedUrl === url ? (
                <Checks size={18} className="text-green-600" />
              ) : (
                <Copy size={18} className="text-secondary-900 group-hover/copy:text-white" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface MediaViewerProps {
  selectedMedia: string;
  validPreviewList: string[];
  onClose: () => void;
  onSelectMedia: (url: string | null) => void;
  onDownloadSingle: (url: string) => void;
  isVideo: (url: string) => boolean;
}

function MediaViewer({
  selectedMedia,
  validPreviewList,
  onClose,
  onSelectMedia,
  onDownloadSingle,
  isVideo,
}: MediaViewerProps) {
  const currentIndex = validPreviewList.indexOf(selectedMedia);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const dragState = React.useRef({ startX: 0, isDragging: false });
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copyingUrl, setCopyingUrl] = useState<string | null>(null);

  const prevMedia = validPreviewList[(currentIndex - 1 + validPreviewList.length) % validPreviewList.length];
  const nextMedia = validPreviewList[(currentIndex + 1) % validPreviewList.length];

  const handleCopyImage = async (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCopyingUrl(url);
    try {
      const isVid = isVideo(url);

      if (isVid) {
        const cacheBusterUrl = url + (url.includes('?') ? '&' : '?') + 'cb=' + new Date().getTime();
        const response = await fetch(cacheBusterUrl, { mode: 'cors', cache: 'no-store' });
        const blob = await response.blob();

        try {
          const clipboardItem = new ClipboardItem({ [blob.type]: blob });
          await navigator.clipboard.write([clipboardItem]);
        } catch {
          await navigator.clipboard.writeText(cacheBusterUrl);
        }
      } else {
        const cacheBusterUrl = url + (url.includes('?') ? '&' : '?') + 'cb=' + new Date().getTime();
        const response = await fetch(cacheBusterUrl, { mode: 'cors', cache: 'no-store' });
        const blob = await response.blob();

        let clipboardBlob = blob;
        if (blob.type !== 'image/png') {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
          });

          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(img.src);

          clipboardBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Canvas toBlob failed')), 'image/png');
          });
        }

        const clipboardItem = new ClipboardItem({ 'image/png': clipboardBlob });
        await navigator.clipboard.write([clipboardItem]);
      }

      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    } finally {
      setCopyingUrl(null);
    }
  };

  React.useLayoutEffect(() => {
    const track = trackRef.current;
    const containerW = containerRef.current?.clientWidth;
    if (track && containerW) {
      track.style.transition = 'none';
      track.style.transform = `translateX(${-containerW}px)`;
    }
  }, [selectedMedia]);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const videos = track.querySelectorAll("video");
    videos.forEach((video) => {
      const v = video as HTMLVideoElement;
      v.pause();
      v.currentTime = 0;
    });

    const currentVideo = Array.from(videos).find(
      (video) => {
        const v = video as HTMLVideoElement;
        return v.src === selectedMedia || v.getAttribute("src") === selectedMedia;
      }
    ) as HTMLVideoElement | undefined;

    if (currentVideo) {
      currentVideo.play().catch((err) => {
        console.warn("Autoplay was blocked or interrupted:", err);
      });
    }
  }, [selectedMedia]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onSelectMedia(nextMedia);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onSelectMedia(prevMedia);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragState.current = { startX: e.touches[0].clientX, isDragging: true };
    const track = trackRef.current;
    if (track) track.style.transition = 'none';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.current.isDragging) return;
    const deltaX = e.touches[0].clientX - dragState.current.startX;
    const containerW = containerRef.current?.clientWidth || 1;
    const track = trackRef.current;
    if (track) {
      track.style.transform = `translateX(${-containerW + deltaX}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragState.current.isDragging) return;
    dragState.current.isDragging = false;

    const deltaX = e.changedTouches[0].clientX - dragState.current.startX;
    const containerW = containerRef.current?.clientWidth || 1;
    const track = trackRef.current;
    if (!track) return;

    if (deltaX > containerW * 0.2) {
      track.style.transition = 'transform 0.25s ease-out';
      track.style.transform = 'translateX(0px)';
      setTimeout(() => onSelectMedia(prevMedia), 250);
    } else if (deltaX < -containerW * 0.2) {
      track.style.transition = 'transform 0.25s ease-out';
      track.style.transform = `translateX(${-2 * containerW}px)`;
      setTimeout(() => onSelectMedia(nextMedia), 250);
    } else {
      track.style.transition = 'transform 0.3s ease-out';
      track.style.transform = `translateX(${-containerW}px)`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 md:px-4 py-4 md:py-4 bg-secondary-800 sticky top-0 z-50">
        <div className="flex items-center gap-3 md:gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 bg-white/10 text-white rounded-full hover:bg-white hover:text-secondary-700 transition-all" onClick={() => onSelectMedia(null)}>
            <CaretLeft size={18} md:size={20} />
          </Button>
          <div>
            <h3 className="text-sm md:text-lg font-black text-white uppercase tracking-tight">Chi tiết</h3>
            <p className="text-[10px] md:text-xs text-white/70 font-bold mt-0.5 md:mt-1">Tệp {currentIndex + 1} / {validPreviewList.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownloadSingle(selectedMedia!)}
            disabled={!selectedMedia}
            className="h-8 md:h-10 px-3 md:px-4 border-white/20 bg-transparent text-white font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-white hover:text-secondary-700 transition-all flex items-center gap-1.5 md:gap-2 disabled:bg-transparent disabled:text-white/30 disabled:border-white/10"
          >
            <DownloadSimple size={14} md:size={16} />
            <span className="hidden md:inline">Tải về</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 bg-white/10 text-white rounded-full hover:bg-red-500 hover:text-white transition-all" onClick={onClose}>
            <X size={16} md:size={20} />
          </Button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-primary-50/50 group/viewer"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {validPreviewList.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 h-10 w-10 md:h-14 md:w-14 bg-white/90 md:bg-white hover:bg-secondary-900 text-secondary-900 hover:text-white rounded-full opacity-100 xl:opacity-0 xl:group-hover/viewer:opacity-100 transition-all shadow-md z-30"
              onClick={handlePrev}
            >
              <CaretLeft size={20} md:size={24} weight="bold" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 h-10 w-10 md:h-14 md:w-14 bg-white/90 md:bg-white hover:bg-secondary-900 text-secondary-900 hover:text-white rounded-full opacity-100 xl:opacity-0 xl:group-hover/viewer:opacity-100 transition-all shadow-md z-30"
              onClick={handleNext}
            >
              <CaretRight size={20} md:size={24} weight="bold" />
            </Button>
          </>
        )}
        <div
          ref={trackRef}
          className="h-full grid grid-cols-3 grid-rows-1"
          style={{ width: '300%' }}
        >
          <SlideItem
            url={prevMedia}
            isActive={false}
            isVideo={isVideo(prevMedia)}
            copyingUrl={copyingUrl}
            copiedUrl={copiedUrl}
            handleCopyImage={handleCopyImage}
          />
          <SlideItem
            url={selectedMedia}
            isActive={true}
            isVideo={isVideo(selectedMedia)}
            copyingUrl={copyingUrl}
            copiedUrl={copiedUrl}
            handleCopyImage={handleCopyImage}
          />
          <SlideItem
            url={nextMedia}
            isActive={false}
            isVideo={isVideo(nextMedia)}
            copyingUrl={copyingUrl}
            copiedUrl={copiedUrl}
            handleCopyImage={handleCopyImage}
          />
        </div>
      </div>
    </div>
  );
}
