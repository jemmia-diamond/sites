import React, { use, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { HistoryDialog } from "./TryOn/components/HistoryDialog";
import { HistoryContent } from "./TryOn/components/HistoryContent";
import {
  ArrowLeft,
  X,
  WarningCircle,
  ArrowRight,
  ArrowCounterClockwise,
  ClockCounterClockwiseIcon,
  SunDim,
  HandPalm,
  CornersOut,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

// Provider & Context
import { TryOnProvider } from "./TryOn/context/TryOnProvider";
import { TryOnContext } from "./TryOn/context/TryOnContext";

// Components
import { MobileStep1, DesktopStep1Left, DesktopStep1Bottom } from "./TryOn/components/Step1Upload";
import { MobileStep2, DesktopStep2Left, DesktopStep2Bottom } from "./TryOn/components/Step2Confirm";
import { MobileStep3, DesktopStep3Left, DesktopStep3Right } from "./TryOn/components/Step3Catalog";
import { MobileStep4, DesktopStep4Left, DesktopStep4Bottom } from "./TryOn/components/Step4Result";
import { DesktopInteractiveCanvas } from "./TryOn/components/DesktopInteractiveCanvas";
import { ResultCanvas } from "./TryOn/components/ResultCanvas";
import { LightboxModal } from "./TryOn/components/LightboxModal";
import { MobileProgressBar } from "./TryOn/components/MobileProgressBar";
import { TryOnGuide } from "./TryOn/components/TryOnGuide";

// Constants
import { TRYON_GUIDE_SHOWN_KEY } from "./TryOn/constants";
import { useTryOnGlobal } from "./TryOn/context/TryOnGlobalContext";

interface TryOnDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TryOnDrawer({ isOpen, onClose }: TryOnDrawerProps) {
  return (
    <TryOnProvider isOpen={isOpen} onClose={onClose}>
      <AnimatePresence>
        {isOpen && <TryOnDrawerInner onClose={onClose} />}
      </AnimatePresence>
    </TryOnProvider>
  );
}

interface TryOnDrawerInnerProps {
  onClose: () => void;
}

function TryOnDrawerInner({ onClose }: TryOnDrawerInnerProps) {
  const context = use(TryOnContext);
  if (!context) return null;

  const { state, actions, meta } = context;
  const {
    step,
    maxStep,
    toastMessage,
    isGenerating,
    selectedGeneratedImage,
    generatedImage,
    isFullscreen,
    showGuide,
    showResumePopup,
    showExitPopup,
    showSaveSuccessPopup,
    savedSessionStep,
    alignmentPreviewUrl,
    isMobile,
    isMobileBehavior,
    isCameraActive,
    useMirror,
  } = state;

  const {
    setStep,
    setShowResumePopup,
    setShowExitPopup,
    setShowSaveSuccessPopup,
    setShowGuide,
    setAlignmentPreviewUrl,
    stopCamera,
    handleResumeSession,
    handleResetAll,
    handleCloseAttempt,
    handleStepClick,
    handleComplete,
    handleCloseFullscreen,
    setGeneratedImage,
    setGeneratedImages,
    setSelectedGeneratedImage,
    capturePhoto,
  } = actions;

  const { lightboxRef, videoRef } = meta;
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);
  const { isTryOnGenerating } = useTryOnGlobal();
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "linear" }}
      className="fixed inset-0 w-full h-full bg-white z-[202] flex flex-col overflow-hidden"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed top-16 md:top-6 left-0 right-0 z-[9999] flex justify-center pointer-events-none px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pointer-events-auto bg-slate-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 max-w-md w-full md:w-auto border border-slate-800"
            >
              <WarningCircle
                size={18}
                className="text-amber-400 shrink-0"
                weight="fill"
              />
              <span className="text-xs font-semibold tracking-wide leading-tight">
                {toastMessage}
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showResumePopup &&
        createPortal(
          <div
            onClick={() => setShowResumePopup(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white shadow-2xl p-4 lg:p-6 max-w-sm w-full border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200"
            >
              {/* Ring Icon Container */}
              <div className="w-20 h-20 rounded-full bg-[#E6F7F7] flex items-center justify-center mb-6">
                <img src="https://cdn.hstatic.net/files/200000355853/file/frame.svg" />
              </div>

              {/* Title */}
              <h3 className="text-slate-900 font-bold text-lg leading-snug tracking-tight mb-2 mx-4 lg:mx-0">
                Bạn đang thực hiện quá trình thử nhẫn (Bước{" "}
                {savedSessionStep || step}/4)
              </h3>

              {/* Description */}
              <p className="text-slate-500 text-sm leading-relaxed mx-4 lg:mx-0">
                Bạn có muốn tiếp tục từ bước này hay bắt đầu lại từ đầu?
              </p>

              {/* Buttons */}
              <Button
                onClick={handleResumeSession}
                variant="secondary"
                className="w-full h-12 gap-2 mt-6"
              >
                <span>Tiếp tục</span>
                <ArrowRight size={16} weight="bold" />
              </Button>
              <Button
                onClick={() => {
                  setShowResumePopup(false);
                  handleResetAll();
                }}
                variant="outline"
                className="w-full h-12 tracking-wider mt-3"
              >
                Bắt đầu lại
                <ArrowCounterClockwise size={16} />
              </Button>
            </motion.div>
          </div>,
          document.body,
        )}

      {showExitPopup &&
        createPortal(
          <div
            onClick={() => setShowExitPopup(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white shadow-2xl p-4 lg:p-6 max-w-sm w-full border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200"
            >
              {/* Close button X */}
              <button
                type="button"
                onClick={() => setShowExitPopup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
              >
                <X size={20} weight="bold" />
              </button>

              {/* Ring Icon Container */}
              <div className="w-20 h-20 rounded-full bg-[#E6F7F7] flex items-center justify-center mb-6 mt-4">
                <img src="https://cdn.hstatic.net/files/200000355853/file/frame.svg" />
              </div>

              {step === 4 && isGenerating ? (
                <>
                  {/* Title */}
                  <h3 className="text-slate-900 font-bold text-lg leading-snug tracking-tight mb-2 mx-4 lg:mx-0">
                    Đang tạo hình ảnh
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 text-sm leading-relaxed mx-4 lg:mx-0">
                    Hình ảnh đang được tạo <br /> tiến trình sẽ tiếp tục ngay cả khi bạn thoát
                  </p>

                  {/* Buttons */}
                  <Button
                    onClick={() => {
                      stopCamera();
                      onClose();
                      setShowExitPopup(false);
                    }}
                    variant="secondary"
                    className="w-full h-12 mt-6 font-semibold"
                  >
                    Thoát
                  </Button>
                  <Button
                    onClick={() => setShowExitPopup(false)}
                    variant="outline"
                    className="w-full h-12 tracking-wider mt-3 font-semibold"
                  >
                    Ở lại
                  </Button>
                </>
              ) : (
                <>
                  {/* Title */}
                  <h3 className="text-slate-900 font-bold text-lg leading-snug tracking-tight mb-2 mx-4 lg:mx-0">
                    Thoát khỏi quá trình này?
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 text-sm leading-relaxed mx-4 lg:mx-0">
                    Bạn đang ở bước {step}/4. Nếu thoát, các thay đổi chưa lưu có thể bị mất
                  </p>

                  {/* Buttons */}
                  <Button
                    onClick={() => {
                      stopCamera();
                      onClose();
                      setShowExitPopup(false);
                    }}
                    variant="secondary"
                    className="w-full h-12 gap-2 mt-6"
                  >
                    Lưu & Thoát
                  </Button>
                  <Button
                    onClick={() => setShowExitPopup(false)}
                    variant="outline"
                    className="w-full h-12 tracking-wider mt-3"
                  >
                    Ở lại
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setShowExitPopup(false);
                      handleResetAll();
                      stopCamera();
                      onClose();
                    }}
                    className="w-full text-center py-3 mt-3 cursor-pointer text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Thoát không lưu
                  </Button>
                </>
              )}
            </motion.div>
          </div>,
          document.body,
        )}

      {showSaveSuccessPopup &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white shadow-2xl p-4 lg:p-6 max-w-sm w-full border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200"
            >
              {/* Green Check Icon Container */}
              <div className="w-20 h-20 flex items-center justify-center">
                <img
                  src="https://cdn.hstatic.net/files/200000355853/file/chatgpt_image_18_00_48_24_thg_6__2026_1__1_.png"
                  alt="Success Check"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="text-slate-900 font-bold text-base leading-relaxed mb-6 mx-4">
                Hình ảnh của bạn đã được lưu <br /> trong thư viện ảnh của sản phẩm
              </h3>

              {/* Buttons */}
              <Button
                onClick={() => {
                  handleResetAll();
                  setShowSaveSuccessPopup(false);
                }}
                variant="secondary"
                className="w-full h-12 font-semibold"
              >
                Tạo hình mới
              </Button>
              <Button
                onClick={() => {
                  handleResetAll();
                  stopCamera();
                  onClose();
                  setShowSaveSuccessPopup(false);
                }}
                variant="outline"
                className="w-full h-12 tracking-wider mt-3 font-semibold text-slate-800"
              >
                Thoát
              </Button>
            </motion.div>
          </div>,
          document.body,
        )}

      {/* Header Title Bar */}
      <div className="h-12 lg:h-14 px-4 lg:px-6 bg-white border-b border-primary-100 flex items-center justify-between shrink-0 relative">
        <img
          src="https://file.hstatic.net/200000355853/file/logo.svg"
          alt="Jemmia Logo"
          className="h-8 w-auto absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0"
          referrerPolicy="no-referrer"
        />

        <div className="flex items-center gap-2 md:gap-4 ml-auto md:ml-0">
          {isMobile ? (
            <button
              onClick={() => setIsMobileHistoryOpen((prev) => !prev)}
              className={cn(
                "p-1.5 rounded-full transition-colors cursor-pointer",
                isMobileHistoryOpen
                  ? "text-teal-700 bg-teal-50"
                  : "text-primary-900/60 hover:text-primary-900 hover:bg-primary-50"
              )}
            >
              <span className="relative">
                <ClockCounterClockwiseIcon weight="bold" size={18} />
                {isTryOnGenerating && (
                  <span className="absolute -top-0.5 -right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </span>
            </button>
          ) : (
            <Button variant={"ghost"} onClick={() => setIsHistoryOpen(true)}>
              <span className="relative">
                <span className="flex gap-2"> Lịch sử <ClockCounterClockwiseIcon weight="bold" size={18} /> </span>
                {isTryOnGenerating && (
                  <span className="absolute -top-1 -right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </span>

            </Button>
          )}
          <button
            onClick={handleCloseAttempt}
            className="text-primary-900/60 hover:text-primary-900 p-1.5 rounded-full hover:bg-primary-50 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" color="black" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row bg-white relative overflow-hidden">
        {isMobile ? (
          <div
            className={cn(
              "flex-1 flex flex-col justify-between bg-white min-w-0 p-4",
              (step === 1 || isMobileHistoryOpen) ? "overflow-hidden" : "overflow-y-auto",
            )}
          >
            {isMobileHistoryOpen ? (
              <HistoryContent
                isMobile={true}
                activeImageUrl={selectedGeneratedImage}
                onClose={() => setIsMobileHistoryOpen(false)}
                onSelectImage={(imageUrl) => {
                  setGeneratedImage(imageUrl);
                  setGeneratedImages([imageUrl]);
                  setSelectedGeneratedImage(imageUrl);
                  setStep(4);
                  setIsMobileHistoryOpen(false);
                }}
              />
            ) : (
              <>
                {step === 1 && <MobileStep1 />}
                {step === 2 && <MobileStep2 />}
                {step === 3 && <MobileStep3 />}
                {step === 4 && <MobileStep4 />}
              </>
            )}
          </div>
        ) : (
          <>
            {/* Left Panel: Instructions/Upload/Catalog */}
            <div
              className={cn(
                "p-6 flex flex-col justify-between shrink-0 overflow-y-auto transition-all duration-300 w-full md:w-[35%]"
              )}
            >
              <div className="space-y-5 flex flex-col min-h-0 h-full">
                {/* Progress Tracker */}
                <div className="w-full shrink-0 mb-5">
                  <MobileProgressBar
                    activeCount={step}
                    onStepClick={handleStepClick}
                    disabled={step === 4 && isGenerating}
                    maxStep={maxStep}
                  />
                </div>

                {step === 1 && <DesktopStep1Left />}
                {step === 2 && <DesktopStep2Left />}
                {step === 3 && <DesktopStep3Left />}
                {step === 4 && <DesktopStep4Left />}
              </div>

              {/* Bottom Actions for Left Panel */}
              <div className="flex flex-col gap-3.5 shrink-0">
                {step === 1 && <DesktopStep1Bottom />}
                {step === 2 && <DesktopStep2Bottom />}
                {step === 4 && <DesktopStep4Bottom />}
              </div>
            </div>

            {/* Right Panel: Interactive Canvas / Upload Preview or Step 3 Product Details */}
            {step === 3 ? (
              <DesktopStep3Right />
            ) : step === 4 ? (
              /* Desktop Step 4 Right Panel */
              <div className="grow flex items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden min-w-0 h-full">
                <ResultCanvas />
              </div>
            ) : (
              /* Desktop Step 1 & 2 Right Panel Canvas */
              <DesktopInteractiveCanvas />
            )}
          </>
        )}
      </div>

      <LightboxModal
        isFullscreen={isFullscreen}
        lightboxRef={lightboxRef}
        selectedGeneratedImage={selectedGeneratedImage}
        handleCloseFullscreen={handleCloseFullscreen}
      />

      <HistoryDialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        activeImageUrl={selectedGeneratedImage}
        onSelectImage={(imageUrl) => {
          setGeneratedImage(imageUrl);
          setGeneratedImages([imageUrl]);
          setSelectedGeneratedImage(imageUrl);
          setStep(4);
          setIsHistoryOpen(false);
        }}
      />

      {/* Alignment Preview Modal */}
      {alignmentPreviewUrl && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-5 max-w-sm lg:max-w-md w-full border border-slate-100 flex flex-col items-center select-none text-center animate-in fade-in zoom-in duration-200"
          >
            <h3 className="text-slate-900 font-bold text-lg leading-snug mb-1">Ảnh gửi đi căn chỉnh</h3>
            <p className="text-slate-500 text-xs leading-normal mb-5 px-3">
              Đây là kết quả hình ảnh thực tế sau khi bạn đã di chuyển, phóng to và xoay để khớp ngón tay với khung màu đỏ.
            </p>

            <div className="w-full aspect-square border border-slate-200 bg-slate-50 flex items-center justify-center relative mb-6">
              <img src={alignmentPreviewUrl} className="w-full h-full object-contain" alt="Alignment Preview" />
            </div>

            <Button
              onClick={() => setAlignmentPreviewUrl(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-none flex items-center justify-center cursor-pointer border-none"
            >
              Đóng xem trước
            </Button>
          </motion.div>
        </div>
      )}

      {/* Guide Modal Overlay */}
      {isMobileBehavior && showGuide && (
        <TryOnGuide
          onClose={() => {
            setShowGuide(false);
            sessionStorage.setItem(TRYON_GUIDE_SHOWN_KEY, "true");
          }}
        />
      )}

      {/* Fullscreen Video Overlay if Camera is Active */}
      {isCameraActive && (
        <div className="fixed inset-0 w-full h-full bg-black z-[300] flex flex-col justify-between overflow-hidden">
          {/* Fullscreen Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full ${
              useMirror ? "transform scale-x-[-1]" : ""
            }`}
          />

          {/* Header Controls */}
          <div className="relative z-[310] flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
            <button
              type="button"
              onClick={stopCamera}
              className="text-white bg-black/40 hover:bg-black/60 p-2 rounded-full backdrop-blur-sm transition-all border-none cursor-pointer"
            >
              <ArrowLeft size={20} weight="bold" />
            </button>
            <span className="text-white text-sm font-semibold tracking-wide shadow-sm">
              Chụp Ảnh Bàn Tay
            </span>
            <div className="w-9 h-9" /> {/* Spacer */}
          </div>

          {/* Footer Actions */}
          <div className="relative z-[310] flex flex-col items-center gap-4 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            {/* 3 Guidelines */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-sm px-2 py-2 rounded border border-white/10">
              <div className="flex flex-col items-center text-center">
                <SunDim size={18} className="text-amber-400 mb-1" />
                <span className="text-[10px] leading-tight text-white/90 font-normal">
                  Đặt bàn tay dưới <br /> ánh sáng tốt
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <HandPalm size={18} className="text-amber-400 mb-1" />
                <span className="text-[10px] leading-tight text-white/90 font-normal">
                  Xòe nhẹ các <br /> ngón tay
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <CornersOut size={18} className="text-amber-400 mb-1" />
                <span className="text-[10px] leading-tight text-white/90 font-normal">
                  Tránh bóng đổ và <br /> ảnh bị mờ
                </span>
              </div>
            </div>

            {/* Capture Button */}
            <button
              type="button"
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white/40 transition-all cursor-pointer shadow-lg mb-2"
            >
              <div className="w-12 h-12 rounded-full bg-white active:scale-95 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </motion.div>,
    document.body,
  );
}
