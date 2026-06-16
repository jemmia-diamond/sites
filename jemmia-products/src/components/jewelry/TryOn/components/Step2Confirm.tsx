import React from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  ArrowCounterClockwise,
  LockSimple,
  Question,
} from "@phosphor-icons/react";
import { MobileProgressBar } from "./MobileProgressBar";
import { MoveableRedBox } from "./MoveableRedBox";

interface Step2ConfirmProps {
  uploadedImage: string | null;
  setStep: (s: number) => void;
  setUploadedImage: (img: string | null) => void;
  startCamera: () => void;
}

interface MobileStep2Props extends Step2ConfirmProps {
  onOpenGuide: () => void;
  ringContainerRef: React.RefObject<HTMLDivElement>;
  handleContainerTouchStart: (e: React.TouchEvent) => void;
  handleContainerTouchMove: (e: React.TouchEvent) => void;
  handleContainerTouchEnd: () => void;
  handleContainerMouseDown: (e: React.MouseEvent) => void;
  handleContainerMouseMove: (e: React.MouseEvent) => void;
  handleContainerMouseUp: () => void;
  triggerUpdateRect: () => void;
  redBoxRef: React.RefObject<HTMLDivElement>;
  fingerPosition: { x: number; y: number };
  ringScale: number;
  dragTranslate: number[];
  ringRotation: number;
  moveableRedBoxRef: React.RefObject<any>;
  cumulativeTranslate: React.MutableRefObject<number[]>;
  latestScale: React.MutableRefObject<number>;
  latestRotation: React.MutableRefObject<number>;
  setDragTranslate: (t: number[]) => void;
  setRingScale: (s: number) => void;
  setRingRotation: (r: number) => void;
}

export function MobileStep2({
  uploadedImage,
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
  triggerUpdateRect,
  redBoxRef,
  fingerPosition,
  ringScale,
  dragTranslate,
  ringRotation,
  moveableRedBoxRef,
  cumulativeTranslate,
  latestScale,
  latestRotation,
  setDragTranslate,
  setRingScale,
  setRingRotation,
  onOpenGuide,
}: MobileStep2Props) {
  return (
    <div className="grow flex flex-col justify-between gap-3 min-h-0">
      {/* Progress Bar & Info */}
      <div className="space-y-3">
        <MobileProgressBar activeCount={2} />
        <div className="space-y-1 text-left">
          <h4 className="text-primary-900 font-bold text-base leading-tight">
            Xác nhận ảnh của bạn
          </h4>
          <p className="text-xs text-primary-600 leading-normal">
            Đảm bảo bàn tay của bạn hiển thị rõ ràng để có kết quả dựng hình AI
            tốt nhất
          </p>
        </div>
      </div>

      {/* Middle Preview Canvas */}
      <div className="grow flex items-center justify-center py-1 min-h-0">
        <div
          ref={ringContainerRef}
          className="w-auto h-full bg-white border border-primary-200 shadow-md rounded-lg relative overflow-hidden flex items-center justify-center select-none mx-auto"
          onTouchStart={handleContainerTouchStart}
          onTouchMove={handleContainerTouchMove}
          onTouchEnd={handleContainerTouchEnd}
          onTouchCancel={handleContainerTouchEnd}
          onMouseDown={handleContainerMouseDown}
          onMouseMove={handleContainerMouseMove}
          onMouseUp={handleContainerMouseUp}
          onMouseLeave={handleContainerMouseUp}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            cursor: "crosshair",
            touchAction: "none",
          }}
        >
          {uploadedImage && (
            <img
              src={uploadedImage}
              className="w-full h-full object-cover"
              alt="Hand Preview"
              draggable={false}
              onLoad={triggerUpdateRect}
            />
          )}
          <MoveableRedBox
            step={2}
            uploadedImage={uploadedImage}
            redBoxRef={redBoxRef}
            fingerPosition={fingerPosition}
            ringScale={ringScale}
            dragTranslate={dragTranslate}
            ringRotation={ringRotation}
            moveableRedBoxRef={moveableRedBoxRef}
            cumulativeTranslate={cumulativeTranslate}
            latestScale={latestScale}
            latestRotation={latestRotation}
            setDragTranslate={setDragTranslate}
            setRingScale={setRingScale}
            setRingRotation={setRingRotation}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenGuide();
            }}
            className="absolute bottom-3 right-3 z-[100] w-10 h-10 rounded-full bg-white/95 hover:bg-white text-black flex items-center justify-center cursor-pointer  border border-primary-100 shadow-md transition-all active:scale-95"
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
  return null; // Desktop Step 2 uses same guidelines panel layout as Step 1
}

export function DesktopStep2Bottom({
  uploadedImage,
  setStep,
  setUploadedImage,
  startCamera,
}: Step2ConfirmProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <Button
        onClick={() => setStep(3)}
        disabled={!uploadedImage}
        className="w-full bg-[#004B49] hover:bg-[#003C3A] text-white font-bold text-xs h-11 flex items-center justify-center gap-2 cursor-pointer rounded-lg border-none shadow-none"
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
        className="w-full h-11 rounded-none border-primary-200 text-primary-900 bg-white hover:bg-primary-50 tracking-wider"
      >
        Chụp lại
        <ArrowCounterClockwise size={18} />
      </Button>

      <div className="flex items-center justify-start gap-1.5 text-primary-400 text-xs mt-3 select-none">
        <LockSimple size={14} weight="regular" />
        <span>Ảnh của bạn là riêng tư và được bảo vệ</span>
      </div>
    </div>
  );
}
