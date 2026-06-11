import { useState, useEffect, useRef } from "react";

interface UseTryOnCameraProps {
  isMobile: boolean;
  onPhotoCaptured: (dataUrl: string) => void;
  onCameraFallback: () => void;
}

export function useTryOnCamera({
  isMobile,
  onPhotoCaptured,
  onCameraFallback,
}: UseTryOnCameraProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [useMirror, setUseMirror] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setIsCameraActive(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsCameraActive(false);
      onCameraFallback();
      return;
    }

    try {
      const facing = isMobile ? "environment" : "user";
      setUseMirror(facing === "user");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setIsCameraActive(false);
      onCameraFallback();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 640;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (useMirror) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        onPhotoCaptured(dataUrl);
        stopCamera();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isCameraActive,
    useMirror,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
  };
}
