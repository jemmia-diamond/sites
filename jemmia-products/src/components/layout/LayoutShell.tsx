
import { ReactNode, useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LayoutShellProps {
  children: ReactNode;
  searchPlaceholder: string;
}

export function LayoutShell({ children, searchPlaceholder }: LayoutShellProps) {
  const [searchParams] = useSearchParams();
  const isSearchActive = !!searchParams.get("searchQuery");
  const { pathname } = useLocation();

  const [isTryOnGenerating, setIsTryOnGenerating] = useState(() => {
    return !!(window as any).__tryon_is_generating;
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    const handleGeneratingChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isGenerating: boolean }>;
      setIsTryOnGenerating(customEvent.detail.isGenerating);
    };

    window.addEventListener("tryon:generating-change", handleGeneratingChange);
    return () => {
      window.removeEventListener("tryon:generating-change", handleGeneratingChange);
    };
  }, []);

  return (
    <div className="relative min-h-screen xl:h-screen w-full font-sans antialiased bg-white text-primary-900 selection:bg-secondary-200 selection:text-secondary-900 flex flex-col xl:overflow-hidden">
      <Header searchPlaceholder={searchPlaceholder} />
      
      {isTryOnGenerating && (
        <div className="fixed bottom-16 md:bottom-4 right-4 z-55 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-primary-100 shadow-lg rounded-full py-1.5 px-3 text-xs text-primary-900 font-medium animate-in fade-in duration-200">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-secondary-600" />
          <span className="text-[10px] tracking-tight uppercase font-bold text-secondary-800">Đang thử nhẫn...</span>
        </div>
      )}

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
