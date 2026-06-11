import React from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  UploadSimple,
  SunDim,
  HandPalm,
  CornersOut,
  LockSimple,
} from "@phosphor-icons/react";
import { MobileProgressBar } from "./MobileProgressBar";

interface Step1Props {
  isCameraActive: boolean;
  useMirror: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startCamera: () => void;
  capturePhoto: () => void;
}

export function MobileStep1({
  isCameraActive,
  useMirror,
  videoRef,
  fileInputRef,
  handleFileUpload,
  startCamera,
  capturePhoto,
}: Step1Props) {
  return (
    <div className="grow flex flex-col justify-between gap-3 min-h-0">
      {/* Progress Bar & Info */}
      <div className="space-y-3">
        <MobileProgressBar activeCount={1} />
        <div className="space-y-1 text-start">
          <h4 className="text-primary-900 font-bold text-base leading-tight">
            Chụp ảnh bàn tay của bạn
          </h4>
          <p className="text-xs text-primary-600 leading-normal">
            Tải lên hình ảnh rõ nét để xem trang sức của chúng tôi hiển thị trên
            tay bạn một cách chân thực
          </p>
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
                src="https://cdn.hstatic.net/files/200000355853/file/7427f60fa387debbcfd44bd25723ec19135a83a1.webp"
                className="w-full h-full object-contain opacity-40"
                alt="Hand Silhouette"
                draggable={false}
              />
            )}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center pb-20">
                <img
                  src="https://cdn.hstatic.net/files/200000355853/file/20260608-151032.webp"
                  className="w-full h-full object-contain opacity-60"
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
                Đặt bàn tay dưới <br/> ánh sáng tốt
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <HandPalm size={18} className="text-[#004B49] mb-1" />
              <span className="text-xs leading-tight text-primary-600 font-nornal">
                Xòe nhẹ các <br/> ngón tay
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <CornersOut size={18} className="text-[#004B49] mb-1" />
              <span className="text-xs leading-tight text-primary-600 font-nornal">
                Tránh bóng đổ và <br/> ảnh bị mờ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="space-y-2 shrink-0">
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
          id="tryon-camera-capture"
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
          className="w-full bg-secondary-800 hover:bg-secondary-700 text-white font-normal text-sm h-11 flex items-center justify-center gap-2 rounded-none cursor-pointer border-none shadow-none tracking-wider"
        >
          {isCameraActive ? "Chụp Ảnh Ngay" : "Mở Camera"}
          <Camera size={18} weight="bold" />
        </Button>
        <Button
          onClick={() => {
            const fileInput = document.getElementById(
              "tryon-file-upload-drawer",
            ) as HTMLInputElement;
            fileInput?.click();
          }}
          className="w-full h-11 rounded-none border-primary-200 text-primary-900 bg-white hover:bg-primary-50 tracking-wider"
          variant="outline"
        >
          Upload Ảnh
          <UploadSimple size={18} weight="bold" />
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
        <p className="text-sm text-primary-500 font-medium leading-relaxed">
          Tải lên hình ảnh rõ nét để xem trang sức của chúng tôi hiển thị trên tay
          bạn một cách chân thực
        </p>
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

export function DesktopStep1Bottom({
  isCameraActive,
  fileInputRef,
  handleFileUpload,
  startCamera,
  capturePhoto,
}: Omit<Step1Props, "useMirror" | "videoRef">) {
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
        id="tryon-camera-capture"
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
        className="w-full bg-secondary-900 hover:bg-secondary-800 text-white font-semibold text-sm h-12 flex items-center justify-center gap-2 rounded-none cursor-pointer border-none shadow-none"
      >
        {isCameraActive ? "Chụp Ảnh Ngay" : "Mở Camera"}
        <Camera size={18} weight="bold" />
      </Button>
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-11 rounded-none border-primary-200 text-primary-900 bg-white hover:bg-primary-50 tracking-wider"
        variant="outline"
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

interface DesktopStep1RightProps {
  isCameraActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  useMirror: boolean;
}

export function DesktopStep1Right({
  isCameraActive,
  videoRef,
  useMirror,
}: DesktopStep1RightProps) {
  return (
    <>
      {isCameraActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover pointer-events-auto rounded-lg ${
            useMirror ? "transform scale-x-[-1]" : ""
          }`}
        />
      ) : (
        <img
          src="https://cdn.hstatic.net/files/200000355853/file/7427f60fa387debbcfd44bd25723ec19135a83a1.webp"
          className="w-full h-full object-contain bg-slate-100 border-dashed border-2 rounded-lg border-slate-300"
          alt="Hand Silhouette"
          draggable={false}
        />
      )}

      {isCameraActive && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
          <img
            src="https://cdn.hstatic.net/files/200000355853/file/20260608-151032.webp"
            className="w-full h-full"
            alt="Hand overlay guide"
          />
        </div>
      )}
    </>
  );
}
