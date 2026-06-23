import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, Fragment } from "react";
import { fetchCombos, ComboFilter } from "../services/comboService";
import { LayoutShell } from "../components/layout/LayoutShell";
import { PageHeader } from "../components/layout/PageHeader";

import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DiamondModel, ProductModel } from "../types";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useFilterSidebarCollapse } from "@/hooks/useFilterSidebarCollapse";
import { ComboFilterSidebar } from "../components/jewelry/JewelryFilterSidebar/ComboFilterSidebar";
import { Filter, X } from "lucide-react";
import {
  cn,
  getDiamondShapeImage,
  formatWarehouseName,
  formatEdgeSize,
} from "@/lib/utils";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CompactGallery,
  ProductCodes,
  MediaPreviewDialog,
  SideStoneTooltip,
} from "../components/jewelry/JewelryTable";

export default function ComboPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { collapsed: isFilterCollapsed, toggle: toggleFilterCollapsed } =
    useFilterSidebarCollapse("jemmia-combo-filter-collapsed");
  const [activeChips, setActiveChips] = useState<
    { key: string; value: any; label: string }[]
  >([]);

  const [filters, setFilters] = useState<Omit<ComboFilter, "page">>({
    limit: 20,
    warehouseIds: [],
    storageSize: [],
    salePriceFrom: undefined,
    salePriceTo: undefined,
    type: undefined,
  });

  const handleApplyFilters = (newFilters: Omit<ComboFilter, "page">) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleRemoveChip = (key: string) => {
    const nextFilters = { ...filters };
    if (key === "salePrice") {
      nextFilters.salePriceFrom = undefined;
      nextFilters.salePriceTo = undefined;
    } else {
      const getResetValue = (k: string): any => {
        if (["warehouseIds", "storageSize"].includes(k)) return [];
        return undefined;
      };
      (nextFilters as any)[key] = getResetValue(key);
    }
    handleApplyFilters(nextFilters);
  };

  const handleClearAllFilters = () => {
    const resetFilters: Omit<ComboFilter, "page"> = {
      limit: 20,
      warehouseIds: [],
      storageSize: [],
      salePriceFrom: undefined,
      salePriceTo: undefined,
      type: undefined,
    };
    handleApplyFilters(resetFilters);
    setActiveChips([]);
  };

  const filterSortContent = (
    <>
      <div className="flex items-center justify-end gap-3 w-full">
        <Button
          onClick={() => setIsFilterOpen(true)}
          variant="outline"
          className="h-8 px-2 rounded-none border-primary-100 font-bold text-xs gap-0 flex items-center"
        >
          <Filter size={14} className="mr-2" />
          <span className="w-max">Bộ lọc</span>
        </Button>
      </div>

      {activeChips.length > 0 && (
        <div className="flex md:hidden flex-wrap gap-2 flex-shrink-0 pt-1 items-center pt-2 md:pt-0">
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

  const queryClient = useQueryClient();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["combos", filters],
      queryFn: ({ pageParam = 1 }) =>
        fetchCombos({ ...filters, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        if (lastPageParam < (lastPage?.meta?.totalPages || 1)) {
          return lastPageParam + 1;
        }
        return undefined;
      },
    });

  const allCombos = data?.pages.flatMap((page) => page.data) || [];

  const lastElementRef = useInfiniteScroll(
    () => {
      fetchNextPage();
    },
    hasNextPage,
    isFetchingNextPage,
  );

  // Media Preview State
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [previewList, setPreviewList] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [uploadConfig, setUploadConfig] = useState<{
    showUpload?: boolean;
    designCode?: string;
    uploadEndpoint?: string;
    productId?: string;
    diamondId?: string;
    isActual?: boolean;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"web" | "actual">("web");

  const activeProductId = uploadConfig?.productId;
  const activeDiamondId = uploadConfig?.diamondId;

  const activeJewelry = activeProductId
    ? allCombos.find((c) => c.jewelry?.id === activeProductId)?.jewelry
    : null;

  const activeDiamond = activeDiamondId
    ? allCombos.find((c) => c.diamond?.id === activeDiamondId)?.diamond
    : null;

  const allWebImages = activeJewelry
    ? activeJewelry.thumbnails?.map((t: any) => t.url) || []
    : activeDiamond
      ? activeDiamond.thumbnails?.map((t: any) => t.url) || []
      : [];

  const allActualImages = activeJewelry
    ? [
        ...(activeJewelry.images?.map((img: any) => img.url) || []),
        ...(activeJewelry.videos?.map((v: any) => v.url) || []),
      ]
    : activeDiamond
      ? [
          ...(activeDiamond.images?.map((img: any) => img.url) || []),
          ...(activeDiamond.videos?.map((v: any) => v.url) || []),
        ]
      : [];

  const displayList =
    activeJewelry || activeDiamond
      ? activeTab === "actual"
        ? allActualImages
        : allWebImages
      : previewList;

  const handleImageError = (url: string) =>
    setBrokenImages((prev) => new Set(prev).add(url));

  const handlePreview = (images: string[], index: number, config?: any) => {
    setActiveTab(config?.isActual ? "actual" : "web");
    setPreviewList(images);
    setPreviewIndex(index);
    setMediaPreviewUrl(images[index]);
    const validImages = images.filter((url) => !brokenImages.has(url));
    if (validImages.length === 1) {
      setSelectedMedia(validImages[0]);
    } else {
      setSelectedMedia(null);
    }
    setUploadConfig(config || null);
  };

  const closeMediaDialog = () => {
    setMediaPreviewUrl(null);
    setSelectedMedia(null);
    setTimeout(() => setUploadConfig(null), 200);
  };

  const handleDownloadSingle = async (url: string) => {
    try {
      const urlParts = url.split("/");
      let fileName = urlParts[urlParts.length - 1];
      if (fileName.includes("?")) {
        fileName = fileName.split("?")[0];
      }

      if (!fileName.includes(".")) {
        const ext =
          url.includes(".mp4") || url.includes(".mov") ? "mp4" : "jpg";
        fileName = `media_${Date.now()}.${ext}`;
      }

      const cacheBusterUrl =
        url + (url.includes("?") ? "&" : "?") + "cb=" + new Date().getTime();

      try {
        const response = await fetch(cacheBusterUrl, {
          method: "GET",
          mode: "cors",
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
      } catch (fetchError) {
        console.warn("Fetch failed, falling back to window.open", fetchError);
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Lỗi khi tải file:", url, error);
    }
  };

  const handleDownloadAll = (images: string[]) => {
    images.forEach((imageUrl) => {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = imageUrl.split("/").pop() || "image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const isVideo = (url: string) =>
    !!url.match(/\.(mp4|webm|ogg|mov)(?:\?|$)|^blob:|^data:video/i);

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["combos"] });
  };

  return (
    <LayoutShell searchPlaceholder="Nhập mã để bắt đầu tìm kiếm">
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
          <ComboFilterSidebar
            onApply={handleApplyFilters}
            currentFilters={filters}
            onClose={() => setIsFilterOpen(false)}
            onToggleCollapse={toggleFilterCollapsed}
            onChipsChange={setActiveChips}
            isCollapsed={isFilterCollapsed}
            isOpen={isFilterOpen}
          />
        </div>
      </div>

      <main className="flex-1 flex flex-col bg-white px-4 xl:px-6 pt-4 md:pt-0  xl:pt-4 pb-2 gap-4 md:gap-0 xl:gap-4 w-full max-w-full min-w-0 xl:overflow-hidden min-h-0">
        <div className="flex flex-col md:sticky md:top-12 xl:top-0 z-51 w-full bg-white justify-between md:gap-2 py-0 md:py-3 xl:py-0">
          <div className="flex justify-between items-center w-full">
            <div className="flex-shrink-0 xl:w-full">
              <PageHeader
                title="Sản phẩm nguyên chiếc"
                description={`Hiển thị ${data?.pages[0]?.meta?.totalRows || 0} kết quả`}
              />
            </div>
            {/* Tablet filters bar */}
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

        <div className="flex-1 bg-white flex flex-col min-h-0 w-full max-w-full md:overflow-hidden md:border md:border-primary-100">
          <div className="flex-1 overflow-y-auto overflow-x-hidden md:overflow-x-auto min-w-0 w-full relative">
            {isLoading ? (
              <>
                {/* Mobile skeletons */}
                <div className="grid grid-cols-1 gap-6 md:hidden">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="border border-primary-100 bg-white flex flex-col overflow-hidden shadow-sm"
                    >
                      {/* Item 1: Jewelry Skeleton */}
                      <div className="flex items-center p-2 md:p-4 border-b border-primary-50">
                        <Skeleton className="w-10 h-10 md:w-12 md:h-12 bg-primary-100/50 flex-shrink-0" />
                        <div className="flex-1 ml-2 md:ml-3 min-w-0">
                          <Skeleton className="h-4 w-1/3 bg-primary-100/50 mb-2" />
                          <div className="mt-1 hidden md:grid md:grid-cols-2 gap-2">
                            <Skeleton className="h-3 w-3/4 bg-primary-100/50" />
                            <Skeleton className="h-3 w-2/3 bg-primary-100/50" />
                          </div>
                          <div className="md:hidden mt-1">
                            <Skeleton className="h-3 w-2/3 bg-primary-100/50" />
                          </div>
                        </div>
                        <div className="ml-2 md:ml-3 text-right flex flex-col items-end min-w-[100px]">
                          <Skeleton className="h-3 w-12 bg-primary-100/50 mb-1" />
                          <Skeleton className="h-4 w-20 bg-primary-100/50" />
                        </div>
                      </div>

                      {/* Item 2: Diamond Skeleton */}
                      <div className="flex items-center p-2 md:p-4">
                        <Skeleton className="w-10 h-10 md:w-12 md:h-12 bg-primary-100/50 flex-shrink-0 rounded-full" />
                        <div className="flex-1 ml-2 md:ml-3 min-w-0">
                          <Skeleton className="h-4 w-1/4 bg-primary-100/50 mb-2" />
                          <div className="mt-1 hidden md:grid md:grid-cols-2 gap-2">
                            <Skeleton className="h-3 w-2/3 bg-primary-100/50" />
                            <Skeleton className="h-3 w-3/4 bg-primary-100/50" />
                          </div>
                          <div className="md:hidden mt-1">
                            <Skeleton className="h-3 w-3/4 bg-primary-100/50" />
                          </div>
                        </div>
                        <div className="ml-2 md:ml-3 text-right flex flex-col items-end min-w-[100px]">
                          <Skeleton className="h-3 w-12 bg-primary-100/50 mb-1" />
                          <Skeleton className="h-4 w-20 bg-primary-100/50" />
                        </div>
                      </div>

                      {/* Total Section Skeleton */}
                      <div className="flex justify-between items-center px-3 py-2 border-t border-primary-50 bg-primary-50/10">
                        <Skeleton className="h-3 w-20 bg-primary-100/50" />
                        <div className="flex flex-col items-end">
                          <Skeleton className="h-3 w-16 bg-primary-100/50 mb-1" />
                          <Skeleton className="h-4 w-24 bg-primary-100/50" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet/Desktop table skeletons */}
                <Table className="hidden md:table w-full border-collapse animate-pulse">
                  <TableHeader className="hidden md:table-header-group">
                    <TableRow className="border-b border-primary-100 hover:bg-transparent">
                      <TableHead className="bg-primary-50 h-10 px-2 xl:px-4 py-0 text-left text-[11px] font-bold uppercase tracking-wider text-primary-700 w-[70px] lg:w-[80px] xl:w-[90px]">
                        Hình ảnh
                      </TableHead>
                      <TableHead className="bg-primary-50 h-10 px-2 xl:px-4 py-0 text-left text-[11px] font-bold uppercase tracking-wider text-primary-700 w-[110px] lg:w-[125px] xl:w-[140px]">
                        Định danh
                      </TableHead>
                      <TableHead className="bg-primary-50 h-10 px-2 xl:px-4 py-0 text-left text-[11px] font-bold uppercase tracking-wider text-primary-700 whitespace-normal min-w-[120px]">
                        Thông tin combo
                      </TableHead>
                      <TableHead className="bg-primary-50 h-10 px-2 xl:px-4 py-0 text-center text-[11px] font-bold uppercase tracking-wider text-primary-700 whitespace-normal min-w-[90px]">
                        Vị trí kho
                      </TableHead>
                      <TableHead className="bg-primary-50 h-10 px-2 xl:px-4 py-0 text-center text-[11px] font-bold uppercase tracking-wider text-primary-700 w-[110px] lg:w-[145px] xl:w-[180px]">
                        Hình ảnh thực tế
                      </TableHead>
                      <TableHead className="bg-primary-50 h-10 px-2 xl:px-4 py-0 text-right text-[11px] font-bold uppercase tracking-wider text-primary-700 w-[100px] lg:w-[120px] xl:w-[140px]">
                        Giá chi tiết
                      </TableHead>
                      <TableHead className="bg-primary-50 h-10 px-2 xl:px-4 py-0 text-right text-[11px] font-bold uppercase tracking-wider text-primary-700 w-[110px] lg:w-[125px] xl:w-[140px]">
                        Tổng cộng
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 3 }).map((_, groupIndex) => (
                      <Fragment key={groupIndex}>
                        {/* Row 1: Jewelry skeleton */}
                        <TableRow className="border-b border-primary-50 divide-x divide-primary-50">
                          <TableCell
                            rowSpan={2}
                            className="px-2 xl:px-4 py-2 align-middle text-center w-[70px] lg:w-[80px] xl:w-[90px]"
                          >
                            <Skeleton className="h-10 w-10 lg:h-12 lg:w-12 bg-primary-100/50 rounded mx-auto" />
                          </TableCell>
                          <TableCell className="px-2 xl:px-4 py-2 w-[110px] lg:w-[125px] xl:w-[140px]">
                            <Skeleton className="h-5 w-20 lg:w-24 bg-primary-100/50 rounded-full" />
                          </TableCell>
                          <TableCell className="px-2 xl:px-4 py-2">
                            <Skeleton className="h-4 w-32 lg:w-48 bg-primary-100/50 rounded-full" />
                          </TableCell>
                          <TableCell className="px-2 xl:px-4 py-2 text-center">
                            <Skeleton className="h-4 w-16 lg:w-24 bg-primary-100/50 rounded-full mx-auto" />
                          </TableCell>
                          <TableCell className="px-2 xl:px-4 py-2 w-[110px] lg:w-[145px] xl:w-[180px]">
                            <div className="flex justify-center gap-1">
                              <Skeleton className="h-8 w-8 bg-primary-100/50 rounded" />
                              <Skeleton className="h-8 w-8 bg-primary-100/50 rounded" />
                            </div>
                          </TableCell>
                          <TableCell className="px-2 xl:px-4 py-2 w-[100px] lg:w-[120px] xl:w-[140px]">
                            <Skeleton className="h-4 w-12 lg:w-16 bg-primary-100/50 ml-auto" />
                          </TableCell>
                          <TableCell
                            rowSpan={2}
                            className="px-2 xl:px-4 py-2 align-middle text-right w-[110px] lg:w-[125px] xl:w-[140px] border-l border-primary-50"
                          >
                            <div className="flex flex-col items-end gap-1 justify-center h-full">
                              <Skeleton className="h-3 w-12 lg:w-16 bg-primary-100/50" />
                              <Skeleton className="h-4 w-16 lg:w-24 bg-primary-100/50" />
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* Row 2: Diamond skeleton */}
                        <TableRow className="border-b-2 border-primary-100 divide-x divide-primary-50">
                          <TableCell className="px-2 xl:px-4 py-2 w-[110px] lg:w-[125px] xl:w-[140px]">
                            <Skeleton className="h-5 w-20 lg:w-24 bg-primary-100/50 rounded-full" />
                          </TableCell>
                          <TableCell className="px-2 xl:px-4 py-2">
                            <Skeleton className="h-4 w-32 lg:w-48 bg-primary-100/50 rounded-full" />
                          </TableCell>
                          <TableCell className="px-2 xl:px-4 py-2 text-center">
                            <Skeleton className="h-4 w-16 lg:w-24 bg-primary-100/50 rounded-full mx-auto" />
                          </TableCell>
                          <TableCell className="px-2 xl:px-4 py-2 w-[110px] lg:w-[145px] xl:w-[180px]">
                            <div className="flex justify-center gap-1">
                              <Skeleton className="h-8 w-8 bg-primary-100/50 rounded" />
                            </div>
                          </TableCell>
                          <TableCell className="px-2 xl:px-4 py-2 w-[100px] lg:w-[120px] xl:w-[140px]">
                            <Skeleton className="h-4 w-12 lg:w-16 bg-primary-100/50 ml-auto" />
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : !allCombos.length ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-primary-300 text-xs">
                  Không tìm thấy combo nào.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View: Cards Grid */}
                <div className="grid grid-cols-1 gap-6 md:hidden">
                  {allCombos.map((combo) => (
                    <ComboTableRow
                      key={`${combo.variant_serials_id}-${combo.diamonds_id}`}
                      combo={combo}
                    />
                  ))}
                </div>

                {/* Tablet & Desktop View: Table */}
                <Table className="hidden md:table w-full border-collapse">
                  <TableHeader className="hidden md:table-header-group">
                    <TableRow className="border-b border-primary-100 hover:bg-transparent">
                      <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 xl:px-4 py-0 text-left text-[11px] font-bold uppercase tracking-wider text-primary-700 w-[70px] lg:w-[80px] xl:w-[90px]">
                        Hình ảnh
                      </TableHead>
                      <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 xl:px-4 py-0 text-left text-[11px] font-bold uppercase tracking-wider text-primary-700 w-[110px] lg:w-[125px] xl:w-[140px]">
                        Định danh
                      </TableHead>
                      <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 xl:px-4 py-0 text-left text-[11px] font-bold uppercase tracking-wider text-primary-700 whitespace-normal min-w-[120px]">
                        Thông tin combo
                      </TableHead>
                      <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 xl:px-4 py-0 text-center text-[11px] font-bold uppercase tracking-wider text-primary-700 whitespace-normal min-w-[90px]">
                        Vị trí kho
                      </TableHead>
                      <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 xl:px-4 py-0 text-center text-[11px] font-bold uppercase tracking-wider text-primary-700 w-[110px] lg:w-[145px] xl:w-[180px]">
                        Hình ảnh thực tế
                      </TableHead>
                      <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 xl:px-4 py-0 text-right text-[11px] font-bold uppercase tracking-wider text-primary-700 w-[100px] lg:w-[120px] xl:w-[140px]">
                        Giá chi tiết
                      </TableHead>
                      <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 xl:px-4 py-0 text-right text-[11px] font-bold uppercase tracking-wider text-primary-700 w-[110px] lg:w-[125px] xl:w-[140px]">
                        Tổng cộng
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCombos.map((combo) => (
                      <ComboTableRows
                        key={`${combo.variant_serials_id}-${combo.diamonds_id}`}
                        combo={combo}
                        brokenImages={brokenImages}
                        onImageError={handleImageError}
                        onPreview={handlePreview}
                        onUploadSuccess={handleUploadSuccess}
                      />
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
            <div ref={lastElementRef} className="h-4 w-full" />
            {isFetchingNextPage && (
              <div className="py-6 flex justify-center items-center w-full">
                <LoadingSpinner size="md" />
              </div>
            )}
          </div>
        </div>
      </main>

      <MediaPreviewDialog
        previewUrl={mediaPreviewUrl}
        previewList={displayList}
        previewIndex={previewIndex}
        selectedMedia={selectedMedia}
        brokenImages={brokenImages}
        uploadConfig={uploadConfig}
        onImageError={handleImageError}
        onClose={closeMediaDialog}
        onPreview={handlePreview}
        onSelectMedia={setSelectedMedia}
        onDownloadSingle={handleDownloadSingle}
        onDownloadAll={handleDownloadAll}
        onUploadSuccess={handleUploadSuccess}
        isVideo={isVideo}
        webImages={allWebImages}
        actualImages={allActualImages}
        tryOnImages={[]}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "actual" || tab === "web") {
            setActiveTab(tab);
          }
        }}
      />
    </LayoutShell>
  );
}

function ComboTableRows({
  combo,
  brokenImages,
  onImageError,
  onPreview,
  onUploadSuccess,
}: {
  combo: any;
  brokenImages: Set<string>;
  onImageError: (url: string) => void;
  onPreview: (images: string[], index: number, config?: any) => void;
  onUploadSuccess: () => void;
  key?: string | number;
}) {
  const jewelry: ProductModel = combo.jewelry;
  const diamond: DiamondModel = combo.diamond;
  const variant: any = jewelry.variants?.[0] || {};

  const fourView = jewelry.attributes?.["4view"];
  const isBundle = jewelry.products && jewelry.products.length > 0;
  const subProductNam = jewelry.products?.find(
    (p: any) => p.attributes?.gender === "Nam",
  );
  const subProductNu = jewelry.products?.find(
    (p: any) => p.attributes?.gender === "Nữ",
  );
  const fourViewNam = subProductNam?.attributes?.["4view"];
  const fourViewNu = subProductNu?.attributes?.["4view"];
  const hasSideStonesNam =
    fourViewNam && Array.isArray(fourViewNam) && fourViewNam.length > 0;
  const hasSideStonesNu =
    fourViewNu && Array.isArray(fourViewNu) && fourViewNu.length > 0;

  const [displayCount, setDisplayCount] = useState(4);

  useEffect(() => {
    const check = () => {
      const width = window.innerWidth;
      if (width < 1024) {
        setDisplayCount(2);
      } else if (width < 1280) {
        setDisplayCount(3);
      } else {
        setDisplayCount(4);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const totalBasePrice =
    (variant?.basePrice || jewelry.basePrice || 0) + (diamond.basePrice || 0);
  const totalSalePrice =
    (variant?.salePrice || jewelry.salePrice || 0) + (diamond.salePrice || 0);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("vi-VN")} ₫`;
  };

  const jewelryPrice = variant?.salePrice || jewelry.salePrice || 0;
  const jewelryOriginalPrice = variant?.basePrice || jewelry.basePrice || 0;
  const diamondPrice = diamond.salePrice || 0;
  const diamondOriginalPrice = diamond.basePrice || 0;

  const jewelryImage = jewelry.thumbnails?.[0]?.url || jewelry.images?.[0]?.url;
  const jewelryWebImages = jewelry.thumbnails?.map((t) => t.url) || [];
  const jewelryActualImages = [
    ...(jewelry.images?.map((img) => img.url) || []),
    ...(jewelry.videos?.map((v) => v.url) || []),
  ];

  const diamondActualImages = [
    ...(diamond.images?.map((img) => img.url) || []),
    ...(diamond.videos?.map((v) => v.url) || []),
  ];

  const jewelrySpecs = [
    variant.attributes?.fineness,
    variant.attributes?.materialColor,
    variant.attributes?.ringSize ? `Ni ${variant.attributes.ringSize}` : null,
    formatGoldWeight(
      variant.attributes?.serialNumber?.goldWeight ||
        variant.attributes?.goldWeight,
    ) !== "-"
      ? formatGoldWeight(
          variant.attributes?.serialNumber?.goldWeight ||
            variant.attributes?.goldWeight,
        )
      : null,
  ]
    .filter(Boolean)
    .join(" - ");

  const formatEdgeSize = (value: number | string) => {
    const num = Number(value);
    return (Math.floor(num * 10) / 10).toFixed(1);
  };
  const sizeStr = diamond.attributes?.edgeSize1
    ? `${formatEdgeSize(Number(diamond.attributes.edgeSize1))}${
        diamond.attributes?.edgeSize2
          ? `x${formatEdgeSize(Number(diamond.attributes.edgeSize2))}`
          : ""
      }`
    : "";
  const caratStr = diamond.attributes?.carat
    ? `${diamond.attributes.carat}ct`
    : "";
  const diamondSpecs = [
    sizeStr,
    diamond.attributes?.color,
    diamond.attributes?.clarity,
    caratStr,
    diamond.attributes?.fluorescence || "None",
  ]
    .filter(Boolean)
    .join(" - ");

  const diamondProduct = {
    id: diamond.id,
    attributes: {
      designCode: `GIA${diamond.attributes?.giaId || ""}`,
    },
    products: [],
  } as unknown as ProductModel;

  return (
    <>
      {/* Row 1: Jewelry */}
      <TableRow className="border-b border-primary-50 divide-x divide-primary-50 hover:bg-primary-50/10 transition-colors">
        <TableCell
          rowSpan={2}
          className="px-2 xl:px-4 py-2 border-r border-primary-50 align-middle text-center w-[70px] lg:w-[80px] xl:w-[90px]"
        >
          <div className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0 overflow-hidden border border-primary-100 bg-primary-50/40 flex items-center justify-center mx-auto">
            {jewelryImage ? (
              <img
                src={jewelryImage}
                alt={jewelry.attributes?.designCode || ""}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  const showActual = jewelryWebImages.length === 0;
                  onPreview(
                    showActual ? jewelryActualImages : jewelryWebImages,
                    0,
                    {
                      productId: jewelry.id,
                      isActual: showActual,
                      designCode:
                        jewelry.attributes?.designCode || jewelry.title,
                      showUpload: false,
                    },
                  );
                }}
              />
            ) : (
              <div className="text-[10px] text-primary-300">No image</div>
            )}
          </div>
        </TableCell>
        <TableCell className="px-2 xl:px-4 py-2 text-left w-[130px] lg:w-[130px] xl:w-[140px]">
          <ProductCodes
            product={jewelry}
            isExpanded={false}
            className="w-[130px] lg:w-[130px] xl:w-[130px] !justify-start"
          />
        </TableCell>
        <TableCell className="px-2 xl:px-4 py-2 text-left whitespace-normal break-words min-w-75">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold text-primary-700">
              {jewelrySpecs}
            </span>
            {fourView && Array.isArray(fourView) && fourView.length > 0 && (
              <div>
                <SideStoneTooltip
                  fourView={fourView as any}
                  isExpanded={false}
                  className="text-[10px] px-1 py-0"
                />
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="px-2 xl:px-4 py-2 text-center whitespace-normal break-words min-w-32">
          <span className="text-[10px] font-semibold text-secondary-900">
            {formatWarehouseName(variant?.stockAt)}
          </span>
        </TableCell>
        <TableCell className="px-2 xl:px-4 py-2 text-center w-[110px] lg:w-[145px] xl:w-[180px]">
          <div className="flex justify-center">
            <CompactGallery
              images={jewelryActualImages}
              showUpload={false}
              brokenImages={brokenImages}
              onImageError={onImageError}
              onPreview={(images, index, config) => {
                onPreview(images, index, {
                  ...config,
                  productId: jewelry.id,
                  isActual: true,
                });
              }}
              designCode={jewelry.attributes?.designCode || jewelry.title}
              onUploadSuccess={onUploadSuccess}
              displayCount={displayCount}
            />
          </div>
        </TableCell>
        <TableCell className="px-2 xl:px-4 py-2 text-right w-[100px] lg:w-[120px] xl:w-[140px]">
          <div className="flex flex-col items-end leading-none">
            {jewelryOriginalPrice > jewelryPrice && (
              <span className="text-[10px] font-semibold text-primary-300 line-through opacity-60 mb-0.5">
                {formatPrice(jewelryOriginalPrice)}
              </span>
            )}
            <span className="text-xs font-semibold text-secondary-900">
              {formatPrice(jewelryPrice)}
            </span>
          </div>
        </TableCell>
        <TableCell
          rowSpan={2}
          className="px-2 xl:px-4 py-2 text-right align-middle w-[110px] lg:w-[125px] xl:w-[140px] border-l border-primary-50"
        >
          <div className="flex flex-col items-end leading-none justify-center h-full">
            {totalBasePrice > totalSalePrice && (
              <span className="text-[11px] font-semibold text-primary-300 line-through opacity-60 mb-1">
                {formatPrice(totalBasePrice)}
              </span>
            )}
            <span className="text-sm font-black text-secondary-900">
              {formatPrice(totalSalePrice)}
            </span>
          </div>
        </TableCell>
      </TableRow>

      {/* Row 2: Diamond */}
      <TableRow className="border-b-2 border-primary-100 divide-x divide-primary-50 hover:bg-primary-50/10 transition-colors">
        <TableCell className="px-2 xl:px-4 py-2 text-left w-[130px] lg:w-[130px] xl:w-[140px]">
          <ProductCodes
            product={diamondProduct}
            isExpanded={false}
            className="w-[130px] lg:w-[130px] xl:w-[130px] !justify-start"
          />
        </TableCell>
        <TableCell className="px-2 xl:px-4 py-2 text-left whitespace-normal break-words">
          <span className="text-[10px] font-semibold text-primary-700">
            {diamondSpecs}
          </span>
        </TableCell>
        <TableCell className="px-2 xl:px-4 py-2 text-center whitespace-normal break-words">
          <span className="text-[10px] font-semibold text-secondary-900">
            {formatWarehouseName(diamond.warehouses?.[0]?.name)}
          </span>
        </TableCell>
        <TableCell className="px-2 xl:px-4 py-2 text-center w-[110px] lg:w-[145px] xl:w-[180px]">
          <div className="flex justify-center">
            {diamondActualImages.length > 0 ? (
              <CompactGallery
                images={diamondActualImages}
                showUpload={false}
                brokenImages={brokenImages}
                onImageError={onImageError}
                onPreview={(images, index, config) => {
                  onPreview(images, index, {
                    ...config,
                    diamondId: diamond.id,
                  });
                }}
                designCode={`GIA${diamond.attributes?.giaId}`}
                onUploadSuccess={onUploadSuccess}
                displayCount={displayCount}
              />
            ) : (
              <span className="text-[10px] text-primary-300 italic">
                -
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="px-2 xl:px-4 py-2 text-right w-[100px] lg:w-[120px] xl:w-[140px]">
          <div className="flex flex-col items-end leading-none">
            {diamondOriginalPrice > diamondPrice && (
              <span className="text-[10px] font-semibold text-primary-300 line-through opacity-60 mb-0.5">
                {formatPrice(diamondOriginalPrice)}
              </span>
            )}
            <span className="text-xs font-semibold text-secondary-900">
              {formatPrice(diamondPrice)}
            </span>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}

function formatGoldWeight(weightInChi: number | null | undefined): string {
  if (
    weightInChi === undefined ||
    weightInChi === null ||
    isNaN(weightInChi) ||
    weightInChi <= 0
  )
    return "-";

  const roundedChi = Math.round(weightInChi * 100) / 100;
  const chiPart = Math.floor(roundedChi);
  const remainder = Math.round((roundedChi - chiPart) * 100);
  const phanPart = Math.floor(remainder / 10);
  const lyPart = remainder % 10;

  if (chiPart === 0) {
    if (phanPart === 0 && lyPart === 0) return "0p";
    return lyPart > 0 ? `${phanPart}p${lyPart}` : `${phanPart}p`;
  } else {
    if (phanPart === 0 && lyPart === 0) return `${chiPart}c`;
    return lyPart > 0
      ? `${chiPart}c${phanPart}${lyPart}`
      : `${chiPart}c${phanPart}`;
  }
}

function ComboTableRow({ combo }: { combo: any; key?: string | number }) {
  const jewelry: ProductModel = combo.jewelry;
  const diamond: DiamondModel = combo.diamond;
  const variant: any = jewelry.variants?.[0] || {};
  const isMobile = useIsMobile();
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1280 : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalBasePrice =
    (variant?.basePrice || jewelry.basePrice || 0) + (diamond.basePrice || 0);
  const totalSalePrice =
    (variant?.salePrice || jewelry.salePrice || 0) + (diamond.salePrice || 0);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("vi-VN")} ₫`;
  };

  const jewelryPrice = variant?.salePrice || jewelry.salePrice || 0;
  const jewelryOriginalPrice = variant?.basePrice || jewelry.basePrice || 0;
  const diamondPrice = diamond.salePrice || 0;
  const diamondOriginalPrice = diamond.basePrice || 0;
  const products = [
    {
      type: "jewelry" as const,
      product: jewelry,
      codeProduct: jewelry,
      variant: variant,
      image: jewelry.thumbnails?.[0]?.url || jewelry.images?.[0]?.url,
      title: `${jewelry.attributes?.designCode || ""}`.trim(),
      sku: variant?.sku,
      barcode: variant?.barcode,
      price: jewelryPrice,
      originalPrice: jewelryOriginalPrice,
    },
    {
      type: "diamond" as const,
      product: diamond,
      codeProduct: {
        id: diamond.id,
        attributes: {
          designCode: `GIA${diamond.attributes?.giaId || ""}`,
        },
        products: [],
      } as any,
      variant: undefined,
      image: getDiamondShapeImage(diamond.attributes?.shape || "Round"),
      title: `GIA${diamond.attributes?.giaId}`,
      sku: undefined,
      barcode: undefined,
      price: diamondPrice,
      originalPrice: diamondOriginalPrice,
    },
  ];

  const handleDetailsOpenChange = (open: boolean) => {
    setDetailsOpen(open);
  };

  const isTablet = !isMobile && !isDesktop;

  return (
    <>
      <div
        className={cn(
          "border border-primary-100 bg-white flex flex-col overflow-hidden transition-colors duration-200 select-none",
          !isDesktop &&
            "cursor-pointer hover:bg-primary-50/15 active:bg-primary-50/30",
        )}
        onClick={() => {
          if (isMobile) setDetailsOpen(true);
          else if (isTablet) setDialogOpen(true);
        }}
      >
        {products.map((product, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-center p-2 md:p-4",
              idx !== products.length - 1 && "border-b border-primary-50",
            )}
          >
            {/* Product thumbnail */}
            <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 border border-primary-100 overflow-hidden bg-primary-50/40 flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className={cn(
                    "w-full h-full object-cover",
                    product.type === "diamond" &&
                      "object-contain w-8 h-8 md:w-9 md:h-9",
                  )}
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </div>

            {/* Product info */}
            <div className="flex-1 ml-2 md:ml-3 min-w-0">
              <div className="font-medium text-xs text-primary-900 leading-tight flex items-center gap-2">
                <ProductCodes
                  product={product.codeProduct}
                  isExpanded={false}
                  className="w-[120px] md:w-[130px] !justify-start"
                />
              </div>

              {/* Additional info - only visible on desktop */}
              <div className="mt-1 hidden xl:grid xl:grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                {product.sku && (
                  <div className="text-primary-400">
                    SKU:{" "}
                    <span className="text-primary-700 font-semibold">
                      {product.sku}
                    </span>
                  </div>
                )}
                {product.barcode && (
                  <div className="text-primary-400">
                    Barcode:{" "}
                    <span className="text-primary-700 font-semibold">
                      {product.barcode}
                    </span>
                  </div>
                )}
                {product.type === "jewelry" ? (
                  <>
                    {product.variant?.attributes?.serialNumber && (
                      <div className="text-primary-400">
                        Serial:{" "}
                        <span className="text-primary-700 font-semibold">
                          {product.variant.attributes.serialNumber}
                        </span>
                      </div>
                    )}
                    {product.variant?.attributes?.ringSize && (
                      <div className="text-primary-400">
                        Ni nhẫn:{" "}
                        <span className="text-primary-700 font-semibold">
                          {product.variant.attributes.ringSize}
                        </span>
                      </div>
                    )}
                    {product.variant?.attributes?.fineness && (
                      <div className="text-primary-400">
                        Chất liệu:{" "}
                        <span className="text-primary-700 font-semibold">
                          {product.variant.attributes.fineness}
                        </span>
                      </div>
                    )}
                    <div className="text-primary-400">
                      TL vàng:{" "}
                      <span className="text-primary-700 font-semibold">
                        {formatGoldWeight(
                          product.variant?.attributes?.serialNumber
                            ?.goldWeight ||
                            product.variant?.attributes?.goldWeight,
                        )}
                      </span>
                    </div>
                    {product.variant?.stockAt && (
                      <div className="text-primary-400 col-span-2">
                        Kho:{" "}
                        <span className="text-primary-700 font-semibold">
                          {formatWarehouseName(product.variant.stockAt)}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-primary-400">
                      Kích thước:{" "}
                      <span className="text-primary-700 font-semibold">
                        {product.product.attributes?.edgeSize1
                          ? `${Number(product.product.attributes.edgeSize1).toFixed(1)}${product.product.attributes?.edgeSize2 ? `x${Number(product.product.attributes.edgeSize2).toFixed(1)}` : ""}`
                          : ""}
                      </span>
                    </div>
                    <div className="text-primary-400">
                      Thông số 4Cs:{" "}
                      <span className="text-primary-700 font-semibold">
                        {product.product.attributes.color} -{" "}
                        {product.product.attributes.clarity} -{" "}
                        {product.product.attributes.carat}ct -{" "}
                        {product.product.attributes.fluorescence}
                      </span>
                    </div>
                    {product.product.warehouses?.[0]?.name && (
                      <div className="text-primary-400 col-span-2">
                        Kho:{" "}
                        <span className="text-primary-700 font-semibold">
                          {formatWarehouseName(
                            product.product.warehouses[0].name,
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Mobile/tablet-only info (for diamond: 4Cs & size) */}
              {!isDesktop && product.type === "diamond" && (
                <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-primary-500 leading-tight">
                  <div>
                    <span className="font-semibold text-primary-700">
                      {product.product.attributes?.edgeSize1
                        ? `${formatEdgeSize(product.product.attributes.edgeSize1)}${
                            product.product.attributes?.edgeSize2
                              ? `x${formatEdgeSize(product.product.attributes.edgeSize2)}`
                              : ""
                          }`
                        : "—"}
                      {[
                        product.product.attributes.color,
                        product.product.attributes.clarity,
                        product.product.attributes.carat
                          ? `${product.product.attributes.carat}ct`
                          : "",
                        product.product.attributes.fluorescence,
                      ]
                        .filter(Boolean)
                        .join(" - ")}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile/tablet-only info (for jewelry: Ni, Vàng, TL vàng) */}
              {!isDesktop && product.type === "jewelry" && (
                <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-primary-500 leading-tight">
                  <div className="font-semibold text-primary-700">
                    {product.variant.attributes.ringSize > 0 && (
                      <>Ni {product.variant.attributes.ringSize} - </>
                    )}
                    {product.variant.attributes.fineness} -{" "}
                    {formatGoldWeight(
                      product.variant?.attributes?.serialNumber?.goldWeight ||
                        product.variant?.attributes?.goldWeight,
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="ml-2 md:ml-3 text-right flex flex-col items-end min-w-[100px]">
              {product.originalPrice > product.price && (
                <div className="text-[10px] md:text-xs text-primary-300 line-through truncate w-full text-right">
                  {formatPrice(product.originalPrice)}
                </div>
              )}
              <div className="text-sm font-medium text-primary-900">
                {formatPrice(product.price)}
              </div>
            </div>
          </div>
        ))}

        {/* Total section */}
        <div className="flex justify-between items-center px-3 py-2 border-t border-primary-50">
          <span className="text-xs font-medium text-primary-400 uppercase">
            TỔNG CỘNG
          </span>
          <div className="flex flex-col items-end">
            <div className="text-[10px] text-primary-300 line-through">
              {formatPrice(totalBasePrice)}
            </div>
            <span className="text-sm font-medium text-primary-900">
              {formatPrice(totalSalePrice)}
            </span>
          </div>
        </div>
      </div>

      {isMobile && (
        <BottomSheet
          open={detailsOpen}
          onOpenChange={handleDetailsOpenChange}
          title="Chi tiết nguyên chiếc"
          className="max-h-[92vh]"
          contentClassName="px-0"
        >
          <ComboDetailsSheetContent
            jewelry={jewelry}
            diamond={diamond}
            variant={variant}
            totalBasePrice={totalBasePrice}
            totalSalePrice={totalSalePrice}
            formatPrice={formatPrice}
          />
        </BottomSheet>
      )}

      {isTablet && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="w-[95%] max-w-sm gap-0 bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="px-4 py-3 border-b border-primary-100 bg-white">
              <DialogTitle className="text-sm font-bold text-secondary-900">
                Chi tiết nguyên chiếc
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[75vh] overflow-y-auto">
              <ComboDetailsSheetContent
                jewelry={jewelry}
                diamond={diamond}
                variant={variant}
                totalBasePrice={totalBasePrice}
                totalSalePrice={totalSalePrice}
                formatPrice={formatPrice}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2 py-px text-[11px] leading-snug">
      <span className="text-primary-400 shrink-0">{label}</span>
      <span className="font-medium text-secondary-900 text-right break-all">
        {value}
      </span>
    </div>
  );
}

function CompactPrice({
  className,
  sale,
  base,
  formatPrice,
}: {
  className?: string;
  sale: number;
  base?: number;
  formatPrice: (price: number) => string;
}) {
  const showStrike = (base ?? 0) > sale;
  return (
    <div className="text-right shrink-0">
      {showStrike && (
        <div className="text-[10px] text-primary-300 line-through leading-none">
          {formatPrice(base!)}
        </div>
      )}
      <div
        className={cn(
          "text-xs font-medium text-secondary-900 leading-tight",
          className,
        )}
      >
        {formatPrice(sale)}
      </div>
    </div>
  );
}

function ComboDetailsSheetContent({
  jewelry,
  diamond,
  variant,
  totalBasePrice,
  totalSalePrice,
  formatPrice,
}: {
  jewelry: ProductModel;
  diamond: DiamondModel;
  variant: any;
  totalBasePrice: number;
  totalSalePrice: number;
  formatPrice: (price: number) => string;
}) {
  const vAttributes = variant?.attributes || {};
  const jewelryImage = jewelry.thumbnails?.[0]?.url || jewelry.images?.[0]?.url;
  const jewelrySale = variant?.salePrice || jewelry.salePrice || 0;
  const jewelryBase = variant?.basePrice || jewelry.basePrice || 0;

  const fourView = jewelry.attributes?.["4view"];
  const isBundle = jewelry.products && jewelry.products.length > 0;
  const subProductNam = jewelry.products?.find(
    (p: any) => p.attributes?.gender === "Nam",
  );
  const subProductNu = jewelry.products?.find(
    (p: any) => p.attributes?.gender === "Nữ",
  );
  const fourViewNam = subProductNam?.attributes?.["4view"];
  const fourViewNu = subProductNu?.attributes?.["4view"];
  const hasSideStonesNam =
    fourViewNam && Array.isArray(fourViewNam) && fourViewNam.length > 0;
  const hasSideStonesNu =
    fourViewNu && Array.isArray(fourViewNu) && fourViewNu.length > 0;

  const d = diamond.attributes;
  const fourCs = [
    d?.color,
    d?.clarity,
    d?.carat ? `${d.carat}ct` : null,
    d?.fluorescence,
  ]
    .filter(Boolean)
    .join(" · ");
  const diamondSize = d?.edgeSize1
    ? `${Number(d.edgeSize1).toFixed(1)}${d?.edgeSize2 ? `×${Number(d.edgeSize2).toFixed(1)}` : ""}`
    : null;

  return (
    <div className="px-3 pb-1 space-y-2">
      {/* Nhẫn */}
      <div className="rounded-lg border border-primary-100 bg-primary-50/40 p-2.5">
        <div className="flex gap-2.5">
          <div className="size-11 shrink-0 border border-primary-100 bg-white overflow-hidden flex items-center justify-center">
            {jewelryImage ? (
              <img
                src={jewelryImage}
                alt=""
                className="size-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : null}
          </div>
          <div className="flex-1 min-w-0 flex justify-between items-center gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-medium text-primary-400 uppercase tracking-wider">
                Nhẫn
              </p>
              <p className="text-[12px] font-medium text-secondary-900 truncate leading-tight">
                {[jewelry.type, jewelry.attributes?.designCode]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </p>
            </div>
            <CompactPrice
              sale={jewelrySale}
              base={jewelryBase}
              formatPrice={formatPrice}
            />
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-primary-100/80 space-y-0">
          <DetailRow label="SKU" value={variant?.sku} />
          <DetailRow label="Serial" value={vAttributes.serialNumber} />
          <DetailRow label="Ni nhẫn" value={vAttributes.ringSize} />
          <DetailRow
            label="Vàng"
            value={[
              vAttributes.fineness,
              formatGoldWeight(
                vAttributes.serialNumber?.goldWeight || vAttributes.goldWeight,
              ) !== "-"
                ? formatGoldWeight(
                    vAttributes.serialNumber?.goldWeight ||
                      vAttributes.goldWeight,
                  )
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          />
          <DetailRow
            label="Kho"
            value={formatWarehouseName(variant?.stockAt)}
          />
          {isBundle ? (
            <>
              {hasSideStonesNam && (
                <div className="flex justify-between gap-2 py-px text-[11px] leading-snug">
                  <span className="text-primary-400 shrink-0">Đá tấm Nam</span>
                  <div className="font-medium text-secondary-900 text-right">
                    <SideStoneTooltip
                      fourView={fourViewNam as any}
                      isExpanded={false}
                    />
                  </div>
                </div>
              )}
              {hasSideStonesNu && (
                <div className="flex justify-between gap-2 py-px text-[11px] leading-snug">
                  <span className="text-primary-400 shrink-0">Đá tấm Nữ</span>
                  <div className="font-medium text-secondary-900 text-right">
                    <SideStoneTooltip
                      fourView={fourViewNu as any}
                      isExpanded={false}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            fourView &&
            Array.isArray(fourView) &&
            fourView.length > 0 && (
              <div className="flex justify-between gap-2 py-px text-[11px] leading-snug">
                <span className="text-primary-400 shrink-0">Đá tấm</span>
                <div className="font-medium text-secondary-900 text-right">
                  <SideStoneTooltip
                    fourView={fourView as any}
                    isExpanded={false}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Kim cương */}
      <div className="rounded-lg border border-primary-100 bg-primary-50/40 p-2.5">
        <div className="flex gap-2.5">
          <div className="size-11 shrink-0 border border-primary-100 bg-white overflow-hidden flex items-center justify-center p-1">
            <img
              src={getDiamondShapeImage(d?.shape || "Round")}
              alt=""
              className="size-8 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0 flex justify-between items-center gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-medium text-primary-400 uppercase tracking-wider">
                Kim cương
              </p>
              <p className="text-[12px] font-medium text-secondary-900 truncate leading-tight">
                GIA{d?.giaId || "—"}
                {d?.shape ? ` · ${d.shape}` : ""}
              </p>
            </div>
            <CompactPrice
              sale={diamond.salePrice || 0}
              base={diamond.basePrice}
              formatPrice={formatPrice}
            />
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-primary-100/80 space-y-0">
          {fourCs && <DetailRow label="4Cs" value={fourCs} />}
          <DetailRow label="Giác cắt" value={d?.cut} />
          <DetailRow label="Kích thước" value={diamondSize} />
          <DetailRow
            label="Kho"
            value={formatWarehouseName(diamond.warehouses?.[0]?.name)}
          />
        </div>
      </div>

      {/* Tổng */}
      <div className="flex justify-between items-center py-2 px-1">
        <span className="text-[10px] font-medium text-primary-400 uppercase tracking-wider">
          Tổng cộng
        </span>
        <CompactPrice
          className="text-sm"
          sale={totalSalePrice}
          base={totalBasePrice}
          formatPrice={formatPrice}
        />
      </div>
    </div>
  );
}
