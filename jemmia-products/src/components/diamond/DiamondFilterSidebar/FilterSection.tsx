import { ReactNode } from "react";

interface FilterSectionProps {
  label: string;
  children: ReactNode;
}

export function FilterSection({ label, children }: FilterSectionProps) {
  return (
    <section className="space-y-4">
      <label className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
        {label}
        <div className="h-px flex-1 bg-primary-100" />
      </label>
      {children}
    </section>
  );
}