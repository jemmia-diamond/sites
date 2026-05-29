import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  items: { name: string; path: string }[];
  isMobile?: boolean;
  onClose?: () => void;
}

export function NavLinks({ items, isMobile, onClose }: NavLinksProps) {
  const location = useLocation();

  return (
    <nav className={cn(
      "flex h-full items-center",
      isMobile ? "flex-col w-full gap-6 h-auto" : "gap-10"
    )}>
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onClose}
          className={cn(
            "relative flex items-center nav-tab-item",
            isMobile ? "w-full py-2 text-sm justify-between" : "h-full",
            location.pathname === item.path
              ? "nav-tab-item-active"
              : "nav-tab-item-inactive"
          )}
        >
          {item.name}
          {location.pathname === item.path && (
            isMobile ? (
              <div className="h-1 w-1 rounded-full bg-secondary-900" />
            ) : (
              <div className="absolute bottom-0 left-0 h-[3px] w-full bg-secondary-900 animate-in fade-in slide-in-from-bottom-2 duration-500" />
            )
          )}
        </Link>
      ))}
    </nav>
  );
}