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
    <div className="bg-white rounded-none border border-primary-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <Table>
        <TableHeader className="bg-primary-50">
          <TableRow className="border-primary-100 divide-x divide-primary-100">
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Định danh</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 text-center uppercase tracking-[0.2em]">Hình minh họa</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 text-center uppercase tracking-[0.2em]">Hình thực tế</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Kích thước</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Trọng lượng (carat)</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Hình dạng</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Nước màu</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Độ sạch</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Huỳnh quang</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 text-right uppercase tracking-[0.2em]">Giá (VND)</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Trạng thái</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Vị trí kho</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 text-center uppercase tracking-[0.2em]">Chứng nhận GIA</TableHead>
            <TableHead className="text-[10px] font-black text-secondary-900 py-5 px-4 uppercase tracking-[0.2em]">Haravan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diamonds.map((diamond) => (
            <DiamondTableRow
              diamond={diamond}
              onGiaPdfClick={setPreviewUrl}
              onImageClick={setImagePreviewUrl}
            />
          ))}
        </TableBody>
      </Table>

      <GiaCertificateDialog previewUrl={previewUrl} onClose={() => setPreviewUrl(null)} />
      <ImagePreviewDialog imagePreviewUrl={imagePreviewUrl} onClose={() => setImagePreviewUrl(null)} />
    </div>
  );
}