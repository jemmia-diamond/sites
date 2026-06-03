import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CaretDown, Copy, Check, X } from "@phosphor-icons/react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";
import { useResponsivePopover } from "./hooks/useResponsivePopover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatLySize } from "./utils/formatters";

interface SideStone {
  round: string;
  diamondCount: string;
}

interface SideStoneTooltipProps {
  fourView: SideStone[];
  isExpanded: boolean;
  label?: string;
}

export function SideStoneTooltip({ fourView, isExpanded, label }: SideStoneTooltipProps) {
  const { open, isMobile, isTablet, onEnter, onLeave, onTriggerClick, handleOpenChange } = useResponsivePopover();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const count = fourView.length;

  useEffect(() => {
    if (open && !isMobile && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left + rect.width / 2,
        width: rect.width,
      });
    }
  }, [open, isMobile]);

  const handleCopyAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = fourView
      .map((s) => `${formatLySize(s.round)}: ${s.diamondCount} viên`)
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    });
  };

  const shouldShowAbove = coords ? (coords.bottom + 200 > window.innerHeight) : false;
  const title = `${count} loại đá`;

  const stonesPanel = (
    <div className="divide-y divide-primary-100">
      {fourView.map((stone, idx) => (
        <div key={idx} className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-secondary-900">{formatLySize(stone.round)}</span>
          <span className="text-xs text-primary-400">{stone.diamondCount} viên</span>
        </div>
      ))}
    </div>
  );

  const handleClick = (e: React.MouseEvent) => {
    if (isMobile) {
      onTriggerClick(e);
    } else if (isTablet) {
      e.stopPropagation();
      setDialogOpen(true);
    } else {
      e.stopPropagation();
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={handleClick}
      ref={triggerRef}
      style={isMobile && open ? { pointerEvents: "none" } : undefined}
    >
      <div className={cn(
        "flex items-center gap-1 px-2 -mt-0.5 md:mt-0 md:px-2 md:py-0.5 text-[10px] md:text-[11px] font-semibold leading-none rounded transition-colors cursor-pointer select-none",
        isExpanded
          ? "text-white/90 hover:text-white"
          : "text-primary-400 hover:bg-primary-50 hover:text-secondary-900"
      )}>
        <span>{label || `${count} loại`}</span>
        <CaretDown size={9} weight="bold" className="mt-px" />
      </div>

      {isMobile && createPortal(
        <BottomSheet open={open} onOpenChange={handleOpenChange} title={title}>
          <div className="pb-4">
            <div className="px-4 pb-3 flex items-center justify-between border-b border-primary-100">
              <span className="text-xs font-bold text-secondary-900">{title}</span>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1 text-[11px] font-bold text-primary-400 hover:text-secondary-900 transition-colors"
              >
                {copiedAll ? (
                  <Check size={12} weight="bold" className="text-emerald-500" />
                ) : (
                  <Copy size={12} weight="bold" />
                )}
                {copiedAll ? "Đã copy" : "Copy"}
              </button>
            </div>
            <div className="px-4 pt-2">{stonesPanel}</div>
          </div>
        </BottomSheet>,
        document.body
      )}

      {!isMobile && !isTablet && open && coords && createPortal(
        <div
          className="fixed z-[100]"
          style={{
            top: shouldShowAbove ? `${coords.top - 8}px` : `${coords.bottom + 4}px`,
            left: `${coords.left}px`,
            transform: "translateX(-50%)",
          }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          <div className="bg-white border border-primary-200 shadow-lg min-w-[150px] animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-1.5 border-b border-primary-100 flex items-center justify-between bg-primary-50/50">
              <span className="text-[10px] font-bold text-secondary-900">{title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyAll(e);
                }}
                className="flex items-center gap-1 text-[10px] font-bold text-primary-400 hover:text-secondary-900 transition-colors"
              >
                {copiedAll ? (
                  <Check size={11} weight="bold" className="text-emerald-500" />
                ) : (
                  <Copy size={11} weight="bold" />
                )}
                {copiedAll ? "Đã copy" : "Copy"}
              </button>
            </div>
            {stonesPanel}
          </div>
        </div>,
        document.body
      )}

      {isTablet && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} disablePointerDismissal={false}>
          <DialogContent className="w-[85%] max-w-[300px] gap-0 bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden" showCloseButton={false}>
            <DialogHeader className="px-4 py-3 border-b border-primary-100 bg-white">
              <DialogTitle className="flex items-center justify-between text-sm text-secondary-900">
                <span className="font-bold">{title}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyAll}
                    className="flex items-center gap-1 text-xs font-bold text-primary-400 hover:text-secondary-900 transition-colors"
                  >
                    {copiedAll ? (
                      <Check size={12} weight="bold" className="text-emerald-500" />
                    ) : (
                      <Copy size={12} weight="bold" />
                    )}
                    {copiedAll ? "Đã copy" : "Copy"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDialogOpen(false);
                    }}
                    className="flex items-center justify-center w-6 h-6 text-primary-400 hover:text-secondary-900 transition-colors"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>
              </DialogTitle>
            </DialogHeader>
            {stonesPanel}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
