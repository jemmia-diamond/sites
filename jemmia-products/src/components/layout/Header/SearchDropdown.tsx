import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { MagnifyingGlass, X, CaretRight, ArrowUpRight, Camera } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ProductModel, PaginateResponse } from "../../../types";
import { getDiamondShapeImage } from "@/lib/utils";

interface SearchDropdownProps {
  query: string;
  isLoading: boolean;
  results: SearchResponse | null;
  isOpen: boolean;
  onQueryChange: (query: string) => void;
  onClose: () => void;
  searchPlaceholder: string;
}

interface SearchResponse {
  diamonds: PaginateResponse<ProductModel>;
  jewelries: PaginateResponse<ProductModel>;
}

export function SearchDropdown({
  query,
  isLoading,
  results,
  isOpen,
  onQueryChange,
  onClose,
  searchPlaceholder,
}: SearchDropdownProps) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleViewAll = () => {
    if (results && query.trim()) {
      const path = results.diamonds.meta.totalRows > results.jewelries.meta.totalRows
        ? "/diamonds"
        : "/jewelry";
      navigate(`${path}?searchQuery=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleViewAll();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="w-full w-full md:max-w-[300px] md:max-w-lg xl:w-[400px] flex items-center relative group" ref={dropdownRef}>
      <MagnifyingGlass className="absolute left-3 h-3.5 w-3.5 md:h-4 md:w-4 text-primary-300 group-hover:text-secondary-900 transition-colors z-10" />
      <Input
        placeholder={searchPlaceholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim() && onClose()}
        className="bg-gray-50/50 border rounded-full border-primary-200 pl-8 md:pl-10 pr-4 h-8 text-[10px] md:text-xs font-black focus-visible:ring-0 focus-visible:bg-white focus-visible:border-secondary-900 placeholder:text-primary-200 transition-all duration-500"
      />
      {query && (
        <button
          onClick={() => {
            onQueryChange("");
            onClose();
          }}
          className="absolute right-4 p-1 text-primary-200 hover:text-secondary-900 transition-colors cursor-pointer"
        >
          <X size={14} weight="bold" />
        </button>
      )}

      {isOpen && (query.trim() || isLoading) && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[85vw] md:w-[400px] md:w-full bg-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.18)] border border-primary-50 max-h-[520px] overflow-y-auto no-scrollbar z-50 animate-in fade-in slide-in-from-top-4 duration-500">
          {isLoading ? (
            <LoadingState />
          ) : results && (results.diamonds.data.length > 0 || results.jewelries.data.length > 0) ? (
            <SearchResults results={results} query={query} onClose={onClose} />
          ) : query.trim() ? (
            <EmptyState />
          ) : null}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-20 text-center flex flex-col items-center justify-center">
      <div className="h-8 w-8 relative mb-4">
        <div className="absolute inset-0 border-2 border-primary-50 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-t-secondary-900 rounded-full animate-spin"></div>
      </div>
      <p className="text-[10px] font-black text-primary-300 uppercase tracking-[0.4em]">Đang tìm kiếm...</p>
    </div>
  );
}

interface SearchResultsProps {
  results: SearchResponse;
  query: string;
  onClose: () => void;
}

function SearchResults({ results, query, onClose }: SearchResultsProps) {
  return (
    <div>
      <div className="px-6 py-4 flex justify-between items-center border-b border-primary-50 pb-4">
        <span className="text-[9px] font-bold text-primary-300 uppercase tracking-widest">
          {(results.jewelries.meta.totalRows + results.diamonds.meta.totalRows)} kết quả
        </span>
        <Link
          to={`${results.diamonds.meta.totalRows > results.jewelries.meta.totalRows ? "/diamonds" : "/jewelry"}?searchQuery=${encodeURIComponent(query)}`}
          onClick={onClose}
          className="text-[9px] font-black text-secondary-900 uppercase tracking-widest hover:underline flex items-center gap-2"
        >
          Xem tất cả <ArrowUpRight size={12} weight="bold" />
        </Link>
      </div>

      <div className="divide-y divide-primary-50">
        {[...results.jewelries.data.map(i => ({ ...i, category: 'Jewelry' as const })), ...results.diamonds.data.map(i => ({ ...i, category: 'Diamond' as const }))].slice(0, 8).map((item, index) => {
          const designCode = item.category === 'Jewelry' ? item.attributes?.designCode : ("GIA" + item.attributes?.giaId);
          const imageUrl = item.category === 'Jewelry'
            ? (item.thumbnails?.[0]?.url || item.images?.[0]?.url)
            : getDiamondShapeImage(item.attributes?.shape);

          return (
            <Link
              key={`${item.category}-${item.id}-${index}`}
              to={item.category === 'Jewelry'
                ? `/jewelry?searchQuery=${encodeURIComponent(designCode || '')}`
                : `/diamonds?searchQuery=${encodeURIComponent(designCode || '')}`}
              onClick={onClose}
              className="flex items-center gap-6 px-4 py-4 hover:bg-gray-50/50 transition-all group relative"
            >
              <div className="h-20 w-20 flex-shrink-0 bg-white border border-primary-50 p-2 overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-1000 ease-out"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Camera size={20} className="text-primary-100" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] font-black text-secondary-900 uppercase tracking-tight group-hover:text-primary-800 transition-colors">
                    {item.category === 'Jewelry' ? (item.type || "Tuyệt tác trang sức") : "Kim cương tự nhiên GIA"}
                  </p>
                  <p className="text-[10px] font-bold text-primary-300 uppercase tracking-[0.2em]">
                    {designCode || "N/A"}
                  </p>
                </div>
              </div>

              <CaretRight size={14} className="text-primary-100 group-hover:text-secondary-900 group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-24 text-center px-10">
      <p className="text-[11px] font-black text-secondary-900 uppercase tracking-[0.2em] mb-3">Không tìm thấy kết quả</p>
    </div>
  );
}
