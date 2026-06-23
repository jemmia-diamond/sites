import React, { useState, useEffect, useRef } from "react";

interface UseTryOnGesturesProps {
  step: number;
  uploadedImage: string | null;
}

export function useTryOnGestures({ step, uploadedImage }: UseTryOnGesturesProps) {
  const [imageScale, setImageScale] = useState<number>(1.0);
  const [imageTranslate, setImageTranslate] = useState<[number, number]>([0, 0]);
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState(400);
  const isMobile = window.innerWidth < 768;
  const redBox = {
    x: 38,
    y: 46,
    w: isMobile ? 36 : 28,
    h: 10,
  };

  const ringContainerRef = useRef<HTMLDivElement>(null);

  const touchStartDist = useRef<number | null>(null);
  const touchStartScale = useRef<number>(1.0);
  const touchStartAngle = useRef<number | null>(null);
  const touchStartRotation = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const touchStartTranslate = useRef<[number, number]>([0, 0]);

  const getTouchDistance = (t1: React.Touch, t2: React.Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchAngle = (t1: React.Touch, t2: React.Touch) => {
    return (
      (Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180) /
      Math.PI
    );
  };

  const handleContainerTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      touchStartDist.current = dist;
      touchStartScale.current = imageScale;

      const angle = getTouchAngle(e.touches[0], e.touches[1]);
      touchStartAngle.current = angle;
      touchStartRotation.current = imageRotation;

      touchStartPos.current = null;
    } else if (e.touches.length === 1) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      touchStartTranslate.current = [imageTranslate[0], imageTranslate[1]];
    }
  };

  const handleContainerTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      if (e.cancelable) e.preventDefault();
      const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
      const factor = currentDist / touchStartDist.current;
      const newScale = Math.min(Math.max(touchStartScale.current * factor, 0.5), 6.0);
      setImageScale(newScale);

      if (touchStartAngle.current !== null) {
        const currentAngle = getTouchAngle(e.touches[0], e.touches[1]);
        const angleDiff = currentAngle - touchStartAngle.current;
        setImageRotation(Math.round((touchStartRotation.current + angleDiff) % 360));
      }
    } else if (e.touches.length === 1 && touchStartPos.current !== null) {
      if (e.cancelable) e.preventDefault();
      const dx = e.touches[0].clientX - touchStartPos.current.x;
      const dy = e.touches[0].clientY - touchStartPos.current.y;
      const newTranslate: [number, number] = [
        touchStartTranslate.current[0] + dx,
        touchStartTranslate.current[1] + dy,
      ];
      setImageTranslate(newTranslate);
    }
  };

  const handleContainerTouchEnd = () => {
    touchStartDist.current = null;
    touchStartAngle.current = null;
    touchStartPos.current = null;
  };

  const mouseStartPos = useRef<{ x: number; y: number } | null>(null);
  const mouseStartTranslate = useRef<[number, number]>([0, 0]);

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    mouseStartPos.current = { x: e.clientX, y: e.clientY };
    mouseStartTranslate.current = [imageTranslate[0], imageTranslate[1]];
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (mouseStartPos.current !== null) {
      e.preventDefault();
      const dx = e.clientX - mouseStartPos.current.x;
      const dy = e.clientY - mouseStartPos.current.y;
      const newTranslate: [number, number] = [
        mouseStartTranslate.current[0] + dx,
        mouseStartTranslate.current[1] + dy,
      ];
      setImageTranslate(newTranslate);
    }
  };

  const handleContainerMouseUp = () => {
    mouseStartPos.current = null;
  };

  const resetZoom = () => {
    setImageScale(1.0);
    setImageTranslate([0, 0]);
    setImageRotation(0);
  };

  return {
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
  };
}
