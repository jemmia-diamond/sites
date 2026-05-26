
import { ReactNode } from "react";
import { Header } from "./Header";

interface LayoutShellProps {
  children: ReactNode;
  searchPlaceholder: string;
}

export function LayoutShell({ children, searchPlaceholder }: LayoutShellProps) {
  return (
    <div className="h-[100dvh] w-full font-sans antialiased bg-white text-primary-900 selection:bg-secondary-200 selection:text-secondary-900 flex flex-col overflow-hidden">
      <Header searchPlaceholder={searchPlaceholder} />
      <div className="flex flex-col lg:flex-row flex-1 p-0 sm:p-4 lg:p-6 w-full max-w-full overflow-hidden relative min-h-0">
        {children}
      </div>
    </div>
  );
}
