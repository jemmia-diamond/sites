import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductModel, PaginateResponse } from "../../../types";
import { NavLinks } from "./NavLinks";
import { SearchDropdown } from "./SearchDropdown";
import { Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { TryOnDrawer } from "../../jewelry/TryOnDrawer";
import { ACTIVE_TRYON_SESSION_KEY } from "../../jewelry/TryOn/constants";

interface HeaderProps {
  searchPlaceholder: string;
}

interface SearchResponse {
  diamonds: PaginateResponse<ProductModel>;
  jewelries: PaginateResponse<ProductModel>;
}

const NAV_ITEMS = [
  { name: "Trang sức", path: "/jewelry" },
  { name: "Kim cương", path: "/diamonds" },
  { name: "Nguyên chiếc", path: "/combos" },
];

let reloadCheckPerformed = false;

export function Header({ searchPlaceholder }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);

  useEffect(() => {
    const handleClearSearch = () => {
      setQuery("");
      setResults(null);
      setIsOpen(false);
    };

    const handleOpenTryOn = () => {
      setIsTryOnOpen(true);
    };

    // Auto open drawer if there is an active running try-on task AND the page was reloaded
    const isReload = (() => {
      if (typeof window === "undefined" || !window.performance) return false;
      const navs = window.performance.getEntriesByType("navigation");
      if (navs.length > 0) {
        return (navs[0] as PerformanceNavigationTiming).type === "reload";
      }
      return (window.performance as any).navigation?.type === 1;
    })();

    if (isReload && !reloadCheckPerformed) {
      reloadCheckPerformed = true;
      const activeSessionStr = sessionStorage.getItem(ACTIVE_TRYON_SESSION_KEY);
      if (activeSessionStr) {
        try {
          const session = JSON.parse(activeSessionStr);
          if (session && session.step === 4) {
            setIsTryOnOpen(true);
          }
        } catch (e) {
          console.error("Error parsing reload session:", e);
        }
      }
    }

    window.addEventListener("search:clear", handleClearSearch);
    window.addEventListener("tryon:open", handleOpenTryOn);
    return () => {
      window.removeEventListener("search:clear", handleClearSearch);
      window.removeEventListener("tryon:open", handleOpenTryOn);
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setIsOpen(true);
      try {
        const response = await axios.get(`/site/products/search-combine?query=${encodeURIComponent(query)}`);
        setResults(response.data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="h-12 border-b border-primary-50 bg-white backdrop-blur-md sticky top-0 z-52 flex items-center px-4 xl:px-8 gap-4 md:gap-12 xl:gap-16 transition-all duration-300">
      <Link to="/" className="flex-shrink-0 mx-auto md:mx-0">
        <img
          src="https://file.hstatic.net/200000355853/file/logo.svg"
          alt="Jemmia Logo"
          className="h-5 xl:h-7 w-auto"
          referrerPolicy="no-referrer"
        />
      </Link>

      <div className="hidden md:flex h-full">
        <NavLinks items={NAV_ITEMS} />
      </div>

      <div className="flex flex-1 justify-end items-center gap-3">
        <SearchDropdown
          query={query}
          isLoading={isLoading}
          results={results}
          isOpen={isOpen}
          onQueryChange={setQuery}
          onClose={() => setIsOpen(false)}
          searchPlaceholder={searchPlaceholder}
        />
        <Button
          onClick={() => setIsTryOnOpen(true)}
          className="bg-secondary-800 hidden md:flex text-white hover:bg-secondary-700 font-normal text-sm px-3 h-8 items-center gap-2 shrink-0 cursor-pointer"
        >
          <Sparkle size={18} className="text-white" />
          <span>Thử Nhẫn</span>
        </Button>
        <TryOnDrawer isOpen={isTryOnOpen} onClose={() => setIsTryOnOpen(false)} />
      </div>
    </header>
  );
}
