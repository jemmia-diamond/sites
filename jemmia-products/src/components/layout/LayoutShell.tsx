
import { ReactNode } from "react";
import { Header } from "./Header";

interface LayoutShellProps {
  children: ReactNode;
  searchPlaceholder: string;
}

export function LayoutShell({ children, searchPlaceholder }: LayoutShellProps) {
  return (
    <div className="min-h-screen w-full font-sans antialiased bg-white text-primary-900 selection:bg-secondary-200 selection:text-secondary-900">
      <Header searchPlaceholder={searchPlaceholder} />
      <div className="flex p-6 h-[calc(100vh-48px)] w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
