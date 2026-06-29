import React, { use } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  ArrowCounterClockwise,
  LockSimple,
  Question,
  CornersOutIcon,
  ArrowRightIcon,
  X,
  CornersOut,
  ArrowsOutCardinal,
  ArrowsOutSimple,
} from "@phosphor-icons/react";
import { MobileProgressBar } from "./MobileProgressBar";
import { TryOnContext } from "../context/TryOnContext";
import { ACTIVE_TRYON_SESSION_KEY } from "../constants";

export function MobileStep2() {
  const context = use(TryOnContext);
  if (!context) return null;
  const {
    state: {
      uploadedImage,
      showResumePopup,
      imageScale,
      imageTranslate,
      imageRotation,
      redBox,
      maxStep,
    },
    actions: {
      setStep,
      setUploadedImage,
      setMaxStep,
      startCamera,
      handleContainerTouchStart,
      handleContainerTouchMove,
      handleContainerTouchEnd,
      handleContainerMouseDown,
      handleContainerMouseMove,
      handleContainerMouseUp,
      handleOpenGuide: onOpenGuide,
      resetZoom,
    },
    meta: { ringContainerRef },
  } = context;

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
          className="h-full w-full relative flex-col rounded-lg bg-black overflow-hidden flex items-center justify-center select-none mx-auto animate-in fade-in zoom-in-95 duration-200"
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
                className="w-full h-full object-contain bg-black"
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

          {/* Reset button at top center */}
          {!showResumePopup && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-md transition-all text-xs font-semibold select-none active:scale-95 animate-in fade-in duration-200"
              title="Đặt lại vị trí & căn chỉnh"
            >
              <ArrowCounterClockwise size={14} className="text-slate-600" />
              <span>Đặt lại</span>
            </button>
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
          onClick={() => {
            setStep(1);
            setUploadedImage(null);
            startCamera();
          }}
          variant="outline-light"
          className="w-full h-11 tracking-wider"
        >
          Chụp lại
          <ArrowCounterClockwise size={18} />
        </Button>
        <Button
          onClick={() => setStep(3)}
          disabled={!uploadedImage}
          variant="secondary"
          className="w-full h-11 tracking-wider gap-2 font-normal"
        >
          Xác nhận
          <Check size={18} weight="bold" />
        </Button>
      </div>
    </div>
  );
}

export function DesktopStep2Left() {
  const context = use(TryOnContext);
  const isMobileBehavior = context?.state?.isMobileBehavior ?? false;

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <h4 className="text-primary-900 font-bold text-xl md:text-2xl tracking-tight leading-tight">
          Đánh dấu vị trí thử nhẫn
        </h4>
      </div>
      <div className="pt-2">
        <ul className="space-y-5 text-sm font-medium text-primary-600">
          {isMobileBehavior ? (
            <>
              <li className="flex items-start gap-3">
                <div className="text-secondary-800 shrink-0 mt-0.5">
                  <CornersOut size={20} weight="regular" />
                </div>
                <span className="leading-relaxed text-slate-800">
                  Đặt vùng đỏ tại vị trí thử nhẫn
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="text-secondary-800 shrink-0 mt-0.5">
                  <ArrowsOutCardinal size={20} weight="regular" />
                </div>
                <span className="leading-relaxed text-slate-800">
                  Dùng 1 ngón để di chuyển hình ảnh
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="text-secondary-800 shrink-0 mt-0.5">
                  <ArrowsOutSimple size={20} weight="regular" />
                </div>
                <span className="leading-relaxed text-slate-800">
                  Dùng 2 ngón để phóng to thu nhỏ
                </span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start gap-3">
                <div className="text-secondary-800 shrink-0 mt-0.5">
                  <CornersOutIcon size={20} weight="regular" />
                </div>
                <span className="leading-relaxed text-slate-800">
                  Nhấn giữ và kéo chuột để vẽ một khung màu đỏ bao quanh vị trí đốt ngón tay đeo nhẫn.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="text-secondary-800 shrink-0 mt-0.5">
                  <ArrowCounterClockwise size={20} weight="regular" />
                </div>
                <span className="leading-relaxed text-slate-800">
                  Sử dụng các điều khiển xoay và dịch chuyển trên khung để khớp vị trí đeo nhẫn.
                </span>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export function DesktopStep2Bottom() {
  const context = use(TryOnContext);
  if (!context) return null;
  const {
    state: { uploadedImage, redBox, isMobileBehavior },
    actions: { setStep, setUploadedImage, startCamera },
  } = context;

  const isNextDisabled = !uploadedImage || (!isMobileBehavior && (!redBox || !redBox.hasDrawn));

  if (isMobileBehavior) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button
          onClick={() => setStep(3)}
          disabled={!uploadedImage}
          variant="secondary"
          className="w-full h-12 gap-2 font-semibold"
        >
          Dùng hình ảnh này
          <Check size={18} weight="bold" />
        </Button>
        <Button
          onClick={() => {
            setStep(1);
            setUploadedImage(null);
            startCamera();
          }}
          variant="outline-light"
          className="w-full h-12 gap-2 font-semibold shadow-none"
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

  return (
    <div className="flex flex-col gap-3.5">
      <Button
        onClick={() => setStep(3)}
        disabled={isNextDisabled}
        variant="secondary"
        className="w-full h-12 gap-2 font-semibold"
      >
        Tiếp theo
        <ArrowRightIcon size={16} weight="bold" />
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-primary-400 text-xs mt-1 select-none">
        <LockSimple size={14} weight="regular" />
        <span>Ảnh của bạn là riêng tư và được bảo vệ</span>
      </div>
    </div>
  );
}
