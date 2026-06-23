import { use } from "react";
import {
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  Question,
} from "@phosphor-icons/react";
import { TryOnContext } from "../context/TryOnContext";
import { DesktopStep1Right } from "./Step1Upload";

const getScaleFromSlider = (v: number): number => {
  if (v <= 1) {
    return 0.5 + v * 0.5; // Maps [0, 1] to [0.5, 1.0]
  }
  return 1.0 + (v - 1) * 5.0; // Maps [1, 2] to [1.0, 6.0]
};

const getSliderFromScale = (scale: number): number => {
  if (scale <= 1.0) {
    return Math.max(0, (scale - 0.5) / 0.5); // Maps [0.5, 1.0] to [0, 1]
  }
  return Math.min(2, 1.0 + (scale - 1.0) / 5.0); // Maps [1.0, 6.0] to [1, 2]
};

export function DesktopInteractiveCanvas() {
  const context = use(TryOnContext);
  if (!context) return null;

  const { state, actions, meta } = context;
  const {
    step,
    uploadedImage,
    imageScale,
    imageTranslate,
    imageRotation,
    redBox,
    containerWidth,
    showResumePopup,
  } = state;

  const {
    setImageScale,
    setImageRotation,
    handleContainerTouchStart,
    handleContainerTouchMove,
    handleContainerTouchEnd,
    handleContainerMouseDown,
    handleContainerMouseMove,
    handleContainerMouseUp,
    handleZoomIn,
    handleZoomOut,
    handleOpenGuide,
  } = actions;

  const { ringContainerRef } = meta;

  return (
    <div className="grow flex items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden min-w-0">
      <div
        ref={ringContainerRef}
        className={`w-full max-w-160 2xl:max-w-180 3xl:max-w-210 rounded-lg h-auto aspect-square relative overflow-hidden flex items-center justify-center select-none transition-all duration-300 ${
          step === 1
            ? "bg-transparent border-none"
            : "bg-black border border-primary-200 shadow-lg"
        }`}
        style={{
          cursor: step === 2 ? "grab" : "default",
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

        {uploadedImage && step !== 1 && (
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

        {/* Fixed, Non-editable Centered Red Box on Desktop */}
        {step === 2 && !showResumePopup && redBox && (
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

        {/* Vertical Zoom Slider on Desktop */}
        {step === 2 && !showResumePopup && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-4 top-4 bottom-20 z-[100] py-4 rounded-full bg-black/60 flex flex-col items-center justify-between select-none animate-in fade-in slide-in-from-right-4 duration-300 w-10"
          >
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-6 h-6 shrink-0 rounded-full hover:bg-slate-100 text-slate-800 flex items-center justify-center cursor-pointer transition-all active:scale-90"
              title="Phóng to"
            >
              <MagnifyingGlassPlus
                size={16}
                weight="bold"
                className="text-white"
              />
            </button>

            <div className="flex-1 w-full flex items-center justify-center relative">
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={getSliderFromScale(imageScale)}
                onChange={(e) =>
                  setImageScale(getScaleFromSlider(Number(e.target.value)))
                }
                style={{
                  width: `${Math.max(100, containerWidth - 210)}px`,
                  background: `linear-gradient(to right, #ffffff 0%, #ffffff ${(getSliderFromScale(imageScale) / 2) * 100}%, #94a3b8 ${(getSliderFromScale(imageScale) / 2) * 100}%, #94a3b8 100%)`,
                }}
                className="custom-slider-vertical-rotated"
              />
            </div>

            <button
              type="button"
              onClick={handleZoomOut}
              className="w-6 h-6 shrink-0 rounded-full hover:bg-slate-100 text-slate-800 flex items-center justify-center cursor-pointer transition-all active:scale-90"
              title="Thu nhỏ"
            >
              <MagnifyingGlassMinus
                size={16}
                weight="bold"
                className="text-white"
              />
            </button>

            <span className="font-mono text-[10px] text-white font-bold w-10 shrink-0 text-center select-none">
              {Math.round(imageScale * 100)}%
            </span>
          </div>
        )}

        {/* Floating Rotation Slider on Desktop */}
        <div className="absolute bottom-4 w-full flex px-4 gap-4 z-[100]">
          {step === 2 && !showResumePopup && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="px-4 flex-1 select-none flex items-center gap-3 bg-black/60 rounded-full animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              <span className="text-[10px] text-white font-bold whitespace-nowrap">
                Xoay:
              </span>
              <input
                type="range"
                min="-180"
                max="180"
                value={imageRotation}
                onChange={(e) => setImageRotation(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #ffffff 0%, #ffffff ${((imageRotation + 180) / 360) * 100}%, #94a3b8 ${((imageRotation + 180) / 360) * 100}%, #94a3b8 100%)`,
                }}
                className="grow custom-slider"
              />
              <span className="font-mono text-[10px] text-white font-bold text-right">
                {imageRotation}°
              </span>
            </div>
          )}

          {step === 2 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenGuide();
              }}
              className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-black flex items-center justify-center cursor-pointer border border-primary-100 shadow-md transition-all active:scale-95"
              title="Hướng dẫn cử chỉ"
            >
              <Question size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
