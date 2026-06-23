import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductModel, PaginateResponse } from "../../../types";
import { NavLinks } from "./NavLinks";
import { SearchDropdown } from "./SearchDropdown";
import { Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { TryOnDrawer } from "../../jewelry/TryOnDrawer";
import { useTryOnGlobal } from "../../jewelry/TryOn/context/TryOnGlobalContext";

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

export function Header({ searchPlaceholder }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isTryOnOpen, openTryOn, closeTryOn, hasUnreadResult } = useTryOnGlobal();

  useEffect(() => {
    const handleClearSearch = () => {
      setQuery("");
      setResults(null);
      setIsOpen(false);
    };

    window.addEventListener("search:clear", handleClearSearch);
    return () => {
      window.removeEventListener("search:clear", handleClearSearch);
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
          onClick={openTryOn}
          className="relative bg-secondary-800 hidden md:flex text-white hover:bg-secondary-700 font-normal text-sm px-3 h-8 items-center gap-2 shrink-0 cursor-pointer"
        >
          <Sparkle size={18} className="text-white" />
          <span>Thử Nhẫn</span>
          {hasUnreadResult && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
        <TryOnDrawer isOpen={isTryOnOpen} onClose={closeTryOn} />
      </div>
    </header>
  );
}
