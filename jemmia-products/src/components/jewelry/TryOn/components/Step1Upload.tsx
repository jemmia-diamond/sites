import React, { use, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Camera,
  UploadSimple,
  SunDim,
  HandPalm,
  CornersOut,
  LockSimple,
  ArrowLeft,
  Check,
  CloudArrowUp,
  X,
} from "@phosphor-icons/react";
import { MobileProgressBar } from "./MobileProgressBar";
import { TRYON_CAMERA_CAPTURE_ID, ACTIVE_TRYON_SESSION_KEY } from "../constants";
import { TryOnContext } from "../context/TryOnContext";

export function MobileStep1() {
  const context = use(TryOnContext);
  if (!context) return null;
  const {
    state: { isCameraActive, useMirror, maxStep, uploadedImage },
    actions: { capturePhoto, startCamera, stopCamera, handleFileUpload, setStep, setUploadedImage, setMaxStep },
    meta: { videoRef, fileInputRef },
  } = context;

  if (isCameraActive) {
    return (
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
    );
  }
  return (
    <div className="grow flex flex-col justify-between gap-3 min-h-0">
      {/* Progress Bar & Info */}
      <div className="space-y-3">
        <MobileProgressBar activeCount={1} onStepClick={setStep} maxStep={maxStep} />
        <div className="space-y-1 text-start">
          <h4 className="text-primary-900 font-bold text-base leading-tight">
            Chụp ảnh bàn tay của bạn
          </h4>
        </div>
      </div>

      {/* Middle Silhouette Area */}
      <div className="grow flex items-center justify-center py-1 min-h-0">
        <div className="h-full w-full aspect-[4/5] border border-dashed border-primary-200 bg-slate-100 relative overflow-hidden flex flex-col justify-between py-4 shadow-sm mx-auto">
          {/* Hand preview (camera video or uploaded image or default silhouette) */}
          <div className="absolute inset-0 flex items-center justify-center pb-20">
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  useMirror ? "transform scale-x-[-1]" : ""
                }`}
              />
            ) : uploadedImage ? (
              <img
                src={uploadedImage}
                className="w-full h-full object-contain"
                alt="Uploaded Hand Preview"
                draggable={false}
              />
            ) : (
              <img
                src="https://cdn.hstatic.net/files/200000355853/file/20260616-164034.webp"
                className="w-full h-full object-contain opacity-40 rotate-180"
                alt="Hand Silhouette"
                draggable={false}
              />
            )}
          </div>

          {/* Close / Remove button */}
          {!isCameraActive && uploadedImage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedImage(null);
                setMaxStep(1);
                sessionStorage.removeItem(ACTIVE_TRYON_SESSION_KEY);
              }}
              className="absolute top-3 right-3 bg-white/85 hover:bg-white text-slate-800 p-2 rounded-full shadow-md z-20 transition-colors border-none cursor-pointer flex items-center justify-center"
            >
              <X size={16} weight="bold" />
            </button>
          )}

          {/* Spacer */}
          <div className="grow" />

          {/* 3 Guidelines at the bottom of the container */}
          <div className="grid grid-cols-3 gap-2 relative z-10 backdrop-blur-sm px-2 rounded">
            <div className="flex flex-col items-center text-center">
              <SunDim size={18} className="text-[#004B49] mb-1" />
              <span className="text-xs leading-tight text-primary-600 font-nornal">
                Đặt bàn tay dưới <br /> ánh sáng tốt
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <HandPalm size={18} className="text-[#004B49] mb-1" />
              <span className="text-xs leading-tight text-primary-600 font-nornal">
                Xòe nhẹ các <br /> ngón tay
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <CornersOut size={18} className="text-[#004B49] mb-1" />
              <span className="text-xs leading-tight text-primary-600 font-nornal">
                Tránh bóng đổ và <br /> ảnh bị mờ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          id="tryon-file-upload-drawer"
          className="hidden"
          onChange={handleFileUpload}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          id={TRYON_CAMERA_CAPTURE_ID}
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button
          onClick={() => {
            const fileInput = document.getElementById(
              "tryon-file-upload-drawer",
            ) as HTMLInputElement;
            fileInput?.click();
          }}
          variant="outline-light"
          className="w-full h-11 tracking-wider"
        >
          Upload Ảnh
          <UploadSimple size={18} weight="bold" />
        </Button>
        <Button
          onClick={() => {
            if (isCameraActive) {
              capturePhoto();
            } else {
              startCamera();
            }
          }}
          variant="secondary"
          className="w-full h-11 tracking-wider gap-2 font-normal"
        >
          {isCameraActive ? "Chụp Ảnh Ngay" : "Mở Camera"}
          <Camera size={18} weight="bold" />
        </Button>
      </div>
    </div>
  );
}

export function DesktopStep1Left() {
  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <h4 className="text-primary-900 font-bold text-xl md:text-2xl tracking-tight leading-tight">
          Upload ảnh bàn tay của bạn
        </h4>
      </div>
      <div className="pt-2">
        <ul className="space-y-5 text-sm font-medium text-primary-600">
          <li className="flex items-start gap-3">
            <div className="text-secondary-800 shrink-0 mt-0.5">
              <SunDim size={20} weight="regular" />
            </div>
            <span className="leading-relaxed text-slate-800">
              Bàn tay được đặt lên bề mặt phẳng trong điều kiện ánh sáng tốt
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="text-secondary-800 shrink-0 mt-0.5">
              <HandPalm size={20} weight="regular" />
            </div>
            <span className="leading-relaxed text-slate-800">
              Xòe nhẹ các ngón tay để cảm biến nhận diện
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="text-secondary-800 shrink-0 mt-0.5">
              <CornersOut size={20} weight="regular" />
            </div>
            <span className="leading-relaxed text-slate-800">
              Tránh bóng đổ mạnh hoặc ảnh bị mờ, mất nét
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function DesktopStep1Bottom() {
  const context = use(TryOnContext);
  if (!context) return null;
  const {
    state: { uploadedImage },
    actions: { handleFileUpload, setStep },
    meta: { fileInputRef },
  } = context;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        id="tryon-file-upload-drawer"
        className="hidden"
        onChange={handleFileUpload}
      />
      <Button
        onClick={() => setStep(2)}
        disabled={!uploadedImage}
        variant="secondary"
        className="w-full h-12 gap-2 font-semibold"
      >
        Sử dụng hình ảnh
        <Check size={18} weight="bold" />
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-primary-400 text-xs mt-1 select-none">
        <LockSimple size={14} weight="regular" />
        <span>Ảnh của bạn là riêng tư và được bảo vệ</span>
      </div>
    </>
  );
}

export function DesktopStep1Right() {
  const context = use(TryOnContext);
  if (!context) return null;
  const {
    state: { uploadedImage },
    actions: { processFile, setUploadedImage, setMaxStep },
    meta: { fileInputRef },
  } = context;

  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        processFile(file);
      } else {
        toast.error("Vui lòng chỉ kéo thả hình ảnh (PNG, JPG, WEBP, v.v.)");
      }
    }
  };

  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", preventDefault);
    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  }, []);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        fileInputRef.current?.click();
      }}
      className="absolute inset-0 w-full h-full border-2 rounded-lg border-dashed border-slate-300 hover:border-slate-400 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden cursor-pointer bg-white"
    >
      {/* Background overlay with 50% opacity */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "url('https://cdn.hstatic.net/files/200000355853/file/ece298d0ec2c16f10310d45724b276a6035cb503__1_.png')",
          backgroundRepeat: "repeat",
          opacity: 0.5,
        }}
      />

      {/* Content wrapper with relative positioning to stack above background overlay */}
      <div
        className={`relative z-10 w-full h-full flex flex-col items-center justify-center ${isDragging ? "invisible" : ""}`}
      >
        {uploadedImage ? (
          <div className="w-full h-full relative">
            <img
              src={uploadedImage}
              className="w-full h-full object-contain bg-black pointer-events-none select-none"
              alt="Hand Preview"
              draggable={false}
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white">
              <UploadSimple size={28} className="mb-2" />
              <span className="text-sm font-semibold">
                Thay đổi ảnh bàn tay
              </span>
            </div>

            {/* Close / Remove button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedImage(null);
                setMaxStep(1);
                sessionStorage.removeItem(ACTIVE_TRYON_SESSION_KEY);
              }}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg z-20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 select-none pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
              <CloudArrowUp size={36} className="text-slate-500" />
            </div>
            <h5 className="text-slate-700 font-medium text-sm mb-1.5">
              Kéo hình ảnh của bạn vào đây hoặc
            </h5>
            <span className="text-blue-600 font-semibold text-sm underline hover:text-blue-700 pointer-events-auto">
              Nhấn để tải lên
            </span>
          </div>
        )}
      </div>

      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-transparent cursor-pointer pointer-events-none z-[50] border-none">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 shadow-sm animate-bounce">
            <UploadSimple size={28} weight="bold" />
          </div>
          <h5 className="text-slate-700 font-medium text-sm mb-1.5">
            Kéo thả ảnh vào đây
          </h5>
          <p className="text-slate-500 font-normal text-xs">
            Hỗ trợ định dạng PNG, JPG hoặc WEBP
          </p>
        </div>
      )}
    </div>
  );
}
