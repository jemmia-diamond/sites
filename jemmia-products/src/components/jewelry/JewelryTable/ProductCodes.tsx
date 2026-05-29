import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ProductModel } from "../../../types";
import { CaretDown, Copy, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useResponsivePopover } from "./hooks/useResponsivePopover";

interface ProductCodesProps {
  product: ProductModel;
  isExpanded: boolean;
  className?: string;
}

interface CopyableItem {
  code: string;
  label: string;
}

export function ProductCodes({ product, isExpanded, className }: ProductCodesProps) {
  const { open, isMobile, onEnter, onLeave } = useResponsivePopover();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const isBundle = product.products && product.products.length > 0;

  const designCode = isBundle
    ? product.products?.map(p => p.attributes.designCode).filter(Boolean).join(" / ")
    : product.attributes?.designCode;

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

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 1500);
    });
  };

  const shouldShowAbove = coords ? (coords.bottom + 160 > window.innerHeight) : false;

  const codesPanel = (
    <div className={cn(
      "flex flex-col gap-1 items-stretch",
      isMobile ? "gap-2" : "p-1.5 min-w-[180px]"
    )}>
      {copyableItems.map((item, i) => (
        <div
          key={i}
          className={cn(
            "group/item flex items-center justify-between gap-3 px-2.5 py-1.5 border transition-colors cursor-pointer",
            isMobile
              ? "bg-primary-50 border-primary-100 active:bg-primary-100/80 py-3"
              : "bg-primary-50 border-primary-100 hover:bg-primary-100/80"
          )}
          onClick={(e) => handleCopy(e, item.code)}
          title={`Copy ${item.label}`}
        >
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-secondary-900 text-[11px] md:text-[10px] font-black uppercase">
              {item.code}
            </span>
          </div>
          <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
            {copiedText === item.code ? (
              <Check size={14} weight="bold" className="text-green-600" />
            ) : (
              <Copy size={14} weight="bold" className="text-secondary-900/40 group-hover/item:text-secondary-900 transition-colors" />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={cn("relative flex items-center justify-center w-fit", className)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      ref={triggerRef}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (designCode) handleCopy(e, designCode);
        }}
        className={cn(
          "flex items-center gap-1.5 rounded-full pl-2.5 pr-2 py-0.5 text-xs font-bold tracking-widest border-none shadow-sm uppercase whitespace-nowrap transition-colors cursor-pointer",
          "bg-secondary-900 text-white active:opacity-90"
        )}
      >
        <span>{designCode || "N/A"}</span>
        {copiedText === designCode ? (
          <Check size={11} weight="bold" className="text-green-400" />
        ) : (
          <Copy size={11} weight="bold" />
        )}
      </button>

      {hasPopover && (
        <div className="absolute left-[calc(100%+4px)] top-1/2 -translate-y-1/2 flex items-center justify-center w-3 h-3">
          <CaretDown
            size={10}
            weight="bold"
            className="text-primary-400"
          />
        </div>
      )}

      {hasPopover && !isMobile && open && coords && createPortal(
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
          <div className="bg-white border border-primary-100 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
            {codesPanel}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
