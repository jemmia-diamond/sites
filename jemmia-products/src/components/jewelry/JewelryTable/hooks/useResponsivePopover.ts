import { useCallback, useRef, useState, useEffect, type MouseEvent } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

const DISMISS_LOCK_MS = 400;

export function useResponsivePopover(delay = 120) {
  const isMobile = useIsMobile();
  const [isTablet, setIsTablet] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissLockUntil = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (max-width: 1279px)");
    const update = () => setIsTablet(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      dismissLockUntil.current = Date.now() + DISMISS_LOCK_MS;
    }
  }, []);

  const onEnter = useCallback(() => {
    if (isMobile || isTablet) return;
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  }, [isMobile, isTablet]);

  const onLeave = useCallback(() => {
    if (isMobile || isTablet) return;
    timer.current = setTimeout(() => setOpen(false), delay);
  }, [isMobile, isTablet, delay]);

  const onTriggerClick = useCallback((e: MouseEvent) => {
    if (!isMobile) return;
    e.stopPropagation();
    if (Date.now() < dismissLockUntil.current) return;
    handleOpenChange(true);
  }, [isMobile, handleOpenChange]);

  const close = useCallback(() => handleOpenChange(false), [handleOpenChange]);

  return {
    open,
    setOpen: handleOpenChange,
    handleOpenChange,
    isMobile,
    isTablet,
    onEnter,
    onLeave,
    onTriggerClick,
    close,
  };
}
