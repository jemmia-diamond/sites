import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CaretDown, Copy, Check } from "@phosphor-icons/react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";
import { useResponsivePopover } from "./hooks/useResponsivePopover";
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
  const { open, isMobile, onEnter, onLeave, onTriggerClick, handleOpenChange } = useResponsivePopover();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

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
  const sheetTitle = `${fourView?.length} loại đá`;

  const stonesPanel = (
    <>
      <div className={cn(
        "flex items-center justify-end",
        isMobile ? "my-2" : "px-3 py-2 bg-secondary-900/5"
      )}>

        <button
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 text-[11px] font-bold text-primary-400 hover:text-secondary-900 transition-colors py-1 rounded-lg hover:bg-primary-50"
        >
          {copiedAll ? (
            <Check size={14} className="text-emerald-500" />
          ) : (
            <Copy size={14} />
          )}
          {copiedAll ? "Đã copy" : "Copy tất cả"}
        </button>
      </div>

      <div className={cn("flex flex-col", isMobile ? "gap-2" : "p-1.5 gap-0.5")}>
        {fourView.map((stone, idx) => (
          <div
            key={idx}
            className={cn(
              "group/item flex items-center justify-between gap-3 px-2.5 py-1.5 transition-colors",
              isMobile
                ? "bg-primary-50 border border-primary-100 py-3"
                : "rounded-lg hover:bg-primary-50"
            )}
          >
            <span className="text-[12px] sm:text-[11px] font-semibold text-secondary-900 whitespace-nowrap">
              {formatLySize(stone.round)}
            </span>
            <span className="text-[12px] sm:text-[11px] text-primary-400 font-medium flex-1 text-right whitespace-nowrap">
              {stone.diamondCount} viên
            </span>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div
      className="relative inline-block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={isMobile ? onTriggerClick : (e) => e.stopPropagation()}
      ref={triggerRef}
      style={isMobile && open ? { pointerEvents: "none" } : undefined}
    >
      <div className={cn(
        "flex items-center gap-1 -mt-0.5 px-2 rounded-md transition-colors",
        isMobile ? "cursor-pointer active:bg-primary-100" : "cursor-pointer hover:bg-primary-50"
      )}>
        <span
          className={cn(
            "text-[11px] font-semibold leading-none transition-colors",
            isExpanded
              ? isMobile ? "text-secondary-900" : "text-white"
              : open ? "text-secondary-900" : "text-primary-400"
          )}
        >
          {label ? label : `${fourView.length} loại`}
        </span>
        <CaretDown
          size={10}
          weight="bold"
          className={cn(
            "transition-all duration-200",
            isExpanded
              ? "text-secondary-900"
              : open ? "text-secondary-900 rotate-180" : "text-primary-400"
          )}
        />
      </div>

      {isMobile && createPortal(
        <BottomSheet open={open} onOpenChange={handleOpenChange} title={sheetTitle}>
          {stonesPanel}
        </BottomSheet>,
        document.body
      )}

      {!isMobile && open && coords && createPortal(
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            top: shouldShowAbove ? `${coords.top - 8}px` : `${coords.bottom + 8}px`,
            left: `${coords.left}px`,
            transform: shouldShowAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)"
          }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          <div className="bg-white border border-primary-100 shadow-2xl overflow-hidden min-w-[140px] animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
            {stonesPanel}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
