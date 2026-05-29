
import { ReactNode, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

interface LayoutShellProps {
  children: ReactNode;
  searchPlaceholder: string;
}

export function LayoutShell({ children, searchPlaceholder }: LayoutShellProps) {
  const [searchParams] = useSearchParams();
  const isSearchActive = !!searchParams.get("searchQuery");
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="min-h-screen xl:h-screen w-full font-sans antialiased bg-white text-primary-900 selection:bg-secondary-200 selection:text-secondary-900 flex flex-col xl:overflow-hidden">
      <Header searchPlaceholder={searchPlaceholder} />
      <div
        className={cn(
          "flex flex-col xl:flex-row flex-1 w-full max-w-full xl:overflow-hidden relative min-h-0",
          isSearchActive ? "pb-0" : "pb-12 xl:pb-0"
        )}
      >
        {children}
      </div>
      {!isSearchActive && <BottomNav />}
    </div>
  );
}
