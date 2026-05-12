import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";

const HEADERS = [
  "Mã sản phẩm",
  "Viên tấm",
  "Ảnh website",
  "Ảnh thực tế",
  "Trạng thái",
  "",
];

export function JewelryTableHeader() {
  return (
    <TableHeader>
      <TableRow className="divide-x divide-primary-100 border-b border-primary-100 hover:bg-transparent">
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
              text-[10px]
              font-black
              uppercase
              tracking-[0.2em]
              text-secondary-900
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