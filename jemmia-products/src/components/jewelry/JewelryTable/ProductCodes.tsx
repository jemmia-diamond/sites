import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ProductModel } from "../../../types";
import { CaretDown, Copy, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useResponsivePopover } from "./hooks/useResponsivePopover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BottomSheet } from "@/components/ui/bottom-sheet";

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
  const { open, setOpen, isMobile, isTablet, onEnter, onLeave, handleOpenChange } = useResponsivePopover();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const allItems: CopyableItem[] = [];
  if (designCode && !isBundle) {
    allItems.push({ code: designCode, label: "Mã thiết kế" });
  }
  allItems.push(...copyableItems);

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

  function CodesList({ items }: { items: CopyableItem[] }) {
    return (
      <div className="flex flex-col items-stretch gap-1">
        {items.map((item, i) => (
          <div
            key={i}
            className="group/item flex items-center justify-between gap-3 px-2.5 py-1.5 border border-primary-100 bg-primary-50 cursor-pointer hover:bg-primary-100/80 transition-colors"
            onClick={(e) => handleCopy(e, item.code)}
            title={`Copy ${item.label}`}
          >
            <span className="text-secondary-900 text-[11px] font-black uppercase">
              {item.code}
            </span>
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
  }

  return (
    <div
      className={cn("relative flex items-center justify-start w-[140px]", className)}
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
          "flex justify-between items-center gap-1.5 rounded-full pl-2 pr-2 py-0.5 w-full text-[10px] font-bold tracking-widest border-none shadow-sm uppercase whitespace-nowrap transition-colors cursor-pointer",
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isTablet) {
              setDialogOpen(true);
            } else if (isMobile) {
              setOpen(true);
            }
          }}
          className="absolute left-[calc(100%+4px)] top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 cursor-pointer"
        >
          <CaretDown
            size={10}
            weight="bold"
            className="text-primary-400"
          />
        </button>
      )}

      {hasPopover && !isMobile && !isTablet && open && coords && createPortal(
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
          <div className="bg-white border border-primary-100 shadow-2xl p-1.5 min-w-[180px] flex flex-col animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
            <CodesList items={copyableItems} />
          </div>
        </div>,
        document.body
      )}

      {isMobile && hasPopover && createPortal(
        <BottomSheet open={open} onOpenChange={handleOpenChange} title={`Mã sản phẩm`}>
          <div className="pb-4">
            <div className="px-4 pt-2">
              <CodesList items={allItems} />
            </div>
          </div>
        </BottomSheet>,
        document.body
      )}

      {isTablet && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="w-[95%] max-w-sm gap-0 bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="px-4 py-3 border-b border-primary-100 bg-white">
              <DialogTitle className="text-sm font-bold text-secondary-900">
                Mã sản phẩm
              </DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <CodesList items={allItems} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
