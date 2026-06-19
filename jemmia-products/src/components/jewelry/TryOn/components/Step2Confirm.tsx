import React from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  ArrowCounterClockwise,
  LockSimple,
  Question,
  ArrowsOutCardinal,
  ArrowsOutSimple,
  CornersOutIcon,
} from "@phosphor-icons/react";
import { MobileProgressBar } from "./MobileProgressBar";

interface Step2ConfirmProps {
  uploadedImage: string | null;
  setStep: (s: number) => void;
  setUploadedImage: (img: string | null) => void;
  startCamera: () => void;
  onGeneratePreview: () => void;
}

interface MobileStep2Props extends Step2ConfirmProps {
  onOpenGuide: () => void;
  ringContainerRef: React.RefObject<HTMLDivElement | null>;
  handleContainerTouchStart: (e: React.TouchEvent) => void;
  handleContainerTouchMove: (e: React.TouchEvent) => void;
  handleContainerTouchEnd: () => void;
  handleContainerMouseDown: (e: React.MouseEvent) => void;
  handleContainerMouseMove: (e: React.MouseEvent) => void;
  handleContainerMouseUp: () => void;
  imageScale: number;
  imageTranslate: number[];
  imageRotation: number;
  setImageRotation: (r: number) => void;
  redBox: { x: number; y: number; w: number; h: number };
  resetZoom: () => void;
  maxStep?: number;
  showResumePopup?: boolean;
}

export function MobileStep2({
  uploadedImage,
  showResumePopup,
  setStep,
  setUploadedImage,
  startCamera,
  ringContainerRef,
  handleContainerTouchStart,
  handleContainerTouchMove,
  handleContainerTouchEnd,
  handleContainerMouseDown,
  handleContainerMouseMove,
  handleContainerMouseUp,
  imageScale,
  imageTranslate,
  imageRotation,
  setImageRotation,
  redBox,
  resetZoom,
  onOpenGuide,
  maxStep,
  onGeneratePreview,
}: MobileStep2Props) {
  return (
    <div className="grow flex flex-col justify-between gap-3 min-h-0">
      {/* Progress Bar & Info */}
      <div className="space-y-3">
        <MobileProgressBar activeCount={2} onStepClick={setStep} maxStep={maxStep} />
        <div className="space-y-1 text-left">
          <h4 className="text-primary-900 font-bold text-base leading-tight">
            Xác nhận ảnh của bạn
          </h4>
        </div>
      </div>

      {/* Middle Preview Canvas */}
      <div className="grow flex items-center justify-center py-1 min-h-0">
        <div
          ref={ringContainerRef}
          className="h-full w-full relative flex-col rounded-lg  overflow-hidden flex items-center justify-center select-none mx-auto animate-in fade-in zoom-in-95 duration-200"
          onTouchStart={handleContainerTouchStart}
          onTouchMove={handleContainerTouchMove}
          onTouchEnd={handleContainerTouchEnd}
          onTouchCancel={handleContainerTouchEnd}
          onMouseDown={handleContainerMouseDown}
          onMouseMove={handleContainerMouseMove}
          onMouseUp={handleContainerMouseUp}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            cursor: "grab",
            touchAction: "none",
          }}
        >
          {/* Main Transformed Image */}
          {uploadedImage && (
            <div
              style={{
                width: "100%",
                height: "100%",
                transform: `translate(${imageTranslate[0]}px, ${imageTranslate[1]}px) scale(${imageScale}) rotate(${imageRotation}deg)`,
                transformOrigin: "center center",
              }}
              className="flex items-center justify-center pointer-events-none select-none"
            >
              <img
                src={uploadedImage}
                className="w-full h-full object-cover"
                alt="Hand Preview"
                draggable={false}
              />
            </div>
          )}

          {/* Fixed, Non-editable Centered Red Box */}
          {!showResumePopup && redBox && (
            <div
              style={{
                position: "absolute",
                left: `${redBox.x}%`,
                top: `${redBox.y}%`,
                width: `${redBox.w}%`,
                height: `${redBox.h}%`,
                border: "2px solid rgb(239, 68, 68)",
                backgroundColor: "rgba(239, 68, 68, 0.5)",
                boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.5)",
                pointerEvents: "none",
                zIndex: 40,
              }}
            />
          )}

          {/* Helper Gesture Guidance Overlay */}
          {!showResumePopup && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-[2px] text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-full select-none pointer-events-none z-40">
              Đặt vùng đỏ tại vị trí thử nhẫn
            </div>
          )}

          {/* Guide info button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenGuide();
            }}
            className="absolute bottom-3 right-3 z-[100] w-10 h-10 rounded-full bg-white/95 hover:bg-white text-black flex items-center justify-center cursor-pointer border border-primary-100 shadow-md transition-all active:scale-95"
            title="Hướng dẫn cử chỉ"
          >
            <Question size={20} />
          </button>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setStep(1);
            setUploadedImage(null);
            startCamera();
          }}
          className="w-full h-11 rounded-none border-primary-200 text-primary-900 bg-white hover:bg-primary-50 tracking-wider"
        >
          Chụp lại
          <ArrowCounterClockwise size={18} />
        </Button>
        <Button
          onClick={() => setStep(3)}
          disabled={!uploadedImage}
          className="w-full bg-secondary-800 hover:bg-secondary-700 text-white font-normal text-sm h-11 flex items-center justify-center gap-2 rounded-none cursor-pointer border-none shadow-none tracking-wider"
        >
          Xác nhận
          <Check size={18} weight="bold" />
        </Button>
      </div>
    </div>
  );
}

export function DesktopStep2Left() {
  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <h4 className="text-primary-900 font-bold text-xl md:text-2xl tracking-tight leading-tight">
          Xác nhận ảnh của bạn
        </h4>
      </div>
      <div className="pt-2">
        <ul className="space-y-5 text-sm font-medium text-primary-600">
          <li className="flex items-start gap-3">
            <div className="text-secondary-700 shrink-0 mt-0.5">
              <CornersOutIcon size={20} weight="regular" />
            </div>
            <span className="leading-relaxed text-slate-800">
              Đặt vùng đỏ tại vị trí thử nhẫn
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

interface DesktopStep2BottomProps extends Step2ConfirmProps {}

export function DesktopStep2Bottom({
  uploadedImage,
  setStep,
  setUploadedImage,
  startCamera,
}: DesktopStep2BottomProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <Button
        onClick={() => setStep(3)}
        disabled={!uploadedImage}
        className="w-full bg-secondary-800 hover:bg-secondary-700 text-white font-semibold text-sm h-12 flex items-center justify-center gap-2 rounded-none cursor-pointer border-none shadow-none"
      >
        Dùng hình ảnh này
        <Check size={16} weight="bold" />
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          setStep(1);
          setUploadedImage(null);
          startCamera();
        }}
        className="w-full h-12 rounded-none border-primary-200 text-primary-900 bg-white hover:bg-primary-50 tracking-wider hover:text-primary-500"
      >
        Chụp lại
        <ArrowCounterClockwise size={18} />
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-primary-400 text-xs mt-1 select-none">
        <LockSimple size={14} weight="regular" />
        <span>Ảnh của bạn là riêng tư và được bảo vệ</span>
      </div>
    </div>
  );
}
