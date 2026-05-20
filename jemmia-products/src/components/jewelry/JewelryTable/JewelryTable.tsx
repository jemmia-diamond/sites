import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ProductModel } from "../../../types";
import { TableBody } from "@/components/ui/table";
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
} from "@phosphor-icons/react";
import { JewelryTableHeader } from "./JewelryTableHeader";
import { JewelryTableRow } from "./JewelryTableRow";
import { SerialListModal } from "./SerialListModal";
import { MediaGallery } from "./MediaGallery";
import { API_BASE_URL } from "../../../config";

interface JewelryTableProps {
  jewelries: ProductModel[];
  warehouseIds?: string[];
}

export function JewelryTable({ jewelries, warehouseIds }: JewelryTableProps) {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [serialModal, setSerialModal] = useState<{ variants: any[]; sku: string; totalQuantity?: number; totalHaravanQuantity?: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewList, setPreviewList] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [uploadConfig, setUploadConfig] = useState<{ showUpload?: boolean; designCode?: string; uploadEndpoint?: string; productId?: string; isActual?: boolean; uploadOptions?: { label: string; designCode: string }[]; } | null>(null);

  React.useEffect(() => {
    if (!uploadConfig?.productId) return;
    const activeProduct = jewelries.find((j) => j.id === uploadConfig.productId);
    if (!activeProduct) return;

    const isBundle = activeProduct.products && activeProduct.products.length > 0;

    const webImages = isBundle
      ? activeProduct.products?.[0]?.thumbnails?.map((t) => t.url) || []
      : activeProduct.thumbnails?.map((t) => t.url) || [];

    const actualImages = isBundle
      ? activeProduct.products!.flatMap((p) => [
        ...(p.images?.map((img) => img.url) || []),
        ...(p.videos?.map((v) => v.url) || []),
      ])
      : [
        ...(activeProduct.images?.map((img) => img.url) || []),
        ...(activeProduct.videos?.map((v) => v.url) || []),
      ];

    const isActual = uploadConfig.isActual ?? uploadConfig.showUpload;
    const newImages = isActual ? actualImages : webImages;

    setPreviewList(newImages);
  }, [jewelries, uploadConfig]);

  const handleImageError = (url: string) =>
    setBrokenImages((prev) => new Set(prev).add(url));

  const handlePreview = (images: string[], index: number, config?: any) => {
    setPreviewList(images);
    setPreviewIndex(index);
    setPreviewUrl(images[index]);
    setSelectedMedia(null);
    setUploadConfig(config || null);
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
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
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
      <div className="relative border border-primary-100 bg-white shadow-sm h-full overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full border-collapse">
            <JewelryTableHeader />

            <TableBody>
              {jewelries.map((product) => (
                <JewelryTableRow
                  product={product}
                  warehouseIds={warehouseIds}
                  isExpanded={expandedId === product.id}
                  expandedId={expandedId}
                  brokenImages={brokenImages}
                  onImageError={handleImageError}
                  onPreview={handlePreview}
                  onToggleExpand={(id) =>
                    setExpandedId(expandedId === id ? null : id)
                  }
                  onOpenSerialModal={handleOpenSerialModal}
                  onUploadSuccess={handleUploadSuccess}
                  key={product.id}
                />
              ))}
            </TableBody>
          </table>
        </div>
      </div>

      <SerialListModal
        variants={serialModal?.variants || []}
        sku={serialModal?.sku || ""}
        totalQuantity={serialModal?.totalQuantity}
        totalHaravanQuantity={serialModal?.totalHaravanQuantity}
        open={!!serialModal}
        onClose={() => setSerialModal(null)}
      />

      <MediaPreviewDialog
        previewUrl={previewUrl}
        previewList={previewList}
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
}: MediaPreviewDialogProps) {
  const validPreviewList = previewList.filter((url) => !brokenImages.has(url));

  return (
    <Dialog open={!!previewUrl || (validPreviewList.length === 0 && !!uploadConfig)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[90%] sm:max-w-[1200px] h-[85vh] bg-white rounded-none border-none p-0 overflow-hidden shadow-2xl flex flex-col outline-none" showCloseButton={false}>
        {selectedMedia ? (
          <MediaViewer
            selectedMedia={selectedMedia}
            validPreviewList={validPreviewList}
            onClose={onClose}
            onSelectMedia={onSelectMedia}
            onDownloadSingle={onDownloadSingle}
            isVideo={isVideo}
          />
        ) : (
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
          />
        )}
      </DialogContent>
    </Dialog>
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
  const isVid = isVideo(selectedMedia);
  const currentIndex = validPreviewList.indexOf(selectedMedia);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectMedia(validPreviewList[(currentIndex + 1) % validPreviewList.length]);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectMedia(validPreviewList[(currentIndex - 1 + validPreviewList.length) % validPreviewList.length]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-8 py-6 bg-secondary-800 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/10 text-white rounded-full hover:bg-white hover:text-secondary-700 transition-all" onClick={() => onSelectMedia(null)}>
            <CaretLeft size={20} />
          </Button>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              Chi tiết
            </h3>
            <p className="text-xs text-white/70 font-bold mt-1">Tệp {currentIndex + 1} trên tổng số {validPreviewList.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownloadSingle(selectedMedia!)}
            disabled={!selectedMedia}
            className="h-10 px-4 border-white/20 bg-transparent text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-secondary-700 transition-all flex items-center gap-2 disabled:bg-transparent disabled:text-white/30 disabled:border-white/10"
          >
            <DownloadSimple size={16} />
            <span className="hidden sm:inline">Tải về</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/10 text-white rounded-full hover:bg-red-500 hover:text-white transition-all" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </div>
      <div className="flex-1 relative flex items-center justify-center p-4 sm:p-12 bg-primary-50/50 overflow-hidden group/viewer">
        {validPreviewList.length > 1 && (
          <>
            <Button variant="ghost" size="icon" className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-white hover:bg-secondary-900 text-secondary-900 hover:text-white rounded-full opacity-0 group-hover/viewer:opacity-100 transition-all shadow-md z-30" onClick={handlePrev}>
              <CaretLeft size={24} weight="bold" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-white hover:bg-secondary-900 text-secondary-900 hover:text-white rounded-full opacity-0 group-hover/viewer:opacity-100 transition-all shadow-md z-30" onClick={handleNext}>
              <CaretRight size={24} weight="bold" />
            </Button>
          </>
        )}
        {isVid ? (
          <video key={selectedMedia} src={selectedMedia} controls autoPlay className="max-w-full max-h-full object-contain rounded-none shadow-lg" />
        ) : (
          <img key={selectedMedia} src={selectedMedia.match(/\.(heic|heif)(?:\?|$)/i) ? `${API_BASE_URL}/files/cloudflare-transform?url=${encodeURIComponent(selectedMedia)}` : selectedMedia} className="max-w-full max-h-full object-contain rounded-none animate-in zoom-in-95 duration-500 shadow-lg" alt="Preview" />
        )}
      </div>
    </div>
  );
}
