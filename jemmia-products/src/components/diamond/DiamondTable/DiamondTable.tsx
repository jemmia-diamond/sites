import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DiamondModel, DiamondStockStatus } from "../../../types";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DiamondTableRow } from "./DiamondTableRow";
import { GiaCertificateDialog } from "./GiaCertificateDialog";
import { MediaPreviewDialog } from "../../jewelry/JewelryTable/JewelryTable";
import { Spinner } from "@/components/ui/spinner";
import { downloadFile, downloadFiles } from "@/lib/download";
import { isVideo } from "@/lib/media";

interface DiamondTableProps {
  diamonds: DiamondModel[];
  lastElementRef?: (node: HTMLElement | null) => void;
  isFetchingNextPage?: boolean;
  expandedId: string | null;
  onToggleExpand: (id: string | null) => void;
  stockStatus?: DiamondStockStatus;
}

export function DiamondTable({ diamonds, lastElementRef, isFetchingNextPage, expandedId, onToggleExpand, stockStatus }: DiamondTableProps) {
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Media Preview State
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [previewList, setPreviewList] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [uploadConfig, setUploadConfig] = useState<{ showUpload?: boolean; designCode?: string; uploadEndpoint?: string; diamondId?: string; } | null>(null);

  useEffect(() => {
    if (!uploadConfig?.diamondId) return;
    const activeDiamond = diamonds.find((d) => d.id === uploadConfig.diamondId);
    if (!activeDiamond) return;

    const newImages = [
      ...(activeDiamond.images?.map((img) => img.url) || []),
      ...(activeDiamond.videos?.map((v) => v.url) || []),
    ];

    setPreviewList(newImages);
  }, [diamonds, uploadConfig]);

  const handleImageError = (url: string) =>
    setBrokenImages((prev) => new Set(prev).add(url));

  const handlePreview = (images: string[], index: number, config?: any) => {
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



  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["diamonds"] });
  };
return (
    <>
      <div className="relative border border-primary-100 bg-white shadow-none flex flex-col flex-1 min-h-0 w-full max-w-full xl:overflow-hidden">
        <div className="flex-1 xl:overflow-y-auto overflow-x-hidden md:overflow-x-auto min-w-0 w-full relative">
          <Table className="w-full border-collapse">
            <TableHeader className="hidden md:table-header-group">
              <TableRow className="border-b border-primary-100 hover:bg-transparent">
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 md:px-3 py-0 text-left text-[10px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap w-[170px]">Mã sản phẩm</TableHead>
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap">Thông số kỹ thuật</TableHead>
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap">Hình ảnh</TableHead>
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-right text-[10px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap">Giá (VND)</TableHead>
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap">Trạng thái</TableHead>
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap">Vị trí kho</TableHead>
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[10px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap">Tác vụ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diamonds.map((diamond) => (
                <DiamondTableRow
                  key={diamond.id}
                  diamond={diamond}
                  isExpanded={expandedId === diamond.id}
                  onGiaPdfClick={setPreviewUrl}
                  brokenImages={brokenImages}
                  onImageError={handleImageError}
                  onPreview={handlePreview}
                  onUploadSuccess={handleUploadSuccess}
                  onToggleExpand={(id) => onToggleExpand(expandedId === id ? null : id)}
                  stockStatus={stockStatus}
                />
              ))}
            </TableBody>
          </Table>
        <div ref={lastElementRef} className="h-4 w-full" />
        {isFetchingNextPage && (
          <div className="py-6 flex justify-center items-center w-full">
            <Spinner className="size-6 text-secondary-900" />
          </div>
        )}
      </div>

      <GiaCertificateDialog previewUrl={previewUrl} onClose={() => setPreviewUrl(null)} />

      <MediaPreviewDialog
        previewUrl={mediaPreviewUrl}
        previewList={previewList}
        previewIndex={previewIndex}
        selectedMedia={selectedMedia}
        brokenImages={brokenImages}
        uploadConfig={uploadConfig}
        onImageError={handleImageError}
        onClose={closeMediaDialog}
        onPreview={handlePreview}
        onSelectMedia={setSelectedMedia}
        onDownloadFile={downloadFile}
        onDownloadFiles={downloadFiles}
        onUploadSuccess={handleUploadSuccess}
        isVideo={isVideo}
      />
    </div>
  </>
  );
}
