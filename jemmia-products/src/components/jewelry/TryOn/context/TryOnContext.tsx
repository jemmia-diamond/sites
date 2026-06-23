import { createContext } from "react";
import { ProductModel } from "../../../../types";

export interface TryOnState {
  step: number;
  maxStep: number;
  uploadedImage: string | null;
  selectedRing: ProductModel | null;
  isMobile: boolean;
  toastMessage: string | null;
  isGenerating: boolean;
  generatedImage: string | null;
  generatedImages: string[];
  selectedGeneratedImage: string | null;
  isFullscreen: boolean;
  generationError: string | null;
  isTryingOn: boolean;
  showGuide: boolean;
  guideStep: number;
  showResumePopup: boolean;
  showExitPopup: boolean;
  savedSessionStep: number | null;
  alignmentPreviewUrl: string | null;
  
  // Camera hooks state
  isCameraActive: boolean;
  useMirror: boolean;
  
  // Gestures hooks state
  imageScale: number;
  imageTranslate: [number, number];
  imageRotation: number;
  redBox: any;
  containerWidth: number;

  // Catalog hooks state
  rings: ProductModel[];
  searchQuery: string;
  isLoadingRings: boolean;
  isLoadingMore: boolean;
}

export interface TryOnActions {
  setStep: (step: number) => void;
  setUploadedImage: (img: string | null) => void;
  setSelectedRing: (ring: ProductModel | null) => void;
  setToastMessage: (msg: string | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setGeneratedImage: (img: string | null) => void;
  setGeneratedImages: (imgs: string[]) => void;
  setSelectedGeneratedImage: (img: string | null) => void;
  setIsFullscreen: (full: boolean) => void;
  setGenerationError: (err: string | null) => void;
  setisTryingOn: (trying: boolean) => void;
  setShowGuide: (show: boolean) => void;
  setGuideStep: (step: number) => void;
  setMaxStep: (step: number) => void;
  setShowResumePopup: (show: boolean) => void;
  setShowExitPopup: (show: boolean) => void;
  setSavedSessionStep: (step: number | null) => void;
  setAlignmentPreviewUrl: (url: string | null) => void;

  // Camera Actions
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => void;

  // Gesture Actions
  setImageScale: React.Dispatch<React.SetStateAction<number>>;
  setImageTranslate: React.Dispatch<React.SetStateAction<[number, number]>>;
  setImageRotation: React.Dispatch<React.SetStateAction<number>>;
  setContainerWidth: React.Dispatch<React.SetStateAction<number>>;
  handleContainerTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleContainerTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleContainerTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleContainerMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleContainerMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleContainerMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  resetZoom: () => void;

  // Catalog Actions
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;

  // Common operations
  handleOpenGuide: () => void;
  handleCloseAttempt: () => void;
  handleResumeSession: () => void;
  handleGenerateAlignmentPreview: () => void;
  handleResetAll: () => void;
  handleSelectGeneratedImage: (img: string | null) => void;
  handleStepClick: (targetStep: number) => void;
  handleSelectRing: (ring: ProductModel) => void;
  handleTryOn: (options?: { force?: boolean }) => Promise<void>;
  handleComplete: () => Promise<void>;
  handleCloseFullscreen: () => void;
  handleDownload: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  processFile: (file: File) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
}

export interface TryOnMeta {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  ringContainerRef: React.RefObject<HTMLDivElement | null>;
  lightboxRef: React.RefObject<HTMLDivElement | null>;
  mobileSentinelRef: React.RefObject<HTMLDivElement | null>;
  desktopSentinelRef: React.RefObject<HTMLDivElement | null>;
}

export interface TryOnContextValue {
  state: TryOnState;
  actions: TryOnActions;
  meta: TryOnMeta;
}

export const TryOnContext = createContext<TryOnContextValue | null>(null);
