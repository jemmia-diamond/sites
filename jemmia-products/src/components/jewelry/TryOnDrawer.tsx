import React, { use } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  X,
  WarningCircle,
  ArrowRight,
  ArrowCounterClockwise,
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
import {
  TRYON_GUIDE_SHOWN_KEY,
} from "./TryOn/constants";

interface TryOnDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TryOnDrawer({ isOpen, onClose }: TryOnDrawerProps) {
  return (
    <TryOnProvider isOpen={isOpen} onClose={onClose}>
      <AnimatePresence>
        {isOpen && (
          <TryOnDrawerInner onClose={onClose} />
        )}
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
    isFullscreen,
    showGuide,
    showResumePopup,
    showExitPopup,
    savedSessionStep,
    alignmentPreviewUrl,
    isMobile,
  } = state;

  const {
    setStep,
    setShowResumePopup,
    setShowExitPopup,
    setShowGuide,
    setAlignmentPreviewUrl,
    stopCamera,
    handleResumeSession,
    handleResetAll,
    handleCloseAttempt,
    handleStepClick,
    handleComplete,
    handleCloseFullscreen,
  } = actions;

  const { lightboxRef } = meta;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "linear" }}
      className="fixed inset-0 w-full h-full bg-white z-[200] flex flex-col overflow-hidden"
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
            </motion.div>
          </div>,
          document.body,
        )}

      {/* Header Title Bar */}
      <div className="h-12 px-4 bg-white border-b border-primary-100 flex items-center justify-between shrink-0 relative">
        <div className="flex items-center">
          {step === 1 ? (
            <button
              onClick={handleCloseAttempt}
              className="text-primary-900/60 hover:text-primary-900 p-1 rounded-full hover:bg-primary-50 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} weight="bold" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (step === 4 && isGenerating) return;
                if (step === 2) stopCamera();
                setStep(step - 1);
              }}
              disabled={step === 4 && isGenerating}
              className={cn(
                "text-primary-900/60 hover:text-primary-900 p-1 rounded-full hover:bg-primary-50 transition-colors cursor-pointer",
                step === 4 &&
                  isGenerating &&
                  "opacity-20 cursor-not-allowed pointer-events-none",
              )}
            >
              <ArrowLeft size={18} weight="bold" />
            </button>
          )}
        </div>

        {isMobile ? (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <img
              src="https://file.hstatic.net/200000355853/file/logo.svg"
              alt="Jemmia Logo"
              className="h-5 w-auto"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <span className="font-bold text-lg select-none text-primary-900">
            Visualize On Your Hand
          </span>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleCloseAttempt}
            className="text-primary-900/60 hover:text-primary-900 p-1.5 rounded-full hover:bg-primary-50 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row bg-white relative overflow-hidden">
        {isMobile ? (
          <div
            className={cn(
              "flex-1 flex flex-col justify-between bg-white min-w-0 p-4",
              step === 1 ? "overflow-hidden" : "overflow-y-auto",
            )}
          >
            {step === 1 && <MobileStep1 />}
            {step === 2 && <MobileStep2 />}
            {step === 3 && <MobileStep3 />}
            {step === 4 && <MobileStep4 />}
          </div>
        ) : (
          <>
            {/* Left Panel: Instructions/Upload/Catalog */}
            <div
              className={cn(
                "p-6 flex flex-col justify-between shrink-0 overflow-y-auto transition-all duration-300",
                step === 3 ? "w-full md:w-[70%]" : "w-full md:w-[35%]",
              )}
            >
              <div className="space-y-5 flex flex-col min-h-0">
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
              <div className="flex flex-col gap-2.5 shrink-0">
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
      {showGuide && (
        <TryOnGuide
          onClose={() => {
            setShowGuide(false);
            sessionStorage.setItem(TRYON_GUIDE_SHOWN_KEY, "true");
          }}
        />
      )}
    </motion.div>,
    document.body,
  );
}
