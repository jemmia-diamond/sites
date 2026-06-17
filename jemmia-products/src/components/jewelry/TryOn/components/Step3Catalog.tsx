import React from "react";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, ImageSquare, Sparkle } from "@phosphor-icons/react";
import { ProductModel } from "../../../../types";
import { MobileProgressBar } from "./MobileProgressBar";
import { RingSkeleton } from "./RingSkeleton";

interface MobileStep3Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoadingRings: boolean;
  isLoadingMore: boolean;
  rings: ProductModel[];
  selectedRing: ProductModel | null;
  handleSelectRing: (ring: ProductModel) => void;
  mobileSentinelRef: React.RefObject<HTMLDivElement>;
  setToastMessage: (msg: string | null) => void;
  handleTryOn: () => void;
  isTryingOn?: boolean;
  setStep?: (s: number) => void;
  maxStep?: number;
}

export function MobileStep3({
  searchQuery,
  setSearchQuery,
  isLoadingRings,
  isLoadingMore,
  rings,
  selectedRing,
  handleSelectRing,
  mobileSentinelRef,
  setToastMessage,
  handleTryOn,
  isTryingOn,
  setStep,
  maxStep,
}: MobileStep3Props) {
  return (
    <div className="grow flex flex-col justify-between gap-4 min-h-0 overflow-hidden">
      {/* Progress Bar & Info */}
      <div className="space-y-3">
        <MobileProgressBar activeCount={3} onStepClick={setStep} maxStep={maxStep} />
        <div className="space-y-1 text-start">
          <h4 className="text-primary-900 font-bold text-base tracking-tight leading-tight">
            Chọn trang sức của bạn
          </h4>
          <p className="text-xs text-primary-600 font-normal mt-1">
            Khám phá bộ sưu tập của chúng tôi và chọn một thiết kế để thử trực
            tiếp trên tay bạn
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative shrink-0">
        <input
          type="text"
          placeholder="Tìm theo mã sản phẩm, SKU, tên sản phẩm ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 text-xs font-semibold pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-full focus:outline-none focus:border-[#004B49] placeholder-[#7A869A]"
        />
        <MagnifyingGlass
          size={16}
          className="absolute right-4 top-3 text-[#7A869A]"
        />
      </div>

      {/* Catalog list area */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {isLoadingRings ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <RingSkeleton key={i} />
            ))}
          </div>
        ) : rings.length === 0 ? (
          <div className="h-full flex items-center justify-center text-primary-400 text-xs font-semibold">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {rings.map((ring) => {
              const isSelected = selectedRing?.id === ring.id;
              return (
                <div
                  key={ring.id}
                  onClick={() => handleSelectRing(ring)}
                  className={`bg-white border flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-300 hover:shadow-md ${
                    isSelected
                      ? "border-secondary-800"
                      : "border-primary-100 hover:border-primary-300"
                  }`}
                >
                  {ring.thumbnails?.[0]?.url ? (
                    <img
                      src={ring.thumbnails?.[0]?.url}
                      className="w-full aspect-square object-cover"
                      alt={ring.title}
                    />
                  ) : (
                    <div className="w-full aspect-square flex flex-col items-center justify-center bg-slate-100 text-[9px] font-bold text-slate-400 gap-1 select-none">
                      <ImageSquare size={20} className="text-slate-400" />
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="w-full p-1 text-start">
                    <p className="text-xs text-primary-600 truncate">
                      {ring.type || "Loại nhẫn"}
                    </p>
                    <p className="text-xs text-primary-900 truncate leading-snug mt-0.5">
                      {ring.attributes?.designCode || "--"}
                    </p>
                  </div>
                </div>
              );
            })}
            {/* Scroll Sentinel */}
            <div
              ref={mobileSentinelRef}
              className="col-span-3 h-10 flex items-center justify-center"
            >
              {isLoadingMore && (
                <div className="grid grid-cols-3 gap-2 w-full mt-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <RingSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions for Step 3 */}
      <div className="pt-2 shrink-0">
        <Button
          disabled={isTryingOn}
          onClick={() => {
            if (!selectedRing) {
              setToastMessage("Vui lòng chọn 1 chiếc nhẫn để tiếp tục");
              return;
            }
            handleTryOn();
          }}
          className="w-full bg-secondary-800 hover:bg-secondary-700 disabled:bg-secondary-800/50 text-white font-semibold text-sm h-12 flex items-center justify-center gap-2 rounded-none cursor-pointer border-none shadow-none"
        >
          {isTryingOn ? "Đang xử lý ở tab khác..." : "Thử Nhẫn"}
          <Sparkle size={18} />
        </Button>
      </div>
    </div>
  );
}

interface DesktopStep3LeftProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoadingRings: boolean;
  isLoadingMore: boolean;
  rings: ProductModel[];
  selectedRing: ProductModel | null;
  handleSelectRing: (ring: ProductModel) => void;
  desktopSentinelRef: React.RefObject<HTMLDivElement>;
}

export function DesktopStep3Left({
  searchQuery,
  setSearchQuery,
  isLoadingRings,
  isLoadingMore,
  rings,
  selectedRing,
  handleSelectRing,
  desktopSentinelRef,
}: DesktopStep3LeftProps) {
  return (
    <div className="grow flex flex-col min-h-0 gap-3">
      <div>
        <p className="text-primary-900 font-bold text-base tracking-tight leading-tight">
          Chọn trang sức của bạn
        </p>
        <p className="text-xs text-primary-600 font-normal mt-1">
          Khám phá bộ sưu tập của chúng tôi và chọn một thiết kế để thử trực
          tiếp trên tay bạn
        </p>
      </div>
      <div className="relative shrink-0 w-[400px] max-w-full">
        <input
          type="text"
          placeholder="Tìm theo mã sản phẩm, SKU, tên sản phẩm ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 text-xs font-semibold pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-full focus:outline-none focus:border-[#004B49] placeholder-[#7A869A]"
        />
        <MagnifyingGlass
          size={16}
          className="absolute right-4 top-3.5 text-primary-400"
        />
      </div>

      {/* Catalog list inside left panel */}
      <div className="flex-1 h-[200px] md:h-[260px] overflow-y-auto pr-1">
        {isLoadingRings ? (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <RingSkeleton key={i} />
            ))}
          </div>
        ) : rings.length === 0 ? (
          <div className="h-full flex items-center justify-center text-primary-400 text-xs font-semibold">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-0.5">
            {rings.map((ring) => {
              const isSelected = selectedRing?.id === ring.id;
              return (
                <div
                  key={ring.id}
                  onClick={() => handleSelectRing(ring)}
                  className={`bg-white border flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "border-secondary-800"
                      : "border-[#E0E0E0] hover:border-primary-300"
                  }`}
                >
                  {ring.thumbnails?.[0]?.url ? (
                    <img
                      src={ring.thumbnails?.[0]?.url}
                      className="w-full aspect-square object-cover"
                      alt={ring.title}
                    />
                  ) : (
                    <div className="w-full aspect-square flex flex-col items-center justify-center bg-slate-100 text-[9px] font-bold text-slate-400 gap-1 select-none">
                      <ImageSquare size={20} className="text-slate-400" />
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="w-full p-2 text-start">
                    <p className="text-xs text-primary-600 truncate">
                      {ring.type || "Loại nhẫn"}
                    </p>
                    <p className="text-xs text-primary-900 truncate leading-snug mt-0.5">
                      {ring.attributes?.designCode || "--"}
                    </p>
                  </div>
                </div>
              );
            })}
            {/* Scroll Sentinel */}
            <div
              ref={desktopSentinelRef}
              className="col-span-3 md:col-span-5 h-10 flex items-center justify-center"
            >
              {isLoadingMore && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 w-full mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <RingSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface DesktopStep3RightProps {
  selectedRing: ProductModel | null;
  handleTryOn: () => void;
  isTryingOn?: boolean;
}

export function DesktopStep3Right({
  selectedRing,
  handleTryOn,
  isTryingOn = false,
}: DesktopStep3RightProps) {
  return (
    <div className="grow h-full flex flex-col justify-between items-center min-w-0 overflow-y-auto">
      <div className="w-full flex flex-col justify-between grow pl-0 py-6 pr-6">
        <div className="border border-primary-100 rounded p-4">
          {/* Title */}
          <h3 className="text-primary-900 font-bold text-base select-none">
            Trang sức được lựa chọn
          </h3>

          {/* Selected product detail content */}
          {selectedRing ? (
            <div className="flex flex-col justify-between py-3">
              {/* Large image */}
              <div className="flex items-center justify-center min-h-64 mb-6">
                {selectedRing.thumbnails?.[0]?.url ? (
                  <img
                    src={selectedRing.thumbnails?.[0]?.url}
                    className="h-auto w-full min-h-64 aspect-square object-cover"
                    alt={selectedRing.title}
                  />
                ) : (
                  <div className="min-h-64 w-full aspect-square flex flex-col items-center justify-center bg-slate-100 border-slate-300 text-xs text-slate-400 gap-2 select-none">
                    <ImageSquare size={48} className="text-slate-400" />
                    <span>No Image</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3 text-left">
                <h4 className="text-secondary-900 font-black text-base leading-snug">
                  {selectedRing.type || "Loại nhẫn"} -{" "}
                  {selectedRing.attributes?.designCode || "--"}
                </h4>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-4 text-[#004B49]">
                <Sparkle size={32} />
              </div>
              <p className="text-sm font-semibold text-primary-500">
                Vui lòng chọn một trang sức để xem chi tiết và bắt đầu thử
                nghiệm.
              </p>
            </div>
          )}
        </div>

        {/* Try On Button */}
        <Button
          onClick={handleTryOn}
          disabled={!selectedRing || isTryingOn}
          className="w-full bg-secondary-800 text-white hover:bg-[#003C3A] disabled:bg-secondary-800/50 disabled:text-white h-12 rounded-none flex items-center justify-center gap-2 cursor-pointer border-none mt-6"
        >
          Thử Nhẫn
          <Sparkle size={16} weight="fill" />
        </Button>
      </div>
    </div>
  );
}
