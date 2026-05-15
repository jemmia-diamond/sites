import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ProductModel } from "../../../types";
import { Badge } from "@/components/ui/badge";
import { CaretDown, Copy, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useHoverPopover } from "./hooks/useHoverPopover";

interface ProductCodesProps {
  product: ProductModel;
  isExpanded: boolean;
}

export function ProductCodes({ product, isExpanded }: ProductCodesProps) {
  const { open, onEnter, onLeave } = useHoverPopover();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const designCode = product.attributes?.designCode;

  const otherCodes = Array.from(
    new Set([
      product.attributes?.erpCode,
      product.attributes?.code,
      product.attributes?.backupCode,
    ].filter(Boolean))
  ).filter((c) => c !== designCode);

  const hasOther = otherCodes.length > 0;

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

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 1500);
    });
  };

  const shouldShowAbove = coords ? (coords.bottom + 160 > window.innerHeight) : false;

  return (
    <div 
      className="relative flex items-center justify-center" 
      onMouseEnter={onEnter} 
      onMouseLeave={onLeave} 
      ref={triggerRef}
    >
      <Badge className="flex items-center gap-1.5 rounded-full bg-secondary-900 text-white pl-2 pr-1.5 py-0.5 text-[10px] font-black tracking-widest border-none shadow-sm uppercase whitespace-nowrap">
        <span>{designCode || "N/A"}</span>
        {designCode && (
          <button
            onClick={(e) => handleCopy(e, designCode)}
            className="text-white/60 hover:text-white transition-colors focus:outline-none flex items-center justify-center"
            title="Copy code"
          >
            {copiedText === designCode ? (
              <Check size={11} weight="bold" className="text-green-400" />
            ) : (
              <Copy size={11} weight="bold" />
            )}
          </button>
        )}
      </Badge>

      {hasOther && (
        <div className="absolute left-[calc(100%+4px)] top-1/2 -translate-y-1/2 flex items-center justify-center w-3 h-3">
          <CaretDown
            size={10}
            weight="bold"
            className={cn(
              "transition-all duration-200",
              isExpanded
                ? open ? "text-white rotate-180" : "text-white"
                : open ? "text-secondary-900 rotate-180" : "text-primary-400"
            )}
          />
        </div>
      )}

      {hasOther && open && coords && createPortal(
        <div 
          className="fixed z-[100] pointer-events-none"
          style={{ 
            top: shouldShowAbove ? `${coords.top - 8}px` : `${coords.bottom + 8}px`, 
            left: `${coords.left}px`,
            transform: shouldShowAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)"
          }}
        >
          <div className="bg-white border border-primary-100 shadow-2xl p-1.5 flex flex-col gap-1 min-w-[160px] items-stretch animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
            {otherCodes.map((c, i) => (
              <div 
                key={i} 
                className="group/item flex items-center justify-between gap-3 px-2.5 py-1.5 bg-primary-50 border border-primary-100 hover:bg-primary-100/80 transition-colors cursor-pointer"
                onClick={(e) => handleCopy(e, c as string)}
              >
                <span className="text-secondary-900 text-[9px] font-bold tracking-widest whitespace-nowrap uppercase">
                  {c}
                </span>
                <div className="flex items-center justify-center w-4 h-4">
                  {copiedText === c ? (
                    <Check size={12} weight="bold" className="text-green-600" />
                  ) : (
                    <Copy size={12} weight="bold" className="text-secondary-900/40 group-hover/item:text-secondary-900 transition-colors" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}