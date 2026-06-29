import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import screenfull from "screenfull";
import { ProductModel } from "../../../../types";
import { TryOnContext, ImageTab } from "./TryOnContext";
import { useTryOnGlobal, TryOnApiStatus } from "./TryOnGlobalContext";

// Hooks
import { useTryOnCamera } from "../hooks/useTryOnCamera";
import { useTryOnGestures } from "../hooks/useTryOnGestures";
import { useTryOnCatalog } from "../hooks/useTryOnCatalog";

// Constants
import {
  TRYON_CACHE_PREFIX,
  TRYON_GUIDE_SHOWN_KEY,
  ACTIVE_TRYON_SESSION_KEY,
  TRYON_CAMERA_CAPTURE_ID,
} from "../constants";

import { addJobId } from "../utils/history";
import { getSimpleHash } from "../utils/hash";
import { resizeAndCompressImage } from "@/lib/media";


// Helpers

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

interface TryOnProviderProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function TryOnProvider({ children, isOpen, onClose }: TryOnProviderProps) {
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
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [showSaveSuccessPopup, setShowSaveSuccessPopup] = useState(false);
  const [savedSessionStep, setSavedSessionStep] = useState<number | null>(null);
  const [alignmentPreviewUrl, setAlignmentPreviewUrl] = useState<string | null>(null);
  const [selectedRingMediaTab, setSelectedRingMediaTab] = useState<ImageTab>(ImageTab.TRY_ON);

  const { addTask, tasks, activeTaskId, setActiveTaskId, setIsCameraActive, removeTask } = useTryOnGlobal();

  // Listen to activeTaskId from global context to load a specific task result
  useEffect(() => {
    if (activeTaskId) {
      const task = tasks.find((t) => t.taskId === activeTaskId);
      if (task) {
        setStep(4);
        setSelectedRing(task.ring);
        setUploadedImage(task.uploadedImage);
        setGeneratedImage(task.resultImage);
        setGeneratedImages(task.resultImage ? [task.resultImage] : []);
        setSelectedGeneratedImage(task.resultImage);
        setIsGenerating(task.status === TryOnApiStatus.QUEUED || task.status === TryOnApiStatus.PROCESSING);
        setisTryingOn(task.status === TryOnApiStatus.QUEUED || task.status === TryOnApiStatus.PROCESSING);
        setGenerationError(task.error);

        if (task.status === TryOnApiStatus.COMPLETED || task.status === TryOnApiStatus.FAILED) {
          removeTask(task.taskId);
        }

        // Reset activeTaskId so we don't trigger this repeatedly
        setActiveTaskId(null);
      }
    }
  }, [activeTaskId, tasks, removeTask, setActiveTaskId]);

  // Sync generating state with global tasks for the currently selected ring
  useEffect(() => {
    if (step === 4 && isGenerating && selectedRing) {
      const task = tasks.find(
        (t) => t.ring.id === selectedRing.id && t.status !== TryOnApiStatus.QUEUED && t.status !== TryOnApiStatus.PROCESSING
      );
      if (task) {
        if (task.status === TryOnApiStatus.COMPLETED && task.resultImage) {
          setGeneratedImages([task.resultImage]);
          setGeneratedImage(task.resultImage);
          setSelectedGeneratedImage(task.resultImage);
          setIsGenerating(false);
          setisTryingOn(false);
          setGenerationError(null);
        } else if (task.status === TryOnApiStatus.FAILED) {
          setToastMessage(task.error || "Không thể tạo hình ảnh thử trực tuyến.");
          setGenerationError(task.error || "Không thể tạo hình ảnh thử trực tuyến.");
          setIsGenerating(false);
          setisTryingOn(false);
        }
        removeTask(task.taskId);
      }
    }
  }, [tasks, step, isGenerating, selectedRing, removeTask]);

