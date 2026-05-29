import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    <header className="h-12 border-b border-primary-50 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-4 lg:px-10 gap-4 lg:gap-16 transition-all duration-300">
      <Link to="/" className="flex-shrink-0 mx-auto lg:mx-0">
        <img
          src="https://file.hstatic.net/200000355853/file/logo.svg"
          alt="Jemmia Logo"
          className="h-5 lg:h-7 w-auto"
          referrerPolicy="no-referrer"
        />
      </Link>

      <div className="hidden lg:flex h-full">
        <NavLinks items={NAV_ITEMS} />
      </div>

      <div className="flex flex-1 justify-end ư">
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