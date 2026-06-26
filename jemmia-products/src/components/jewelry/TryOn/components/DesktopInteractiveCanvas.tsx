import { use } from "react";
import {
  ArrowClockwise,
  X,
} from "@phosphor-icons/react";
import { TryOnContext } from "../context/TryOnContext";
import { DesktopStep1Right } from "./Step1Upload";
import { ACTIVE_TRYON_SESSION_KEY } from "../constants";

export function DesktopInteractiveCanvas() {
  const context = use(TryOnContext);
  if (!context) return null;

  const { state, actions, meta } = context;
  const {
    step,
    uploadedImage,
    redBox,
    showResumePopup,
    isMobileBehavior,
    imageScale,
    imageTranslate,
    imageRotation,
  } = state;

  const {
    handleContainerTouchStart,
    handleContainerTouchMove,
    handleContainerTouchEnd,
    handleContainerMouseDown,
    handleContainerMouseMove,
    handleContainerMouseUp,
    handleRotateStart,
    handleRotateTouchStart,
    handleDragStart,
    handleDragTouchStart,
    resetZoom,
    handleResizeStart,
    handleResizeTouchStart,
    setUploadedImage,
    setMaxStep,
    setStep,
  } = actions;

  const { ringContainerRef } = meta;

  return (
    <div className="grow flex items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden min-w-0">
      <div
        ref={ringContainerRef}
        className={`max-w-225 h-auto w-full aspect-square bg-black rounded-lg relative overflow-hidden flex items-center justify-center select-none transition-all duration-300 ${
          step === 1
            ? "bg-transparent border-none"
            : "bg-black border border-primary-200 shadow-lg"
        }`}
        style={{
          cursor: step === 2 ? "crosshair" : "default",
          touchAction: "none",
        }}
        onTouchStart={handleContainerTouchStart}
        onTouchMove={handleContainerTouchMove}
        onTouchEnd={handleContainerTouchEnd}
        onTouchCancel={handleContainerTouchEnd}
        onMouseDown={handleContainerMouseDown}
        onMouseMove={handleContainerMouseMove}
        onMouseUp={handleContainerMouseUp}
        onMouseLeave={handleContainerMouseUp}
      >
        {step === 1 && <DesktopStep1Right />}



        {/* Close/Remove button */}
        {step === 2 && !showResumePopup && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setUploadedImage(null);
              setMaxStep(1);
              setStep(1);
              sessionStorage.removeItem(ACTIVE_TRYON_SESSION_KEY);
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent triggering drag/move gestures
            className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg z-[100] transition-colors border-none cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 animate-in fade-in duration-200"
            title="Xóa hình ảnh"
          >
            <X size={16} weight="bold" />
          </button>
        )}

        {uploadedImage && step !== 1 && (
          <div
            style={{
              width: "100%",
              height: "100%",
              transform: isMobileBehavior
                ? `translate(${imageTranslate[0]}px, ${imageTranslate[1]}px) scale(${imageScale}) rotate(${imageRotation}deg)`
                : "none",
              transformOrigin: "center center",
            }}
            className="flex items-center justify-center pointer-events-none select-none relative"
          >
            <img
              src={uploadedImage}
              className="w-full h-full object-contain bg-black"
              alt="Hand Preview"
              draggable={false}
            />
            {/* Dark overlay backdrop when red box has not been drawn on desktop step 2 */}
            {step === 2 && !isMobileBehavior && (!redBox || !redBox.hasDrawn) && (
              <div className="absolute inset-0 bg-black/50 transition-all duration-300 flex items-center justify-center">
              </div>
            )}
          </div>
        )}

        {/* Drawn & Rotatable Red Box on Desktop Step 2 */}
        {step === 2 && !showResumePopup && redBox && redBox.hasDrawn && (
          <div
            onMouseDown={isMobileBehavior ? undefined : handleDragStart}
            onTouchStart={isMobileBehavior ? undefined : handleDragTouchStart}
            style={{
              position: "absolute",
              left: `${redBox.x}%`,
              top: `${redBox.y}%`,
              width: `${redBox.w}%`,
              height: `${redBox.h}%`,
              border: "2px solid rgb(239, 68, 68)",
              backgroundColor: "rgba(239, 68, 68, 0.5)",
              boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.5)",
              transform: `rotate(${redBox.rotation || 0}deg)`,
              transformOrigin: "center center",
              pointerEvents: isMobileBehavior ? "none" : "auto",
              cursor: isMobileBehavior ? "default" : "move",
              zIndex: 40,
            }}
          >
            {/* Rotation Handle */}
            {!isMobileBehavior && (
              <>
                <div
                  onMouseDown={handleRotateStart}
                  onTouchStart={handleRotateTouchStart}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-red-500 flex items-center justify-center cursor-alias shadow-md hover:bg-slate-50 transition-all select-none active:cursor-grabbing"
                  style={{
                    pointerEvents: "auto",
                  }}
                  title="Nhấn giữ và kéo để xoay"
                >
                  <ArrowClockwise size={12} className="text-red-500 font-bold" />
                </div>
                {/* Connecting line */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-red-500 pointer-events-none"
                />
              </>
            )}

            {/* Resize Handles */}
            {!isMobileBehavior && (
              <>
                {/* 4 Corner Handles (Square Right-Angled L-shapes) */}
                {/* Top-Left */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, "tl")}
                  onTouchStart={(e) => handleResizeTouchStart(e, "tl")}
                  className="absolute top-0 left-0 w-3.5 h-3.5 -translate-x-[2px] -translate-y-[2px] border-t-[3px] border-l-[3px] border-white cursor-nwse-resize z-20"
                  style={{ pointerEvents: "auto" }}
                  title="Kéo để chỉnh kích thước"
                />
                {/* Top-Right */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, "tr")}
                  onTouchStart={(e) => handleResizeTouchStart(e, "tr")}
                  className="absolute top-0 right-0 translate-x-[2px] -translate-y-[2px] w-3.5 h-3.5 border-t-[3px] border-r-[3px] border-white cursor-nesw-resize z-20"
                  style={{ pointerEvents: "auto" }}
                  title="Kéo để chỉnh kích thước"
                />
                {/* Bottom-Left */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, "bl")}
                  onTouchStart={(e) => handleResizeTouchStart(e, "bl")}
                  className="absolute bottom-0 left-0 -translate-x-[2px] translate-y-[2px] w-3.5 h-3.5 border-b-[3px] border-l-[3px] border-white cursor-nesw-resize z-20"
                  style={{ pointerEvents: "auto" }}
                  title="Kéo để chỉnh kích thước"
                />
                {/* Bottom-Right */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, "br")}
                  onTouchStart={(e) => handleResizeTouchStart(e, "br")}
                  className="absolute bottom-0 right-0 translate-x-[2px] translate-y-[2px] w-3.5 h-3.5 border-b-[3px] border-r-[3px] border-white cursor-nwse-resize z-20"
                  style={{ pointerEvents: "auto" }}
                  title="Kéo để chỉnh kích thước"
                />

                {/* 4 Edge Handles (Thin, Transparent Interactive Zones) */}
                {/* Top Edge */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, "t")}
                  onTouchStart={(e) => handleResizeTouchStart(e, "t")}
                  className="absolute top-0 left-3 right-3 h-2.5 -translate-y-1/2 cursor-ns-resize z-10 bg-transparent"
                  style={{ pointerEvents: "auto" }}
                  title="Kéo để chỉnh chiều cao"
                />
                {/* Bottom Edge */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, "b")}
                  onTouchStart={(e) => handleResizeTouchStart(e, "b")}
                  className="absolute bottom-0 left-3 right-3 h-2.5 translate-y-1/2 cursor-ns-resize z-10 bg-transparent"
                  style={{ pointerEvents: "auto" }}
                  title="Kéo để chỉnh chiều cao"
                />
                {/* Left Edge */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, "l")}
                  onTouchStart={(e) => handleResizeTouchStart(e, "l")}
                  className="absolute top-3 bottom-3 left-0 w-2.5 -translate-x-1/2 cursor-ew-resize z-10 bg-transparent"
                  style={{ pointerEvents: "auto" }}
                  title="Kéo để chỉnh chiều rộng"
                />
                {/* Right Edge */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, "r")}
                  onTouchStart={(e) => handleResizeTouchStart(e, "r")}
                  className="absolute top-3 bottom-3 right-0 w-2.5 translate-x-1/2 cursor-ew-resize z-10 bg-transparent"
                  style={{ pointerEvents: "auto" }}
                  title="Kéo để chỉnh chiều rộng"
                />
              </>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
