
import { ReactNode } from "react";
import { Header } from "./Header";

interface LayoutShellProps {
  children: ReactNode;
  searchPlaceholder: string;
}

export function LayoutShell({ children, searchPlaceholder }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-bg-1 font-sans antialiased text-primary-900 selection:bg-secondary-200 selection:text-secondary-900">
      <Header searchPlaceholder={searchPlaceholder} />
      <div className="flex h-[calc(100vh-48px)] overflow-hidden">
        {children}
      </div>
    </div>
  );
}
