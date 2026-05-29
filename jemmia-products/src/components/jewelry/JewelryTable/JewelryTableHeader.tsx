import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";

const HEADERS = [
  "Mã sản phẩm",
  "Ảnh website",
  "Ảnh/video thực tế",
  "Viên tấm",
  "Giá",
  "Trạng thái",
  "",
];

export function JewelryTableHeader() {
  return (
    <TableHeader className="hidden sm:table-header-group">
      <TableRow className="border-b border-primary-100 hover:bg-transparent">
        {HEADERS.map((h, i) => (
          <TableHead
            key={i}
            className={cn(
              `
              sticky top-0 z-50
              bg-primary-50
              h-10
              px-2
              py-0
              text-center
              text-[11px]
              font-bold
              uppercase
              tracking-wider
              text-primary-700
              whitespace-nowrap
            `,
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
