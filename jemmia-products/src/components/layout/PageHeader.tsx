
import { ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
  description: string | ReactNode;
  actions?: ReactNode;
  headerStart?: ReactNode;
  sortOptions?: {
    value: string;
    label: string;
  }[];
  onSortChange?: (value: string) => void;
  defaultSort?: string;
  sortLabel?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  headerStart,
  sortOptions,
  onSortChange,
  defaultSort,
  sortLabel = "SẮP XẾP THEO",
  className
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-start justify-between gap-1", className)}>
      <div className="flex items-center gap-4">
        {headerStart && <div>{headerStart}</div>}
        <div className="space-y-0">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
          <div className="text-sm text-gray-500 max-w-2xl leading-relaxed font-medium">
            {description}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 pt-2 justify-end">
        {sortOptions && (
          <div className="flex flex-col gap-1.5 flex-1 sm:flex-initial">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">{sortLabel}</span>
            <Select defaultValue={defaultSort} onValueChange={onSortChange}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white border border-gray-200 h-10 font-bold text-xs ring-offset-white focus:ring-1 focus:ring-[#002B2B]">
                <SelectValue placeholder={sortLabel} />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {actions && (
          <div>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
