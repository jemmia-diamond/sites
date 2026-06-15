import { ArrowCounterClockwise, ImageSquare } from "@phosphor-icons/react";
import { ProductModel } from "../../../../types";
import { MobileProgressBar } from "./MobileProgressBar";
import { ResultCanvas } from "./ResultCanvas";

interface MobileStep4Props {
  isGenerating: boolean;
  uploadedImage: string | null;
  selectedGeneratedImage: string | null;
  generatedImages: string[];
  handleSelectGeneratedImage: (img: string | null) => void;
  handleDownload: () => void;
  setIsFullscreen: (f: boolean) => void;
  generationError?: string | null;
}

export function MobileStep4({
  isGenerating,
  uploadedImage,
  selectedGeneratedImage,
  generatedImages,
  handleSelectGeneratedImage,
  handleDownload,
  setIsFullscreen,
  generationError,
}: MobileStep4Props) {
  return (
    <div className="grow flex flex-col justify-between min-h-0 overflow-hidden">
      {/* Progress Bar & Info */}
      <div className="space-y-3 mb-4">
        <MobileProgressBar activeCount={4} />
        <div className="text-start">
          <h4 className="text-primary-900 font-bold text-base leading-tight">
            Hoàn tất tạo ảnh
          </h4>
          <p className="text-sm text-primary-600 leading-normal">
            AI đã xử lý xong và tạo hình ảnh nhẫn trên tay bạn
          </p>
        </div>
      </div>

      {/* Middle Interactive Canvas */}
      <div className="flex-1 min-h-0 w-full relative">
        <ResultCanvas
          isMobile={true}
          isGenerating={isGenerating}
          uploadedImage={uploadedImage}
          selectedGeneratedImage={selectedGeneratedImage}
          generatedImages={generatedImages}
          handleSelectGeneratedImage={handleSelectGeneratedImage}
          handleDownload={handleDownload}
          setIsFullscreen={setIsFullscreen}
          generationError={generationError}
        />
      </div>
    </div>
  );
}

export function DesktopStep4Left() {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="space-y-1">
          <h4 className="text-primary-900 font-bold text-lg leading-tight">
            Hoàn tất tạo ảnh
          </h4>
          <p className="text-xs text-primary-500 leading-normal">
            AI đã xử lý xong và tạo hình ảnh nhẫn trên tay bạn
          </p>
        </div>
      </div>
    </div>
  );
}

interface DesktopStep4BottomProps {
  selectedRing: ProductModel | null;
  isGenerating: boolean;
  selectedGeneratedImage: string | null;
}

export function DesktopStep4Bottom({
  selectedRing,
  isGenerating,
  selectedGeneratedImage,
}: DesktopStep4BottomProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Selected Ring Card */}
      {selectedRing && (
        <div className="border border-primary-100 p-4 bg-white rounded relative w-full shadow-sm">
          <span className="absolute top-3 left-3 bg-[#E6F4F2] text-secondary-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            Nhẫn đã chọn
          </span>
          <div className="flex items-center justify-center min-h-64 mb-3">
            {selectedRing.thumbnails?.[0]?.url ? (
              <img
                src={selectedRing.thumbnails?.[0]?.url}
                className="h-auto w-full min-h-64 aspect-square object-cover"
                alt={selectedRing.title}
              />
            ) : (
              <div className="min-h-64 w-full aspect-square flex flex-col items-center justify-center bg-slate-100 border-slate-300 text-xs text-slate-400 gap-2 select-none">
                <ImageSquare size={48} className="text-slate-400" />
                <span>No Image</span>
              </div>
            )}
          </div>
          <div className="space-y-3 text-left">
            <h4 className="text-secondary-900 font-black text-base leading-snug">
              {selectedRing.type || "Loại nhẫn"} -{" "}
              {selectedRing.attributes?.designCode || "--"}
            </h4>
          </div>
        </div>
      )}
    </div>
  );
}
