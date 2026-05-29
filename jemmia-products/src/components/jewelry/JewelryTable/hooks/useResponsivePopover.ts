import { useCallback, useRef, useState, type MouseEvent } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

const DISMISS_LOCK_MS = 400;

export function useResponsivePopover(delay = 120) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissLockUntil = useRef(0);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      dismissLockUntil.current = Date.now() + DISMISS_LOCK_MS;
    }
  }, []);

  const onEnter = useCallback(() => {
    if (isMobile) return;
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  }, [isMobile]);

  const onLeave = useCallback(() => {
    if (isMobile) return;
    timer.current = setTimeout(() => setOpen(false), delay);
  }, [isMobile, delay]);

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
    onEnter,
    onLeave,
    onTriggerClick,
    close,
  };
}
