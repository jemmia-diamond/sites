import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDiamonds } from "../services/diamondService";
import { DiamondFilter } from "../types";
import { LayoutShell } from "../components/layout/LayoutShell";
import { DiamondFilterSidebar } from "../components/diamond/DiamondFilterSidebar";
import { DiamondTable } from "../components/diamond/DiamondTable";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";

import { PageHeader } from "../components/layout/PageHeader";

export default function DiamondPage() {
  const [filters, setFilters] = useState<DiamondFilter>({
    page: 1,
    limit: 10,
    sortBySalePrice: "DESC",
    stockStatus: "IN_STOCK"
  });

  const { data, isLoading } = useQuery({
    queryKey: ["diamonds", filters],
    queryFn: () => fetchDiamonds(filters),
    staleTime: 5 * 60 * 1000,
  });

  const handleApplyFilters = (newFilters: DiamondFilter) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const toggleSort = () => {
    const newSort = filters.sortBySalePrice === "DESC" ? "ASC" : "DESC";
    setFilters(prev => ({ ...prev, sortBySalePrice: newSort, page: 1 }));
  };

  const totalItems = data?.meta.totalRows || 0;
  const totalPages = data?.meta.totalPages || 1;
  const currentPage = filters.page || 1;

  return (
    <LayoutShell searchPlaceholder="Nhập mã để bắt đầu tìm kiếm">
      <DiamondFilterSidebar onApply={handleApplyFilters} />
      
      <main className="flex-1 bg-white overflow-y-auto p-10">
        <div className="mx-auto space-y-8">
          <PageHeader 
            title="Quản Lý Danh Mục Kim Cương"
            description={`Hiển thị ${data?.data.length || 0} trên ${totalItems} kết quả`}
            actions={
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
            }
          />

          <div className="min-h-[400px] space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 w-full rounded-none shadow-sm" />
                ))}
              </div>
            ) : !data || data.data.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-none border border-dashed border-primary-200">
                <p className="text-primary-400 font-medium">Không tìm thấy viên kim cương nào phù hợp với yêu cầu</p>
              </div>
            ) : (
              <DiamondTable diamonds={data.data} />
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
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, currentPage - 1) }))}
                      className="border border-primary-50 hover:border-secondary-900 hover:bg-white text-primary-200 hover:text-secondary-900 cursor-pointer rounded-none transition-all px-4 h-10 text-[10px] font-black tracking-widest disabled:opacity-30" 
                    />
                  </PaginationItem>
                  
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink 
                          onClick={() => setFilters(prev => ({ ...prev, page: p }))}
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
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, currentPage + 1) }))}
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
