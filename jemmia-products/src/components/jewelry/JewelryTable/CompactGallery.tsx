import React from "react";
import { Camera, Plus, CircleNotch, PlayCircle, GenderMale, GenderFemale } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import axios from "axios";
import { cn } from "@/lib/utils";

interface CompactGalleryProps {
  images: string[];
  showUpload?: boolean;
  brokenImages: Set<string>;
  onImageError: (url: string) => void;
  onPreview: (images: string[], index: number, config?: any) => void;
  designCode?: string;
  onUploadSuccess?: () => void | Promise<void>;
  uploadEndpoint?: string;
  displayCount?: number;
  uploadOptions?: { label: string; designCode: string }[];
}

export function CompactGallery({
  images,
  showUpload = false,
  brokenImages,
  onImageError,
  onPreview,
  designCode,
  onUploadSuccess,
  uploadEndpoint,
  displayCount = 4,
  uploadOptions,
}: CompactGalleryProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = React.useState(false);
  const [activeDesignCode, setActiveDesignCode] = React.useState<string | null>(null);
  const [activeLabel, setActiveLabel] = React.useState<string | null>(null);

  const validImages = images.filter((url) => !brokenImages.has(url));

  const items = validImages.slice(0, displayCount);
  const totalCount = validImages.length;

  const isVideo = (url: string) =>
    !!url.match(/\.(mp4|webm|ogg|mov)(?:\?|$)|^blob:|^data:video/i);

  const isHeic = (url: string) =>
    !!url.match(/\.(heic|heif)(?:\?|$)/i);

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
    const targetDesignCode = activeDesignCode || designCode;
    if (!files || files.length === 0 || !targetDesignCode) return;

    const fileArray = Array.from(files) as File[];
    setSelectedFiles(fileArray);

    // Generate object URLs for preview
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
    const targetDesignCode = activeDesignCode || designCode;
    if (selectedFiles.length === 0 || !targetDesignCode) return;

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append("files", file);
    });

    try {
      setUploading(true);
      const endpoint = uploadEndpoint || `/files/upload-design-images-multiple?designCode=${targetDesignCode}`;
      await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await onUploadSuccess?.();
      handleCancelUpload(); // Close dialog and clean up on success
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  // Cleanup object urls on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);
  return (
    <>
      <div className="flex items-center gap-2">
        <div style={{ width: `${43 * displayCount}px` }}>
          {validImages.length === 0 ? (
            <div 
              className="h-10 w-full border border-dashed border-primary-100 flex items-center justify-center gap-2 bg-white cursor-pointer hover:bg-primary-50/50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (showUpload) {
                  onPreview([], 0, { showUpload, designCode, uploadEndpoint, uploadOptions });
                }
              }}
            >
              <Camera size={14} className="text-primary-200" />

              <span className="text-[11px] text-primary-300 whitespace-nowrap">
                Không có dữ liệu
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {items.map((url, idx) => {
                const isVid = isVideo(url);
                const isHeicImg = isHeic(url);

                return (
                  <div
                    key={idx}
                    className="relative h-10 w-10 overflow-hidden cursor-pointer bg-white border border-primary-50 shadow-sm hover:z-10 transition-all hover:scale-110 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(validImages, idx, { showUpload, designCode, uploadEndpoint, uploadOptions });
                    }}
                  >
                    {isVid ? (
                      <div className="h-full w-full bg-secondary-900 flex items-center justify-center relative">
                        <video
                          src={url}
                          className="h-full w-full object-cover opacity-50"
                        />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={isHeicImg ? `/files/cloudflare-transform?url=${encodeURIComponent(url)}` : url}
                        className="h-full w-full object-cover"
                        alt=""
                        onError={() => onImageError(url)}
                      />
                    )}

                    {idx === displayCount - 1 &&
                      totalCount > displayCount && (
                        <div 
                          className="absolute inset-0 bg-secondary-900/70 flex items-center justify-center z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreview(validImages, idx, { showUpload, designCode, uploadEndpoint, uploadOptions });
                          }}
                        >
                          <span className="text-[9px] text-white font-bold">
                            +{totalCount - displayCount}
                          </span>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showUpload && (
          <Button
            variant="ghost"
            size="icon"
            disabled={uploading}
            className="h-6 w-6 shrink-0 bg-slate-50 text-primary-300 hover:text-secondary-900 hover:bg-secondary-50 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              if (uploadOptions && uploadOptions.length > 1) {
                setIsSelectionDialogOpen(true);
              } else {
                setActiveDesignCode(designCode || null);
                setActiveLabel(null);
                fileInputRef.current?.click();
              }
            }}
          >
            {uploading ? (
              <CircleNotch size={12} weight="bold" className="animate-spin" />
            ) : (
              <Plus size={12} weight="bold" />
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCancelUpload()}>
        <DialogContent className="w-full gap-2 bg-white border-none shadow-2xl p-0 rounded-none overflow-hidden" showCloseButton={false}>
          <DialogHeader className="px-4 py-4 bg-primary-50/50 border-b border-primary-50">
            <DialogTitle className="text-secondary-900 font-black tracking-tight flex items-center justify-between">
              Xác nhận tải lên
              <span className="bg-secondary-900 text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-widest">
                {activeLabel ? `${activeLabel} - ${activeDesignCode}` : (activeDesignCode || designCode)}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 py-2">
            <p className="text-sm text-secondary-600 font-medium mb-4">
              Bạn có chắc chắn muốn tải lên <span className="font-bold text-secondary-900">{selectedFiles.length} tệp</span> không?
            </p>
            <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {previewUrls.map((url, idx) => {
                const fileName = selectedFiles[idx].name;
                const isVid = isVideo(fileName);
                const isHeicFile = isHeic(fileName);
                return (
                  <div key={idx} className="relative aspect-square overflow-hidden border border-primary-100 shadow-sm">
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
          <DialogFooter className="px-4 py-2 m-0 bg-primary-50/30 border-t border-primary-50">
            <div className="flex w-full justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelUpload}
                disabled={uploading}
                className="border-primary-100 font-bold text-xs"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmUpload}
                disabled={uploading}
                className="bg-secondary-900 text-white hover:bg-secondary-800 font-bold text-xs"
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
            {uploadOptions?.map((option, idx) => (
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