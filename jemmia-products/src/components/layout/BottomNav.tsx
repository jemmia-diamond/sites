import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    {
      name: "Kim cương",
      path: "/diamonds",
    },
    {
      name: "Trang sức",
      path: "/jewelry",
    },
    {
      name: "Nguyên chiếc",
      path: "/combos",
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-12 bg-white border-t border-primary-50 flex items-center justify-around z-[9999] shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
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
                "text-xs tracking-wide transition-all duration-300",
                isActive
                  ? "text-secondary-900 font-bold"
                  : "text-slate-500 font-medium"
              )}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
