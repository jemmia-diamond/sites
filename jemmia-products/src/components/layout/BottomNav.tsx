import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTryOnGlobal } from "../jewelry/TryOn/context/TryOnGlobalContext";
import { use } from "react";
import { TryOnContext } from "../jewelry/TryOn/context/TryOnContext";

export function BottomNav() {
  const location = useLocation();
  const { hasUnreadResult, openTryOn, isTryOnGenerating } = useTryOnGlobal();
  const context = use(TryOnContext);
  if (!context) return null;

  const { state } = context;
  const { isGenerating } = state;

  const navItems = [
    {
      name: "Trang sức",
      path: "/jewelry",
    },
    {
      name: "Kim cương",
      path: "/diamonds",
    },
    {
      name: "Nguyên chiếc",
      path: "/combos",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-12 bg-white border-t border-primary-50 flex items-center justify-around z-[55] shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className="relative h-full flex items-center justify-center flex-1 transition-all"
          >
            {/* Top Teal Indicator Line */}
            {isActive && (
              <div className="absolute top-0 left-4 right-4 h-[3px] bg-secondary-900 rounded-b-sm animate-in fade-in duration-300" />
            )}

            <span
              className={cn(
                "nav-tab-item",
                isActive
                  ? "nav-tab-item-active"
                  : "nav-tab-item-inactive"
              )}
            >
              {item.name}
            </span>
          </Link>
        );
      })}

      {/* Try on button */}
      <button
        onClick={openTryOn}
        className="h-full flex items-center justify-center flex-1 transition-all cursor-pointer border-none bg-transparent"
      >
        <span className="relative nav-tab-item nav-tab-item-inactive">
          Thử nhẫn
          {(hasUnreadResult || isTryOnGenerating || isGenerating) && (
            <span className="absolute -top-1 -right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </span>
      </button>
    </nav>
  );
}
