import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const HEADERS = ["Mã sản phẩm", "Viên tấm", "Ảnh website", "Ảnh thực tế", "Trạng thái", ""];

export function JewelryTableHeader() {
  return (
    <TableHeader className="bg-primary-50">
      <TableRow className="border-primary-100 divide-x divide-primary-100 border-b">
        {HEADERS.map((h, i) => (
          <TableHead
            key={i}
            className={cn(
              "bg-primary-50 h-10 py-0 text-[10px] font-black text-secondary-900 px-2 text-center uppercase tracking-[0.2em] border-primary-100",
              i === 5 && "w-12"
            )}
          >
            {h}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}