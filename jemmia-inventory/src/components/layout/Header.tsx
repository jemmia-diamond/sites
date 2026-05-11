
import { useState, useEffect, useRef } from "react";
import { MagnifyingGlass, Bell, Gear, X, CaretRight, ArrowUpRight } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ProductModel, PaginateResponse } from "../../types";

interface HeaderProps {
  searchPlaceholder: string;
}

interface SearchResponse {
  diamonds: PaginateResponse<ProductModel>;
  jewelries: PaginateResponse<ProductModel>;
}

export function Header({ searchPlaceholder }: HeaderProps) {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: "Kim cương", path: "/diamonds" },
    { name: "Trang sức", path: "/jewelry" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        const response = await fetch(`https://api.salesaya.com/products/search-combine?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data);
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

      <nav className="flex h-full items-center gap-10">
        {navItems.map((item) => (
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
      <div className="flex-1 flex justify-end">
        <div className="w-[400px] max-w-lg flex items-center relative group" ref={dropdownRef}>
          <MagnifyingGlass className="absolute left-3 h-4 w-4 text-primary-300 group-hover:text-secondary-900 transition-colors z-10" />
          <Input
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setIsOpen(true)}
            className="bg-gray-50/50 border border-primary-200 pl-10 pr-4 h-8 rounded-none text-xs font-black focus-visible:ring-0 focus-visible:bg-white focus-visible:border-secondary-900 placeholder:text-primary-200 transition-all duration-500"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults(null); setIsOpen(false); }}
              className="absolute right-4 p-1 text-primary-200 hover:text-secondary-900 transition-colors cursor-pointer"
            >
              <X size={14} weight="bold" />
            </button>
          )}

          {isOpen && (query.trim() || isLoading) && (
            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.18)] border border-primary-50 max-h-[520px] overflow-y-auto no-scrollbar z-50 animate-in fade-in slide-in-from-top-4 duration-500">
              {isLoading ? (
                <div className="p-20 text-center flex flex-col items-center justify-center">
                  <div className="h-8 w-8 relative mb-4">
                    <div className="absolute inset-0 border-2 border-primary-50 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-t-secondary-900 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-[10px] font-black text-primary-300 uppercase tracking-[0.4em]">Đang tuyển chọn tinh hoa...</p>
                </div>
              ) : results && (results.diamonds.data.length > 0 || results.jewelries.data.length > 0) ? (
                <div>
                  <div className="px-6 py-4 flex justify-between items-center border-b border-primary-50 pb-4">
                    <span className="text-[9px] font-bold text-primary-300 uppercase tracking-widest">
                      {(results.jewelries.meta.totalRows + results.diamonds.meta.totalRows)} kết quả
                    </span>
                  </div>

                  <div className="divide-y divide-primary-50">
                    {[...results.jewelries.data.map(i => ({ ...i, category: 'Jewelry' })), ...results.diamonds.data.map(i => ({ ...i, category: 'Diamond' }))].slice(0, 8).map((item, index) => (
                      <Link
                        key={`${item.category}-${item.id}-${index}`}
                        to={item.category === 'Jewelry' ? `/jewelry?designCode=${item.attributes?.designCode}` : "/diamonds"}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-6 px-4 py-4 hover:bg-gray-50/50 transition-all group relative"
                      >
                        <div className="h-20 w-20 flex-shrink-0 bg-white border border-primary-50 p-2 overflow-hidden">
                          <img
                            src={item.category === 'Jewelry' ? (item.thumbnails?.[0]?.url || item.images?.[0]?.url) : "https://cdn.hstatic.net/files/200000355853/file/salesaya_image_131__1_.png"}
                            alt={item.title}
                            className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-1000 ease-out"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[12px] font-black text-secondary-900 uppercase tracking-tight group-hover:text-primary-800 transition-colors">
                              {item.category === 'Jewelry' ? (item.type || "Tuyệt tác trang sức") : "Kim cương tự nhiên GIA"}
                            </p>
                            <p className="text-[10px] font-bold text-primary-300 uppercase tracking-[0.2em]">
                              {item.category === 'Jewelry' ? (item.attributes?.designCode || "N/A") : ("GIA" + item.attributes?.giaId || "N/A")}
                            </p>
                          </div>
                        </div>

                        <CaretRight size={14} className="text-primary-100 group-hover:text-secondary-900 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : query.trim() ? (
                <div className="py-24 text-center px-10">
                  <div className="h-10 w-px bg-primary-100 mx-auto mb-6" />
                  <p className="text-[11px] font-black text-secondary-900 uppercase tracking-[0.5em] mb-3">Kiệt tác chưa hiện hữu</p>
                  <p className="text-[10px] text-primary-300 italic tracking-wider leading-relaxed">
                    Chúng tôi không tìm thấy thiết kế phù hợp với yêu cầu của quý khách. <br />
                    Thử tìm kiếm với tên bộ sưu tập hoặc mã thiết kế khác.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
