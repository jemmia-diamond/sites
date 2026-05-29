import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Eye,
  X,
  UploadSimple,
  CircleNotch,
  PlayCircle,
  DownloadSimple,
  Checks,
  Copy,
} from "@phosphor-icons/react";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { API_BASE_URL } from "../../../config";

export interface MediaGalleryProps {
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

export function MediaGallery({
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
  const [activeDesignCode, setActiveDesignCode] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [selectedMediaUrls, setSelectedMediaUrls] = useState<string[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copyingUrl, setCopyingUrl] = useState<string | null>(null);

  const handleToggleSelect = (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedMediaUrls(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

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

  const handleToggleSelectAll = () => {
    if (selectedMediaUrls.length === validPreviewList.length) {
      setSelectedMediaUrls([]);
    } else {
      setSelectedMediaUrls([...validPreviewList]);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedMediaUrls.length === 0) return;

    setIsDownloading(true);
    try {
      if (selectedMediaUrls.length === 1) {
        // Tải 1 file trực tiếp
        const url = selectedMediaUrls[0];
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
          saveAs(blob, fileName);
        } catch (fetchError) {
          console.warn("Fetch failed, falling back to window.open", fetchError);
          window.open(url, '_blank');
        }
      } else {
        // Tải nhiều file -> Nén thành file ZIP
        const zip = new JSZip();

        const fetchPromises = selectedMediaUrls.map(async (url, index) => {
          let fileName = url.split('/').pop() || `media_${index}`;
          if (fileName.includes('?')) {
            fileName = fileName.split('?')[0];
          }
          if (!fileName.includes('.')) {
            const ext = isVideo(url) ? 'mp4' : 'jpg';
            fileName = `media_${index}.${ext}`;
          }

          const cacheBusterUrl = url + (url.includes('?') ? '&' : '?') + 'cb=' + new Date().getTime();
          try {
            const response = await fetch(cacheBusterUrl, {
              method: 'GET',
              mode: 'cors',
              cache: 'no-store'
            });
            if (!response.ok) throw new Error('Fetch failed');
            const blob = await response.blob();
            zip.file(`${index + 1}_${fileName}`, blob);
          } catch (err) {
            console.error("Lỗi khi tải file vào zip:", url, err);
          }
        });

        await Promise.all(fetchPromises);

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `Jemmia_Media_${Date.now()}.zip`);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý tải file:", error);
    } finally {
      setIsDownloading(false);
    }
  };

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

  const allSelected =
    validPreviewList.length > 0 && selectedMediaUrls.length === validPreviewList.length;
  const hasActions = validPreviewList.length > 0 || uploadConfig?.showUpload;

  const openFilePicker = () => {
    if (uploadConfig?.uploadOptions && uploadConfig.uploadOptions.length > 1) {
      setIsSelectionDialogOpen(true);
    } else {
      setActiveDesignCode(uploadConfig?.designCode || null);
      setActiveLabel(null);
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Mobile header */}
      <div className="xl:hidden sticky top-0 z-20 bg-secondary-800 shrink-0">
        <div className="flex items-start justify-between gap-2 px-3 pt-3 pb-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">
              Thư viện
            </h3>
            <p className="mt-1 text-[10px] text-white/60 font-medium leading-snug truncate">
              {uploadConfig?.designCode && (
                <span className="text-white/90 font-bold">{uploadConfig.designCode}</span>
              )}
              {uploadConfig?.designCode && " · "}
              {validPreviewList.length} tệp
              {selectedMediaUrls.length > 0 && (
                <span className="text-white/80"> · đã chọn {selectedMediaUrls.length}</span>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 bg-white/10 text-white rounded-full hover:bg-red-500 hover:text-white"
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        </div>

        {hasActions && (
          <div className="flex items-center gap-1.5 px-3 pb-2.5 overflow-x-auto no-scrollbar">
            {validPreviewList.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleSelectAll}
                  className="h-7 shrink-0 px-2.5 border-white/20 bg-transparent text-white font-bold text-[10px] hover:bg-white hover:text-secondary-700 flex items-center gap-1"
                >
                  <Checks size={13} weight="bold" />
                  {allSelected ? "Bỏ chọn" : "Chọn hết"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSelected}
                  disabled={isDownloading || selectedMediaUrls.length === 0}
                  className="h-7 shrink-0 px-2.5 border-white bg-white text-secondary-700 font-bold text-[10px] hover:bg-secondary-700 hover:text-white flex items-center gap-1 disabled:opacity-40"
                >
                  {isDownloading ? (
                    <CircleNotch size={13} className="animate-spin" />
                  ) : (
                    <DownloadSimple size={13} weight="bold" />
                  )}
                  Tải ({selectedMediaUrls.length})
                </Button>
              </>
            )}
            {uploadConfig?.showUpload && (
              <Button
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={openFilePicker}
                className="h-7 shrink-0 px-2.5 border-white/20 bg-transparent text-white font-bold text-[10px] hover:bg-white hover:text-secondary-700 flex items-center gap-1 disabled:opacity-40"
              >
                {uploading ? (
                  <CircleNotch size={13} className="animate-spin" />
                ) : (
                  <UploadSimple size={13} weight="bold" />
                )}
                Tải lên
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Desktop header */}
      <div className="hidden xl:flex items-center justify-between px-8 py-6 bg-secondary-800 sticky top-0 z-20 gap-4">
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            Thư viện
            {uploadConfig?.designCode && (
              <span className="bg-white/20 text-white text-[10px] px-2 py-1 rounded-full tracking-widest uppercase">
                {uploadConfig.designCode}
              </span>
            )}
          </h3>
          <p className="text-xs text-white/70 font-bold mt-1">Tổng cộng {validPreviewList.length} tệp tin</p>
        </div>
        <div className="flex items-center gap-3">
          {validPreviewList.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleSelectAll}
                className="h-10 px-4 border-white/20 bg-transparent text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-secondary-700 transition-all flex items-center gap-2"
              >
                <Checks size={14} />
                {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSelected}
                disabled={isDownloading || selectedMediaUrls.length === 0}
                className="h-10 px-4 border-white font-bold text-xs uppercase tracking-widest bg-white text-secondary-700 hover:bg-secondary-700 hover:text-white transition-all flex items-center gap-2 disabled:bg-white/50 disabled:text-secondary-700/50 disabled:border-transparent"
              >
                {isDownloading ? (
                  <CircleNotch size={14} className="animate-spin" />
                ) : (
                  <DownloadSimple size={14} />
                )}
                Tải về ({selectedMediaUrls.length})
              </Button>
            </>
          )}
          {uploadConfig?.showUpload && (
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              className="h-10 px-4 border-white/20 bg-transparent text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-secondary-700 transition-all flex items-center gap-2 disabled:bg-transparent disabled:text-white/30 disabled:border-white/10"
              onClick={openFilePicker}
            >
              {uploading ? (
                <CircleNotch size={14} className="animate-spin" />
              ) : (
                <UploadSimple size={14} />
              )}
              Tải lên
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-white/10 text-white rounded-full hover:bg-red-500 hover:text-white transition-all"
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
      />
      <div className="flex-1 overflow-y-auto p-4 xl:p-8 pt-2 xl:pt-4">
        {validPreviewList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-primary-300 gap-2">
            <UploadSimple size={40} xl:size={48} weight="thin" />
            <p className="text-sm font-bold">Chưa có tệp tin nào</p>
            {uploadConfig?.showUpload && (
              <p className="text-xs">Nhấn "Tải lên" để thêm tệp tin mới</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 xl:gap-4">
            {validPreviewList.map((url, i) => {
              const isVid = isVideo(url);
              const isHeicImg = !!url.match(/\.(heic|heif)(?:\?|$)/i);
              const isSelected = selectedMediaUrls.includes(url);
              return (
                <div
                  key={i}
                  className={`group relative aspect-square overflow-hidden transition-all duration-500 cursor-pointer ${isSelected ? 'border-secondary-900 ring-2 ring-secondary-900/20' : 'border-primary-100 hover:border-secondary-900'
                    }`}
                  onClick={() => onSelectMedia(url)}
                >
                  {/* Checkbox Overlay */}
                  <div
                    className="absolute top-2 right-2 z-30 transition-opacity duration-300 opacity-100"
                    onClick={(e) => handleToggleSelect(url, e)}
                  >
                    <div className={`w-5 h-5 xl:w-6 xl:h-6 rounded-full flex items-center justify-center border-2 transition-all ${isSelected
                      ? 'bg-secondary-700 border-secondary-700 text-white'
                      : 'bg-white border-primary-200 text-transparent'
                      }`}>
                      {isSelected && <Checks size={12} xl:size={14} weight="bold" />}
                    </div>
                  </div>

                  {isVid ? (
                    <video src={url} className="h-full w-full object-cover" controls={false} muted preload="metadata"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                    />
                  ) : (
                    <img src={isHeicImg ? `${API_BASE_URL}/files/cloudflare-transform?url=${encodeURIComponent(url)}` : url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Media ${i}`} loading="lazy" onError={() => onImageError(url)} />
                  )}
                  {isVid && (
                    <div className="absolute top-2 left-2 bg-secondary-900/80 px-1.5 py-1 rounded-full flex items-center gap-1 z-10 pointer-events-none">
                      <div className="w-1 h-1 xl:w-1.5 xl:h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[8px] xl:text-[10px] font-black text-white uppercase tracking-wider">Video</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-secondary-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <div className="h-10 w-10 xl:h-12 xl:w-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-500">
                      {isVid ? (
                        <div className="w-0 h-0 border-t-[6px] xl:border-t-[8px] border-t-transparent border-l-[10px] xl:border-l-[12px] border-l-white border-b-[6px] xl:border-b-[8px] border-b-transparent ml-0.5" />
                      ) : (
                        <Eye size={20} xl:size={24} className="text-white" />
                      )}
                    </div>
                  </div>
                  {!isVid && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyImage(url, e); }}
                      disabled={copyingUrl === url}
                      className="absolute bottom-2 right-2 xl:bottom-3 xl:right-3 h-8 w-8 xl:h-9 xl:w-9 bg-white/90 hover:bg-secondary-900 rounded-full flex items-center justify-center border border-primary-200 hover:border-transparent z-30 transition-colors duration-200 group/copy disabled:opacity-50 shadow-sm"
                      title="Copy image"
                    >
                      {copyingUrl === url ? (
                        <CircleNotch size={16} xl:size={18} className="text-secondary-900 animate-spin group-hover/copy:text-white" />
                      ) : copiedUrl === url ? (
                        <Checks size={16} xl:size={18} className="text-green-600" />
                      ) : (
                        <Copy size={16} xl:size={18} className="text-secondary-900 group-hover/copy:text-white" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCancelUpload()}>
        <DialogContent className="w-[95%] md:w-[90%] md:max-w-2xl gap-0 bg-white border-none shadow-2xl p-0 rounded-none! overflow-hidden" showCloseButton={false}>
          <DialogHeader className="px-4 md:px-6 py-3 md:py-4 bg-primary-50/50 border-b border-primary-50">
            <DialogTitle className="text-sm md:text-base text-secondary-900 font-black tracking-tight flex items-center justify-between">
              Xác nhận tải lên
              <span className="bg-secondary-900 text-white text-[9px] md:text-[10px] px-2 py-1 rounded-full uppercase tracking-widest">
                {activeLabel ? `${activeLabel} - ${activeDesignCode}` : (activeDesignCode || uploadConfig?.designCode)}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 md:px-6 py-3 md:py-4">
            <p className="text-xs md:text-sm text-secondary-600 font-medium mb-3 md:mb-4">
              Bạn có chắc chắn muốn tải lên <span className="font-bold text-secondary-900">{selectedFiles.length} tệp</span> không?
            </p>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1 md:pr-2">
              {previewUrls.map((url, idx) => {
                const fileName = selectedFiles[idx].name;
                const isVid = isVideo(fileName);
                const isHeicFile = !!fileName.match(/\.(heic|heif)(?:\?|$)/i);
                return (
                  <div key={idx} className="relative aspect-square overflow-hidden border border-primary-100 shadow-sm rounded-none bg-primary-50">
                    {isVid ? (
                      <div className="h-full w-full bg-secondary-900 flex items-center justify-center relative group">
                        <video src={url} className="h-full w-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle size={20} md:size={24} weight="fill" className="text-white/80" />
                        </div>
                      </div>
                    ) : isHeicFile ? (
                      <div className="h-full w-full bg-primary-50 flex items-center justify-center flex-col">
                        <span className="text-[10px] md:text-[12px] font-black text-primary-300">HEIC</span>
                      </div>
                    ) : (
                      <img src={url} className="h-full w-full object-cover" alt="Preview" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter className="px-4 md:px-6 py-3 md:py-4 m-0 bg-primary-50/30 border-t border-primary-50">
            <div className="flex w-full justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelUpload}
                disabled={uploading}
                className="border-primary-100 font-bold text-xs rounded-full px-4 md:px-6 h-8 md:h-auto"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmUpload}
                disabled={uploading}
                className="bg-secondary-900 text-white hover:bg-secondary-800 font-bold text-xs rounded-full px-4 md:px-6 h-8 md:h-auto"
              >
                {uploading ? (
                  <>
                    <CircleNotch size={12} md:size={14} className="animate-spin mr-1 md:mr-2" weight="bold" />
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
        <DialogContent className="w-[95%] md:w-full max-w-sm gap-4 bg-white border-none shadow-2xl p-0 rounded-none overflow-hidden" showCloseButton={true}>
          <DialogHeader className="px-4 py-3 md:py-4 bg-primary-50/50 border-b border-primary-50">
            <DialogTitle className="text-secondary-900 font-black tracking-tight text-[10px] md:text-xs uppercase">
              Chọn nhẫn cần tải lên tệp
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-3 md:pb-4 flex flex-col gap-2">
            {uploadConfig?.uploadOptions?.map((option, idx) => (
              <Button
                key={idx}
                onClick={() => handleSelectOption(option)}
                className="w-full flex justify-between items-center bg-primary-50 hover:bg-secondary-900 hover:text-white text-secondary-900 font-bold text-xs h-10 md:h-12 rounded-none px-4 border border-primary-100 transition-all duration-300"
              >
                <span className="text-xs md:text-sm">{option.label}</span>
                <span className="text-[9px] md:text-[10px] font-black uppercase font-mono tracking-wider opacity-80">
                  {option.designCode}
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}
