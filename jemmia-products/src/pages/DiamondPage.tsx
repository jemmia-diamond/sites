import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchDiamonds } from "../services/diamondService";
import { DiamondFilter } from "../types";
import { LayoutShell } from "../components/layout/LayoutShell";
import { DiamondFilterSidebar } from "../components/diamond/DiamondFilterSidebar";
import { DiamondTable } from "../components/diamond/DiamondTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDownWideNarrow, ArrowLeft, ArrowUpWideNarrow, Filter, X } from "lucide-react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

import { PageHeader } from "../components/layout/PageHeader";

export default function DiamondPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQueryParam = searchParams.get("searchQuery");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeChips, setActiveChips] = useState<{ key: string; value: any; label: string }[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Omit<DiamondFilter, 'page'>>({
    limit: 20,
    sortBySalePrice: "DESC",
    stockStatus: "IN_STOCK",
    warehouseIds: [],
    searchQuery: searchQueryParam || undefined
  });

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      searchQuery: searchQueryParam || undefined,
    }));
  }, [searchQueryParam]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["diamonds", filters],
    queryFn: ({ pageParam = 1 }) => fetchDiamonds({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPageParam < (lastPage?.meta?.totalPages || 1)) {
        return lastPageParam + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleApplyFilters = (newFilters: DiamondFilter) => {
    const { page, ...restFilters } = newFilters;
    const updated = { ...filters, ...restFilters };
    setFilters(updated);
    if (window.innerWidth < 1024) setIsFilterOpen(false);
  };

  const handleRemoveChip = (key: string) => {
    let nextFilters = { ...filters };
    if (key === "salePrice") {
      nextFilters.salePriceFrom = undefined;
      nextFilters.salePriceTo = undefined;
    } else if (key === "carat") {
      nextFilters.caratFrom = undefined;
      nextFilters.caratTo = undefined;
    } else {
      const getResetValue = (k: string): any => {
        if (k === "stockStatus") return "IN_STOCK";
        if (["edgeSizes", "shapes", "color", "clarity", "fluorescence", "warehouseIds"].includes(k)) return [];
        return undefined;
      };
      (nextFilters as any)[key] = getResetValue(key);
    }
    handleApplyFilters(nextFilters as DiamondFilter);
  };

  const handleClearAllFilters = () => {
    const resetFilters: Omit<DiamondFilter, 'page'> = {
      limit: 20,
      sortBySalePrice: "DESC",
      stockStatus: "IN_STOCK",
      warehouseIds: [],
      searchQuery: searchQueryParam || undefined,
      salePriceFrom: undefined,
      salePriceTo: undefined,
      caratFrom: undefined,
      caratTo: undefined,
      edgeSizes: [],
      shapes: [],
      color: [],
      clarity: [],
      fluorescence: [],
    };
    handleApplyFilters(resetFilters as DiamondFilter);
    setActiveChips([]);
  };

  const toggleSort = () => {
    const newSort = filters.sortBySalePrice === "DESC" ? "ASC" : "DESC";
    setFilters(prev => ({ ...prev, sortBySalePrice: newSort }));
  };

  const allDiamonds = data?.pages.flatMap(page => page.data) || [];
  const totalItems = data?.pages[0]?.meta?.totalRows || 0;

  useEffect(() => {
    if (allDiamonds.length === 1) {
      setExpandedId(allDiamonds[0].id);
    }
  }, [allDiamonds]);

  const lastElementRef = useInfiniteScroll(
    () => {
      fetchNextPage();
    },
    hasNextPage,
    isFetchingNextPage
  );

  const handleGoBack = () => {
    setExpandedId(null);
    window.dispatchEvent(new Event("search:clear"));
    navigate("/diamonds");
  };

  return (
    <LayoutShell searchPlaceholder="Nhập mã để bắt đầu tìm kiếm">
      <div className={cn(
        "fixed inset-0 z-[60] lg:relative lg:inset-auto bg-white lg:bg-transparent transition-transform duration-300 lg:translate-x-0",
        isFilterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "w-full lg:w-auto h-full"
      )}>
        {!searchQueryParam && (
          <div className="h-full relative flex flex-col">
            <DiamondFilterSidebar
              onApply={handleApplyFilters}
              currentFilters={filters as DiamondFilter}
              onClose={() => setIsFilterOpen(false)}
              onChipsChange={setActiveChips}
            />
          </div>
        )}
      </div>

      <main className="flex-1 flex flex-col bg-white px-4 lg:px-6 pt-4 pb-6 gap-4 w-full max-w-full min-w-0 overflow-hidden min-h-0">
        <div className="flex-shrink-0">
          <PageHeader
            title={filters.searchQuery ? `Tìm kiếm kim cương: ${filters.searchQuery}` : "Danh sách kim cương"}
            description={`Hiển thị ${totalItems} kết quả`}
            headerStart={
              searchQueryParam ? (
                <Button
                  onClick={handleGoBack}
                  className={'h-full'}
                >
                  <ArrowLeft size={16} />
                  Quay về
                </Button>
              ) : null
            }
            actions={
              <>
                <div className="hidden lg:flex flex-col gap-1.5 min-w-[150px]">
                  <Button
                    onClick={toggleSort}
                    variant="outline"
                    className="flex items-center justify-between group h-10 px-4 rounded-none border-primary-100 font-bold text-xs"
                  >
                    <span className="uppercase tracking-tight">
                      {filters.sortBySalePrice === "DESC" ? "Giá giảm dần" : "Giá tăng dần"}
                    </span>
                    {filters.sortBySalePrice === "DESC" ? (
                      <ArrowDownWideNarrow className="h-4 w-4 text-primary-900 group-hover:text-primary-50 transition-colors" />
                    ) : (
                      <ArrowUpWideNarrow className="h-4 w-4 text-primary-900 group-hover:text-primary-50 transition-colors" />
                    )}
                  </Button>
                </div>
                <div className="sm:hidden flex items-center justify-between w-full">
                  <Button
                    onClick={() => setIsFilterOpen(true)}
                    variant="outline"
                    className="h-8 px-2 rounded-none border-primary-100 font-bold text-xs gap-0 flex items-center"
                  >
                    <Filter size={14} className="mr-2" />
                    <span className="w-max">Bộ lọc</span>
                  </Button>
                  <Button
                    onClick={toggleSort}
                    variant="outline"
                    className="h-8 px-2 rounded-none border-primary-100 font-bold text-xs gap-0 flex items-center"
                  >
                    {filters.sortBySalePrice === "DESC" ? <ArrowDownWideNarrow size={14} className="mr-1" /> : <ArrowUpWideNarrow size={14} className="mr-1" />}
                    <span className="w-max">{filters.sortBySalePrice === "DESC" ? "Giá giảm dần" : "Giá tăng dần"}</span>
                  </Button>
                </div>
              </>
            }
          />
        </div>

        {activeChips.length > 0 && (
          <div className="lg:hidden flex flex-wrap gap-2 flex-shrink-0 pb-1 items-center">
            <div className="flex flex-wrap gap-2 flex-1">
              {activeChips.map((chip) => (
                <Badge
                  key={chip.key}
                  variant="default"
                  className="flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 bg-primary-100 text-primary-900 border-primary-200 hover:bg-primary-100 hover:text-primary-900"
                >
                  <span className="text-xs font-medium">{chip.label}</span>
                  <button
                    onClick={() => handleRemoveChip(chip.key)}
                    className="ml-1 rounded-full p-0.5 hover:bg-primary-200/50 cursor-pointer transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="h-auto p-0 text-[9px] font-black text-primary-400 hover:text-secondary-900 hover:bg-transparent uppercase tracking-wider flex-shrink-0"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {isLoading ? (
            <div className="h-full overflow-y-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-96 w-full rounded-none mb-4 shadow-sm" />
              ))}
            </div>
          ) : isError || allDiamonds.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-none border border-dashed border-primary-200">
              <p className="text-primary-400 font-medium">Không tìm thấy viên kim cương nào phù hợp với yêu cầu</p>
            </div>
          ) : (
            <DiamondTable
              diamonds={allDiamonds}
              lastElementRef={lastElementRef}
              isFetchingNextPage={isFetchingNextPage}
              expandedId={expandedId}
              onToggleExpand={setExpandedId}
            />
          )}
        </div>
      </main>
    </LayoutShell>
  );
}
