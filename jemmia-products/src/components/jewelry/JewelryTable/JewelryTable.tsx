import React, { useState } from "react";
import { ProductModel } from "../../../types";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  CaretLeft,
  CaretRight,
  DownloadSimple,
  Eye,
  X,
} from "@phosphor-icons/react";
import { JewelryTableHeader } from "./JewelryTableHeader";
import { JewelryTableRow } from "./JewelryTableRow";
import { SerialListModal } from "./SerialListModal";

interface JewelryTableProps {
  jewelries: ProductModel[];
}

export function JewelryTable({ jewelries }: JewelryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [serialModal, setSerialModal] = useState<{ variants: any[]; sku: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewList, setPreviewList] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const handleImageError = (url: string) =>
    setBrokenImages((prev) => new Set(prev).add(url));

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

  const handleOpenSerialModal = (variants: any[], sku: string) => {
    setSerialModal({ variants, sku });
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
                  isExpanded={expandedId === product.id}
                  expandedId={expandedId}
                  brokenImages={brokenImages}
                  onImageError={handleImageError}
                  onPreview={handlePreview}
                  onToggleExpand={(id) =>
                    setExpandedId(expandedId === id ? null : id)
                  }
                  onOpenSerialModal={handleOpenSerialModal}
                />
              ))}
            </TableBody>
          </table>
        </div>
      </div>

      <SerialListModal
        variants={serialModal?.variants || []}
        sku={serialModal?.sku || ""}
        open={!!serialModal}
        onClose={() => setSerialModal(null)}
      />

      <MediaPreviewDialog
        previewUrl={previewUrl}
        previewList={previewList}
        previewIndex={previewIndex}
        selectedMedia={selectedMedia}
        brokenImages={brokenImages}
        onImageError={handleImageError}
        onClose={closeMediaDialog}
        onPreview={handlePreview}
        onSelectMedia={setSelectedMedia}
        onDownloadSingle={handleDownloadSingle}
        onDownloadAll={handleDownloadAll}
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
  onImageError: (url: string) => void;
  onClose: () => void;
  onPreview: (images: string[], index: number) => void;
  onSelectMedia: (url: string | null) => void;
  onDownloadSingle: (url: string) => void;
  onDownloadAll: (images: string[]) => void;
  isVideo: (url: string) => boolean;
}

export function MediaPreviewDialog({
  previewUrl,
  previewList,
  previewIndex,
  selectedMedia,
  brokenImages,
  onImageError,
  onClose,
  onSelectMedia,
  onDownloadSingle,
  onDownloadAll,
  isVideo,
}: MediaPreviewDialogProps) {
  const validPreviewList = previewList.filter((url) => !brokenImages.has(url));

  return (
    <Dialog open={!!previewUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[1200px]! w-full max-h-[90vh] bg-white rounded-3xl border-none p-0 overflow-hidden shadow-2xl flex flex-col outline-none">
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
            onSelectMedia={onSelectMedia}
            onDownloadAll={onDownloadAll}
            onImageError={onImageError}
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
    <div className="flex flex-col h-full bg-secondary-900">
      <div className="flex items-center justify-between px-8 py-4 bg-secondary-900/50 backdrop-blur-md sticky top-0 z-50">
        <Button variant="ghost" className="text-white hover:bg-white/10 font-bold" onClick={() => onSelectMedia(null)}>
          <CaretLeft size={20} className="mr-0" />
          Quay lại thư viện
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-[11px] font-bold tracking-widest">{currentIndex + 1} / {validPreviewList.length}</span>
          <Button disabled variant="secondary" size="sm" onClick={() => onDownloadSingle(selectedMedia)} className="bg-white/15 hover:bg-white/20 text-white/20 border-none">
            <DownloadSimple size={18} className="mr-0" />Tải về
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-xl">
            <X size={20} />
          </Button>
        </div>
      </div>
      <div className="h-[75vh] relative flex items-center justify-center p-4 sm:p-12 bg-white overflow-hidden group/viewer">
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

interface MediaGalleryProps {
  validPreviewList: string[];
  previewIndex: number;
  onClose: () => void;
  onSelectMedia: (url: string) => void;
  onDownloadAll: (images: string[]) => void;
  onImageError: (url: string) => void;
  isVideo: (url: string) => boolean;
}

function MediaGallery({
  validPreviewList,
  previewIndex,
  onClose,
  onSelectMedia,
  onDownloadAll,
  onImageError,
  isVideo,
}: MediaGalleryProps) {
  return (
    <>
      <div className="flex items-center justify-between px-8 py-6 border-b border-primary-50 bg-white sticky top-0 z-20">
        <div>
          <h3 className="text-lg font-black text-secondary-900 uppercase tracking-tight">Thư viện hình ảnh/video</h3>
          <p className="text-xs text-primary-300 font-bold">Tổng cộng {validPreviewList.length} tệp tin</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" disabled size="sm" className="h-10 px-4 border-primary-100 font-bold text-xs uppercase tracking-widest hover:bg-secondary-900 hover:text-white transition-all" onClick={() => onDownloadAll(validPreviewList)}>
            <DownloadSimple size={16} className="mr-2" />Tải về tất cả
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 bg-primary-50 text-secondary-900 rounded-full hover:bg-red-50 hover:text-red-500" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-3 gap-4">
          {validPreviewList.map((url, i) => {
            const isVid = isVideo(url);
            return (
              <div key={i} className="group relative aspect-square overflow-hidden bg-primary-50 border border-primary-100 hover:border-secondary-900 transition-all duration-500 cursor-pointer" onClick={() => onSelectMedia(url)}>
                {isVid ? (
                  <video src={url} className="h-full w-full object-cover" controls={false} muted preload="metadata"
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                  />
                ) : (
                  <img src={url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Media ${i}`} loading="lazy" onError={() => onImageError(url)} />
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
}