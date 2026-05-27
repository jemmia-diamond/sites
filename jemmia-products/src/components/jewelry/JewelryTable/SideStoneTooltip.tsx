import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CaretDown, Copy, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useHoverPopover } from "./hooks/useHoverPopover";
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
  const { open, onEnter, onLeave } = useHoverPopover();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left + rect.width / 2,
        width: rect.width,
      });
    }
  }, [open]);

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

  return (
    <div
      className="relative inline-block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={(e) => e.stopPropagation()}
      ref={triggerRef}
    >
      <div className="flex items-center gap-1 -mt-0.5 cursor-pointer px-2 rounded-md hover:bg-primary-50 transition-colors">
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

      {open && coords && createPortal(
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            top: shouldShowAbove ? `${coords.top - 8}px` : `${coords.bottom + 8}px`,
            left: `${coords.left}px`,
            transform: shouldShowAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)"
          }}
        >
          <div className="bg-white border border-primary-100 shadow-2xl overflow-hidden min-w-[140px] animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
            <div className="flex items-center justify-between px-3 py-2 bg-secondary-900/5 border-b border-primary-100">
              <div></div>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1 text-[10px] font-bold text-primary-400 hover:text-secondary-900 transition-colors"
              >
                {copiedAll ? (
                  <Check size={11} className="text-emerald-500" />
                ) : (
                  <Copy size={11} />
                )}
                {copiedAll ? "Đã copy" : "Copy"}
              </button>
            </div>

            <div className="p-1.5 flex flex-col gap-0.5">
              {fourView.map((stone, idx) => (
                <div
                  key={idx}
                  className="group/item flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <span className="text-[11px] font-semibold text-secondary-900 whitespace-nowrap">
                    {formatLySize(stone.round)}
                  </span>
                  <span className="text-[11px] text-primary-400 font-medium flex-1 text-right whitespace-nowrap">
                    {stone.diamondCount} viên
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
