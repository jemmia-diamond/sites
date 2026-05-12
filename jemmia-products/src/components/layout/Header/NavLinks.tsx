import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  items: { name: string; path: string }[];
}

export function NavLinks({ items }: NavLinksProps) {
  const location = useLocation();

  return (
    <nav className="flex h-full items-center gap-10">
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "relative flex h-full items-center text-[11px] font-bold uppercase tracking-[0.2em] transition-all",
            location.pathname === item.path
              ? "text-secondary-900"
              : "text-primary-300 hover:text-secondary-900"
          )}
        >
          {item.name}
          {location.pathname === item.path && (
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-secondary-900 animate-in fade-in slide-in-from-bottom-2 duration-500" />
          )}
        </Link>
      ))}
    </nav>
  );
}