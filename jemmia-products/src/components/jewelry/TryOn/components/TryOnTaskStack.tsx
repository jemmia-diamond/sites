import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useTryOnGlobal, TryOnApiStatus } from "../context/TryOnGlobalContext";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useIsMobile";

export function TryOnTaskStack() {
  const { tasks, removeTask, setActiveTaskId, openTryOn, isCameraActive, setIsHistoryOpen } = useTryOnGlobal();
  const [showPopover, setShowPopover] = useState(false);
  const isMobile = useIsMobile();

  const cardHeight = isMobile ? 84 : 132;
  const spacingHeight = isMobile ? 92 : 140;

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === TryOnApiStatus.COMPLETED && b.status !== TryOnApiStatus.COMPLETED) return -1;
    if (a.status !== TryOnApiStatus.COMPLETED && b.status === TryOnApiStatus.COMPLETED) return 1;
    return b.createdAt - a.createdAt;
  });

  if (!tasks?.length || isCameraActive) {
    return null;
  }

  return (
    <div
      className="fixed bottom-16 md:bottom-4 right-4 z-[203] w-[230px] md:w-[320px] transition-all duration-300 ease-in-out"
      style={{
        height: showPopover ? `${sortedTasks.length * spacingHeight - 8}px` : `${cardHeight}px`,
      }}
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <div className="relative w-full h-full">
        {sortedTasks.map((task, i) => (
          <div
            key={task.taskId}
            className="absolute bottom-0 right-0 bg-secondary-900 border border-white text-white p-2.5 md:p-4 rounded-xl shadow-lg flex flex-col justify-between w-full h-[84px] md:h-[112px] text-start transition-all duration-300 ease-in-out"
            style={{
              transform: showPopover
                ? `translateY(-${i * spacingHeight}px) scale(1)`
                : `translateY(-${i * 8}px) scale(${1 - i * 0.04})`,
              zIndex: 50 - i,
              opacity: !showPopover && i > 2 ? 0 : 1,
              pointerEvents: !showPopover && i > 0 ? "none" : "auto",
            }}
          >
            <div className="flex gap-2 md:gap-3 items-start">
              {task.status === TryOnApiStatus.QUEUED || task.status === TryOnApiStatus.PROCESSING ? (
                <Spinner className="size-3.5 md:size-5 text-white shrink-0 mt-0.5" />
              ) : task.status === TryOnApiStatus.COMPLETED ? (
                <CheckCircleIcon size={isMobile ? 14 : 20} color="white" className="shrink-0 mt-0.5" />
              ) : (
                <div className="w-3.5 h-3.5 md:w-5 md:h-5 rounded-full border border-red-400 flex items-center justify-center shrink-0 mt-0.5 text-red-400 font-bold text-[9px] md:text-xs">
                  !
                </div>
              )}

              <div className="flex-1 flex flex-col text-start overflow-hidden">
                <span className="text-[8px] md:text-[10px] text-white/60 font-bold uppercase tracking-wider truncate">
                  {task.ring.type || "Nhẫn"} - {task.ring.attributes?.designCode || "--"}
                </span>
                <div className="text-[10px] md:text-xs text-white leading-tight mt-0.5 line-clamp-2">
                  {task.status === TryOnApiStatus.QUEUED || task.status === TryOnApiStatus.PROCESSING ? (
                    <span>
                      Quá trình xử lý ảnh sẽ tự động lưu trong{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsHistoryOpen(true);
                          openTryOn();
                        }}
                        className="underline text-white font-semibold hover:text-slate-200 transition-colors bg-transparent border-none p-0 inline cursor-pointer outline-none align-baseline"
                      >
                        Lịch sử
                      </button>
                    </span>
                  ) : task.status === TryOnApiStatus.COMPLETED ? (
                    "Quá trình tạo ảnh đã hoàn tất, hình ảnh của bạn đã sẵn sàng"
                  ) : (
                    `Lỗi: ${task.error || "Không thể tạo ảnh"}`
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 shrink-0 mt-0.5">
              {(task.status === TryOnApiStatus.COMPLETED ||
                task.status === TryOnApiStatus.QUEUED ||
                task.status === TryOnApiStatus.PROCESSING) && (
                <Button
                  variant={"ghost"}
                  onClick={() => {
                    setActiveTaskId(task.taskId);
                    openTryOn();
                    setShowPopover(false);
                  }}
                  className={"text-white hover:text-secondary-800"}
                  size={"sm"}
                >
                  Xem
                </Button>
              )}
              <Button
                variant={"ghost"}
                onClick={() => removeTask(task.taskId)}
                className={"text-white hover:text-secondary-800"}
                size={"sm"}
              >
                Đóng
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
