import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";

const HEADERS = [
  "Ảnh website",
  "Mã sản phẩm",
  "Ảnh/video thực tế",
  "Viên tấm",
  "Giá",
  "Trạng thái",
  "",
];

export function JewelryTableHeader() {
  return (
    <TableHeader className="hidden md:table-header-group">
      <TableRow className="border-b border-primary-100 hover:bg-transparent">
        {HEADERS.map((h, i) => (
          <TableHead
            key={i}
            className={cn(
              `
              sticky top-0 z-50
              bg-primary-50
              h-10
              py-0
              text-[11px]
              font-bold
              uppercase
              tracking-wider
              text-primary-700
              whitespace-nowrap
            `,
              i === 1 ? "text-left px-6 md:px-3 w-42.5" : "text-center px-2",
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
