import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  ArrowLeft,
  X,
  WarningCircle,
} from "@phosphor-icons/react";
import { ProductModel } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import screenfull from "screenfull";
import Moveable from "react-moveable";

// Hooks
import { useTryOnCamera } from "./TryOn/hooks/useTryOnCamera";
import { useTryOnGestures } from "./TryOn/hooks/useTryOnGestures";
import { useTryOnCatalog } from "./TryOn/hooks/useTryOnCatalog";

// Components
import {
  MobileStep1,
  DesktopStep1Left,
  DesktopStep1Bottom,
  DesktopStep1Right,
} from "./TryOn/components/Step1Upload";
import { MobileStep2, DesktopStep2Bottom } from "./TryOn/components/Step2Confirm";
import {
  MobileStep3,
  DesktopStep3Left,
  DesktopStep3Right,
} from "./TryOn/components/Step3Catalog";
import {
  MobileStep4,
  DesktopStep4Left,
  DesktopStep4Bottom,
} from "./TryOn/components/Step4Result";
import { ResultCanvas } from "./TryOn/components/ResultCanvas";
import { MoveableRedBox } from "./TryOn/components/MoveableRedBox";
import { LightboxModal } from "./TryOn/components/LightboxModal";
import { formatPrice } from "./TryOn/utils";

