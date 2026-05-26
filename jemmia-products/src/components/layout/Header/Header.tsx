import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlass, List, X } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ProductModel, PaginateResponse } from "../../../types";
import { NavLinks } from "./NavLinks";
import { SearchDropdown } from "./SearchDropdown";

interface HeaderProps {
  searchPlaceholder: string;
}

interface SearchResponse {
  diamonds: PaginateResponse<ProductModel>;
  jewelries: PaginateResponse<ProductModel>;
}

const NAV_ITEMS = [
  { name: "Kim cương", path: "/diamonds" },
  { name: "Trang sức", path: "/jewelry" },
  { name: "Sản phẩm nguyên chiếc", path: "/combos" },
];

export function Header({ searchPlaceholder }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleClearSearch = () => {
      setQuery("");
      setResults(null);
      setIsOpen(false);
    };

    window.addEventListener("search:clear", handleClearSearch);
    return () => window.removeEventListener("search:clear", handleClearSearch);
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
        const response = await axios.get(`/products/search-combine?query=${encodeURIComponent(query)}`);
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
    <header className="h-12 border-b border-primary-50 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-4 md:px-10 gap-4 md:gap-16 transition-all duration-300">
      <button 
        className="md:hidden p-2 text-primary-900 -ml-2"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
      </button>

      <Link to="/" className="flex-shrink-0">
        <img
          src="https://file.hstatic.net/200000355853/file/logo.svg"
          alt="Jemmia Logo"
          className="h-5 md:h-7 w-auto"
          referrerPolicy="no-referrer"
        />
      </Link>

      <div className="hidden md:flex h-full">
        <NavLinks items={NAV_ITEMS} />
      </div>

      <div className="flex-1 flex justify-end">
        <SearchDropdown
          query={query}
          isLoading={isLoading}
          results={results}
          isOpen={isOpen}
          onQueryChange={setQuery}
          onClose={() => setIsOpen(false)}
          searchPlaceholder={searchPlaceholder}
        />
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-12 left-0 w-full bg-white border-b border-primary-50 p-6 flex flex-col gap-6 md:hidden z-50 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <NavLinks 
            items={NAV_ITEMS} 
            isMobile 
            onClose={() => setIsMobileMenuOpen(false)} 
          />
        </div>
      )}
    </header>
  );
}