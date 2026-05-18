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
}

export function DiamondTable({ diamonds }: DiamondTableProps) {
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
    setSelectedMedia(null);
    setUploadConfig(config || null);
  };

  const closeMediaDialog = () => {
    setMediaPreviewUrl(null);
    setSelectedMedia(null);
    setTimeout(() => setUploadConfig(null), 200);
  };

  const handleDownloadSingle = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="relative border border-primary-100 bg-white shadow-sm h-full overflow-hidden">
      <div className="h-full overflow-auto">
        <table className="w-full min-w-[1200px] border-collapse">
          <TableHeader>
            <TableRow className="border-b border-primary-100 hover:bg-transparent">
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-xs font-black text-secondary-900 whitespace-nowrap">Định danh</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-xs font-black text-secondary-900 whitespace-nowrap">Hình thực tế</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-xs font-black text-secondary-900 whitespace-nowrap">Hình minh họa</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-xs font-black text-secondary-900 whitespace-nowrap">Kích thước</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-xs font-black text-secondary-900 whitespace-nowrap">Trọng lượng</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-xs font-black text-secondary-900 whitespace-nowrap">Hình dạng</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-xs font-black text-secondary-900 whitespace-nowrap">Nước màu</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-xs font-black text-secondary-900 whitespace-nowrap">Độ sạch</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-xs font-black text-secondary-900 whitespace-nowrap">Huỳnh quang</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-right text-xs font-black text-secondary-900 whitespace-nowrap">Giá (VND)</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-xs font-black text-secondary-900 whitespace-nowrap">Trạng thái</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-xs font-black text-secondary-900 whitespace-nowrap">Vị trí kho</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-xs font-black text-secondary-900 whitespace-nowrap">Chứng nhận GIA</TableHead>
              <TableHead className="sticky top-0 z-50 bg-primary-50 h-10 px-2 py-0 text-center text-xs font-black text-secondary-900 whitespace-nowrap">Haravan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {diamonds.map((diamond) => (
              <DiamondTableRow
                key={diamond.id}
                diamond={diamond}
                onGiaPdfClick={setPreviewUrl}
                brokenImages={brokenImages}
                onImageError={handleImageError}
                onPreview={handlePreview}
                onUploadSuccess={handleUploadSuccess}
              />
            ))}
          </TableBody>
        </table>
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
      />
    </div>
  );
}