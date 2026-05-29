
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
    <div className={cn("flex flex-col  justify-between gap-1", className)}>
      {headerStart && <div>{headerStart}</div>}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="space-y-0">
            <h1 className="text-lg md:text-2xl font-bold tracking-tight text-primary-900">{title}</h1>
            <div className="text-sm text-primary-500 max-w-2xl leading-relaxed font-medium">
              {description}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 sm:pt-2 justify-between sm:justify-end">
          {sortOptions && (
            <div className="flex flex-col gap-1.5 flex-1 sm:flex-initial">
              <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest pl-1">{sortLabel}</span>
              <Select defaultValue={defaultSort} onValueChange={onSortChange}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white border border-primary-100 h-10 font-bold text-xs ring-offset-white focus:ring-1 focus:ring-secondary-900">
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
            <div className="w-full flex items-center justify-between sm:justify-end">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
