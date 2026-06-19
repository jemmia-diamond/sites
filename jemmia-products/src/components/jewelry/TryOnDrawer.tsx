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
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
} from "@phosphor-icons/react";
import { ProductModel } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import screenfull from "screenfull";

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
  DesktopStep2Left,
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
import { LightboxModal } from "./TryOn/components/LightboxModal";
import { MobileProgressBar } from "./TryOn/components/MobileProgressBar";
import { TryOnGuide } from "./TryOn/components/TryOnGuide";
import {
  TRYON_CACHE_PREFIX,
  TRYON_GUIDE_SHOWN_KEY,
  ACTIVE_TRYON_SESSION_KEY,
  TRYON_CAMERA_CAPTURE_ID,
} from "./TryOn/constants";

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
      if (key && key.startsWith(TRYON_CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
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
    freeStorageSpace();
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (retryErr) {
      return false;
    }
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
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [savedSessionStep, setSavedSessionStep] = useState<number | null>(null);
  const [alignmentPreviewUrl, setAlignmentPreviewUrl] = useState<string | null>(null);

  const handleOpenGuide = () => {
    setShowGuide(true);
    setGuideStep(1);
  };

  const handleCloseAttempt = () => {
    if (step > 1) {
      setShowExitPopup(true);
    } else {
      stopCamera();
      onClose();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useRef(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionRestoredRef = useRef(false);

  // Responsive device width observer
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 993);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
      setImageTranslate([0, 0]);
      setImageScale(1.0);
      setImageRotation(0);
      const hasShownGuide =
        sessionStorage.getItem(TRYON_GUIDE_SHOWN_KEY) === "true";
      if (!hasShownGuide) {
        setShowGuide(true);
        setGuideStep(1);
      }
      setStep(2);
      setMaxStep(2);
    },
    onCameraFallback: () => {
      document.getElementById(TRYON_CAMERA_CAPTURE_ID)?.click();
    },
  });

  const {
    imageScale,
    setImageScale,
    imageTranslate,
    setImageTranslate,
    imageRotation,
    setImageRotation,
    redBox,
    containerWidth,
    setContainerWidth,
    ringContainerRef,
    handleContainerTouchStart,
    handleContainerTouchMove,
    handleContainerTouchEnd,
    handleContainerMouseDown,
    handleContainerMouseMove,
    handleContainerMouseUp,
    resetZoom,
  } = useTryOnGestures({ step, uploadedImage });

  const getScaleFromSlider = (v: number): number => {
    if (v <= 1) {
      return 0.5 + v * 0.5; // Maps [0, 1] to [0.5, 1.0]
    }
    return 1.0 + (v - 1) * 3.0; // Maps [1, 2] to [1.0, 4.0]
  };

  const getSliderFromScale = (scale: number): number => {
    if (scale <= 1.0) {
      return Math.max(0, (scale - 0.5) / 0.5); // Maps [0.5, 1.0] to [0, 1]
    }
    return Math.min(2, 1.0 + (scale - 1.0) / 3.0); // Maps [1.0, 4.0] to [1, 2]
  };

  const handleZoomIn = () => {
    setImageScale((prev) => Math.min(prev + 0.15, 4.0));
  };

  const handleZoomOut = () => {
    setImageScale((prev) => Math.max(prev - 0.15, 0.5));
  };

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
          setisTryingOn(false);

          // Save cache
          const cacheKey = `${TRYON_CACHE_PREFIX}${targetRing.id}_${getSimpleHash(targetImage)}`;
          safeSessionStorageSetItem(cacheKey, JSON.stringify([compressedResult]));

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else if (status === "failed") {
          setToastMessage(error || "Không thể tạo hình ảnh thử trực tuyến.");
          setGenerationError(error || "Không thể tạo hình ảnh thử trực tuyến.");
          setIsGenerating(false);
          setisTryingOn(false);

          // Clean up session on failure
          sessionStorage.removeItem(ACTIVE_TRYON_SESSION_KEY);

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setIsGenerating(false);
          setisTryingOn(false);
          sessionStorage.removeItem(ACTIVE_TRYON_SESSION_KEY);

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
    if (isOpen && !sessionRestoredRef.current) {
      sessionRestoredRef.current = true;
      const activeSessionStr = sessionStorage.getItem(ACTIVE_TRYON_SESSION_KEY);
      if (activeSessionStr) {
        try {
          const session = JSON.parse(activeSessionStr);
          if (session) {
            const resumeStep = session.maxStep || session.step;
            if (resumeStep > 1) {
              setStep(resumeStep);
              setSelectedRing(session.selectedRing);
              setUploadedImage(session.uploadedImage);
              if (session.imageScale !== undefined) {
                setImageScale(session.imageScale);
              }
              if (session.imageTranslate !== undefined) {
                setImageTranslate(session.imageTranslate);
              }
              if (session.imageRotation !== undefined) {
                setImageRotation(session.imageRotation);
              }

              setMaxStep(resumeStep);

              if (session.generatedImage) {
                setGeneratedImage(session.generatedImage);
                setGeneratedImages(session.generatedImages || [session.generatedImage]);
                setSelectedGeneratedImage(session.selectedGeneratedImage || session.generatedImage);
                setIsGenerating(false);
                setisTryingOn(false);
              } else if (resumeStep === 4) {
                setIsGenerating(true);
                setisTryingOn(true);
                if (session.taskId) {
                  pollTaskStatus(session.taskId, session.selectedRing, session.uploadedImage);
                }
              } else {
                setisTryingOn(false);
              }

              setSavedSessionStep(resumeStep);
              setShowResumePopup(true);
              return;
            }
          }
        } catch (err) {
          sessionStorage.removeItem(ACTIVE_TRYON_SESSION_KEY);
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
        const existingSessionStr = sessionStorage.getItem(ACTIVE_TRYON_SESSION_KEY);
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
        imageScale,
        imageTranslate,
        imageRotation,
        redBox,
        fingerPosition: { x: 0, y: 0 },
        ringScale: 1.0,
        ringRotation: 0,
        dragTranslate: [0, 0],
        generatedImage,
        generatedImages,
        selectedGeneratedImage,
      };
      safeSessionStorageSetItem(ACTIVE_TRYON_SESSION_KEY, JSON.stringify(sessionData));
    }
  }, [
    step,
    selectedRing,
    uploadedImage,
    imageScale,
    imageTranslate,
    imageRotation,
    redBox,
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

  const handleGenerateAlignmentPreview = () => {
    if (!uploadedImage) return;

    const canvas = document.createElement("canvas");
    const imgHand = new Image();
    imgHand.crossOrigin = "anonymous";

    imgHand.onload = () => {
      canvas.width = imgHand.naturalWidth || 600;
      canvas.height = imgHand.naturalHeight || 600;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw original hand background (original size, no zoom/pan/rotate)
      ctx.drawImage(imgHand, 0, 0);

      const W_orig = canvas.width;
      const H_orig = canvas.height;
      const C_orig_x = W_orig / 2;
      const C_orig_y = H_orig / 2;

      const containerWidthVal =
        ringContainerRef.current?.getBoundingClientRect().width || 400;

      const r_orig = W_orig / H_orig;
      let S_base = 1;
      if (r_orig < 1) {
        S_base = containerWidthVal / W_orig;
      } else {
        S_base = containerWidthVal / H_orig;
      }
      const S_total = S_base * imageScale;

      const redBoxLeft = (redBox.x / 100) * containerWidthVal;
      const redBoxTop = (redBox.y / 100) * containerWidthVal;
      const redBoxWidth = (redBox.w / 100) * containerWidthVal;
      const redBoxHeight = (redBox.h / 100) * containerWidthVal;

      const redBoxCenterX = redBoxLeft + redBoxWidth / 2;
      const redBoxCenterY = redBoxTop + redBoxHeight / 2;

      const containerCenterX = containerWidthVal / 2;
      const containerCenterY = containerWidthVal / 2;

      const p_screen_x = redBoxCenterX - containerCenterX;
      const p_screen_y = redBoxCenterY - containerCenterY;

      const p_double_prime_x = p_screen_x - imageTranslate[0];
      const p_double_prime_y = p_screen_y - imageTranslate[1];

      const p_prime_x = p_double_prime_x / S_total;
      const p_prime_y = p_double_prime_y / S_total;

      const angleRad = (-imageRotation * Math.PI) / 180;
      const cosA = Math.cos(angleRad);
      const sinA = Math.sin(angleRad);
      const p_orig_x = p_prime_x * cosA - p_prime_y * sinA;
      const p_orig_y = p_prime_x * sinA + p_prime_y * cosA;

      const finalCenterX = C_orig_x + p_orig_x;
      const finalCenterY = C_orig_y + p_orig_y;

      const finalBoxW = redBoxWidth / S_total;
      const finalBoxH = redBoxHeight / S_total;

      // Draw red box overlay mapped to original coordinates and rotated
      if (redBox) {
        ctx.save();
        ctx.translate(finalCenterX, finalCenterY);
        ctx.rotate((-imageRotation * Math.PI) / 180);

        ctx.fillStyle = "rgba(239, 68, 68, 0.5)";
        ctx.fillRect(-finalBoxW / 2, -finalBoxH / 2, finalBoxW, finalBoxH);

        ctx.strokeStyle = "rgb(239, 68, 68)";
        ctx.lineWidth = Math.max(2, 2 / S_total);
        ctx.strokeRect(-finalBoxW / 2, -finalBoxH / 2, finalBoxW, finalBoxH);
        ctx.restore();
      }

      const previewUrl = canvas.toDataURL("image/png");
      setAlignmentPreviewUrl(previewUrl);
    };

    imgHand.src = uploadedImage;
  };

  const handleResetAll = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    sessionStorage.removeItem(ACTIVE_TRYON_SESSION_KEY);
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
    setisTryingOn(true);

    if (!selectedRing || !uploadedImage) {
      setisTryingOn(false);
      return;
    }

    const cacheKey = `${TRYON_CACHE_PREFIX}${selectedRing.id}_${getSimpleHash(uploadedImage)}`;
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

          // Draw original hand background (original size, no zoom/pan/rotate)
          ctx.drawImage(imgHand, 0, 0);

          const W_orig = canvas.width;
          const H_orig = canvas.height;
          const C_orig_x = W_orig / 2;
          const C_orig_y = H_orig / 2;

          const containerWidthVal =
            ringContainerRef.current?.getBoundingClientRect().width || 400;

          const r_orig = W_orig / H_orig;
          let S_base = 1;
          if (r_orig < 1) {
            S_base = containerWidthVal / W_orig;
          } else {
            S_base = containerWidthVal / H_orig;
          }
          const S_total = S_base * imageScale;

          const redBoxLeft = (redBox.x / 100) * containerWidthVal;
          const redBoxTop = (redBox.y / 100) * containerWidthVal;
          const redBoxWidth = (redBox.w / 100) * containerWidthVal;
          const redBoxHeight = (redBox.h / 100) * containerWidthVal;

          const redBoxCenterX = redBoxLeft + redBoxWidth / 2;
          const redBoxCenterY = redBoxTop + redBoxHeight / 2;

          const containerCenterX = containerWidthVal / 2;
          const containerCenterY = containerWidthVal / 2;

          const p_screen_x = redBoxCenterX - containerCenterX;
          const p_screen_y = redBoxCenterY - containerCenterY;

          const p_double_prime_x = p_screen_x - imageTranslate[0];
          const p_double_prime_y = p_screen_y - imageTranslate[1];

          const p_prime_x = p_double_prime_x / S_total;
          const p_prime_y = p_double_prime_y / S_total;

          const angleRad = (-imageRotation * Math.PI) / 180;
          const cosA = Math.cos(angleRad);
          const sinA = Math.sin(angleRad);
          const p_orig_x = p_prime_x * cosA - p_prime_y * sinA;
          const p_orig_y = p_prime_x * sinA + p_prime_y * cosA;

          const finalCenterX = C_orig_x + p_orig_x;
          const finalCenterY = C_orig_y + p_orig_y;

          const finalBoxW = redBoxWidth / S_total;
          const finalBoxH = redBoxHeight / S_total;

          // Draw red box overlay mapped to original coordinates and rotated
          if (redBox) {
            ctx.save();
            ctx.translate(finalCenterX, finalCenterY);
            ctx.rotate((-imageRotation * Math.PI) / 180);

            ctx.fillStyle = "rgba(239, 68, 68, 0.5)";
            ctx.fillRect(-finalBoxW / 2, -finalBoxH / 2, finalBoxW, finalBoxH);

            ctx.strokeStyle = "rgb(239, 68, 68)";
            ctx.lineWidth = Math.max(2, 2 / S_total);
            ctx.strokeRect(-finalBoxW / 2, -finalBoxH / 2, finalBoxW, finalBoxH);
            ctx.restore();
          }

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
        imageScale,
        imageTranslate,
        imageRotation,
        redBox,
        fingerPosition: { x: 0, y: 0 },
        ringScale: 1.0,
        ringRotation: 0,
        dragTranslate: [0, 0],
      };
      safeSessionStorageSetItem(ACTIVE_TRYON_SESSION_KEY, JSON.stringify(sessionData));

      // Start polling
      pollTaskStatus(taskId, selectedRing, uploadedImage);
    } catch (e) {
      setToastMessage("Lỗi kết nối máy chủ khi tạo ảnh thử trực tuyến.");
      setGenerationError("Lỗi kết nối máy chủ khi tạo ảnh thử trực tuyến.");
      setIsGenerating(false);
      setisTryingOn(false);
      sessionStorage.removeItem(ACTIVE_TRYON_SESSION_KEY);
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
          setImageTranslate([0, 0]);
          setImageScale(1.0);
          setImageRotation(0);
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
        // Draw original hand background (original size, no zoom/pan/rotate)
        ctx.drawImage(imgHand, 0, 0);

        const W_orig = canvas.width;
        const H_orig = canvas.height;
        const C_orig_x = W_orig / 2;
        const C_orig_y = H_orig / 2;

        const containerWidthVal =
          ringContainerRef.current?.getBoundingClientRect().width || 400;

        const r_orig = W_orig / H_orig;
        let S_base = 1;
        if (r_orig < 1) {
          S_base = containerWidthVal / W_orig;
        } else {
          S_base = containerWidthVal / H_orig;
        }
        const S_total = S_base * imageScale;

        const redBoxLeft = (redBox.x / 100) * containerWidthVal;
        const redBoxTop = (redBox.y / 100) * containerWidthVal;
        const redBoxWidth = (redBox.w / 100) * containerWidthVal;
        const redBoxHeight = (redBox.h / 100) * containerWidthVal;

        const redBoxCenterX = redBoxLeft + redBoxWidth / 2;
        const redBoxCenterY = redBoxTop + redBoxHeight / 2;

        const containerCenterX = containerWidthVal / 2;
        const containerCenterY = containerWidthVal / 2;

        const p_screen_x = redBoxCenterX - containerCenterX;
        const p_screen_y = redBoxCenterY - containerCenterY;

        const p_double_prime_x = p_screen_x - imageTranslate[0];
        const p_double_prime_y = p_screen_y - imageTranslate[1];

        const p_prime_x = p_double_prime_x / S_total;
        const p_prime_y = p_double_prime_y / S_total;

        const angleRad = (-imageRotation * Math.PI) / 180;
        const cosA = Math.cos(angleRad);
        const sinA = Math.sin(angleRad);
        const p_orig_x = p_prime_x * cosA - p_prime_y * sinA;
        const p_orig_y = p_prime_x * sinA + p_prime_y * cosA;

        const finalCenterX = C_orig_x + p_orig_x;
        const finalCenterY = C_orig_y + p_orig_y;

        const finalBoxW = redBoxWidth / S_total;
        const finalBoxH = redBoxHeight / S_total;

        imgRing.onload = () => {
          ctx.save();
          ctx.translate(finalCenterX, finalCenterY);
          ctx.rotate((-imageRotation * Math.PI) / 180);
          ctx.drawImage(
            imgRing,
            -finalBoxW / 2,
            -finalBoxH / 2,
            finalBoxW,
            finalBoxH
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
                      Bạn đang ở bước {step}/4. Nếu thoát, các thay đổi chưa lưu
                      có thể bị mất
                    </p>

                    {/* Buttons */}
                    <Button
                      onClick={() => {
                        stopCamera();
                        onClose();
                        setShowExitPopup(false);
                      }}
                      className="w-full bg-secondary-800 mb-2 text-white hover:bg-[#003C3A] disabled:bg-secondary-800/50 disabled:text-white h-12 rounded-none flex items-center justify-center gap-2 cursor-pointer border-none mt-6"
                    >
                      Lưu & Thoát
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowExitPopup(false)}
                      className="w-full h-12 rounded-none border-primary-200 text-primary-900 bg-white hover:bg-primary-50 tracking-wider hover:text-primary-500"
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
                      className="w-full text-center py-3 mt-3 cursor-pointer"
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
                      imageScale={imageScale}
                      imageTranslate={imageTranslate}
                      imageRotation={imageRotation}
                      setImageRotation={setImageRotation}
                      redBox={redBox}
                      resetZoom={resetZoom}
                      onOpenGuide={handleOpenGuide}
                      maxStep={maxStep}
                      showResumePopup={showResumePopup}
                      onGeneratePreview={handleGenerateAlignmentPreview}
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
                          onGeneratePreview={handleGenerateAlignmentPreview}
                        />
                      )}
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
                      <div
                        ref={ringContainerRef}
                        className={`w-full max-w-160 2xl:max-w-210 rounded-lg h-auto aspect-square relative overflow-hidden flex items-center justify-center select-none transition-all duration-300 ${
                          step === 1
                            ? "bg-transparent border-none"
                            : "bg-black border border-primary-200 shadow-lg"
                        }`}
                        style={{
                          cursor: step === 2 ? "grab" : "default",
                          touchAction: "none"
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
                        {step === 1 && (
                          <DesktopStep1Right
                            isCameraActive={isCameraActive}
                            videoRef={videoRef}
                            useMirror={useMirror}
                          />
                        )}

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
                                  setImageScale(
                                    getScaleFromSlider(Number(e.target.value)),
                                  )
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
                                onChange={(e) =>
                                  setImageRotation(Number(e.target.value))
                                }
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
                              className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-black flex items-center justify-center cursor-pointer  border border-primary-100 shadow-md transition-all active:scale-95"
                              title="Hướng dẫn cử chỉ"
                            >
                              <Question size={20} />
                            </button>
                          )}
                        </div>
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
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
