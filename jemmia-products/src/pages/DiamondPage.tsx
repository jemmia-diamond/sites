import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchDiamonds } from "../services/diamondService";
import { DiamondFilter } from "../types";
import { LayoutShell } from "../components/layout/LayoutShell";
import { DiamondFilterSidebar } from "../components/diamond/DiamondFilterSidebar";
import { useFilterSidebarCollapse } from "@/hooks/useFilterSidebarCollapse";
import { DiamondTable } from "../components/diamond/DiamondTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  ArrowUpWideNarrow,
  Filter,
  X,
} from "lucide-react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

import { PageHeader } from "../components/layout/PageHeader";

export default function DiamondPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQueryParam = searchParams.get("searchQuery");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { collapsed: isFilterCollapsed, toggle: toggleFilterCollapsed } =
    useFilterSidebarCollapse("jemmia-diamond-filter-collapsed");
  const [activeChips, setActiveChips] = useState<
    { key: string; value: any; label: string }[]
  >([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Omit<DiamondFilter, "page">>({
    limit: 20,
    sortBySalePrice: "DESC",
    stockStatus: "IN_STOCK",
    warehouseIds: [],
    searchQuery: searchQueryParam || undefined,
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: searchQueryParam || undefined,
    }));
  }, [searchQueryParam]);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["diamonds", filters],
    queryFn: ({ pageParam = 1 }) => {
      const apiFilters = { ...filters } as any;
      if (apiFilters.searchQuery) {
        delete apiFilters.warehouseIds;
        delete apiFilters.stockStatus;
      }
      return fetchDiamonds({ ...apiFilters, page: pageParam });
    },
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
  };

  const handleRemoveChip = (key: string) => {
    let nextFilters = { ...filters };
    if (key === "salePrice") {
      nextFilters.salePriceFrom = undefined;
      nextFilters.salePriceTo = undefined;
    } else if (key === "carat") {
      nextFilters.caratFrom = undefined;
      nextFilters.caratTo = undefined;
    } else if (key === "edgeLong") {
      nextFilters.edgeLongFrom = undefined;
      nextFilters.edgeLongTo = undefined;
    } else if (key === "edgeShort") {
      nextFilters.edgeShortFrom = undefined;
      nextFilters.edgeShortTo = undefined;
    } else {
      const getResetValue = (k: string): any => {
        if (k === "stockStatus") return "IN_STOCK";
        if (
          [
            "edgeSizes",
            "shapes",
            "color",
            "clarity",
            "fluorescence",
            "warehouseIds",
          ].includes(k)
        )
          return [];
        return undefined;
      };
      (nextFilters as any)[key] = getResetValue(key);
    }
    handleApplyFilters(nextFilters as DiamondFilter);
  };

  const handleClearAllFilters = () => {
    const resetFilters: Omit<DiamondFilter, "page"> = {
      limit: 20,
      sortBySalePrice: "DESC",
      stockStatus: "IN_STOCK",
      warehouseIds: [],
      searchQuery: searchQueryParam || undefined,
      salePriceFrom: undefined,
      salePriceTo: undefined,
      caratFrom: undefined,
      caratTo: undefined,
      edgeLongFrom: undefined,
      edgeLongTo: undefined,
      edgeShortFrom: undefined,
      edgeShortTo: undefined,
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
    setFilters((prev) => ({ ...prev, sortBySalePrice: newSort }));
  };

  const allDiamonds = data?.pages.flatMap((page) => page.data) || [];
  const totalItems = data?.pages[0]?.meta?.totalRows || 0;

  useEffect(() => {
    setExpandedId(null);
  }, [searchQueryParam]);

  useEffect(() => {
    if (searchQueryParam || filters.searchQuery || isFetching) {
      return;
    }
    if (allDiamonds.length === 1) {
      setExpandedId(allDiamonds[0].id);
    }
  }, [allDiamonds, searchQueryParam, filters.searchQuery, isFetching]);

  const lastElementRef = useInfiniteScroll(
    () => {
      fetchNextPage();
    },
    hasNextPage,
    isFetchingNextPage,
  );

  const handleGoBack = () => {
    setExpandedId(null);
    window.dispatchEvent(new Event("search:clear"));
    navigate("/diamonds");
  };

  const filterSortContent = (
    <>
      <div
        className={cn(
          "flex items-center gap-3 w-full",
          searchQueryParam ? "justify-end" : "justify-end",
        )}
      >
        <Button
          onClick={toggleSort}
          variant="outline"
          className="h-8 px-2 rounded-none border-primary-100 font-bold text-xs gap-0 flex items-center w-max"
        >
          {filters.sortBySalePrice === "DESC" ? (
            <ArrowDownWideNarrow size={14} className="mr-1" />
          ) : (
            <ArrowUpWideNarrow size={14} className="mr-1" />
          )}
          <span className="w-max">
            {filters.sortBySalePrice === "DESC"
              ? "Giá giảm dần"
              : "Giá tăng dần"}
          </span>
        </Button>
        {!searchQueryParam && (
          <Button
            onClick={() => setIsFilterOpen(true)}
            variant="outline"
            className="h-8 px-2 rounded-none border-primary-100 font-bold text-xs gap-0 flex items-center"
          >
            <Filter size={14} className="mr-2" />
            <span className="w-max">Bộ lọc</span>
          </Button>
        )}
      </div>

      {activeChips.length > 0 && (
        <div className="md:hidden flex flex-wrap gap-2 flex-shrink-0 pt-1 items-center pt-2 md:pt-0">
          <div className="flex flex-wrap gap-2 flex-1">
            {activeChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="default"
                className="active-chip-badge"
              >
                <span>{chip.label}</span>
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
            className="clear-filters-btn flex-shrink-0"
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </>
  );

  return (
    <LayoutShell searchPlaceholder="Nhập mã để bắt đầu tìm kiếm">
      {!searchQueryParam && (
        <>
          {/* Backdrop overlay for mobile/tablet filter drawer */}
          {isFilterOpen && (
            <div
              className="xl:hidden fixed inset-0 bg-black/40 z-[9999] animate-in fade-in duration-200"
              onClick={() => setIsFilterOpen(false)}
            />
          )}

          <div
            className={cn(
              // Desktop: relative sidebar
              "xl:relative xl:inset-auto xl:bg-transparent xl:translate-x-0 shrink-0",
              // Mobile/Tablet: right-side fixed drawer
              "fixed inset-y-0 right-0 bg-white transition-all duration-300 ease-out",
              isFilterOpen
                ? "translate-x-0 z-[10000]"
                : "translate-x-full xl:translate-x-0 z-[60]",
              // Width: full on phone, 380px on tablet, collapsed/expanded on desktop
              "w-full md:w-[380px] h-full",
              isFilterCollapsed ? "xl:w-16" : "xl:w-80",
            )}
          >
            <div className="h-full relative flex flex-col">
              <DiamondFilterSidebar
                onApply={handleApplyFilters}
                currentFilters={filters as DiamondFilter}
                onClose={() => setIsFilterOpen(false)}
                onToggleCollapse={toggleFilterCollapsed}
                onChipsChange={setActiveChips}
                isCollapsed={isFilterCollapsed}
                isOpen={isFilterOpen}
              />
            </div>
          </div>
        </>
      )}

      <main className="flex-1 flex flex-col bg-white px-4 xl:px-6 pt-4 md:pt-0 xl:pt-4 pb-2 xl:gap-4 w-full max-w-full min-w-0 xl:overflow-hidden min-h-0">
        <div className="flex flex-col md:sticky top-12 xl:top-0 z-51 w-full bg-white justify-between md:gap-2 py-0 md:py-3 xl:py-0">
          <div className="flex justify-between items-center w-full">
            <div className="flex-shrink-0 xl:w-full">
              <PageHeader
                title={
                  filters.searchQuery
                    ? `Tìm kiếm kim cương: ${filters.searchQuery}`
                    : "Danh sách kim cương"
                }
                description={`Hiển thị ${totalItems} kết quả`}
                headerStart={
                  searchQueryParam ? (
                    <Button onClick={handleGoBack} className={"h-full w-max"}>
                      <ArrowLeft size={16} />
                      Quay về
                    </Button>
                  ) : null
                }
                actions={
                  <div className="flex items-center gap-2 w-full">
                    <div className="hidden xl:flex items-center gap-2">
                      <Button
                        onClick={toggleSort}
                        variant="outline"
                        className="flex items-center justify-between group h-10 px-4 rounded-none border-primary-100 font-bold text-xs"
                      >
                        <span className="uppercase tracking-tight">
                          {filters.sortBySalePrice === "DESC"
                            ? "Giá giảm dần"
                            : "Giá tăng dần"}
                        </span>
                        {filters.sortBySalePrice === "DESC" ? (
                          <ArrowDownWideNarrow className="h-4 w-4 text-primary-900 group-hover:text-primary-50 transition-colors" />
                        ) : (
                          <ArrowUpWideNarrow className="h-4 w-4 text-primary-900 group-hover:text-primary-50 transition-colors" />
                        )}
                      </Button>
                    </div>
                  </div>
                }
              />
            </div>

            {/* Tablet filters bar (inside sticky wrapper) */}
            <div className="hidden md:flex xl:hidden bg-white flex-col md:gap-4 w-full border-b border-primary-50 md:border-none py-2">
              {filterSortContent}
            </div>
          </div>
          {activeChips.length > 0 && (
            <div className="hidden md:flex xl:hidden flex-wrap gap-2 flex-shrink-0 pt-1 items-center pt-2 md:pt-0">
              <div className="flex flex-wrap gap-2 flex-1">
                {activeChips.map((chip) => (
                  <Badge
                    key={chip.key}
                    variant="default"
                    className="active-chip-badge"
                  >
                    <span>{chip.label}</span>
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
                className="clear-filters-btn flex-shrink-0"
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
        {/* Mobile-only sticky filters bar */}
        <div className="md:hidden sticky top-12 z-40 bg-white flex flex-col w-full border-b border-primary-50 py-2">
          {filterSortContent}
        </div>
        <div className="flex-1 flex flex-col min-h-0 xl:overflow-hidden">
          {isLoading ? (
            <div className="relative border border-primary-100 bg-white shadow-none flex flex-col flex-1 min-h-0 w-full max-w-full xl:overflow-hidden">
              <div className="flex-1 xl:overflow-y-auto min-w-0 w-full relative">
                <Table className="w-full md:min-w-[1200px] border-collapse">
                  {/* Desktop Table Header */}
                  <TableHeader className="hidden md:table-header-group">
                    <TableRow className="border-b border-primary-100 hover:bg-transparent">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <TableHead
                          key={i}
                          className={cn(
                            "bg-primary-50 h-10 py-0",
                            i === 0 ? "text-left px-2 w-[170px]" : "text-center px-2"
                          )}
                        >
                          <Skeleton className={cn("h-3 w-16 bg-primary-200/50", i === 0 ? "mx-0" : "mx-auto")} />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Desktop Rows */}
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                      <TableRow
                        key={rowIndex}
                        className="hidden md:table-row divide-x border-b border-primary-50 divide-primary-50"
                      >
                        {Array.from({ length: 14 }).map((_, cellIndex) => (
                          <TableCell
                            key={cellIndex}
                            className={cn(
                              "py-4",
                              cellIndex === 0 ? "px-2 text-left w-[180px]" : "px-3 text-center"
                            )}
                          >
                            <Skeleton
                              className={cn(
                                "h-3 bg-primary-100/50",
                                cellIndex === 0 ? "w-20 mx-0" : "mx-auto",
                                cellIndex === 1 && "w-12",
                                cellIndex === 2 && "w-10",
                                cellIndex === 3 && "w-16",
                                cellIndex === 4 && "w-8",
                                cellIndex === 5 && "w-8",
                                cellIndex === 6 && "w-12",
                                cellIndex === 7 && "w-32",
                                cellIndex === 8 && "w-20",
                                cellIndex === 9 && "w-16",
                                cellIndex === 10 && "w-12",
                                cellIndex === 11 && "w-24",
                                cellIndex === 12 && "w-10",
                                cellIndex === 13 && "w-10",
                              )}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {/* Mobile Cards Skeletons */}
                    {Array.from({ length: 4 }).map((_, i) => (
                      <TableRow
                        key={i}
                        className="md:hidden border-b border-primary-50"
                      >
                        <TableCell className="px-3 py-3">
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex-1 flex flex-col gap-2">
                              <Skeleton className="h-4 w-1/2 bg-primary-100/50" />
                              <Skeleton className="h-3 w-3/4 bg-primary-100/50" />
                            </div>
                            <Skeleton className="h-5 w-16 bg-primary-100/50 rounded-full" />
                            <Skeleton className="h-5 w-5 bg-primary-100/50 rounded-full" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : isError || allDiamonds.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-none border border-dashed border-primary-200">
              <p className="text-primary-400 font-medium">
                Không tìm thấy viên kim cương nào phù hợp với yêu cầu
              </p>
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
