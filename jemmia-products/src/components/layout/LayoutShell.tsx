
import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { FloatingSearch } from "./FloatingSearch";

interface LayoutShellProps {
  children: ReactNode;
  searchPlaceholder: string;
}

export function LayoutShell({ children, searchPlaceholder }: LayoutShellProps) {
  return (
    <div className="h-[100dvh] w-full font-sans antialiased bg-white text-primary-900 selection:bg-secondary-200 selection:text-secondary-900 flex flex-col overflow-hidden">
      <Header searchPlaceholder={searchPlaceholder} />
      <div className="flex flex-col lg:flex-row flex-1 w-full max-w-full overflow-hidden relative min-h-0 pb-12 lg:pb-0">
        {children}
      </div>
      <BottomNav />
      <FloatingSearch />
    </div>
  );
}
