import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  ArrowLeft,
  X,
  WarningCircle,
  Question,
  ArrowRight,
  LockSimple,
  ArrowCounterClockwise,
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
import {
  MobileStep2,
  DesktopStep2Bottom,
} from "./TryOn/components/Step2Confirm";
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
import { MobileProgressBar } from "./TryOn/components/MobileProgressBar";
import { TryOnGuide } from "./TryOn/components/TryOnGuide";

function getSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function freeStorageSpace(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith("tryon_cache_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} tryon cache items from sessionStorage to free up space.`);
  } catch (e) {
    console.error("Failed to free storage space:", e);
  }
}

function resizeAndCompressImage(
  base64OrUrl: string,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    if (!base64OrUrl || !base64OrUrl.startsWith("data:image")) {
      resolve(base64OrUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64OrUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedBase64);
    };
    img.onerror = () => {
      resolve(base64OrUrl);
    };
    img.src = base64OrUrl;
  });
}

function safeSessionStorageSetItem(key: string, value: string): boolean {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`sessionStorage setItem failed for key "${key}", attempting to free space...`, e);
    freeStorageSpace();
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (retryErr) {
      console.error(`sessionStorage setItem failed again for key "${key}" after clearing cache:`, retryErr);
      return false;
    }
  }
}

function safeLocalStorageSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.error(`localStorage setItem failed for key "${key}":`, e);
    return false;
  }
}


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
  const [selectedGeneratedImage, setSelectedGeneratedImage] = useState<
    string | null
  >(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isTryingOn, setisTryingOn] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [savedSessionStep, setSavedSessionStep] = useState<number | null>(null);

  const handleOpenGuide = () => {
    setShowGuide(true);
    setGuideStep(1);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useRef(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Reset the device isTryingOn lock if this tab unloads while generating (and no async task is active in step 4)
  useEffect(() => {
    const handleUnload = () => {
      const activeSessionStr = sessionStorage.getItem("active_tryon_session");
      let isStep4 = false;
      if (activeSessionStr) {
        try {
          const session = JSON.parse(activeSessionStr);
          isStep4 = session && session.step === 4;
        } catch (e) {}
      }
      if (!isStep4 && localStorage.getItem("isTryingOn") === "true") {
        safeLocalStorageSetItem("isTryingOn", "false");
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
    onPhotoCaptured: async (dataUrl) => {
      const compressed = await resizeAndCompressImage(dataUrl);
      setUploadedImage(compressed);
      setDragTranslate([0, 0]);
      cumulativeTranslate.current = [0, 0];
      const hasShownGuide =
        sessionStorage.getItem("tryon_guide_shown") === "true";
      if (!hasShownGuide) {
        setShowGuide(true);
        setGuideStep(1);
      }
      setStep(2);
      setMaxStep(2);
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

  const pollTaskStatus = (taskId: string, targetRing: ProductModel, targetImage: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get<{
          status: "queued" | "processing" | "completed" | "failed";
          result?: { base64: string; mimeType: string };
          error?: string;
        }>(`/image-generation/status/${taskId}`);

        const { status, result, error } = response.data;

        if (status === "completed" && result?.base64) {
          const imageUrl = `data:${result.mimeType || "image/png"};base64,${result.base64}`;
          const compressedResult = await resizeAndCompressImage(imageUrl);
          setGeneratedImages([compressedResult]);
          setGeneratedImage(compressedResult);
          setSelectedGeneratedImage(compressedResult);
          setIsGenerating(false);
          safeLocalStorageSetItem("isTryingOn", "false");
          setisTryingOn(false);

          // Save cache
          const cacheKey = `tryon_cache_${targetRing.id}_${getSimpleHash(targetImage)}`;
          safeSessionStorageSetItem(cacheKey, JSON.stringify([compressedResult]));

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else if (status === "failed") {
          setToastMessage(error || "Không thể tạo hình ảnh thử trực tuyến.");
          setGenerationError(error || "Không thể tạo hình ảnh thử trực tuyến.");
          setIsGenerating(false);
          safeLocalStorageSetItem("isTryingOn", "false");
          setisTryingOn(false);

          // Clean up session on failure
          sessionStorage.removeItem("active_tryon_session");

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (err: any) {
        console.error("Error polling task status:", err);
        if (err.response?.status === 404) {
          setIsGenerating(false);
          safeLocalStorageSetItem("isTryingOn", "false");
          setisTryingOn(false);
          sessionStorage.removeItem("active_tryon_session");

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      }
    }, 3000);
  };

  const handleResumeSession = () => {
    setShowResumePopup(false);
  };

  // Open resume popup and load active session details immediately on mount/open
  useEffect(() => {
    if (isOpen) {
      const activeSessionStr = sessionStorage.getItem("active_tryon_session");
      if (activeSessionStr) {
        try {
          const session = JSON.parse(activeSessionStr);
          if (session) {
            const resumeStep = session.maxStep || session.step;
            if (resumeStep > 1) {
              setStep(resumeStep);
              setSelectedRing(session.selectedRing);
              setUploadedImage(session.uploadedImage);
              setFingerPosition(session.fingerPosition);
              setRingScale(session.ringScale);
              setRingRotation(session.ringRotation);
              setDragTranslate(session.dragTranslate);
              setMaxStep(resumeStep);

              if (session.generatedImage) {
                setGeneratedImage(session.generatedImage);
                setGeneratedImages(session.generatedImages || [session.generatedImage]);
                setSelectedGeneratedImage(session.selectedGeneratedImage || session.generatedImage);
                setIsGenerating(false);
                safeLocalStorageSetItem("isTryingOn", "false");
                setisTryingOn(false);
              } else if (resumeStep === 4) {
                setIsGenerating(true);
                safeLocalStorageSetItem("isTryingOn", "true");
                setisTryingOn(true);
                if (session.taskId) {
                  pollTaskStatus(session.taskId, session.selectedRing, session.uploadedImage);
                }
              } else {
                safeLocalStorageSetItem("isTryingOn", "false");
                setisTryingOn(false);
              }

              setSavedSessionStep(resumeStep);
              setShowResumePopup(true);
              return;
            }
          }
        } catch (err) {
          console.error("Failed to parse saved session on open:", err);
          sessionStorage.removeItem("active_tryon_session");
        }
      }

      const resumeStep = Math.max(maxStep, step);
      if (resumeStep > 1) {
        setSavedSessionStep(resumeStep);
        setShowResumePopup(true);
      }
    }
  }, [isOpen]);

  // Save active session to sessionStorage on any state changes
  useEffect(() => {
    if (step > 1 && uploadedImage) {
      let existingTaskId = null;
      try {
        const existingSessionStr = sessionStorage.getItem("active_tryon_session");
        if (existingSessionStr) {
          const parsed = JSON.parse(existingSessionStr);
          if (parsed && parsed.taskId) {
            existingTaskId = parsed.taskId;
          }
        }
      } catch (err) {
        console.error(err);
      }

      const sessionData = {
        taskId: existingTaskId,
        step,
        maxStep: Math.max(maxStep, step),
        selectedRing,
        uploadedImage,
        fingerPosition,
        ringScale,
        ringRotation,
        dragTranslate,
        generatedImage,
        generatedImages,
        selectedGeneratedImage,
      };
      safeSessionStorageSetItem("active_tryon_session", JSON.stringify(sessionData));
    }
  }, [
    step,
    selectedRing,
    uploadedImage,
    fingerPosition,
    ringScale,
    ringRotation,
    dragTranslate,
    generatedImage,
    generatedImages,
    selectedGeneratedImage,
  ]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleResetAll = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    sessionStorage.removeItem("active_tryon_session");
    safeLocalStorageSetItem("isTryingOn", "false");
    setisTryingOn(false);
    setStep(1);
    setUploadedImage(null);
    setSelectedRing(null);
    setGeneratedImage(null);
    setGeneratedImages([]);
    setSelectedGeneratedImage(null);
    setGenerationError(null);
    setMaxStep(1);
  };

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

  useEffect(() => {
    if (step > maxStep) {
      setMaxStep(step);
    }
  }, [step, maxStep]);

  useEffect(() => {
    if (!uploadedImage) {
      setMaxStep(1);
    }
  }, [uploadedImage]);

  // Removed old showResumePopup check since it is handled by the new mount/open session restoration effect

  const handleStepClick = (targetStep: number) => {
    if (step === 4 && isGenerating) return;
    if (step === 2) stopCamera();
    setStep(targetStep);
  };

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
    setMaxStep(3);
    setGeneratedImage(null);
    setGeneratedImages([]);
    setSelectedGeneratedImage(null);
    setGenerationError(null);
  };

  const handleTryOn = async () => {
    if (localStorage.getItem("isTryingOn") === "true") {
      setToastMessage(
        "Hệ thống đang xử lý yêu cầu thử nhẫn trên một cửa sổ khác.",
      );
      return;
    }

    safeLocalStorageSetItem("isTryingOn", "true");
    setisTryingOn(true);

    if (!selectedRing || !uploadedImage) {
      safeLocalStorageSetItem("isTryingOn", "false");
      setisTryingOn(false);
      return;
    }

    const cacheKey = `tryon_cache_${selectedRing.id}_${getSimpleHash(uploadedImage)}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
      try {
        const cachedUrls = JSON.parse(cachedData) as string[];
        if (cachedUrls && cachedUrls.length > 0) {
          setStep(4);
          setIsGenerating(true);
          setGeneratedImages([]);
          setSelectedGeneratedImage(null);
          setGenerationError(null);

          setTimeout(() => {
            setGeneratedImages(cachedUrls);
            setGeneratedImage(cachedUrls[0]);
            setSelectedGeneratedImage(cachedUrls[0]);
            setIsGenerating(false);
            safeLocalStorageSetItem("isTryingOn", "false");
            setisTryingOn(false);
          }, 1000);
          return;
        }
      } catch (err) {
        console.error("Error parsing cached data:", err);
      }
    }

    setStep(4);
    setIsGenerating(true);
    setGeneratedImages([]);
    setSelectedGeneratedImage(null);
    setGenerationError(null);

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
      selectedRing.thumbnails.forEach((t) => {
        if (t?.url) {
          formData.append("imageUrls", t.url);
        }
      });
      formData.append("handImage", file);
      formData.append("designCode", selectedRing.attributes?.designCode || "");

      const response = await axios.post<{ taskId: string }>("/image-generation/generate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const taskId = response.data.taskId;
      if (!taskId) {
        throw new Error("Không nhận được taskId từ máy chủ.");
      }

      // Save active try-on session
      const sessionData = {
        taskId,
        step: 4,
        selectedRing,
        uploadedImage,
        fingerPosition,
        ringScale,
        ringRotation,
        dragTranslate,
      };
      safeSessionStorageSetItem("active_tryon_session", JSON.stringify(sessionData));

      // Start polling
      pollTaskStatus(taskId, selectedRing, uploadedImage);
    } catch (e) {
      console.error("Image generation failed:", e);
      setToastMessage("Lỗi kết nối máy chủ khi tạo ảnh thử trực tuyến.");
      setGenerationError("Lỗi kết nối máy chủ khi tạo ảnh thử trực tuyến.");
      setIsGenerating(false);
      safeLocalStorageSetItem("isTryingOn", "false");
      setisTryingOn(false);
      sessionStorage.removeItem("active_tryon_session");
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
      reader.onload = async (event) => {
        if (event.target?.result) {
          const compressed = await resizeAndCompressImage(event.target.result as string);
          setUploadedImage(compressed);
          setDragTranslate([0, 0]);
          cumulativeTranslate.current = [0, 0];
          const hasShownGuide =
            sessionStorage.getItem("tryon_guide_shown") === "true";
          if (!hasShownGuide) {
            setShowGuide(true);
            setGuideStep(1);
          }
          setStep(2);
          setMaxStep(2);
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
            {showResumePopup && createPortal(
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                <motion.div
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
                    Bạn đang thực hiện dở quá trình thử nhẫn (Bước {savedSessionStep || step}/4)
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 text-sm leading-relaxed mx-4 lg:mx-0">
                    Bạn có muốn tiếp tục từ bước này hay bắt đầu lại từ đầu?
                  </p>

                  {/* Buttons */}
                  <Button
                    onClick={handleResumeSession}
                    className="w-full bg-secondary-800 mb-2 text-white hover:bg-[#003C3A] disabled:bg-secondary-800/50 disabled:text-white h-12 rounded-none flex items-center justify-center gap-2 cursor-pointer border-none mt-6"
                  >
                    <span>Tiếp tục</span>
                    <ArrowRight size={16} weight="bold" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowResumePopup(false);
                      handleResetAll();
                    }}
                    className="w-full h-12 rounded-none border-primary-200 text-primary-900 bg-white hover:bg-primary-50 tracking-wider hover:text-primary-500"
                  >
                    Bắt đầu lại
                    <ArrowCounterClockwise size={16} />
                  </Button>
                </motion.div>
              </div>,
              document.body
            )}
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
                      stopCamera={stopCamera}
                    />
                  )}
                  {step === 2 && (
                    <MobileStep2
                      uploadedImage={uploadedImage}
                      setStep={handleStepClick}
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
                      onOpenGuide={handleOpenGuide}
                      maxStep={maxStep}
                      showResumePopup={showResumePopup}
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
                      setStep={handleStepClick}
                      maxStep={maxStep}
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
                      generationError={generationError}
                      selectedRing={selectedRing}
                      setStep={handleStepClick}
                      maxStep={maxStep}
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
                      {!showGuide && (
                        <div className="w-full shrink-0 mb-5">
                          <MobileProgressBar
                            activeCount={step}
                            onStepClick={handleStepClick}
                            disabled={step === 4 && isGenerating}
                            maxStep={maxStep}
                          />
                        </div>
                      )}

                      {step === 1 && <DesktopStep1Left />}
                      {step === 2 &&
                        (showGuide ? (
                          <div className="space-y-4 text-left animate-in fade-in duration-300">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                              {guideStep === 1
                                ? "Dùng 2 ngón để phóng to/thu nhỏ"
                                : "Dùng 1 ngón để chọn vị trí đeo nhẫn"}
                            </h3>
                            <ul className="text-sm text-slate-900 space-y-3 list-disc pl-4 leading-relaxed">
                              {guideStep === 1 ? (
                                <>
                                  <li>
                                    Đặt hai ngón tay lên màn hình để điều chỉnh
                                    kích thước red mark
                                  </li>
                                  <li>
                                    Kéo ra xa để phóng to, kéo lại gần để thu
                                    nhỏ.
                                  </li>
                                </>
                              ) : (
                                <>
                                  <li>
                                    Kéo red mark đến vị trí ngón tay bạn muốn
                                    thử nhẫn bằng 1 ngón tay
                                  </li>
                                  <li>
                                    Bạn có thể kết hợp phóng to/thu nhỏ để đặt
                                    khung chính xác hơn
                                  </li>
                                  <li>
                                    Khi red box nằm đúng vị trí, hệ thống sẽ
                                    hiển thị nhẫn trên ngón đó
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>
                        ) : (
                          <DesktopStep1Left />
                        ))}
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
                      {step === 2 &&
                        (showGuide ? (
                          <div className="flex flex-col gap-2.5 animate-in fade-in duration-300">
                            <Button
                              onClick={() => {
                                if (guideStep === 1) {
                                  setGuideStep(2);
                                } else {
                                  setShowGuide(false);
                                  sessionStorage.setItem(
                                    "tryon_guide_shown",
                                    "true",
                                  );
                                }
                              }}
                              className="w-full bg-secondary-800 hover:bg-secondary-700 text-white font-semibold text-sm h-12 flex items-center justify-center gap-2 rounded-none cursor-pointer border-none shadow-none"
                            >
                              Tiếp tục
                              <ArrowRight size={16} weight="bold" />
                            </Button>
                            <div className="flex items-center justify-center gap-1.5 text-primary-400 text-xs mt-1 select-none">
                              <LockSimple size={14} weight="regular" />
                              <span>
                                Ảnh của bạn là riêng tư và được bảo vệ
                              </span>
                            </div>
                          </div>
                        ) : (
                          <DesktopStep2Bottom
                            uploadedImage={uploadedImage}
                            setStep={setStep}
                            setUploadedImage={setUploadedImage}
                            startCamera={startCamera}
                          />
                        ))}
                      {step === 4 && (
                        <DesktopStep4Bottom
                          selectedRing={selectedRing}
                          isGenerating={isGenerating}
                          selectedGeneratedImage={selectedGeneratedImage}
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
                      {step === 2 && showGuide ? (
                        <div className="h-auto max-w-160 xl:max-w-210 w-full rounded-lg overflow-hidden bg-white animate-in fade-in zoom-in duration-300">
                          <img
                            src={
                              guideStep === 1
                                ? "https://cdn.hstatic.net/files/200000355853/file/dropzone.png"
                                : "https://cdn.hstatic.net/files/200000355853/file/dropzone__1_.png"
                            }
                            className="w-full h-full object-cover select-none"
                            alt="Guide illustration"
                          />
                        </div>
                      ) : (
                        <div
                          ref={ringContainerRef}
                          className={`w-full max-w-160 xl:max-w-210 h-auto aspect-square relative overflow-hidden flex items-center justify-center select-none transition-all duration-300 ${
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
                              src={uploadedImage}
                              className="w-full h-full object-cover"
                              alt="Hand Preview"
                              draggable={false}
                              onLoad={triggerUpdateRect}
                            />
                          )}

                          {!showResumePopup && (
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
                          )}

                          {step === 2 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenGuide();
                              }}
                              className="absolute bottom-3 right-3 z-[100] w-10 h-10 rounded-full bg-white/95 hover:bg-white text-black flex items-center justify-center cursor-pointer  border border-primary-100 shadow-md transition-all active:scale-95"
                              title="Hướng dẫn cử chỉ"
                            >
                              <Question size={20} />
                            </button>
                          )}
                        </div>
                      )}
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

          {/* Guide Modal Overlay (Mobile only) */}
          {showGuide && isMobile && (
            <TryOnGuide
              guideStep={guideStep}
              onNext={() => {
                if (guideStep === 1) {
                  setGuideStep(2);
                } else {
                  setShowGuide(false);
                  sessionStorage.setItem("tryon_guide_shown", "true");
                }
              }}
              onClose={() => {
                setShowGuide(false);
                sessionStorage.setItem("tryon_guide_shown", "true");
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