interface TryOnDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TryOnDrawer({ isOpen, onClose }: TryOnDrawerProps) {
  const [step, setStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedRing, setSelectedRing] = useState<ProductModel | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedGeneratedImage, setSelectedGeneratedImage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isTryingOn, setisTryingOn] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useRef(0);

  // Responsive device width observer
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 993);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Monitor isTryingOn in localStorage across tabs/windows
  useEffect(() => {
    const checkStorage = () => {
      setisTryingOn(localStorage.getItem("isTryingOn") === "true");
    };
    checkStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "isTryingOn") {
        setisTryingOn(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Reset the device isTryingOn lock if this tab unloads while generating
  useEffect(() => {
    const handleUnload = () => {
      if (localStorage.getItem("isTryingOn") === "true") {
        localStorage.setItem("isTryingOn", "false");
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // Custom Hooks
  const {
    isCameraActive,
    useMirror,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
  } = useTryOnCamera({
    isMobile,
    onPhotoCaptured: (dataUrl) => {
      setUploadedImage(dataUrl);
      setDragTranslate([0, 0]);
      cumulativeTranslate.current = [0, 0];
      setStep(2);
    },
    onCameraFallback: () => {
      document.getElementById("tryon-camera-capture")?.click();
    },
  });

  const {
    ringScale,
    setRingScale,
    ringRotation,
    setRingRotation,
    dragTranslate,
    setDragTranslate,
    fingerPosition,
    setFingerPosition,
    containerWidth,
    setContainerWidth,
    ringContainerRef,
    redBoxRef,
    ringTargetRef,
    moveableRedBoxRef,
    moveableRingRef,
    cumulativeTranslate,
    latestScale,
    latestRotation,
    handleContainerTouchStart,
    handleContainerTouchMove,
    handleContainerTouchEnd,
    handleContainerMouseDown,
    handleContainerMouseMove,
    handleContainerMouseUp,
    handleImageClick,
    triggerUpdateRect,
  } = useTryOnGestures({ step, uploadedImage });

  const {
    rings,
    searchQuery,
    setSearchQuery,
    isLoadingRings,
    isLoadingMore,
    mobileSentinelRef,
    desktopSentinelRef,
  } = useTryOnCatalog({ step, isOpen });

  const handleSelectGeneratedImage = (img: string | null) => {
    setSelectedGeneratedImage(img);
    setGeneratedImage(img);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSelectRing = (ring: ProductModel) => {
    const ringType = ring.type || "";
    const isRing = ringType.toLowerCase().includes("nhẫn");
    const isWeddingRing = ringType.toLowerCase().includes("nhẫn cưới");
    const hasThumbnail = !!ring.thumbnails?.[0]?.url;

    if (!hasThumbnail) {
      setToastMessage("Sản phẩm không có ảnh nên không sử dụng được tính năng");
      return;
    }

    if (!isRing || isWeddingRing) {
      setToastMessage("Tính năng chỉ khả dụng cho trang sức nhẫn");
      return;
    }

    setSelectedRing(ring);
  };

  const handleTryOn = async () => {
    if (localStorage.getItem("isTryingOn") === "true") {
      setToastMessage("Hệ thống đang xử lý yêu cầu thử nhẫn trên một cửa sổ khác.");
      return;
    }

    localStorage.setItem("isTryingOn", "true");
    setisTryingOn(true);

    if (!selectedRing || !uploadedImage) {
      localStorage.setItem("isTryingOn", "false");
      setisTryingOn(false);
      return;
    }

    setStep(4);
    setIsGenerating(true);
    setGeneratedImages([]);
    setSelectedGeneratedImage(null);
    setGenerationError(null);

    const isFakeMode = true; // Set to true to mock image generation for UI development

    if (isFakeMode) {
      setTimeout(() => {
        const mockUrls = [
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=600&auto=format&fit=crop",
        ];
        setGeneratedImages(mockUrls);
        setGeneratedImage(mockUrls[0]);
        setIsGenerating(false);
      }, 10000);
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const imgHand = new Image();
      imgHand.crossOrigin = "anonymous";

      const filePromise = new Promise<File>((resolve, reject) => {
        imgHand.onload = () => {
          canvas.width = imgHand.naturalWidth || 600;
          canvas.height = imgHand.naturalHeight || 600;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get 2D context"));
            return;
          }

          // Draw hand background
          ctx.drawImage(imgHand, 0, 0, canvas.width, canvas.height);

          // Draw red box overlay
          ctx.save();

          const containerWidthVal =
            ringContainerRef.current?.getBoundingClientRect().width || 400;

          const boxWidthPx = 48 * ringScale;
          const boxHeightPx = 18 * ringScale;

          const initialLeftPx = (fingerPosition.x / 100) * containerWidthVal;
          const initialTopPx = (fingerPosition.y / 100) * containerWidthVal;

          const finalLeftPx = initialLeftPx + dragTranslate[0];
          const finalTopPx = initialTopPx + dragTranslate[1];

          const centerX = finalLeftPx + boxWidthPx / 2;
          const centerY = finalTopPx + boxHeightPx / 2;

          const targetX = (centerX / containerWidthVal) * canvas.width;
          const targetY = (centerY / containerWidthVal) * canvas.height;

          const boxWidthCanvas =
            (boxWidthPx / containerWidthVal) * canvas.width;
          const boxHeightCanvas =
            (boxHeightPx / containerWidthVal) * canvas.height;

          ctx.translate(targetX, targetY);
          ctx.rotate((ringRotation * Math.PI) / 180);

          ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
          ctx.fillRect(
            -boxWidthCanvas / 2,
            -boxHeightCanvas / 2,
            boxWidthCanvas,
            boxHeightCanvas,
          );

          ctx.strokeStyle = "rgb(239, 68, 68)";
          ctx.lineWidth = 2 * (canvas.width / containerWidthVal);
          ctx.strokeRect(
            -boxWidthCanvas / 2,
            -boxHeightCanvas / 2,
            boxWidthCanvas,
            boxHeightCanvas,
          );

          ctx.restore();

          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "hand_with_box.png", {
                type: "image/png",
              });
              resolve(file);
            } else {
              reject(new Error("Failed to create blob"));
            }
          }, "image/png");
        };

        imgHand.onerror = () => {
          reject(new Error("Failed to load hand image"));
        };

        imgHand.src = uploadedImage;
      });

      const file = await filePromise;

      const formData = new FormData();
      formData.append("image1Url", selectedRing.thumbnails?.[0]?.url || "");
      formData.append(
        "image2Url",
        selectedRing.thumbnails?.[1]?.url ||
          selectedRing.images?.[0]?.url ||
          "",
      );
      formData.append("image3", file);
      if (isFakeMode) {
        formData.append("isFake", "true");
      }

      const promises = Array.from({ length: 4 }).map(() =>
        axios.post<{
          base64: string;
          mimeType: string;
          caption: string | null;
        }>("/image-generation/generate", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
      );

      const results = await Promise.allSettled(promises);
      let urls = results
        .filter(
          (r): r is PromiseFulfilledResult<any> => r.status === "fulfilled",
        )
        .map((r) => r.value)
        .filter((r) => r.data && r.data.base64)
        .map(
          (r) =>
            `data:${r.data.mimeType || "image/png"};base64,${r.data.base64}`,
        );

      if (urls.length === 0 && isFakeMode) {
        urls = [
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=600&auto=format&fit=crop",
        ];
      }

      if (urls.length > 0) {
        setGeneratedImages(urls);
        setGeneratedImage(urls[0]);
      } else {
        setToastMessage("Không thể tạo hình ảnh thử trực tuyến.");
        setGenerationError("Không thể tạo hình ảnh thử trực tuyến.");
      }
    } catch (e) {
      if (isFakeMode) {
        const mockUrls = [
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=600&auto=format&fit=crop",
        ];
        setGeneratedImages(mockUrls);
        setGeneratedImage(mockUrls[0]);
      } else {
        console.error("Image generation failed:", e);
        setToastMessage("Lỗi kết nối máy chủ khi tạo ảnh thử trực tuyến.");
        setGenerationError("Lỗi kết nối máy chủ khi tạo ảnh thử trực tuyến.");
      }
    } finally {
      setIsGenerating(false);
      localStorage.setItem("isTryingOn", "false");
      setisTryingOn(false);
    }
  };

  useEffect(() => {
    const updateSize = () => {
      if (ringContainerRef.current) {
        setContainerWidth(
          ringContainerRef.current.getBoundingClientRect().width,
        );
      }
    };
    updateSize();
    const timer = setTimeout(updateSize, 300);
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      clearTimeout(timer);
    };
  }, [isOpen, step]);

  // Lightbox / Screenfull Fullscreen triggers
  useEffect(() => {
    if (!screenfull.isEnabled) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(screenfull.isFullscreen);
    };

    screenfull.on("change", handleFullscreenChange);
    return () => {
      screenfull.off("change", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (isFullscreen && screenfull.isEnabled && lightboxRef.current) {
      screenfull.request(lightboxRef.current).catch((err) => {
        console.error("Error enabling browser fullscreen:", err);
      });
    }
  }, [isFullscreen]);

  const handleCloseFullscreen = () => {
    if (screenfull.isEnabled && screenfull.isFullscreen) {
      screenfull.exit();
    } else {
      setIsFullscreen(false);
    }
  };

  // Scroll lock overlay styling hooks
  useEffect(() => {
    if (isOpen) {
      scrollPosition.current = window.pageYOffset;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPosition.current}px`;
      document.body.style.width = "100%";
      document.documentElement.style.overflow = "hidden";
    } else {
      stopCamera();
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.documentElement.style.overflow = "";
      window.scrollTo(0, scrollPosition.current);
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          setDragTranslate([0, 0]);
          cumulativeTranslate.current = [0, 0];
          setStep(2);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (generatedImage) {
      try {
        if (generatedImage.startsWith("data:")) {
          const link = document.createElement("a");
          link.download = `jemmia_try_on_${Date.now()}.png`;
          link.href = generatedImage;
          link.click();
        } else {
          const response = await fetch(generatedImage);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.download = `jemmia_try_on_${Date.now()}.png`;
          link.href = blobUrl;
          link.click();

          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        }
      } catch (e) {
        console.error("Download failed, fallback to direct link:", e);
        const link = document.createElement("a");
        link.target = "_blank";
        link.href = generatedImage;
        link.click();
      }
      return;
    }

    if (!uploadedImage || !selectedRing) return;

    const canvas = document.createElement("canvas");
    const imgHand = new Image();
    const imgRing = new Image();

    imgHand.crossOrigin = "anonymous";
    imgRing.crossOrigin = "anonymous";

    imgHand.onload = () => {
      canvas.width = imgHand.naturalWidth || 600;
      canvas.height = imgHand.naturalHeight || 600;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(imgHand, 0, 0, canvas.width, canvas.height);

        imgRing.onload = () => {
          ctx.save();

          const containerWidthVal =
            ringContainerRef.current?.getBoundingClientRect().width || 400;
          const ringWidthPx = containerWidthVal * 0.08 * ringScale;
          const ringHeightPx = containerWidthVal * 0.08 * ringScale;

          const initialLeftPx = (fingerPosition.x / 100) * containerWidthVal;
          const initialTopPx = (fingerPosition.y / 100) * containerWidthVal;

          const finalLeftPx = initialLeftPx + dragTranslate[0];
          const finalTopPx = initialTopPx + dragTranslate[1];

          const centerX = finalLeftPx + ringWidthPx / 2;
          const centerY = finalTopPx + ringHeightPx / 2;

          const targetX = (centerX / containerWidthVal) * canvas.width;
          const targetY = (centerY / containerWidthVal) * canvas.height;

          const ringWidth = canvas.width * 0.08 * ringScale;
          const ringHeight = canvas.width * 0.08 * ringScale;

          ctx.translate(targetX, targetY);
          ctx.rotate((ringRotation * Math.PI) / 180);
          ctx.drawImage(
            imgRing,
            -ringWidth / 2,
            -ringHeight / 2,
            ringWidth,
            ringHeight,
          );
          ctx.restore();

          const link = document.createElement("a");
          link.download = `jemmia_try_on_${Date.now()}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        };
        imgRing.src = selectedRing.thumbnails?.[0]?.url;
      }
    };
    imgHand.src = uploadedImage;
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
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

            {/* Header Title Bar */}
            <div className="h-12 px-4 bg-white border-b border-primary-100 flex items-center justify-between shrink-0 relative">
              <div className="flex items-center">
                {step === 1 ? (
                  <button
                    onClick={onClose}
                    className="text-primary-900/60 hover:text-primary-900 p-1 rounded-full hover:bg-primary-50 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={18} weight="bold" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (step === 4 && selectedGeneratedImage) {
                        handleSelectGeneratedImage(null);
                      } else {
                        if (step === 2) stopCamera();
                        setStep(step - 1);
                      }
                    }}
                    className="text-primary-900/60 hover:text-primary-900 p-1 rounded-full hover:bg-primary-50 transition-colors cursor-pointer"
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
                {!isMobile && (
                  <span className="text-xs text-primary-400 font-mono tracking-widest uppercase select-none">
                    Step {step} / 4
                  </span>
                )}
                <button
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
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
                  {step === 1 && (
                    <MobileStep1
                      isCameraActive={isCameraActive}
                      useMirror={useMirror}
                      videoRef={videoRef}
                      fileInputRef={fileInputRef}
                      handleFileUpload={handleFileUpload}
                      startCamera={startCamera}
                      capturePhoto={capturePhoto}
                    />
                  )}
                  {step === 2 && (
                    <MobileStep2
                      uploadedImage={uploadedImage}
                      setStep={setStep}
                      setUploadedImage={setUploadedImage}
                      startCamera={startCamera}
                      ringContainerRef={ringContainerRef}
                      handleContainerTouchStart={handleContainerTouchStart}
                      handleContainerTouchMove={handleContainerTouchMove}
                      handleContainerTouchEnd={handleContainerTouchEnd}
                      handleContainerMouseDown={handleContainerMouseDown}
                      handleContainerMouseMove={handleContainerMouseMove}
                      handleContainerMouseUp={handleContainerMouseUp}
                      triggerUpdateRect={triggerUpdateRect}
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
                  )}
                  {step === 3 && (
                    <MobileStep3
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      isLoadingRings={isLoadingRings}
                      isLoadingMore={isLoadingMore}
                      rings={rings}
                      selectedRing={selectedRing}
                      handleSelectRing={handleSelectRing}
                      mobileSentinelRef={mobileSentinelRef}
                      setToastMessage={setToastMessage}
                      handleTryOn={handleTryOn}
                      isTryingOn={isTryingOn}
                    />
                  )}
                  {step === 4 && (
                    <MobileStep4
                      isGenerating={isGenerating}
                      uploadedImage={uploadedImage}
                      selectedGeneratedImage={selectedGeneratedImage}
                      generatedImages={generatedImages}
                      handleSelectGeneratedImage={handleSelectGeneratedImage}
                      handleDownload={handleDownload}
                      setIsFullscreen={setIsFullscreen}
                      handleTryOn={handleTryOn}
                      generationError={generationError}
                      isTryingOn={isTryingOn}
                    />
                  )}
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
                      <div className="flex gap-2 shrink-0">
                        <div
                          className={`h-1 w-9 transition-all rounded-full ${step >= 1 ? "bg-primary-900" : "bg-primary-100"}`}
                        />
                        <div
                          className={`h-1 w-9 transition-all rounded-full ${step >= 2 ? "bg-primary-900" : "bg-primary-100"}`}
                        />
                        <div
                          className={`h-1 w-9 transition-all rounded-full ${step >= 3 ? "bg-primary-900" : "bg-primary-100"}`}
                        />
                        <div
                          className={`h-1 w-9 transition-all rounded-full ${step >= 4 ? "bg-primary-900" : "bg-primary-100"}`}
                        />
                      </div>

                      {step === 1 && <DesktopStep1Left />}
                      {step === 2 && <DesktopStep1Left />}
                      {step === 3 && (
                        <DesktopStep3Left
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          isLoadingRings={isLoadingRings}
                          isLoadingMore={isLoadingMore}
                          rings={rings}
                          selectedRing={selectedRing}
                          handleSelectRing={handleSelectRing}
                          desktopSentinelRef={desktopSentinelRef}
                        />
                      )}
                      {step === 4 && <DesktopStep4Left />}
                    </div>

                    {/* Bottom Actions for Left Panel */}
                    <div className="flex flex-col gap-2.5 shrink-0">
                      {step === 1 && (
                        <DesktopStep1Bottom
                          isCameraActive={isCameraActive}
                          fileInputRef={fileInputRef}
                          handleFileUpload={handleFileUpload}
                          startCamera={startCamera}
                          capturePhoto={capturePhoto}
                        />
                      )}
                      {step === 2 && (
                        <DesktopStep2Bottom
                          uploadedImage={uploadedImage}
                          setStep={setStep}
                          setUploadedImage={setUploadedImage}
                          startCamera={startCamera}
                        />
                      )}
                      {step === 4 && (
                        <DesktopStep4Bottom
                          selectedRing={selectedRing}
                          isGenerating={isGenerating}
                          selectedGeneratedImage={selectedGeneratedImage}
                          handleTryOn={handleTryOn}
                          isTryingOn={isTryingOn}
                        />
                      )}
                    </div>
                  </div>

                  {/* Right Panel: Interactive Canvas / Upload Preview or Step 3 Product Details */}
                  {step === 3 ? (
                    <DesktopStep3Right
                      selectedRing={selectedRing}
                      handleTryOn={handleTryOn}
                      isTryingOn={isTryingOn}
                    />
                  ) : step === 4 ? (
                    /* Desktop Step 4 Right Panel */
                    <div className="grow flex items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden min-w-0 h-full">
                      <ResultCanvas
                        isMobile={false}
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
                  ) : (
                    /* Desktop Step 1 & 2 Right Panel Canvas */
                    <div className="grow flex items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden min-w-0">
                      <div
                        ref={ringContainerRef}
                        className={`w-full aspect-square max-w-175 relative overflow-hidden flex items-center justify-center select-none transition-all duration-300 ${
                          step === 1
                            ? "bg-transparent border-none"
                            : "bg-white border border-primary-200 shadow-lg"
                        }`}
                        style={{ cursor: "default" }}
                        onTouchStart={handleContainerTouchStart}
                        onTouchMove={handleContainerTouchMove}
                        onTouchEnd={handleContainerTouchEnd}
                        onTouchCancel={handleContainerTouchEnd}
                        onMouseDown={handleContainerMouseDown}
                        onMouseMove={handleContainerMouseMove}
                        onMouseUp={handleContainerMouseUp}
                        onMouseLeave={handleContainerMouseUp}
                        onClick={handleImageClick}
                      >
                        {step === 1 && (
                          <DesktopStep1Right
                            isCameraActive={isCameraActive}
                            videoRef={videoRef}
                            useMirror={useMirror}
                          />
                        )}

                        {uploadedImage && step !== 1 && (
                          <img
                            src={generatedImage || uploadedImage}
                            className="w-full h-full object-cover"
                            alt="Hand Preview"
                            draggable={false}
                            onLoad={triggerUpdateRect}
                          />
                        )}

                        <MoveableRedBox
                          step={step}
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

                        {/* Visual Ring Overlay (Step 4 only, desktop fallback if no generatedImage) */}
                        {!generatedImage &&
                          uploadedImage &&
                          step === 4 &&
                          selectedRing && (
                            <>
                              <div
                                ref={ringTargetRef}
                                className="absolute pointer-events-auto cursor-move select-none"
                                style={{
                                  left: `${fingerPosition.x}%`,
                                  top: `${fingerPosition.y}%`,
                                  width: `${36 * ringScale}px`,
                                  height: `${36 * ringScale}px`,
                                  transform: `translate(${dragTranslate[0]}px, ${dragTranslate[1]}px) rotate(${ringRotation}deg)`,
                                }}
                              >
                                <img
                                  src={selectedRing.thumbnails?.[0]?.url}
                                  className="w-full h-full object-contain select-none"
                                  alt={selectedRing.title}
                                  draggable={false}
                                />
                              </div>
                              <Moveable
                                ref={moveableRingRef}
                                target={ringTargetRef}
                                draggable={true}
                                resizable={true}
                                rotatable={true}
                                keepRatio={true}
                                origin={false}
                                throttleRotate={0}
                                onDragStart={({ set }) => {
                                  set(cumulativeTranslate.current);
                                }}
                                onResizeStart={({ dragStart }) => {
                                  dragStart &&
                                    dragStart.set(cumulativeTranslate.current);
                                }}
                                onRotateStart={({ dragStart }) => {
                                  dragStart &&
                                    dragStart.set(cumulativeTranslate.current);
                                }}
                                onDrag={(e) => {
                                  cumulativeTranslate.current =
                                    e.beforeTranslate;
                                  e.target.style.transform = e.transform;
                                }}
                                onDragEnd={() => {
                                  setDragTranslate(cumulativeTranslate.current);
                                }}
                                onResize={(e) => {
                                  e.target.style.width = `${e.width}px`;
                                  e.target.style.height = `${e.height}px`;
                                  e.target.style.transform = e.transform;
                                  cumulativeTranslate.current =
                                    e.drag.beforeTranslate;
                                  latestScale.current = e.width / 36;
                                }}
                                onResizeEnd={() => {
                                  setRingScale(latestScale.current);
                                  setDragTranslate(cumulativeTranslate.current);
                                }}
                                onRotate={(e) => {
                                  e.target.style.transform = e.transform;
                                  cumulativeTranslate.current =
                                    e.drag.beforeTranslate;
                                  latestRotation.current = e.rotation;
                                }}
                                onRotateEnd={() => {
                                  setRingRotation(latestRotation.current);
                                  setDragTranslate(cumulativeTranslate.current);
                                }}
                              />
                            </>
                          )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          <LightboxModal
            isFullscreen={isFullscreen}
            lightboxRef={lightboxRef}
            selectedGeneratedImage={selectedGeneratedImage}
            handleCloseFullscreen={handleCloseFullscreen}
          />
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
