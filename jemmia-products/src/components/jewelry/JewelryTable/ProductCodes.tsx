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
  className?: string;
}

export function ProductCodes({ product, isExpanded, className }: ProductCodesProps) {
  const { open, onEnter, onLeave } = useHoverPopover();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const isBundle = product.products && product.products.length > 0;

  const designCode = isBundle
    ? product.products?.map(p => p.attributes.designCode).filter(Boolean).join(" / ")
    : product.attributes?.designCode;

  interface CopyableItem {
    code: string;
    label: string;
  }

  const copyableItems: CopyableItem[] = [];

  if (isBundle) {
    product.products?.forEach((subProduct, idx) => {
      const code = subProduct.attributes?.designCode;
      if (code) {
        const genderLabel = subProduct.attributes?.gender === 'Nam'
          ? 'Nhẫn Nam'
          : subProduct.attributes?.gender === 'Nữ'
            ? 'Nhẫn Nữ'
            : `Nhẫn con ${idx + 1}`;
        copyableItems.push({
          code,
          label: genderLabel
        });
      }
    });
  } else {
    const otherCodes = Array.from(
      new Set([
        product.attributes?.erpCode,
        product.attributes?.code,
        product.attributes?.backupCode,
      ].filter(Boolean))
    ).filter((c) => c !== designCode);

    otherCodes.forEach((c) => {
      let label = "Mã khác";
      if (c === product.attributes?.erpCode) label = "Mã ERP";
      else if (c === product.attributes?.code) label = "Mã phụ";
      else if (c === product.attributes?.backupCode) label = "Mã dự phòng";

      copyableItems.push({
        code: c as string,
        label
      });
    });
  }

  const hasPopover = copyableItems.length > 0;

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
      className={cn("relative flex items-center justify-center", className)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      ref={triggerRef}
    >
      <Badge className={cn(
        "flex items-center gap-1.5 rounded-full pl-2 pr-1.5 py-0.5 text-[10px] font-black tracking-widest border-none shadow-sm uppercase whitespace-nowrap",
        "bg-secondary-900 text-white"
      )}>
        <span>{designCode || "N/A"}</span>
        {!isBundle && designCode && (
          <button
            onClick={(e) => handleCopy(e, designCode)}
            className="text-white/60 hover:text-white transition-colors focus:outline-none flex items-center justify-center animate-in fade-in duration-300"
            title="Copy mã sản phẩm"
          >
            {copiedText === designCode ? (
              <Check size={11} weight="bold" className="text-green-400" />
            ) : (
              <Copy size={11} weight="bold" />
            )}
          </button>
        )}
      </Badge>

      {hasPopover && (
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

      {hasPopover && open && coords && createPortal(
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            top: shouldShowAbove ? `${coords.top - 8}px` : `${coords.bottom + 8}px`,
            left: `${coords.left}px`,
            transform: shouldShowAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)"
          }}
        >
          <div className="bg-white border border-primary-100 shadow-2xl p-1.5 flex flex-col gap-1 min-w-[180px] items-stretch animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
            {copyableItems.map((item, i) => (
              <div
                key={i}
                className="group/item flex items-center justify-between gap-3 px-2.5 py-1.5 bg-primary-50 border border-primary-100 hover:bg-primary-100/80 transition-colors cursor-pointer"
                onClick={(e) => handleCopy(e, item.code)}
                title={`Copy ${item.label}`}
              >
                <div className="flex flex-col items-start gap-0.5">
                  {isBundle && (
                    <span className="text-secondary-600 text-[8px] font-semibold">
                      {item.label}
                    </span>
                  )}
                  <span className="text-secondary-900 text-[10px] font-black uppercase">
                    {item.code}
                  </span>
                </div>
                <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                  {copiedText === item.code ? (
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
