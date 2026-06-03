import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DiamondModel } from "../../../types";
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

interface DiamondTableProps {
  diamonds: DiamondModel[];
  lastElementRef?: (node: HTMLElement | null) => void;
  isFetchingNextPage?: boolean;
  expandedId: string | null;
  onToggleExpand: (id: string | null) => void;
}

export function DiamondTable({ diamonds, lastElementRef, isFetchingNextPage, expandedId, onToggleExpand }: DiamondTableProps) {
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

  const handleDownloadSingle = async (url: string) => {
    try {
      const urlParts = url.split('/');
      let fileName = urlParts[urlParts.length - 1];
      if (fileName.includes('?')) {
        fileName = fileName.split('?')[0];
      }

      if (!fileName.includes('.')) {
         const ext = (url.includes('.mp4') || url.includes('.mov')) ? 'mp4' : 'jpg'; // Basic check since isVideo is not imported here, though it might be in JewelryTable
         fileName = `media_${Date.now()}.${ext}`;
      }

      const cacheBusterUrl = url + (url.includes('?') ? '&' : '?') + 'cb=' + new Date().getTime();

      try {
        const response = await fetch(cacheBusterUrl, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-store'
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
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
        window.open(url, '_blank');
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
    !!url.match(/\.(mp4|webm|ogg|mov)$|^blob:|^data:video/i);

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
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 md:px-3 py-0 text-left text-[11px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap w-[170px]">Mã sản phẩm</TableHead>
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[11px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap">Thông số kỹ thuật</TableHead>
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[11px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap">Hình ảnh</TableHead>
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-right text-[11px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap">Giá (VND)</TableHead>
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[11px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap">Trạng thái</TableHead>
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[11px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap">Vị trí kho</TableHead>
                <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-[11px] font-bold uppercase tracking-wider text-primary-700 whitespace-nowrap">Tác vụ</TableHead>
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
                />
              ))}
            </TableBody>
          </Table>
        <div ref={lastElementRef} className="h-4 w-full" />
        {isFetchingNextPage && (
          <div className="py-6 flex justify-center items-center w-full">
            <div className="h-6 w-6 relative">
              <div className="absolute inset-0 border-2 border-primary-50 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-t-secondary-900 rounded-full animate-spin"></div>
            </div>
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
        onDownloadSingle={handleDownloadSingle}
        onDownloadAll={handleDownloadAll}
        onUploadSuccess={handleUploadSuccess}
        isVideo={isVideo}
        webImages={[]}
        actualImages={[]}
        activeTab="actual"
        onTabChange={() => {}}
      />
    </div>
  </>
  );
}
