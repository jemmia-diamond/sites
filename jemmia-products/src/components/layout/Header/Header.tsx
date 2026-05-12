import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlass } from "@phosphor-icons/react";
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
];

export function Header({ searchPlaceholder }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
    <header className="h-12 border-b border-primary-50 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-10 gap-16 transition-all duration-300">
      <Link to="/" className="flex-shrink-0">
        <img
          src="https://file.hstatic.net/200000355853/file/logo.svg"
          alt="Jemmia Logo"
          className="h-7 w-auto"
          referrerPolicy="no-referrer"
        />
      </Link>

      <NavLinks items={NAV_ITEMS} />

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
    </header>
  );
}