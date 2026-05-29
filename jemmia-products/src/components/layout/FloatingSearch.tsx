import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { MagnifyingGlass, X, CaretRight, ArrowUpRight, Camera, CircleNotch } from "@phosphor-icons/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProductModel, PaginateResponse } from "../../types";
import { getDiamondShapeImage } from "@/lib/utils";
import { API_BASE_URL } from "../../config";

interface SearchResponse {
  diamonds: PaginateResponse<ProductModel>;
  jewelries: PaginateResponse<ProductModel>;
}

export function FloatingSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Search logic on query change with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const endpoint = import.meta.env.PROD
          ? `/products/search-combine?query=${encodeURIComponent(query)}`
          : `${API_BASE_URL}/products/search-combine?query=${encodeURIComponent(query)}`;
        const response = await axios.get(endpoint);
        setResults(response.data);
      } catch (error) {
        console.error("Mobile search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
    setResults(null);
  };

  const handleViewAll = () => {
    if (results && query.trim()) {
      const path = results.diamonds.meta.totalRows > results.jewelries.meta.totalRows
        ? "/diamonds"
        : "/jewelry";
      navigate(`${path}?searchQuery=${encodeURIComponent(query)}`);
      handleClose();
    }
  };

  const totalResults = results
    ? (results.jewelries.meta.totalRows + results.diamonds.meta.totalRows)
    : 0;

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-16 right-4 z-[9998] w-12 h-12 bg-secondary-900 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(1,58,64,0.35)] hover:bg-secondary-800 active:scale-95 transition-all duration-300 border border-secondary-800"
        aria-label="Search products"
      >
        <MagnifyingGlass size={22} weight="bold" />
      </button>

      {/* Modern Full-Screen Search Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="w-[95%] sm:max-w-md bg-white gap-1 p-0 rounded-md overflow-hidden border-none shadow-2xl z-[9999] top-[20%] translate-y-0">

          {/* Search Input Bar */}
          <div className="relative border-b border-primary-50 p-4 flex items-center">
            <MagnifyingGlass className="absolute left-7 h-5 w-5 text-primary-300" />
            <Input
              autoFocus
              placeholder="Tìm kiếm kim cương, trang sức..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-primary-50/50 border border-primary-100 pl-12 pr-10 h-11 rounded-full text-xs font-bold focus-visible:ring-2 focus-visible:ring-secondary-900/10 focus-visible:bg-white focus-visible:border-secondary-900 placeholder:text-primary-300 transition-all duration-300"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="absolute right-7 p-1 text-primary-300 hover:text-secondary-900 transition-colors"
              >
                <X size={16} weight="bold" />
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="absolute right-7 p-1 text-primary-300 hover:text-secondary-900 transition-colors"
              >
                <X size={16} weight="bold" />
              </button>
            )}
          </div>

          {/* Results Container */}
          <div className="max-h-[60vh] overflow-y-auto min-h-[100px] flex flex-col justify-start">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <CircleNotch size={32} className="animate-spin text-secondary-900" />
                <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest">Đang tìm kiếm...</p>
              </div>
            ) : results && (results.jewelries.data.length > 0 || results.diamonds.data.length > 0) ? (
              <div>
                {/* Result count & View All */}
                <div className="px-5 py-3.5 flex justify-between items-center bg-primary-50/30 border-b border-primary-50">
                  <span className="text-[9px] font-bold text-primary-400 uppercase tracking-wider">
                    Có {totalResults} kết quả tìm được
                  </span>
                  <button
                    onClick={handleViewAll}
                    className="text-[9px] font-black text-secondary-900 uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    Xem tất cả <ArrowUpRight size={12} weight="bold" />
                  </button>
                </div>

                {/* Results List */}
                <div className="divide-y divide-primary-50">
                  {[
                    ...results.jewelries.data.map(i => ({ ...i, category: 'Jewelry' as const })),
                    ...results.diamonds.data.map(i => ({ ...i, category: 'Diamond' as const }))
                  ].slice(0, 5).map((item, index) => {
                    const designCode = item.category === 'Jewelry' ? item.attributes?.designCode : ("GIA " + item.attributes?.giaId);
                    const imageUrl = item.category === 'Jewelry'
                      ? (item.thumbnails?.[0]?.url || item.images?.[0]?.url)
                      : getDiamondShapeImage(item.attributes?.shape);

                    return (
                      <Link
                        key={`${item.category}-${item.id}-${index}`}
                        to={item.category === 'Jewelry'
                          ? `/jewelry?searchQuery=${encodeURIComponent(designCode || '')}`
                          : `/diamonds?searchQuery=${encodeURIComponent(designCode || '')}`}
                        onClick={handleClose}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-primary-50/40 transition-all group"
                      >
                        <div className="h-14 w-14 flex-shrink-0 bg-white border border-primary-50 p-1.5 overflow-hidden flex items-center justify-center rounded-lg">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.title}
                              className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Camera size={18} className="text-primary-100" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-secondary-900 uppercase truncate">
                            {item.category === 'Jewelry' ? (item.type || "Trang sức thiết kế") : "Kim cương GIA"}
                          </p>
                          <p className="text-[9px] font-black text-primary-300 uppercase tracking-widest mt-0.5">
                            {designCode || "N/A"}
                          </p>
                        </div>

                        <CaretRight size={14} className="text-primary-200 group-hover:text-secondary-900 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : query.trim() ? (
              <div className="py-16 text-center">
                <p className="text-[11px] font-black text-secondary-900 uppercase tracking-widest">Không tìm thấy kết quả</p>
                <p className="text-[9px] text-primary-300 mt-1">Vui lòng thử tìm kiếm với từ khóa khác</p>
              </div>
            ) : (
              <div className="py-16 text-center text-primary-300 flex flex-col items-center justify-center gap-2 px-6">
                <MagnifyingGlass size={28} weight="thin" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Nhập từ khóa để bắt đầu tìm kiếm</p>
              </div>
            )}
          </div>

        </DialogContent>
      </Dialog>
    </>
  );
}
