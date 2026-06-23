import { useState, use } from "react";
import { ArrowCounterClockwise, ImageSquare } from "@phosphor-icons/react";
import { MobileProgressBar } from "./MobileProgressBar";
import { ResultCanvas } from "./ResultCanvas";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { TryOnContext } from "../context/TryOnContext";

export function MobileStep4() {
  const context = use(TryOnContext);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  if (!context) return null;

  const { state, actions } = context;
  const {
    isGenerating,
    generationError,
    selectedRing,
    maxStep,
  } = state;

  const {
    handleStepClick,
    handleTryOn,
    handleComplete,
  } = actions;

  return (
    <div className="grow flex flex-col justify-between min-h-0 overflow-hidden">
      {/* Progress Bar & Info */}
      <div className="space-y-3 mb-4">
        <MobileProgressBar activeCount={4} onStepClick={handleStepClick} disabled={isGenerating} maxStep={maxStep} />
        <div className="text-start">
          <h4 className="text-primary-900 font-bold text-base leading-tight">
            Hoàn tất tạo ảnh
          </h4>
        </div>
      </div>

      {/* Middle Interactive Canvas */}
      <div className="flex-1 min-h-0 w-full relative">
        <ResultCanvas
          onViewProduct={selectedRing ? () => setIsBottomSheetOpen(true) : undefined}
        />
      </div>


      {/* Bottom Actions for Step 4 */}
      {!isGenerating && !generationError && (
        <div className="flex gap-3 pt-4 shrink-0">
          <Button
            onClick={() => handleTryOn({ force: true })}
            variant="outline-light"
            className="w-full h-11 tracking-wider"
          >
            <span>Thử lại</span>
            <ArrowCounterClockwise size={18} />
          </Button>
          <Button
            onClick={handleComplete}
            variant="secondary"
            className="w-full h-11 tracking-wider font-normal"
          >
            Hoàn tất
          </Button>
        </div>
      )}

      <BottomSheet
        open={isBottomSheetOpen}
        onOpenChange={setIsBottomSheetOpen}
        title="Thông tin sản phẩm đã chọn"
        contentClassName="pb-6"
      >
        {selectedRing ? (
          <div className="flex flex-col items-center gap-4 py-2">
            {/* Image */}
            <div className="overflow-hidden flex items-center justify-center">
              {selectedRing.thumbnails?.[0]?.url ? (
                <img
                  src={selectedRing.thumbnails?.[0]?.url}
                  className="w-full h-full object-cover"
                  alt={selectedRing.title}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-xs text-slate-400 gap-1.5 select-none">
                  <ImageSquare size={36} className="text-slate-400" />
                  <span>No Image</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="w-full text-center space-y-1 px-4">
              <h4 className="text-secondary-900 font-bold text-sm leading-snug">
                {selectedRing.type || "Loại nhẫn"} -  {selectedRing.attributes?.designCode || "--"}
              </h4>
            </div>
          </div>
        ) : (
          <p className="text-xs text-center text-primary-400 py-6">
            Chưa có sản phẩm nào được chọn
          </p>
        )}
      </BottomSheet>
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
        </div>
      </div>
    </div>
  );
}

export function DesktopStep4Bottom() {
  const context = use(TryOnContext);
  if (!context) return null;

  const { state, actions } = context;
  const {
    selectedRing,
    isGenerating,
    selectedGeneratedImage,
    generationError,
  } = state;

  const {
    handleTryOn,
    handleComplete,
  } = actions;

  return (
    <div className="flex flex-col gap-4">
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

      {/* Desktop Actions */}
      {!isGenerating && !generationError && (
        <div className="flex gap-3 mt-2">
          <Button
            onClick={() => handleTryOn({ force: true })}
            variant="outline-light"
            className="w-full h-11 tracking-wider"
          >
            <span>Thử lại</span>
            <ArrowCounterClockwise size={18} />
          </Button>
          <Button
            onClick={handleComplete}
            variant="secondary"
            className="w-full h-11 tracking-wider font-normal"
          >
            Hoàn tất
          </Button>
        </div>
      )}
    </div>
  );
}
