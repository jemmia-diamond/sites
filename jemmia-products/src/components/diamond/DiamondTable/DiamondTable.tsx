import { useState } from "react";
import { DiamondModel } from "../../../types";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DiamondTableRow } from "./DiamondTableRow";
import { GiaCertificateDialog } from "./GiaCertificateDialog";
import { ImagePreviewDialog } from "./ImagePreviewDialog";

interface DiamondTableProps {
  diamonds: DiamondModel[];
}

export function DiamondTable({ diamonds }: DiamondTableProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  return (
    <div className="relative border border-primary-100 bg-white shadow-sm h-full overflow-hidden">
      <div className="h-full overflow-auto">
        <table className="w-full min-w-[1200px] border-collapse">
          <TableHeader>
            <TableRow className="border-b border-primary-100 hover:bg-transparent">
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-black tracking-[0.2em] text-secondary-900 whitespace-nowrap">Định danh</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-black tracking-[0.2em] text-secondary-900 whitespace-nowrap">Hình thực tế</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-black tracking-[0.2em] text-secondary-900 whitespace-nowrap">Kích thước</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-black tracking-[0.2em] text-secondary-900 whitespace-nowrap">Trọng lượng</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-black tracking-[0.2em] text-secondary-900 whitespace-nowrap">Hình dạng</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-black tracking-[0.2em] text-secondary-900 whitespace-nowrap">Nước màu</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-black tracking-[0.2em] text-secondary-900 whitespace-nowrap">Độ sạch</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-black tracking-[0.2em] text-secondary-900 whitespace-nowrap">Huỳnh quang</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-right text-[10px] font-black tracking-[0.2em] text-secondary-900 whitespace-nowrap">Giá (VND)</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-black tracking-[0.2em] text-secondary-900 whitespace-nowrap">Trạng thái</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-black tracking-[0.2em] text-secondary-900 whitespace-nowrap">Vị trí kho</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-black tracking-[0.2em] text-secondary-900 whitespace-nowrap">Chứng nhận GIA</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-black tracking-[0.2em] text-secondary-900 whitespace-nowrap">Haravan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {diamonds.map((diamond) => (
              <DiamondTableRow
                key={diamond.id}
                diamond={diamond}
                onGiaPdfClick={setPreviewUrl}
                onImageClick={setImagePreviewUrl}
              />
            ))}
          </TableBody>
        </table>
      </div>

      <GiaCertificateDialog previewUrl={previewUrl} onClose={() => setPreviewUrl(null)} />
      <ImagePreviewDialog imagePreviewUrl={imagePreviewUrl} onClose={() => setImagePreviewUrl(null)} />
    </div>
  );
}