
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { jewelryService } from "../services/jewelryService";
import { JewelryFilter } from "../types";
import { LayoutShell } from "../components/layout/LayoutShell";
import { JewelryFilterSidebar } from "../components/jewelry/JewelryFilterSidebar";
import { useFilterSidebarCollapse } from "@/hooks/useFilterSidebarCollapse";
import { JewelryTable } from "../components/jewelry/JewelryTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "../components/layout/PageHeader";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownWideNarrow, ArrowLeft, ArrowUpWideNarrow, Filter, X } from "lucide-react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

export default function JewelryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const designCodeParam = searchParams.get("designCode");
  const searchQueryParam = searchParams.get("searchQuery");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { collapsed: isFilterCollapsed, toggle: toggleFilterCollapsed } =
    useFilterSidebarCollapse("jemmia-jewelry-filter-collapsed");
  const [activeChips, setActiveChips] = useState<{ key: string; value: any; label: string }[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // We omit `page` from the local state since react-query handles it for infinite scroll
  const [filters, setFilters] = useState<Omit<JewelryFilter, 'page'>>({
    sortBySalePrice: "DESC",
    stockStatus: "IN_STOCK",
    designCode: designCodeParam || undefined,
    searchQuery: searchQueryParam || undefined,
    type: searchQueryParam ? undefined : (searchParams.get("type") || undefined)
  });

  const [debouncedFilters, setDebouncedFilters] = useState<Omit<JewelryFilter, 'page'>>(filters);

  useEffect(() => {
    setFilters(prev => {
      const next = {
        sortBySalePrice: prev.sortBySalePrice,
        stockStatus: prev.stockStatus,
        designCode: designCodeParam || undefined,
        searchQuery: searchQueryParam || undefined,
        type: searchQueryParam ? undefined : prev.type,
        warehouseIds: prev.warehouseIds,
        storageSize1: prev.storageSize1,
        salePriceFrom: prev.salePriceFrom,
        salePriceTo: prev.salePriceTo,
        ringHeadStyles: prev.ringHeadStyles,
        ringBandStyles: prev.ringBandStyles,
      };
      setDebouncedFilters(next);
      return next;
    });
  }, [designCodeParam, searchQueryParam]);

  const handleGoBack = () => {
    setExpandedId(null);
    window.dispatchEvent(new Event("search:clear"));
    navigate("/jewelry");
  };

  const debouncedSetFilters = useMemo(
    () => debounce((newFilters: Omit<JewelryFilter, 'page'>) => {
      setDebouncedFilters(newFilters);
    }, 400),
    []
  );

  const handleApplyFilters = (newFilters: JewelryFilter) => {
    const { page, ...restFilters } = newFilters;
    const updated = { ...filters, ...restFilters };
    setFilters(updated);
    setDebouncedFilters(updated);
  };

  const handleRemoveChip = (key: string) => {
    let nextFilters = { ...filters };
    if (key === "salePrice") {
      nextFilters.salePriceFrom = undefined;
      nextFilters.salePriceTo = undefined;
    } else {
      const getResetValue = (k: string): any => {
        if (k === "stockStatus") return "all";
        if (["warehouseIds", "storageSize1", "ringHeadStyles", "ringBandStyles"].includes(k)) return [];
        return undefined;
      };
      (nextFilters as any)[key] = getResetValue(key);
    }
    handleApplyFilters(nextFilters as JewelryFilter);
  };

  const handleClearAllFilters = () => {
    const resetFilters: Omit<JewelryFilter, 'page'> = {
      sortBySalePrice: "DESC",
      stockStatus: "IN_STOCK",
      designCode: designCodeParam || undefined,
      searchQuery: searchQueryParam || undefined,
      type: searchQueryParam ? undefined : (searchParams.get("type") || undefined),
      warehouseIds: [],
      storageSize1: [],
      salePriceFrom: undefined,
      salePriceTo: undefined,
      ringHeadStyles: [],
      ringBandStyles: [],
    };
    handleApplyFilters(resetFilters as JewelryFilter);
    setActiveChips([]);
  };

  const toggleSort = () => {
    const newSort = filters.sortBySalePrice === "DESC" ? "ASC" : "DESC";
    const updated = { ...filters, sortBySalePrice: newSort };
    setFilters(updated);
    setDebouncedFilters(updated);
  };

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["jewelry-designs", debouncedFilters],
    queryFn: ({ pageParam = 1 }) => jewelryService.getJewelries({ ...debouncedFilters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPageParam < (lastPage?.meta?.totalPages || 1)) {
        return lastPageParam + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  const allJewelries = data?.pages.flatMap(page => page.data) || [];
  const totalResults = data?.pages[0]?.meta?.totalRows || 0;

  useEffect(() => {
    if (allJewelries.length === 1) {
      setExpandedId(allJewelries[0].id);
    }
  }, [allJewelries]);

  const lastElementRef = useInfiniteScroll(
    () => {
      fetchNextPage();
    },
    hasNextPage,
    isFetchingNextPage
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
              isFilterOpen ? "translate-x-0 z-[10000]" : "translate-x-full xl:translate-x-0 z-[60]",
              // Width: full on phone, 380px on tablet, collapsed/expanded on desktop
              "w-full md:w-[380px] h-full",
              isFilterCollapsed ? "xl:w-16" : "xl:w-80"
            )}
          >
            <div className="h-full relative flex flex-col">
              <JewelryFilterSidebar
                onApply={handleApplyFilters}
                currentFilters={filters as JewelryFilter}
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

      <main className="flex-1 flex flex-col md:gap-4 bg-white px-4 xl:px-6 pt-4 pb-6 w-full max-w-full min-w-0 xl:overflow-hidden min-h-0">
        <div className="flex justify-between gap-4">
          <div className="flex-shrink-0">
            <PageHeader
              title={
                debouncedFilters.designCode
                  ? `Mã: ${debouncedFilters.designCode}`
                  : debouncedFilters.searchQuery
                    ? `Tìm kiếm: ${debouncedFilters.searchQuery}`
                    : `${debouncedFilters.type || "Tất cả trang sức"}`
              }
              description={`Hiển thị ${totalResults} kết quả`}
              headerStart={
                searchQueryParam ? (
                  <Button
                    onClick={handleGoBack}
                    className={'h-full w-max'}
                  >
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
                        {filters.sortBySalePrice === "DESC" ? "Giá giảm dần" : "Giá tăng dần"}
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

          {/* Sticky Mobile Filters & Active Chips Bar */}
          <div className="xl:hidden sticky top-12 z-40 bg-white flex flex-col gap-2 w-full border-b border-primary-50 md:border-none py-2">
            <div
              className={cn(
                "flex items-center gap-3 w-full",
                searchQueryParam ? "justify-end" : "justify-end"
              )}
            >
              <Button
                onClick={toggleSort}
                variant="outline"
                className="h-8 px-2 rounded-none border-primary-100 font-bold text-xs gap-0 flex items-center w-max"
              >
                {filters.sortBySalePrice === "DESC" ? <ArrowDownWideNarrow size={14} className="mr-1" /> : <ArrowUpWideNarrow size={14} className="mr-1" />}
                <span className="w-max">{filters.sortBySalePrice === "DESC" ? "Giá giảm dần" : "Giá tăng dần"}</span>
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
              <div className="flex flex-wrap gap-2 flex-shrink-0 pt-1 items-center">
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
        </div>
        <div className="flex-1 flex flex-col min-h-0 xl:overflow-hidden">
          {isLoading ? (
            <div className="relative border border-primary-100 bg-white shadow-sm flex flex-col flex-1 min-h-0 w-full max-w-full xl:overflow-hidden">
              <div className="flex-1 xl:overflow-y-auto min-w-0 w-full relative">
                <Table className="w-full md:min-w-[1200px] border-collapse">
                  {/* Desktop Table Header */}
                  <TableHeader className="hidden md:table-header-group">
                    <TableRow className="border-b border-primary-100 hover:bg-transparent">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <TableHead key={i} className="bg-primary-50 h-10 px-2 py-0">
                          <Skeleton className="h-3 w-16 bg-primary-200/50 mx-auto" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Desktop Rows */}
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                      <TableRow key={rowIndex} className="hidden md:table-row divide-x border-b border-primary-50 divide-primary-50">
                        {Array.from({ length: 7 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex} className="px-3 py-4 text-center">
                            <Skeleton className={cn(
                              "h-3 bg-primary-100/50 mx-auto",
                              cellIndex === 0 && "w-24",
                              cellIndex === 1 && "w-28",
                              cellIndex === 2 && "w-28",
                              cellIndex === 3 && "w-16",
                              cellIndex === 4 && "w-24",
                              cellIndex === 5 && "w-16",
                              cellIndex === 6 && "w-8"
                            )} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {/* Mobile Cards Skeletons */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="md:hidden border-b border-primary-50">
                        <TableCell className="px-3 py-3">
                          <div className="flex items-center gap-3 w-full">
                            <Skeleton className="h-14 w-14 bg-primary-100/50 rounded-lg flex-shrink-0" />
                            <div className="flex-1 flex flex-col gap-2 min-w-0">
                              <Skeleton className="h-4 w-2/3 bg-primary-100/50" />
                              <Skeleton className="h-3 w-1/3 bg-primary-100/50" />
                            </div>
                            <Skeleton className="h-5 w-12 bg-primary-100/50 rounded-full flex-shrink-0" />
                            <Skeleton className="h-5 w-5 bg-primary-100/50 rounded-full flex-shrink-0" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
            <JewelryTable
              jewelries={allJewelries}
              warehouseIds={debouncedFilters.warehouseIds}
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
