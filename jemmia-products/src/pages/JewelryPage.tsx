
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { jewelryService } from "../services/jewelryService";
import { JewelryFilter } from "../types";
import { LayoutShell } from "../components/layout/LayoutShell";
import { JewelryFilterSidebar } from "../components/jewelry/JewelryFilterSidebar";
import { JewelryTable } from "../components/jewelry/JewelryTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "../components/layout/PageHeader";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";

export default function JewelryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const designCodeParam = searchParams.get("designCode");
  const searchQueryParam = searchParams.get("searchQuery");

  const [filters, setFilters] = useState<JewelryFilter>({
    page: 1,
    sortBySalePrice: "DESC",
    stockStatus: "all",
    designCode: designCodeParam || undefined,
    searchQuery: searchQueryParam || undefined,
    type: searchQueryParam ? undefined : (searchParams.get("type") || undefined)
  });

  const [debouncedFilters, setDebouncedFilters] = useState<JewelryFilter>(filters);

  useEffect(() => {
    setFilters(prev => {
      const next = { 
        ...prev, 
        designCode: designCodeParam || undefined, 
        searchQuery: searchQueryParam || undefined,
        type: searchQueryParam ? undefined : prev.type,
        page: 1 
      };
      setDebouncedFilters(next);
      return next;
    });
  }, [designCodeParam, searchQueryParam]);

  // Debounce logic for filters (excluding sort)
  const debouncedSetFilters = useMemo(
    () => debounce((newFilters: JewelryFilter) => {
      setDebouncedFilters(newFilters);
    }, 400),
    []
  );

  const handleApplyFilters = (newFilters: JewelryFilter) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    setDebouncedFilters(updated);
  };

  const toggleSort = () => {
    const newSort = filters.sortBySalePrice === "DESC" ? "ASC" : "DESC";
    const updated = { ...filters, sortBySalePrice: newSort, page: 1 };
    setFilters(updated);
    setDebouncedFilters(updated);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["jewelry-designs", debouncedFilters],
    queryFn: () => jewelryService.getJewelries(debouncedFilters),
    staleTime: 5 * 60 * 1000,
  });

  const allJewelries = data?.data || [];
  const totalResults = data?.meta.totalRows || 0;
  const totalPages = data?.meta.totalPages || 1;
  const currentPage = debouncedFilters.page || 1;
  return (
    <LayoutShell searchPlaceholder="Nhập mã để bắt đầu tìm kiếm">
      {!searchQueryParam && (
        <JewelryFilterSidebar
          onApply={handleApplyFilters}
          currentFilters={filters}
        />
      )}

      <main className="flex-1 bg-white overflow-y-auto px-4 pt-2 pb-6">
        <div className="mx-auto space-y-4">
          <PageHeader
            title={debouncedFilters.searchQuery ? `Tìm kiếm: ${debouncedFilters.searchQuery}` : `${debouncedFilters.type || "Tất cả trang sức"}`}
            description={`Hiển thị ${allJewelries.length} trên ${totalResults} kết quả`}
            actions={
              <div className="flex items-center gap-2">
                {searchQueryParam && (
                  <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    className="flex items-center gap-2 h-10 px-4 rounded-none border-primary-100 font-bold text-xs uppercase tracking-tight hover:bg-primary-50"
                  >
                    Quay về
                  </Button>
                )}
                <div className="flex flex-col gap-1.5 min-w-[150px]">
                <Button
                  onClick={toggleSort}
                  variant="outline"
                  className="flex items-center justify-between group h-10 px-4 rounded-none border-primary-100 font-bold text-xs"
                >
                  <span className="uppercase tracking-tight">
                    {filters.sortBySalePrice === "DESC" ? "Giá giảm dần" : "Giá tăng dần"}
                  </span>
                  {filters.sortBySalePrice === "DESC" ? (
                    <ArrowDownWideNarrow className="h-4 w-4 text-primary-400 group-hover:text-secondary-900 transition-colors" />
                  ) : (
                    <ArrowUpWideNarrow className="h-4 w-4 text-primary-400 group-hover:text-secondary-900 transition-colors" />
                  )}
                </Button>
                </div>
              </div>
            }
          />

          <div className="min-h-[400px]">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-none" />
                ))}
              </div>
            ) : isError ? (
              <div className="py-20 text-center bg-white rounded-none border border-dashed border-red-200">
                <p className="text-red-500 font-medium">Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</p>
              </div>
            ) : allJewelries.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-none border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">Không tìm thấy thiết kế nào phù hợp với bộ lọc.</p>
              </div>
            ) : (
              <JewelryTable jewelries={allJewelries} />
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-12 pb-24 flex flex-col items-center gap-6">
              <div className="h-px w-24 bg-primary-100" />
              <Pagination>
                <PaginationContent className="gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      text="TRƯỚC"
                      onClick={() => {
                        const newPage = Math.max(1, currentPage - 1);
                        const updated = { ...filters, page: newPage };
                        setFilters(updated);
                        setDebouncedFilters(updated);
                      }}
                      className="border border-primary-50 hover:border-secondary-900 hover:bg-white text-primary-200 hover:text-secondary-900 cursor-pointer rounded-none transition-all px-4 h-10 text-[10px] font-black tracking-widest disabled:opacity-30"
                    />
                  </PaginationItem>

                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          onClick={() => {
                            const updated = { ...filters, page: p };
                            setFilters(updated);
                            setDebouncedFilters(updated);
                          }}
                          isActive={currentPage === p}
                          className={cn(
                            "rounded-none h-10 w-10 border transition-all cursor-pointer text-xs font-black hover:bg-secondary-900 hover:text-white hover:border-secondary-900",
                            currentPage === p
                              ? "bg-secondary-900 text-white border-secondary-900 shadow-xl shadow-secondary-900/10"
                              : "border-primary-50 text-primary-300"
                          )}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {totalPages > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis className="text-primary-100" />
                      </PaginationItem>
                    )}
                  </div>

                  <PaginationItem>
                    <PaginationNext
                      text="SAU"
                      onClick={() => {
                        const newPage = Math.min(totalPages, currentPage + 1);
                        const updated = { ...filters, page: newPage };
                        setFilters(updated);
                        setDebouncedFilters(updated);
                      }}
                      className="border border-primary-50 hover:border-secondary-900 hover:bg-white text-primary-200 hover:text-secondary-900 cursor-pointer rounded-none transition-all px-4 h-10 text-[10px] font-black tracking-widest"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </main>
    </LayoutShell>
  );
}
