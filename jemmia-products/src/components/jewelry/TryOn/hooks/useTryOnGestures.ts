import React, { useState, useEffect, useRef } from "react";

interface UseTryOnGesturesProps {
  step: number;
  uploadedImage: string | null;
}

export function useTryOnGestures({ step, uploadedImage }: UseTryOnGesturesProps) {
  const [ringScale, setRingScale] = useState<number>(1.2);
  const [ringRotation, setRingRotation] = useState<number>(0);
  const [dragTranslate, setDragTranslate] = useState<number[]>([0, 0]);
  const [fingerPosition, setFingerPosition] = useState<{ x: number; y: number }>({
    x: 42.8,
    y: 52.3,
  });
  const [containerWidth, setContainerWidth] = useState(400);

  const ringContainerRef = useRef<HTMLDivElement>(null);
  const redBoxRef = useRef<HTMLDivElement>(null);
  const ringTargetRef = useRef<HTMLDivElement>(null);
  const moveableRedBoxRef = useRef<any>(null);
  const moveableRingRef = useRef<any>(null);
  const cumulativeTranslate = useRef<number[]>([0, 0]);

  const latestScale = useRef<number>(1.2);
  const latestRotation = useRef<number>(0);

  useEffect(() => {
    latestScale.current = ringScale;
  }, [ringScale]);

  useEffect(() => {
    latestRotation.current = ringRotation;
  }, [ringRotation]);

  useEffect(() => {
    cumulativeTranslate.current = dragTranslate;
  }, [dragTranslate]);

  const touchStartDist = useRef<number | null>(null);
  const touchStartScale = useRef<number>(1.2);
  const touchStartAngle = useRef<number | null>(null);
  const touchStartRotation = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const touchStartTranslate = useRef<number[]>([0, 0]);

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
      touchStartScale.current = latestScale.current;

      const angle = getTouchAngle(e.touches[0], e.touches[1]);
      touchStartAngle.current = angle;
      touchStartRotation.current = latestRotation.current;
      touchStartPos.current = null;
    } else if (e.touches.length === 1) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      touchStartTranslate.current = [...cumulativeTranslate.current];
    }
  };

  const handleContainerTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      if (e.cancelable) {
        e.preventDefault();
      }

      const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
      const factor = currentDist / touchStartDist.current;
      const newScale = Math.min(
        Math.max(touchStartScale.current * factor, 0.4),
        3.0,
      );
      setRingScale(newScale);
      latestScale.current = newScale;

      if (touchStartAngle.current !== null) {
        const currentAngle = getTouchAngle(e.touches[0], e.touches[1]);
        const angleDiff = currentAngle - touchStartAngle.current;
        const newRotation = (touchStartRotation.current + angleDiff) % 360;
        setRingRotation(newRotation);
        latestRotation.current = newRotation;
      }
    } else if (e.touches.length === 1 && touchStartPos.current !== null) {
      if (e.cancelable) {
        e.preventDefault();
      }

      const dx = e.touches[0].clientX - touchStartPos.current.x;
      const dy = e.touches[0].clientY - touchStartPos.current.y;

      const newTranslate = [
        touchStartTranslate.current[0] + dx,
        touchStartTranslate.current[1] + dy,
      ];
      setDragTranslate(newTranslate);
      cumulativeTranslate.current = newTranslate;
    }
  };

  const handleContainerTouchEnd = () => {
    touchStartDist.current = null;
    touchStartAngle.current = null;
    touchStartPos.current = null;
  };

  const mouseStartPos = useRef<{ x: number; y: number } | null>(null);
  const mouseStartTranslate = useRef<number[]>([0, 0]);

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (step === 2 || step === 4) {
      mouseStartPos.current = { x: e.clientX, y: e.clientY };
      mouseStartTranslate.current = [...cumulativeTranslate.current];
    }
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (mouseStartPos.current !== null) {
      e.preventDefault();
      const dx = e.clientX - mouseStartPos.current.x;
      const dy = e.clientY - mouseStartPos.current.y;
      const newTranslate = [
        mouseStartTranslate.current[0] + dx,
        mouseStartTranslate.current[1] + dy,
      ];
      setDragTranslate(newTranslate);
      cumulativeTranslate.current = newTranslate;
    }
  };

  const handleContainerMouseUp = () => {
    mouseStartPos.current = null;
  };

  const triggerUpdateRect = () => {
    if (moveableRedBoxRef.current) {
      moveableRedBoxRef.current.updateRect();
    }
    if (moveableRingRef.current) {
      moveableRingRef.current.updateRect();
    }
  };

  useEffect(() => {
    const handle = requestAnimationFrame(triggerUpdateRect);
    return () => cancelAnimationFrame(handle);
  }, [
    fingerPosition,
    ringScale,
    ringRotation,
    step,
    uploadedImage,
    containerWidth,
    dragTranslate,
  ]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(".moveable-control") ||
      target.closest(".moveable-line") ||
      target.closest(".moveable-area") ||
      target.closest(".moveable-rotation") ||
      target === redBoxRef.current ||
      redBoxRef.current?.contains(target) ||
      target === ringTargetRef.current ||
      ringTargetRef.current?.contains(target)
    ) {
      return;
    }

    if (ringContainerRef.current) {
      const rect = ringContainerRef.current.getBoundingClientRect();
      const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;
      const widthPercent = 9.6 * ringScale;
      const heightPercent = 3.6 * ringScale;
      setFingerPosition({
        x: clickXPercent - widthPercent / 2,
        y: clickYPercent - heightPercent / 2,
      });
      setDragTranslate([0, 0]);
      cumulativeTranslate.current = [0, 0];
    }
  };

  return {
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
  };
}
