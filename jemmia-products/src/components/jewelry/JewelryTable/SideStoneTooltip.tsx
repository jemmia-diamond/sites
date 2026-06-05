import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CaretDown, Copy, Check, X } from "@phosphor-icons/react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";
import { useResponsivePopover } from "./hooks/useResponsivePopover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatLySize } from "./utils/formatters";

interface SideStone {
  shape?: string;
  round?: string;
  diamondCount: string;
  [key: string]: any;
}

interface SideStoneTooltipProps {
  fourView: SideStone[];
  isExpanded: boolean;
  label?: string;
}

function getStoneSize(stone: SideStone): string {
  if (stone.round) return stone.round;
  if (stone.shape) {
    const key = stone.shape.toLowerCase();
    if (stone[key]) return stone[key];
  }
  const otherKey = Object.keys(stone).find(
    (k) => k !== "shape" && k !== "diamondCount"
  );
  return otherKey ? stone[otherKey] : "";
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

  const getStoneSizeValue = (stone: SideStone) => {
    return getStoneSize(stone);
  };

  const handleCopyAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = fourView
      .map((s) => {
        const sizeVal = getStoneSizeValue(s);
        const prefix = s.shape ? `${s.shape} ` : "";
        return `${prefix}${formatLySize(sizeVal)}: ${s.diamondCount} viên`;
      })
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    });
  };

  const shouldShowAbove = coords ? (coords.bottom + 200 > window.innerHeight) : false;
  const title = `${count} loại đá`;

  const hasAnyShape = fourView.some((stone) => stone.shape);
  const containerMinWidthClass = hasAnyShape ? "min-w-[220px] md:min-w-[260px]" : "min-w-[150px]";

  const stonesPanel = (
    <div className="divide-y divide-primary-100">
      {fourView.map((stone, idx) => {
        const sizeValue = getStoneSizeValue(stone);
        return (
          <div key={idx} className="flex items-center justify-between px-0 md:px-4 py-2 text-xs">
            {hasAnyShape ? (
              <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-2 w-full items-center">
                <span className="text-xs text-secondary-900 truncate" title={stone.shape || ""}>
                  {stone.shape || "--"}
                </span>
                <span className="text-xs text-secondary-900 truncate">
                  {formatLySize(sizeValue)}
                </span>
                <span className="text-xs text-secondary-900 text-right">
                  {stone.diamondCount} viên
                </span>
              </div>
            ) : (
              <>
                <span className="text-xs text-secondary-900">{formatLySize(sizeValue)}</span>
                <span className="text-xs text-secondary-900">{stone.diamondCount} viên</span>
              </>
            )}
          </div>
        );
      })}
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
    <>
      <div
        className="relative inline-block"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={handleClick}
        ref={triggerRef}
        style={isMobile && open ? { pointerEvents: "none" } : undefined}
      >
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 text-xs font-normal leading-none rounded-full transition-colors cursor-pointer select-none border border-transparent shadow-sm",
          isExpanded
            ? "bg-white/15 text-white hover:bg-white/25"
            : "bg-slate-100 text-secondary-900 hover:bg-slate-200"
        )}>
          <span>{label || `${count} loại`}</span>
          <CaretDown size={9} weight="bold" className="mt-px flex-shrink-0" />
        </div>

        {isMobile && createPortal(
          <BottomSheet
            open={open}
            onOpenChange={handleOpenChange}
            title={
              <div className="flex items-center justify-between w-full pr-1">
                <span>{title}</span>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary-400 hover:text-secondary-900 transition-colors mr-2 cursor-pointer"
                >
                  {copiedAll ? (
                    <Check size={12} weight="bold" className="text-emerald-500" />
                  ) : (
                    <Copy size={12} weight="bold" />
                  )}
                  {copiedAll ? "Đã copy" : "Copy"}
                </button>
              </div>
            }
          >
            <div className="pb-4">
              {stonesPanel}
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
            <div className={cn("bg-white border border-primary-200 shadow-lg animate-in fade-in zoom-in-95 duration-200", containerMinWidthClass)}>
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
      </div>

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
    </>
  );
}
