import React, { use, useState, useEffect } from "react";
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
} from "@phosphor-icons/react";
import { MobileProgressBar } from "./MobileProgressBar";
import { TRYON_CAMERA_CAPTURE_ID } from "../constants";
import { TryOnContext } from "../context/TryOnContext";

export function MobileStep1() {
  const context = use(TryOnContext);
  if (!context) return null;
  const {
    state: { isCameraActive, useMirror },
    actions: { capturePhoto, startCamera, stopCamera, handleFileUpload },
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

        {/* Hand Overlay Guide */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center pb-14 z-[305]">
          <img
            src="https://cdn.hstatic.net/files/200000355853/file/20260616-164029.webp"
            className="w-full h-full object-contain opacity-60 scale-[165%] rotate-180"
            alt="Camera Overlay Hand"
          />
        </div>

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
        <MobileProgressBar activeCount={1} />
        <div className="space-y-1 text-start">
          <h4 className="text-primary-900 font-bold text-base leading-tight">
            Chụp ảnh bàn tay của bạn
          </h4>
        </div>
      </div>

      {/* Middle Silhouette Area */}
      <div className="grow flex items-center justify-center py-1 min-h-0">
        <div className="h-full w-full aspect-[4/5] border border-dashed border-primary-200 bg-slate-100 relative overflow-hidden flex flex-col justify-between py-4 shadow-sm mx-auto">
          {/* Hand preview (camera video or default silhouette) */}
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
            ) : (
              <img
                src="https://cdn.hstatic.net/files/200000355853/file/20260616-164034.webp"
                className="w-full h-full object-contain opacity-40 rotate-180"
                alt="Hand Silhouette"
                draggable={false}
              />
            )}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center pb-20">
                <img
                  src="https://cdn.hstatic.net/files/200000355853/file/20260616-164029.webp"
                  className="w-full h-full object-contain opacity-60 rotate-180"
                  alt="Camera Overlay Hand"
                />
              </div>
            )}
          </div>

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
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-primary-900 font-bold text-xl md:text-2xl tracking-tight leading-tight">
          Chụp ảnh bàn tay của bạn
        </h4>
      </div>
      <div className="pt-2">
        <ul className="space-y-5 text-sm font-medium text-primary-600">
          <li className="flex items-start gap-3">
            <div className="text-secondary-700 shrink-0 mt-0.5">
              <SunDim size={20} weight="regular" />
            </div>
            <span className="leading-relaxed">
              Đặt bàn tay lên bề mặt phẳng trong điều kiện ánh sáng tốt
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="text-secondary-700 shrink-0 mt-0.5">
              <HandPalm size={20} weight="regular" />
            </div>
            <span className="leading-relaxed">
              Xòe nhẹ các ngón tay để cảm biến nhận diện
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="text-secondary-700 shrink-0 mt-0.5">
              <CornersOut size={20} weight="regular" />
            </div>
            <span className="leading-relaxed">
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
    state: { isCameraActive },
    actions: { capturePhoto, startCamera, handleFileUpload },
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
          if (isCameraActive) {
            capturePhoto();
          } else {
            startCamera();
          }
        }}
        variant="secondary"
        className="w-full h-12 gap-2 font-semibold"
      >
        {isCameraActive ? "Chụp Ảnh Ngay" : "Mở Camera"}
        <Camera size={18} weight="bold" />
      </Button>
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline-light"
        className="w-full h-11 tracking-wider"
      >
        Upload Ảnh
        <UploadSimple size={18} weight="bold" />
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-primary-400 text-xs mt-3 select-none">
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
    state: { isCameraActive, useMirror },
    actions: { processFile },
    meta: { videoRef, fileInputRef },
  } = context;

  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

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
        if (!isCameraActive) {
          fileInputRef.current?.click();
        }
      }}
      className={`absolute inset-0 w-full h-full border-2 rounded-lg border-dashed border-slate-300 hover:border-slate-400 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden bg-slate-100 ${
        isCameraActive ? "" : "cursor-pointer"
      }`}
    >
      {isCameraActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover pointer-events-none rounded-lg ${
            useMirror ? "transform scale-x-[-1]" : ""
          }`}
        />
      ) : (
        <img
          src="https://cdn.hstatic.net/files/200000355853/file/20260616-164034.webp"
          className="w-full h-full object-contain pointer-events-none select-none opacity-40"
          alt="Hand Silhouette"
          draggable={false}
        />
      )}

      {isCameraActive && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
          <img
            src="https://cdn.hstatic.net/files/200000355853/file/20260616-164029.webp"
            className="w-full h-full"
            alt="Hand overlay guide"
          />
        </div>
      )}
      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="absolute inset-0 w-full h-full rounded-lg transition-all duration-300 flex flex-col items-center justify-center overflow-hidden bg-slate-100 cursor-pointer pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-primary-50 text-secondary-800 flex items-center justify-center mb-3 animate-bounce">
            <UploadSimple size={24} weight="bold" />
          </div>
          <h5 className="text-primary-900 font-bold text-sm leading-tight mb-1">
            Kéo thả ảnh vào đây
          </h5>
          <p className="text-primary-600/70 text-[10px] max-w-[200px] leading-relaxed">
            Hỗ trợ định dạng PNG, JPG hoặc WEBP
          </p>
        </div>
      )}
    </div>
  );
}
