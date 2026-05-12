import React, { useState } from "react";
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
}

export function SideStoneTooltip({ fourView, isExpanded }: SideStoneTooltipProps) {
  const { open, onEnter, onLeave } = useHoverPopover();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopy = (e: React.MouseEvent, text: string, idx: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    });
  };

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

  return (
    <div
      className="relative inline-block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md hover:bg-primary-50 transition-colors">
        <span
          className={cn(
            "text-[11px] font-semibold leading-none transition-colors",
            isExpanded
              ? open ? "text-secondary-900" : "text-white"
              : open ? "text-secondary-900" : "text-primary-400"
          )}
        >
          {fourView.length} loại
        </span>
        <CaretDown
          size={10}
          weight="bold"
          className={cn(
            "transition-all duration-200",
            isExpanded
              ? open ? "text-secondary-900 rotate-180" : "text-white"
              : open ? "text-secondary-900 rotate-180" : "text-primary-400"
          )}
        />
      </div>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[80]">
          <div className="bg-white border border-primary-100 shadow-xl overflow-hidden min-w-[140px]">
            <div className="flex items-center justify-between px-3 py-2 bg-secondary-900/5 border-b border-primary-100">
              <span className="text-[10px] font-black text-secondary-900 tracking-wider">
                Đá tấm
              </span>
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
        </div>
      )}
    </div>
  );
}