import React, { useState, useEffect, useRef } from "react";

interface UseTryOnGesturesProps {
  step: number;
  uploadedImage: string | null;
  isMobileBehavior: boolean;
}

export function useTryOnGestures({ step, uploadedImage, isMobileBehavior }: UseTryOnGesturesProps) {
  const [imageScale, setImageScale] = useState<number>(1.0);
  const [imageTranslate, setImageTranslate] = useState<[number, number]>([0, 0]);
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState(400);

  const [redBox, setRedBox] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
    hasDrawn?: boolean;
  }>({
    x: 38,
    y: 46,
    w: isMobileBehavior ? 36 : 28,
    h: 10,
    rotation: 0,
    hasDrawn: isMobileBehavior ? true : false,
  });

  useEffect(() => {
    setRedBox((prev) => {
      if (!prev.hasDrawn || prev.w === 0 || prev.h === 0) {
        return {
          x: 38,
          y: 46,
          w: isMobileBehavior ? 36 : 28,
          h: 10,
          rotation: 0,
          hasDrawn: isMobileBehavior ? true : false,
        };
      }
      return prev;
    });
  }, [isMobileBehavior]);

  const currentRedBox = useRef(redBox);
  useEffect(() => {
    currentRedBox.current = redBox;
  }, [redBox]);

  const handleRotateRedBox = (deg: number) => {
    setRedBox((prev) => ({
      ...prev,
      rotation: (prev.rotation + deg) % 360,
    }));
  };

  const handleResetRedBox = () => {
    setRedBox({
      x: 38,
      y: 46,
      w: isMobileBehavior ? 36 : 28,
      h: 10,
      rotation: 0,
      hasDrawn: isMobileBehavior ? true : false,
    });
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.button !== 0) return;

    if (!ringContainerRef.current) return;
    const rect = ringContainerRef.current.getBoundingClientRect();
    
    const centerX = rect.left + ((currentRedBox.current.x + currentRedBox.current.w / 2) / 100) * rect.width;
    const centerY = rect.top + ((currentRedBox.current.y + currentRedBox.current.h / 2) / 100) * rect.height;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startAngle = Math.atan2(startY - centerY, startX - centerX) * 180 / Math.PI;
    const startRotation = currentRedBox.current.rotation || 0;

    const handleWindowMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - centerX;
      const dy = moveEvent.clientY - centerY;
      const currentAngle = Math.atan2(dy, dx) * 180 / Math.PI;
      const angleDiff = currentAngle - startAngle;
      
      setRedBox((prev) => ({
        ...prev,
        rotation: Math.round((startRotation + angleDiff) % 360),
      }));
    };

    const handleWindowMouseUp = () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
  };

  const handleRotateTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;

    if (!ringContainerRef.current) return;
    const rect = ringContainerRef.current.getBoundingClientRect();
    
    const centerX = rect.left + ((currentRedBox.current.x + currentRedBox.current.w / 2) / 100) * rect.width;
    const centerY = rect.top + ((currentRedBox.current.y + currentRedBox.current.h / 2) / 100) * rect.height;
    
    const startX = e.touches[0].clientX;
    const startY = e.touches[0].clientY;
    const startAngle = Math.atan2(startY - centerY, startX - centerX) * 180 / Math.PI;
    const startRotation = currentRedBox.current.rotation || 0;

    const handleWindowTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      const dx = moveEvent.touches[0].clientX - centerX;
      const dy = moveEvent.touches[0].clientY - centerY;
      const currentAngle = Math.atan2(dy, dx) * 180 / Math.PI;
      const angleDiff = currentAngle - startAngle;
      
      setRedBox((prev) => ({
        ...prev,
        rotation: Math.round((startRotation + angleDiff) % 360),
      }));
    };

    const handleWindowTouchEnd = () => {
      window.removeEventListener("touchmove", handleWindowTouchMove);
      window.removeEventListener("touchend", handleWindowTouchEnd);
      window.removeEventListener("touchcancel", handleWindowTouchEnd);
    };

    window.addEventListener("touchmove", handleWindowTouchMove, { passive: false });
    window.addEventListener("touchend", handleWindowTouchEnd);
    window.addEventListener("touchcancel", handleWindowTouchEnd);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.button !== 0) return;

    if (!ringContainerRef.current) return;
    const rect = ringContainerRef.current.getBoundingClientRect();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startBoxX = currentRedBox.current.x;
    const startBoxY = currentRedBox.current.y;

    const handleWindowMouseMove = (moveEvent: MouseEvent) => {
      const dx_px = moveEvent.clientX - startX;
      const dy_px = moveEvent.clientY - startY;
      
      const dx_pct = (dx_px / rect.width) * 100;
      const dy_pct = (dy_px / rect.height) * 100;

      setRedBox((prev) => {
        const nextX = Math.max(0, Math.min(100 - prev.w, startBoxX + dx_pct));
        const nextY = Math.max(0, Math.min(100 - prev.h, startBoxY + dy_pct));
        return {
          ...prev,
          x: nextX,
          y: nextY,
        };
      });
    };

    const handleWindowMouseUp = () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
  };

  const handleDragTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;

    if (!ringContainerRef.current) return;
    const rect = ringContainerRef.current.getBoundingClientRect();
    
    const startX = e.touches[0].clientX;
    const startY = e.touches[0].clientY;
    const startBoxX = currentRedBox.current.x;
    const startBoxY = currentRedBox.current.y;

    const handleWindowTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      const dx_px = moveEvent.touches[0].clientX - startX;
      const dy_px = moveEvent.touches[0].clientY - startY;
      
      const dx_pct = (dx_px / rect.width) * 100;
      const dy_pct = (dy_px / rect.height) * 100;

      setRedBox((prev) => {
        const nextX = Math.max(0, Math.min(100 - prev.w, startBoxX + dx_pct));
        const nextY = Math.max(0, Math.min(100 - prev.h, startBoxY + dy_pct));
        return {
          ...prev,
          x: nextX,
          y: nextY,
        };
      });
    };

    const handleWindowTouchEnd = () => {
      window.removeEventListener("touchmove", handleWindowTouchMove);
      window.removeEventListener("touchend", handleWindowTouchEnd);
      window.removeEventListener("touchcancel", handleWindowTouchEnd);
    };

    window.addEventListener("touchmove", handleWindowTouchMove, { passive: false });
    window.addEventListener("touchend", handleWindowTouchEnd);
    window.addEventListener("touchcancel", handleWindowTouchEnd);
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

  const isDrawing = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    if (!isMobileBehavior && step === 2) {
      if (!ringContainerRef.current) return;
      const rect = ringContainerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      startPos.current = { x: clickX, y: clickY };
      isDrawing.current = true;
      
      const pctX = (clickX / rect.width) * 100;
      const pctY = (clickY / rect.height) * 100;
      setRedBox({
        x: pctX,
        y: pctY,
        w: 0,
        h: 0,
        rotation: 0,
        hasDrawn: false,
      });
    } else {
      mouseStartPos.current = { x: e.clientX, y: e.clientY };
      mouseStartTranslate.current = [imageTranslate[0], imageTranslate[1]];
    }
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (!isMobileBehavior && step === 2) {
      if (!isDrawing.current || !startPos.current || !ringContainerRef.current) return;
      
      const rect = ringContainerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      const x1 = Math.max(0, Math.min(rect.width, startPos.current.x));
      const y1 = Math.max(0, Math.min(rect.height, startPos.current.y));
      const x2 = Math.max(0, Math.min(rect.width, currentX));
      const y2 = Math.max(0, Math.min(rect.height, currentY));
      
      const left = Math.min(x1, x2);
      const top = Math.min(y1, y2);
      const width = Math.abs(x1 - x2);
      const height = Math.abs(y1 - y2);
      
      setRedBox((prev) => ({
        x: (left / rect.width) * 100,
        y: (top / rect.height) * 100,
        w: (width / rect.width) * 100,
        h: (height / rect.height) * 100,
        rotation: prev.rotation || 0,
        hasDrawn: width >= 2 || height >= 2 ? true : prev.hasDrawn,
      }));
    } else {
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
    }
  };

  const handleContainerMouseUp = () => {
    if (!isMobileBehavior && step === 2) {
      if (isDrawing.current) {
        isDrawing.current = false;
        startPos.current = null;
        const finalBox = currentRedBox.current;
        if (finalBox.w < 2 || finalBox.h < 2) {
          setRedBox({
            x: 38,
            y: 46,
            w: 28,
            h: 10,
            rotation: 0,
            hasDrawn: false,
          });
        } else {
          setRedBox((prev) => ({
            ...prev,
            hasDrawn: true,
          }));
        }
      }
    } else {
      mouseStartPos.current = null;
    }
  };

  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.button !== 0) return;

    if (!ringContainerRef.current) return;

    const box = currentRedBox.current;
    const theta = ((box.rotation || 0) * Math.PI) / 180;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;

    const corners = {
      tl: {
        x: cx + (-box.w / 2) * cos - (-box.h / 2) * sin,
        y: cy + (-box.w / 2) * sin + (-box.h / 2) * cos,
      },
      tr: {
        x: cx + (box.w / 2) * cos - (-box.h / 2) * sin,
        y: cy + (box.w / 2) * sin + (-box.h / 2) * cos,
      },
      bl: {
        x: cx + (-box.w / 2) * cos - (box.h / 2) * sin,
        y: cy + (-box.w / 2) * sin + (box.h / 2) * cos,
      },
      br: {
        x: cx + (box.w / 2) * cos - (box.h / 2) * sin,
        y: cy + (box.w / 2) * sin + (box.h / 2) * cos,
      },
    };

    let px = 0;
    let py = 0;
    if (corner === "tl") {
      px = corners.br.x;
      py = corners.br.y;
    } else if (corner === "tr") {
      px = corners.bl.x;
      py = corners.bl.y;
    } else if (corner === "bl") {
      px = corners.tr.x;
      py = corners.tr.y;
    } else if (corner === "br") {
      px = corners.tl.x;
      py = corners.tl.y;
    } else if (corner === "t") {
      px = (corners.bl.x + corners.br.x) / 2;
      py = (corners.bl.y + corners.br.y) / 2;
    } else if (corner === "b") {
      px = (corners.tl.x + corners.tr.x) / 2;
      py = (corners.tl.y + corners.tr.y) / 2;
    } else if (corner === "l") {
      px = (corners.tr.x + corners.br.x) / 2;
      py = (corners.tr.y + corners.br.y) / 2;
    } else if (corner === "r") {
      px = (corners.tl.x + corners.bl.x) / 2;
      py = (corners.tl.y + corners.bl.y) / 2;
    }

    const handleWindowMouseMove = (moveEvent: MouseEvent) => {
      if (!ringContainerRef.current) return;
      const currentRect = ringContainerRef.current.getBoundingClientRect();

      const mx_pct = ((moveEvent.clientX - currentRect.left) / currentRect.width) * 100;
      const my_pct = ((moveEvent.clientY - currentRect.top) / currentRect.height) * 100;

      const vx = (mx_pct - px) * cos + (my_pct - py) * sin;
      const vy = -(mx_pct - px) * sin + (my_pct - py) * cos;

      let w_new = box.w;
      let h_new = box.h;
      let local_cx = 0;
      let local_cy = 0;

      if (corner === "tl") {
        w_new = -vx;
        h_new = -vy;
        w_new = Math.max(3, Math.min(100, w_new));
        h_new = Math.max(3, Math.min(100, h_new));
        local_cx = -w_new / 2;
        local_cy = -h_new / 2;
      } else if (corner === "tr") {
        w_new = vx;
        h_new = -vy;
        w_new = Math.max(3, Math.min(100, w_new));
        h_new = Math.max(3, Math.min(100, h_new));
        local_cx = w_new / 2;
        local_cy = -h_new / 2;
      } else if (corner === "bl") {
        w_new = -vx;
        h_new = vy;
        w_new = Math.max(3, Math.min(100, w_new));
        h_new = Math.max(3, Math.min(100, h_new));
        local_cx = -w_new / 2;
        local_cy = h_new / 2;
      } else if (corner === "br") {
        w_new = vx;
        h_new = vy;
        w_new = Math.max(3, Math.min(100, w_new));
        h_new = Math.max(3, Math.min(100, h_new));
        local_cx = w_new / 2;
        local_cy = h_new / 2;
      } else if (corner === "t") {
        h_new = -vy;
        h_new = Math.max(3, Math.min(100, h_new));
        local_cx = 0;
        local_cy = -h_new / 2;
      } else if (corner === "b") {
        h_new = vy;
        h_new = Math.max(3, Math.min(100, h_new));
        local_cx = 0;
        local_cy = h_new / 2;
      } else if (corner === "l") {
        w_new = -vx;
        w_new = Math.max(3, Math.min(100, w_new));
        local_cx = -w_new / 2;
        local_cy = 0;
      } else if (corner === "r") {
        w_new = vx;
        w_new = Math.max(3, Math.min(100, w_new));
        local_cx = w_new / 2;
        local_cy = 0;
      }

      const cx_new = px + local_cx * cos - local_cy * sin;
      const cy_new = py + local_cx * sin + local_cy * cos;

      const x_new = Math.max(0, Math.min(100 - w_new, cx_new - w_new / 2));
      const y_new = Math.max(0, Math.min(100 - h_new, cy_new - h_new / 2));

      setRedBox((prev) => ({
        ...prev,
        x: x_new,
        y: y_new,
        w: w_new,
        h: h_new,
      }));
    };

    const handleWindowMouseUp = () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
  };

  const handleResizeTouchStart = (e: React.TouchEvent, corner: string) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;

    if (!ringContainerRef.current) return;

    const box = currentRedBox.current;
    const theta = ((box.rotation || 0) * Math.PI) / 180;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;

    const corners = {
      tl: {
        x: cx + (-box.w / 2) * cos - (-box.h / 2) * sin,
        y: cy + (-box.w / 2) * sin + (-box.h / 2) * cos,
      },
      tr: {
        x: cx + (box.w / 2) * cos - (-box.h / 2) * sin,
        y: cy + (box.w / 2) * sin + (-box.h / 2) * cos,
      },
      bl: {
        x: cx + (-box.w / 2) * cos - (box.h / 2) * sin,
        y: cy + (-box.w / 2) * sin + (box.h / 2) * cos,
      },
      br: {
        x: cx + (box.w / 2) * cos - (box.h / 2) * sin,
        y: cy + (box.w / 2) * sin + (box.h / 2) * cos,
      },
    };

    let px = 0;
    let py = 0;
    if (corner === "tl") {
      px = corners.br.x;
      py = corners.br.y;
    } else if (corner === "tr") {
      px = corners.bl.x;
      py = corners.bl.y;
    } else if (corner === "bl") {
      px = corners.tr.x;
      py = corners.tr.y;
    } else if (corner === "br") {
      px = corners.tl.x;
      py = corners.tl.y;
    } else if (corner === "t") {
      px = (corners.bl.x + corners.br.x) / 2;
      py = (corners.bl.y + corners.br.y) / 2;
    } else if (corner === "b") {
      px = (corners.tl.x + corners.tr.x) / 2;
      py = (corners.tl.y + corners.tr.y) / 2;
    } else if (corner === "l") {
      px = (corners.tr.x + corners.br.x) / 2;
      py = (corners.tr.y + corners.br.y) / 2;
    } else if (corner === "r") {
      px = (corners.tl.x + corners.bl.x) / 2;
      py = (corners.tl.y + corners.bl.y) / 2;
    }

    const handleWindowTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      if (!ringContainerRef.current) return;
      const currentRect = ringContainerRef.current.getBoundingClientRect();

      const mx_pct = ((moveEvent.touches[0].clientX - currentRect.left) / currentRect.width) * 100;
      const my_pct = ((moveEvent.touches[0].clientY - currentRect.top) / currentRect.height) * 100;

      const vx = (mx_pct - px) * cos + (my_pct - py) * sin;
      const vy = -(mx_pct - px) * sin + (my_pct - py) * cos;

      let w_new = box.w;
      let h_new = box.h;
      let local_cx = 0;
      let local_cy = 0;

      if (corner === "tl") {
        w_new = -vx;
        h_new = -vy;
        w_new = Math.max(3, Math.min(100, w_new));
        h_new = Math.max(3, Math.min(100, h_new));
        local_cx = -w_new / 2;
        local_cy = -h_new / 2;
      } else if (corner === "tr") {
        w_new = vx;
        h_new = -vy;
        w_new = Math.max(3, Math.min(100, w_new));
        h_new = Math.max(3, Math.min(100, h_new));
        local_cx = w_new / 2;
        local_cy = -h_new / 2;
      } else if (corner === "bl") {
        w_new = -vx;
        h_new = vy;
        w_new = Math.max(3, Math.min(100, w_new));
        h_new = Math.max(3, Math.min(100, h_new));
        local_cx = -w_new / 2;
        local_cy = h_new / 2;
      } else if (corner === "br") {
        w_new = vx;
        h_new = vy;
        w_new = Math.max(3, Math.min(100, w_new));
        h_new = Math.max(3, Math.min(100, h_new));
        local_cx = w_new / 2;
        local_cy = h_new / 2;
      } else if (corner === "t") {
        h_new = -vy;
        h_new = Math.max(3, Math.min(100, h_new));
        local_cx = 0;
        local_cy = -h_new / 2;
      } else if (corner === "b") {
        h_new = vy;
        h_new = Math.max(3, Math.min(100, h_new));
        local_cx = 0;
        local_cy = h_new / 2;
      } else if (corner === "l") {
        w_new = -vx;
        w_new = Math.max(3, Math.min(100, w_new));
        local_cx = -w_new / 2;
        local_cy = 0;
      } else if (corner === "r") {
        w_new = vx;
        w_new = Math.max(3, Math.min(100, w_new));
        local_cx = w_new / 2;
        local_cy = 0;
      }

      const cx_new = px + local_cx * cos - local_cy * sin;
      const cy_new = py + local_cx * sin + local_cy * cos;

      const x_new = Math.max(0, Math.min(100 - w_new, cx_new - w_new / 2));
      const y_new = Math.max(0, Math.min(100 - h_new, cy_new - h_new / 2));

      setRedBox((prev) => ({
        ...prev,
        x: x_new,
        y: y_new,
        w: w_new,
        h: h_new,
      }));
    };

    const handleWindowTouchEnd = () => {
      window.removeEventListener("touchmove", handleWindowTouchMove);
      window.removeEventListener("touchend", handleWindowTouchEnd);
      window.removeEventListener("touchcancel", handleWindowTouchEnd);
    };

    window.addEventListener("touchmove", handleWindowTouchMove, { passive: false });
    window.addEventListener("touchend", handleWindowTouchEnd);
    window.addEventListener("touchcancel", handleWindowTouchEnd);
  };

  const resetZoom = () => {
    setImageScale(1.0);
    setImageTranslate([0, 0]);
    setImageRotation(0);
    setRedBox({
      x: 38,
      y: 46,
      w: 28,
      h: 10,
      rotation: 0,
      hasDrawn: isMobileBehavior ? true : false,
    });
  };

  return {
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
  };
}