  useEffect(() => {
    setSelectedRingMediaTab(ImageTab.TRY_ON);
  }, [selectedRing]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useRef(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionRestoredRef = useRef(false);

  useEffect(() => {
    (window as any).__tryon_is_generating = isGenerating;
    window.dispatchEvent(
      new CustomEvent("tryon:generating-change", {
        detail: { isGenerating },
      })
    );
  }, [isGenerating]);

  const handleOpenGuide = () => {
    setShowGuide(true);
    setGuideStep(1);
  };

  const handleCloseAttempt = () => {
    if (step > 1 && step < 4) {
      setShowExitPopup(true);
    } else {
      stopCamera();
      onClose();
    }
  };

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);

  // Responsive device width observer
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 993);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobileBehavior = isMobile || windowWidth <= 1280;

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
      if (typeof handleResetRedBox === "function") {
        handleResetRedBox();
      }
      const compressed = await resizeAndCompressImage({ url: dataUrl });
      setUploadedImage(compressed);
      setImageTranslate([0, 0]);
      setImageScale(1.0);
      setImageRotation(0);
      const hasShownGuide =
        sessionStorage.getItem(TRYON_GUIDE_SHOWN_KEY) === "true";
      if (!hasShownGuide && isMobileBehavior) {
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

  useEffect(() => {
    setIsCameraActive(isCameraActive);
    return () => {
      setIsCameraActive(false);
    };
  }, [isCameraActive, setIsCameraActive]);

  const {
    imageScale,
    setImageScale,
    imageTranslate,
    setImageTranslate,
    imageRotation,
    setImageRotation,
    redBox,
    setRedBox,
    handleRotateRedBox,
    handleResetRedBox,
    handleRotateStart,
    handleRotateTouchStart,
    handleDragStart,
    handleDragTouchStart,
    handleResizeStart,
    handleResizeTouchStart,
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
  } = useTryOnGestures({ step, uploadedImage, isMobileBehavior });

  const {
    rings,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    isLoadingRings,
    isLoadingMore,
    mobileSentinelRef,
    desktopSentinelRef,
  } = useTryOnCatalog({ step, isOpen });

  interface PollTaskOptions {
    taskId: string;
    targetRing: ProductModel;
    targetImage: string;
  }

  const pollTaskStatus = ({
    taskId,
    targetRing,
    targetImage,
  }: PollTaskOptions) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get<{
          status: TryOnApiStatus;
          result?: { base64?: string; mimeType?: string; url?: string };
          error?: string;
        }>(`/image-generation/status/${taskId}`);

        const { status, result, error } = response.data;

        if (status === TryOnApiStatus.COMPLETED) {
          const useBase64Env = import.meta.env.VITE_TRYON_USE_BASE64 === "true";
          let finalImage = "";

          if (useBase64Env) {
            if (result?.base64) {
              const imageUrl = `data:${result.mimeType || "image/png"};base64,${result.base64}`;
              finalImage = await resizeAndCompressImage({ url: imageUrl });
            }
          } else {
            if (result?.url) {
              finalImage = result.url;
            } else if (result?.base64) {
              const imageUrl = `data:${result.mimeType || "image/png"};base64,${result.base64}`;
              finalImage = await resizeAndCompressImage({ url: imageUrl });
            }
          }

          if (finalImage) {
            setGeneratedImages([finalImage]);
            setGeneratedImage(finalImage);
            setSelectedGeneratedImage(finalImage);
            setIsGenerating(false);
            setisTryingOn(false);

            if (!isOpen) {
              sessionStorage.setItem("tryon_unread_result", "true");
              window.dispatchEvent(
                new CustomEvent("tryon:unread-change", {
                  detail: { hasUnread: true },
                })
              );
            }

            // Save cache
            const cacheKey = `${TRYON_CACHE_PREFIX}${targetRing.id}_${getSimpleHash(targetImage)}`;
            safeSessionStorageSetItem(cacheKey, JSON.stringify([finalImage]));

            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          } else {
            setToastMessage("Không tìm thấy dữ liệu hình ảnh kết quả. Quay lại bước 3.");
            setGenerationError("Không tìm thấy dữ liệu hình ảnh kết quả.");
            setIsGenerating(false);
            setisTryingOn(false);
            setStep(3); // Go back to step 3
            sessionStorage.removeItem(ACTIVE_TRYON_SESSION_KEY);

            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        } else if (status === TryOnApiStatus.FAILED) {
          setToastMessage(error || "Không thể tạo hình ảnh thử trực tuyến. Quay lại bước 3.");
          setGenerationError(error || "Không thể tạo hình ảnh thử trực tuyến.");
          setIsGenerating(false);
          setisTryingOn(false);
          setStep(3); // Go back to step 3

          // Clean up session on failure
          sessionStorage.removeItem(ACTIVE_TRYON_SESSION_KEY);

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setToastMessage("Không tìm thấy phiên tạo ảnh cũ hoặc phiên đã hết hạn. Quay lại bước 3.");
          setGenerationError("Không tìm thấy phiên tạo ảnh cũ hoặc phiên đã hết hạn.");
          setIsGenerating(false);
          setisTryingOn(false);
          setStep(3); // Go back to step 3
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

  // Restore background generation on mount (e.g. after reload)
  useEffect(() => {
    const activeSessionStr = sessionStorage.getItem(ACTIVE_TRYON_SESSION_KEY);
    if (activeSessionStr) {
      try {
        const session = JSON.parse(activeSessionStr);
        if (
          session &&
          (session.maxStep === 4 || session.step === 4) &&
          session.taskId &&
          !session.generatedImage
        ) {
          setStep(4);
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
          if (session.redBox !== undefined) {
            setRedBox(session.redBox);
          }
          setMaxStep(4);
          setIsGenerating(true);
          setisTryingOn(true);
          addTask({
            taskId: session.taskId,
            ring: session.selectedRing,
            uploadedImage: session.uploadedImage,
            status: TryOnApiStatus.PROCESSING,
            resultImage: null,
            error: null,
            createdAt: Date.now(),
          });
        }
      } catch (err) {
        console.error("Error restoring background generation:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      sessionStorage.removeItem("tryon_unread_result");
      window.dispatchEvent(
        new CustomEvent("tryon:unread-change", {
          detail: { hasUnread: false },
        })
      );
    }
  }, [isOpen]);

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
              if (session.redBox !== undefined) {
                setRedBox(session.redBox);
              }

              setMaxStep(resumeStep);

              if (session.generatedImage) {
                setGeneratedImage(session.generatedImage);
                setGeneratedImages(session.generatedImages || [session.generatedImage]);
                setSelectedGeneratedImage(session.selectedGeneratedImage || session.generatedImage);
                setIsGenerating(false);
                setisTryingOn(false);
              } else if (resumeStep === 4) {
                if (session.taskId) {
                  setIsGenerating(true);
                  setisTryingOn(true);
                  addTask({
                    taskId: session.taskId,
                    ring: session.selectedRing,
                    uploadedImage: session.uploadedImage,
                    status: TryOnApiStatus.PROCESSING,
                    resultImage: null,
                    error: null,
                    createdAt: Date.now(),
                  });
                } else {
                  setStep(3);
                  setIsGenerating(false);
                  setisTryingOn(false);
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
        generatedImage,
        generatedImages,
        selectedGeneratedImage,
        redBox,
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
    generatedImage,
    generatedImages,
    selectedGeneratedImage,
    redBox,
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
      const S_base = r_orig < 1
        ? containerWidthVal / W_orig
        : containerWidthVal / H_orig;
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
        const netRotation = (redBox.rotation || 0) - imageRotation;
        ctx.save();
        ctx.translate(finalCenterX, finalCenterY);
        ctx.rotate((netRotation * Math.PI) / 180);

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
    setIsGenerating(false);
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

  const handleTryOn = async (options?: { force?: boolean }) => {
    const force = options?.force ?? false;
    setisTryingOn(true);

    if (!selectedRing || !uploadedImage) {
      setisTryingOn(false);
      return;
    }

    const cacheKey = `${TRYON_CACHE_PREFIX}${selectedRing.id}_${getSimpleHash(uploadedImage)}`;
    // Clear both cache and active session if forcing a new generation
    if (force) {
      sessionStorage.removeItem(cacheKey);
      sessionStorage.removeItem(ACTIVE_TRYON_SESSION_KEY);
      // Clear any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData && !force) {
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

            addTask({
              taskId: `cache_${selectedRing.id}_${getSimpleHash(uploadedImage)}`,
              ring: selectedRing,
              uploadedImage,
              status: TryOnApiStatus.COMPLETED,
              resultImage: cachedUrls[0],
              error: null,
              createdAt: Date.now(),
            });

            if (!isOpen) {
              sessionStorage.setItem("tryon_unread_result", "true");
              window.dispatchEvent(
                new CustomEvent("tryon:unread-change", {
                  detail: { hasUnread: true },
                })
              );
            }
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
          const S_base = r_orig < 1
            ? containerWidthVal / W_orig
            : containerWidthVal / H_orig;
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
            const netRotation = (redBox.rotation || 0) - imageRotation;
            ctx.save();
            ctx.translate(finalCenterX, finalCenterY);
            ctx.rotate((netRotation * Math.PI) / 180);

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
      formData.append("designCode", selectedRing.attributes.designCode);

      const response = await axios.post<{ taskId: string; jobId?: number }>("/image-generation/generate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { taskId, jobId } = response.data;
      if (!taskId) {
        throw new Error("Không nhận được taskId từ máy chủ.");
      }

      if (jobId) {
        addJobId(jobId);
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
      };
      safeSessionStorageSetItem(ACTIVE_TRYON_SESSION_KEY, JSON.stringify(sessionData));

      // Add task to global list
      addTask({
        taskId,
        ring: selectedRing,
        uploadedImage,
        status: TryOnApiStatus.PROCESSING,
        resultImage: null,
        error: null,
        createdAt: Date.now(),
      });
    } catch (e) {
      setToastMessage("Lỗi kết nối máy chủ khi tạo ảnh thử trực tuyến.");
      setGenerationError("Lỗi kết nối máy chủ khi tạo ảnh thử trực tuyến.");
      setIsGenerating(false);
      setisTryingOn(false);
      sessionStorage.removeItem(ACTIVE_TRYON_SESSION_KEY);
    }
  };

  const handleComplete = async () => {
    try {
      if (generatedImage) {
        const designCode = selectedRing?.attributes?.designCode || "";
        await axios.post("/image-generation/save", {
          designCode,
          imageUrl: generatedImage,
        });
      }
    } catch (err) {
      console.error("Failed to save image-generation result:", err);
    } finally {
      setShowSaveSuccessPopup(true);
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
        const S_base = r_orig < 1
          ? containerWidthVal / W_orig
          : containerWidthVal / H_orig;
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
          const netRotation = (redBox.rotation || 0) - imageRotation;
          ctx.save();
          ctx.translate(finalCenterX, finalCenterY);
          ctx.rotate((netRotation * Math.PI) / 180);
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

  const processFile = (file: File) => {
    stopCamera();
    if (typeof handleResetRedBox === "function") {
      handleResetRedBox();
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const compressed = await resizeAndCompressImage({ url: event.target.result as string });
        setUploadedImage(compressed);
        setImageTranslate([0, 0]);
        setImageScale(1.0);
        setImageRotation(0);
        const hasShownGuide =
          sessionStorage.getItem(TRYON_GUIDE_SHOWN_KEY) === "true";
        if (!hasShownGuide && isMobileBehavior) {
          setShowGuide(true);
          setGuideStep(1);
        }
        setStep(2);
        setMaxStep(2);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleZoomIn = () => {
    setImageScale((prev) => Math.min(prev + 0.15, 6.0));
  };

  const handleZoomOut = () => {
    setImageScale((prev) => Math.max(prev - 0.15, 0.5));
  };

  const contextValue = {
    state: {
      step,
      maxStep,
      uploadedImage,
      selectedRing,
      isMobile,
      isMobileBehavior,
      toastMessage,
      isGenerating,
      generatedImage,
      generatedImages,
      selectedGeneratedImage,
      isFullscreen,
      generationError,
      isTryingOn,
      showGuide,
      guideStep,
      showResumePopup,
      showExitPopup,
      showSaveSuccessPopup,
      savedSessionStep,
      alignmentPreviewUrl,
      isCameraActive,
      useMirror,
      imageScale,
      imageTranslate: imageTranslate as [number, number],
      imageRotation,
      redBox,
      containerWidth,
      rings,
      searchQuery,
      selectedTypes,
      isLoadingRings,
      isLoadingMore,
      selectedRingMediaTab,
    },
    actions: {
      setStep,
      setUploadedImage,
      setSelectedRing,
      setToastMessage,
      setIsGenerating,
      setGeneratedImage,
      setGeneratedImages,
      setSelectedGeneratedImage,
      setIsFullscreen,
      setGenerationError,
      setisTryingOn,
      setShowGuide,
      setGuideStep,
      setMaxStep,
      setShowResumePopup,
      setShowExitPopup,
      setShowSaveSuccessPopup,
      setSavedSessionStep,
      setAlignmentPreviewUrl,
      startCamera,
      stopCamera,
      capturePhoto,
      setImageScale,
      setImageTranslate,
      setImageRotation,
      setContainerWidth,
      handleContainerTouchStart,
      handleContainerTouchMove,
      handleContainerTouchEnd,
      handleContainerMouseDown,
      handleContainerMouseMove,
      handleContainerMouseUp,
      resetZoom,
      setSearchQuery,
      setSelectedTypes,
      setSelectedRingMediaTab,
      handleOpenGuide,
      handleCloseAttempt,
      handleResumeSession,
      handleGenerateAlignmentPreview,
      handleResetAll,
      handleSelectGeneratedImage,
      handleStepClick,
      handleSelectRing,
      handleTryOn,
      handleComplete,
      handleCloseFullscreen,
      handleDownload,
      handleFileUpload,
      processFile,
      handleRotateRedBox,
      handleResetRedBox,
      handleRotateStart,
      handleRotateTouchStart,
      handleDragStart,
      handleDragTouchStart,
      handleResizeStart,
      handleResizeTouchStart,
      handleZoomIn,
      handleZoomOut,
    },
    meta: {
      videoRef,
      fileInputRef,
      ringContainerRef,
      lightboxRef,
      mobileSentinelRef,
      desktopSentinelRef,
    },
  };

  return (
    <TryOnContext.Provider value={contextValue}>
      {children}
    </TryOnContext.Provider>
  );
}
