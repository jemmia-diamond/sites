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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CaretLeft,
  CaretRight,
  DownloadSimple,
  Eye,
  X,
  UploadSimple,
  CircleNotch,
  PlayCircle,
  GenderMale,
  GenderFemale,
  Camera,
} from "@phosphor-icons/react";
import { JewelryTableHeader } from "./JewelryTableHeader";
import { JewelryTableRow } from "./JewelryTableRow";
import { SerialListModal } from "./SerialListModal";
import axios from "axios";
import { cn } from "@/lib/utils";

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
      <DialogContent className="w-[90%] sm:max-w-[1200px] max-h-[90vh] bg-white rounded-3xl border-none p-0 overflow-hidden shadow-2xl flex flex-col outline-none" showCloseButton={false}>
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
    <div className="flex flex-col h-full bg-secondary-900">
      <div className="flex items-center justify-between px-8 py-4 bg-secondary-900/50 backdrop-blur-md sticky top-0 z-50">
        <Button variant="ghost" className="text-white hover:bg-white/10 font-bold" onClick={() => onSelectMedia(null)}>
          <CaretLeft size={20} className="mr-0" />
          Quay lại thư viện
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-[11px] font-bold tracking-widest">{currentIndex + 1} / {validPreviewList.length}</span>
          {/* <Button disabled variant="secondary" size="sm" onClick={() => onDownloadSingle(selectedMedia)} className="bg-white/15 hover:bg-white/20 text-white/20 border-none">
            <DownloadSimple size={18} className="mr-0" />Tải về
          </Button> */}
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
          <img key={selectedMedia} src={selectedMedia.match(/\.(heic|heif)(?:\?|$)/i) ? `/files/cloudflare-transform?url=${encodeURIComponent(selectedMedia)}` : selectedMedia} className="max-w-full max-h-full object-contain rounded-xl animate-in zoom-in-95 duration-500" alt="Preview" />
        )}
      </div>
    </div>
  );
}

interface MediaGalleryProps {
  validPreviewList: string[];
  previewIndex: number;
  uploadConfig?: { showUpload?: boolean; designCode?: string; uploadEndpoint?: string; uploadOptions?: { label: string; designCode: string }[]; } | null;
  onClose: () => void;
  onSelectMedia: (url: string) => void;
  onDownloadAll: (images: string[]) => void;
  onImageError: (url: string) => void;
  onUploadSuccess?: (fromGallery?: boolean) => void | Promise<void>;
  isVideo: (url: string) => boolean;
}

