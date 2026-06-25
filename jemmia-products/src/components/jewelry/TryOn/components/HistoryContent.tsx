import React, { useState, useEffect } from "react";
import { Copy, DownloadSimple, ArrowLeft, MagnifyingGlass } from "@phosphor-icons/react";
import { Spinner } from "@/components/ui/spinner";
import axios from "axios";
import { getJobIds } from "../utils/history";
import { FullscreenGallery } from "./FullscreenGallery";
import { copyImage } from "@/lib/media";
import { downloadFile } from "@/lib/download";

interface HistoryContentProps {
  onSelectImage?: (imageUrl: string) => void;
  activeImageUrl?: string | null;
  onClose?: () => void;
  isMobile?: boolean;
}

export function HistoryContent({
  onSelectImage,
  activeImageUrl,
  onClose,
  isMobile = false,
}: HistoryContentProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFullscreenUrl, setActiveFullscreenUrl] = useState<string | null>(null);

  const fetchJobs = async () => {
    const jobIds = getJobIds();
    if (jobIds.length === 0) {
      setJobs([]);
      return;
    }

    try {
      const response = await axios.post<{ list: any[] }>("/image-generation/jobs", {
        ids: jobIds,
      });
      const list = response.data.list || [];

      // Sort to match the order of jobIds in localStorage (newest first)
      const sortedList = [...list].sort((a, b) => {
        const indexA = jobIds.indexOf(a.Id);
        const indexB = jobIds.indexOf(b.Id);
        return (indexA === -1 ? 9999 : indexA) - (indexB === -1 ? 9999 : indexB);
      });

      setJobs(sortedList);
    } catch (e) {
      console.error("Failed to fetch jobs from server", e);
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      await fetchJobs();
      setIsLoading(false);
    };
    initialFetch();
    return () => {
      setJobs([]);
      setSearchQuery("");
    };
  }, []);

  // Polling for active (queued or processing) jobs
  useEffect(() => {
    if (jobs.length === 0) return;

    const hasActiveJobs = jobs.some(
      (job) => job.status === "queued" || job.status === "processing"
    );

    if (hasActiveJobs) {
      const timer = setInterval(() => {
        fetchJobs();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [jobs]);

  // Listen to local job list changes
  useEffect(() => {
    const handleJobChange = () => {
      fetchJobs();
    };
    window.addEventListener("tryon:job-change", handleJobChange);
    return () => {
      window.removeEventListener("tryon:job-change", handleJobChange);
    };
  }, []);

  const formatHistoryDate = (dateStr: string): string => {
    try {
      const normalized = dateStr.replace(" ", "T");
      const date = new Date(normalized);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleCopyLink = async (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    await copyImage(url);
  };

  const handleDownloadImage = async (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    await downloadFile(url);
  };

  const getJobImageUrl = (job: any): string | undefined => {
    const genImage = job.metadata?.generated_image;
    if (!genImage) return undefined;
    if (typeof genImage === "string") return genImage;
    if (genImage.url) return genImage.url;
    if (genImage.base64) {
      return genImage.base64.startsWith("data:")
        ? genImage.base64
        : `data:${genImage.mimetype || "image/png"};base64,${genImage.base64}`;
    }
    return undefined;
  };

  // Filter jobs based on search query (by design code / SKU)
  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const designCode = job.design?._design_code || "";
    return designCode.toLowerCase().includes(query);
  });

  // Get all completed image urls in currently filtered jobs
  const completedImageUrls = filteredJobs
    .filter((j) => j.status === "completed" && getJobImageUrl(j))
    .map((j) => getJobImageUrl(j)!);

  return (
    <div className="flex flex-col h-full min-h-0 select-none">
      {/* Mobile Title with Back Arrow */}
      {isMobile && (
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors border-none bg-transparent"
          >
            <ArrowLeft size={20} weight="bold" />
          </button>
          <span className="text-lg font-bold text-slate-900 font-sans">
            Lịch sử tạo ảnh
          </span>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="relative w-[40%] mb-4 shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo mã sản phẩm"
          className="w-full h-10 pl-4 pr-11 text-sm bg-white border border-slate-200 rounded-full font-sans font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-400 transition-colors"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <MagnifyingGlass size={20} />
        </div>
      </div>

      {/* Grid Area */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Spinner className="h-8 w-8 text-slate-400" />
            <span className="mt-3 text-xs text-slate-500 font-medium">Đang tải lịch sử...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <span className="text-sm font-medium">
              {searchQuery ? "Không tìm thấy kết quả phù hợp." : "Chưa có lịch sử tạo ảnh nào."}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredJobs.map((job) => {
              const imageUrl = getJobImageUrl(job);
              const isActive = imageUrl && activeImageUrl === imageUrl;
              const isCompleted = job.status === "completed" && imageUrl;
              const isProcessing = job.status === "queued" || job.status === "processing";
              const designCode = job.design?._design_code || "N/A";

              return (
                <div
                  key={job.Id}
                  onClick={() => {
                    if (isCompleted) {
                      setActiveFullscreenUrl(imageUrl!);
                    }
                  }}
                  className={`group relative flex flex-col bg-white border overflow-hidden transition-all duration-200 ${
                    isCompleted ? "cursor-pointer" : "cursor-default"
                      } ${
                    isActive
                      ? "border-teal-600 ring-2 ring-teal-600/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Image / Loading Container */}
                  <div className="relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden">
                    {isProcessing ? (
                      <div className="absolute inset-0 bg-neutral-100 flex flex-col items-center justify-center p-6">
                        <Spinner className="h-6 w-6 text-slate-400" />
                        <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 animate-pulse font-sans">
                          Đang xử lý...
                        </span>
                      </div>
                    ) : job.status === "failed" ? (
                      <div className="absolute inset-0 bg-red-50/50 flex flex-col items-center justify-center p-3 text-center text-red-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Tạo ảnh thất bại
                        </span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={imageUrl}
                          alt={designCode}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {/* Copy & Download Floating Buttons */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleCopyLink(e, imageUrl!)}
                            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-95 transition-all border border-slate-100 cursor-pointer"
                            title="Copy link ảnh"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDownloadImage(e, imageUrl!)}
                            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-95 transition-all border border-slate-100 cursor-pointer"
                            title="Tải ảnh xuống"
                          >
                            <DownloadSimple size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Info & Metadata */}
                  <div className="p-3 flex flex-col gap-0.5 border-t border-slate-100 bg-white">
                    <span className="text-sm font-bold text-slate-800 font-sans truncate">
                      {designCode}
                    </span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[11px] font-semibold text-slate-400 font-sans">
                        {formatHistoryDate(job.CreatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Gallery View */}
      {activeFullscreenUrl && (
        <FullscreenGallery
          mediaList={completedImageUrls}
          currentUrl={activeFullscreenUrl}
          onClose={() => setActiveFullscreenUrl(null)}
          onSelect={(url) => setActiveFullscreenUrl(url)}
        />
      )}
    </div>
  );
}
