import React from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductModel } from "../../../types";
import { SerialListModal } from "./SerialListModal";
import { formatPrice, cleanFineness } from "./utils/formatters";

interface DesignCardTableProps {
  stockBySKU: Record<string, { variants: any[]; totalQuantity: number; firstVariant: any }>;
  isEarring: boolean;
  product: ProductModel;
}

export function DesignCardTable({ stockBySKU, isEarring, product }: DesignCardTableProps) {
  return (
    <Table>
      <TableHeader className="bg-primary-50/50">
        <TableRow className="border-b border-primary-50 hover:bg-transparent">
          <TableHead className="text-[9px] font-black text-primary-300 py-2.5 uppercase pl-8 tracking-widest">Sản phẩm (SKU/Barcode)</TableHead>
          <TableHead className="text-[9px] font-black text-primary-300 py-2.5 uppercase tracking-widest">Cấu hình (Vàng/Màu/Ni)</TableHead>
          <TableHead className="text-[9px] font-black text-primary-300 py-2.5 uppercase tracking-widest text-center">Tồn kho</TableHead>
          <TableHead className="text-[9px] font-black text-primary-300 py-2.5 uppercase tracking-widest text-right pr-8">Giá bán</TableHead>
          <TableHead className="text-[9px] font-black text-primary-300 py-2.5 uppercase tracking-widest text-center">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(stockBySKU).map(([sku, group]) => {
          const variant = group.firstVariant;
          return (
            <TableRow key={sku} className="border-b border-primary-50 last:border-none group/row hover:bg-primary-50/20 transition-colors">
              <TableCell className="py-2 pl-8">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-secondary-900">SKU: {sku}</p>
                  <p className="text-[9px] font-black text-primary-200 tracking-wider">BC: {variant.barcode || "N/A"}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full text-[10px] font-bold px-1.5 py-0.5 bg-white border-primary-100 text-primary-600">
                    {cleanFineness(variant.attributes?.fineness || product.attributes?.fineness)}
                  </Badge>
                  <span className="text-[11px] font-bold text-secondary-900">{variant.attributes?.materialColor || "N/A"}</span>
                  <span className="text-primary-100">/</span>
                  <span className="text-[11px] font-black text-secondary-900">{variant.attributes?.ringSize ? `Ni ${variant.attributes.ringSize}` : "--"}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-secondary-900 text-white rounded-full text-[11px] font-black h-6 w-10 flex items-center justify-center">
                  {isEarring ? Math.floor(group.totalQuantity / 2) : group.totalQuantity}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-8">
                <div className="flex flex-col items-end">
                  {variant.basePrice > 0 && variant.basePrice !== variant.salePrice && (
                    <p className="text-[10px] font-medium text-primary-200 line-through">
                      {formatPrice(isEarring ? variant.basePrice * 2 : variant.basePrice)}
                    </p>
                  )}
                  <p className="text-sm font-black text-secondary-900">
                    {formatPrice(isEarring ? (variant.salePrice || 0) * 2 : (variant.salePrice || 0))}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-center" onClick={(e) => e.stopPropagation()}>
                  <SerialListModal variants={group.variants} sku={sku} />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}