function MediaGallery({
  validPreviewList,
  previewIndex,
  uploadConfig,
  onClose,
  onSelectMedia,
  onDownloadAll,
  onImageError,
  onUploadSuccess,
  isVideo,
}: MediaGalleryProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
  const [activeDesignCode, setActiveDesignCode] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  
  const handleSelectOption = (option: { label: string; designCode: string }) => {
    setActiveDesignCode(option.designCode);
    setActiveLabel(option.label);
    setIsSelectionDialogOpen(false);
    
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const targetDesignCode = activeDesignCode || uploadConfig?.designCode;
    if (!files || files.length === 0 || !targetDesignCode) return;

    const fileArray = Array.from(files) as File[];
    setSelectedFiles(fileArray);

    const urls = fileArray.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setIsDialogOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelUpload = () => {
    setIsDialogOpen(false);
    setIsSelectionDialogOpen(false);
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setActiveDesignCode(null);
    setActiveLabel(null);
  };

  const handleConfirmUpload = async () => {
    const targetDesignCode = activeDesignCode || uploadConfig?.designCode;
    if (selectedFiles.length === 0 || !targetDesignCode) return;

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append("files", file);
    });

    try {
      setUploading(true);
      const endpoint = uploadConfig.uploadEndpoint || `/files/upload-design-images-multiple?designCode=${targetDesignCode}`;
      await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await onUploadSuccess?.();
      handleCancelUpload();
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <>
      <div className="flex items-center justify-between px-8 py-6 border-b border-primary-50 bg-white sticky top-0 z-20">
        <div>
          <h3 className="text-lg font-black text-secondary-900 uppercase tracking-tight flex items-center gap-2">
            Thư viện
            {uploadConfig?.designCode && (
              <span className="bg-primary-50 text-secondary-900 text-[10px] px-2 py-1 rounded-full tracking-widest uppercase">
                {uploadConfig.designCode}
              </span>
            )}
          </h3>
          <p className="text-xs text-primary-300 font-bold mt-1">Tổng cộng {validPreviewList.length} tệp tin</p>
        </div>
        <div className="flex items-center gap-3">
          {uploadConfig?.showUpload && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={uploading}
                className="h-10 px-4 border-primary-100 font-bold text-xs uppercase tracking-widest hover:bg-secondary-900 hover:text-white transition-all flex items-center gap-2"
                onClick={() => {
                  if (uploadConfig.uploadOptions && uploadConfig.uploadOptions.length > 1) {
                    setIsSelectionDialogOpen(true);
                  } else {
                    setActiveDesignCode(uploadConfig.designCode || null);
                    setActiveLabel(null);
                    fileInputRef.current?.click();
                  }
                }}
              >
                {uploading ? (
                  <CircleNotch size={16} className="animate-spin" />
                ) : (
                  <UploadSimple size={16} />
                )}
                Tải lên
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
            </>
          )}
          {/* <Button variant="outline" disabled size="sm" className="h-10 px-4 border-primary-100 font-bold text-xs uppercase tracking-widest hover:bg-secondary-900 hover:text-white transition-all" onClick={() => onDownloadAll(validPreviewList)}>
            <DownloadSimple size={16} className="mr-2" />Tải về tất cả
          </Button> */}
          <Button variant="ghost" size="icon" className="h-10 w-10 bg-primary-50 text-secondary-900 rounded-full hover:bg-red-50 hover:text-red-500" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 pt-4">
        {validPreviewList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-primary-300 gap-2">
            <UploadSimple size={48} weight="thin" />
            <p className="text-sm font-bold">Chưa có tệp tin nào</p>
            {uploadConfig?.showUpload && (
              <p className="text-xs">Nhấn "Tải lên" để thêm tệp tin mới</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {validPreviewList.map((url, i) => {
              const isVid = isVideo(url);
              const isHeicImg = !!url.match(/\.(heic|heif)(?:\?|$)/i);
            return (
              <div key={i} className="group relative aspect-square overflow-hidden bg-primary-50 border border-primary-100 hover:border-secondary-900 transition-all duration-500 cursor-pointer" onClick={() => onSelectMedia(url)}>
                {isVid ? (
                  <video src={url} className="h-full w-full object-cover" controls={false} muted preload="metadata"
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                  />
                ) : (
                  <img src={isHeicImg ? `/files/cloudflare-transform?url=${encodeURIComponent(url)}` : url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Media ${i}`} loading="lazy" onError={() => onImageError(url)} />
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
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCancelUpload()}>
        <DialogContent className="w-[90%] sm:max-w-2xl gap-0 bg-white border-none shadow-2xl p-0 rounded-2xl overflow-hidden" showCloseButton={false}>
          <DialogHeader className="px-6 py-4 bg-primary-50/50 border-b border-primary-50">
            <DialogTitle className="text-secondary-900 font-black tracking-tight flex items-center justify-between">
              Xác nhận tải lên
              <span className="bg-secondary-900 text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-widest">
                {activeLabel ? `${activeLabel} - ${activeDesignCode}` : (activeDesignCode || uploadConfig?.designCode)}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            <p className="text-sm text-secondary-600 font-medium mb-4">
              Bạn có chắc chắn muốn tải lên <span className="font-bold text-secondary-900">{selectedFiles.length} tệp</span> không?
            </p>
            <div className="grid grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {previewUrls.map((url, idx) => {
                const fileName = selectedFiles[idx].name;
                const isVid = isVideo(fileName);
                const isHeicFile = !!fileName.match(/\.(heic|heif)(?:\?|$)/i);
                return (
                  <div key={idx} className="relative aspect-square overflow-hidden border border-primary-100 shadow-sm rounded-lg bg-primary-50">
                    {isVid ? (
                      <div className="h-full w-full bg-secondary-900 flex items-center justify-center relative group">
                        <video src={url} className="h-full w-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle size={24} weight="fill" className="text-white/80" />
                        </div>
                      </div>
                    ) : isHeicFile ? (
                      <div className="h-full w-full bg-primary-50 flex items-center justify-center flex-col">
                        <span className="text-[12px] font-black text-primary-300">HEIC</span>
                      </div>
                    ) : (
                      <img src={url} className="h-full w-full object-cover" alt="Preview" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter className="px-6 py-4 m-0 bg-primary-50/30 border-t border-primary-50">
            <div className="flex w-full justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelUpload}
                disabled={uploading}
                className="border-primary-100 font-bold text-xs rounded-full px-6"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmUpload}
                disabled={uploading}
                className="bg-secondary-900 text-white hover:bg-secondary-800 font-bold text-xs rounded-full px-6"
              >
                {uploading ? (
                  <>
                    <CircleNotch size={14} className="animate-spin mr-2" weight="bold" />
                    Đang tải...
                  </>
                ) : (
                  "Xác nhận"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSelectionDialogOpen} onOpenChange={(open) => !open && setIsSelectionDialogOpen(false)}>
        <DialogContent className="w-full max-w-sm gap-4 bg-white border-none shadow-2xl p-0 rounded-none overflow-hidden" showCloseButton={true}>
          <DialogHeader className="px-4 py-4 bg-primary-50/50 border-b border-primary-50">
            <DialogTitle className="text-secondary-900 font-black tracking-tight text-xs uppercase">
              Chọn nhẫn cần tải lên tệp
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-2">
            {uploadConfig?.uploadOptions?.map((option, idx) => (
              <Button
                key={idx}
                onClick={() => handleSelectOption(option)}
                className="w-full flex justify-between items-center bg-primary-50 hover:bg-secondary-900 hover:text-white text-secondary-900 font-bold text-xs h-12 rounded-none px-4 border border-primary-100 transition-all duration-300"
              >
                <span>{option.label}</span>
                <span className="text-[10px] font-black uppercase font-mono tracking-wider opacity-80">
                  {option.designCode}
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}