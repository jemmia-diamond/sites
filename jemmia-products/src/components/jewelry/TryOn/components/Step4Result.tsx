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
    handleResetAll,
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
            className="w-full h-11"
          >
            <span>Tạo lại ảnh này</span>
          </Button>
          <Button
            onClick={handleResetAll}
            variant="secondary"
            className="w-full h-11 text-sm font-normal"
          >
            Thử lại nhẫn
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
  const context = use(TryOnContext);
  if (!context) return null;

  const { state } = context;
  const { selectedRing } = state;
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {/* Selected Ring Card */}
        {selectedRing && (
          <div className="border border-primary-100 p-4 bg-white rounded relative w-full shadow-sm">
            {/* <span className="absolute top-3 left-3 bg-[#E6F4F2] text-secondary-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Nhẫn đã chọn
            </span> */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center w-1/3">
                <img
                  src={selectedRing.thumbnails?.[0]?.url}
                  className="h-auto w-full aspect-square object-cover"
                  alt={selectedRing.title}
                />
              </div>
              <div className="text-left">
                <h4 className="text-slate-700 font-medium text-base leading-snug">
                  {selectedRing.type || "Loại nhẫn"}
                </h4>
                <h4 className="text-slate-900 font-black text-base leading-snug">
                  {selectedRing.attributes?.designCode || "--"}
                </h4>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DesktopStep4Bottom() {
  const context = use(TryOnContext);
  if (!context) return null;

  const { state, actions } = context;
  const {
    isGenerating,
    generationError,
  } = state;

  const {
    handleTryOn,
    handleResetAll,
  } = actions;

  return (
    <div className="flex flex-col gap-4">
      {/* Desktop Actions */}
      {!isGenerating && !generationError && (
        <div className="flex flex-col gap-3 mt-2">
          <Button
            onClick={() => handleTryOn({ force: true })}
            variant="outline-light"
            className="w-full h-11 tracking-wider"
          >
            <span>Tạo lại ảnh này</span>
          </Button>
          <Button
            onClick={handleResetAll}
            variant="secondary"
            className="w-full h-11 tracking-wider font-normal"
          >
            Thử lại nhẫn
          </Button>
        </div>
      )}
    </div>
  );
}
