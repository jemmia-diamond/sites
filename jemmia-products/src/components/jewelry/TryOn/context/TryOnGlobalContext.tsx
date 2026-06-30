import React, { createContext, useState, useEffect, use } from "react";
import axios from "axios";
import { ProductModel } from "../../../../types";
import { getSimpleHash } from "../utils/hash";
import { processTryOnResult } from "../utils/result";

export enum TryOnApiStatus {
  QUEUED = "queued",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface TryOnTask {
  taskId: string;
  ring: ProductModel;
  uploadedImage: string;
  status: TryOnApiStatus;
  resultImage: string | null;
  error: string | null;
  createdAt: number;
}

export interface TryOnGlobalContextValue {
  isTryOnOpen: boolean;
  openTryOn: () => void;
  closeTryOn: () => void;
  hasUnreadResult: boolean;
  setHasUnreadResult: (unread: boolean) => void;
  isTryOnGenerating: boolean;
  setIsTryOnGenerating: (generating: boolean) => void;
  tasks: TryOnTask[];
  addTask: (task: TryOnTask) => void;
  removeTask: (taskId: string) => void;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  isCameraActive: boolean;
  setIsCameraActive: (active: boolean) => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
}

export const TryOnGlobalContext = createContext<TryOnGlobalContextValue | null>(null);

export function TryOnGlobalProvider({ children }: { children: React.ReactNode }) {
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [hasUnreadResult, setHasUnreadResult] = useState(() => {
    return sessionStorage.getItem("tryon_unread_result") === "true";
  });

  const [tasks, setTasks] = useState<TryOnTask[]>(() => {
    try {
      const stored = sessionStorage.getItem("tryon_tasks");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isTryOnGeneratingState, setIsTryOnGeneratingState] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const isTryOnGenerating = tasks.some(t => t.status === TryOnApiStatus.QUEUED || t.status === TryOnApiStatus.PROCESSING);

  const openTryOn = () => setIsTryOnOpen(true);
  const closeTryOn = () => setIsTryOnOpen(false);

  const addTask = (task: TryOnTask) => {
    setTasks((prev) => {
      const filtered = prev.filter((t) => t.taskId !== task.taskId);
      return [task, ...filtered];
    });
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
  };

  // Sync tasks with session storage
  useEffect(() => {
    try {
      sessionStorage.setItem("tryon_tasks", JSON.stringify(tasks));
    } catch (e) {
      try {
        // Clear all cached images to free up space in sessionStorage
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith("tryon_cache_")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => sessionStorage.removeItem(key));

        // Try saving tasks again
        sessionStorage.setItem("tryon_tasks", JSON.stringify(tasks));
        return; // Success!
      } catch (retryErr) {
        console.warn("Still exceeded quota after clearing cache. Saving trimmed tasks to sessionStorage only...", retryErr);
      }

      // If still failing, save a trimmed version to sessionStorage, but DO NOT update the React state 'tasks'
      let trimmed = [...tasks];
      while (trimmed.length > 1) {
        trimmed.pop();
        try {
          sessionStorage.setItem("tryon_tasks", JSON.stringify(trimmed));
          break;
        } catch {}
      }
    }
  }, [tasks]);

  // Sync unread status with session storage
  useEffect(() => {
    try {
      sessionStorage.setItem("tryon_unread_result", hasUnreadResult ? "true" : "false");
    } catch {}
  }, [hasUnreadResult]);

  const pollSingleTask = async (task: TryOnTask): Promise<{ task: TryOnTask; changed: boolean }> => {
    if (task.status !== TryOnApiStatus.QUEUED && task.status !== TryOnApiStatus.PROCESSING) {
      return { task, changed: false };
    }

    if (task.taskId.startsWith("temp_")) {
      return { task, changed: false };
    }

    try {
      const response = await axios.get<{
        status: TryOnApiStatus;
        result?: { base64?: string; mimeType?: string; url?: string };
        error?: string;
      }>(`/image-generation/status/${task.taskId}`);

      const { status, result, error } = response.data;

      if (status === TryOnApiStatus.COMPLETED) {
        const finalImage = await processTryOnResult(result);

        if (finalImage) {


          return {
            task: {
              ...task,
              status: TryOnApiStatus.COMPLETED,
              resultImage: finalImage,
            },
            changed: true,
          };
        }
      } else if (status === TryOnApiStatus.FAILED) {
        return {
          task: {
            ...task,
            status: TryOnApiStatus.FAILED,
            error: error || "Không thể tạo hình ảnh thử trực tuyến.",
          },
          changed: true,
        };
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        return {
          task: {
            ...task,
            status: TryOnApiStatus.FAILED,
            error: "Phiên tạo ảnh đã hết hạn.",
          },
          changed: true,
        };
      }
    }
    return { task, changed: false };
  };

  // Poll generating tasks
  useEffect(() => {
    const generatingTasks = tasks.filter((t) => t.status === TryOnApiStatus.QUEUED || t.status === TryOnApiStatus.PROCESSING);
    if (generatingTasks.length === 0) return;

    const interval = setInterval(async () => {
      let hasChanges = false;
      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          const { task: updatedTask, changed } = await pollSingleTask(task);
          if (changed) hasChanges = true;
          return updatedTask;
        })
      );

      if (hasChanges) {
        setTasks(updatedTasks);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [tasks]);

  // Sync window/legacy properties
  useEffect(() => {
    (window as any).__tryon_is_generating = isTryOnGenerating;
    window.dispatchEvent(
      new CustomEvent("tryon:generating-change", {
        detail: { isGenerating: isTryOnGenerating },
      })
    );
  }, [isTryOnGenerating]);

  // Handle updates from custom events in case legacy parts dispatch them
  useEffect(() => {
    const handleOpen = () => setIsTryOnOpen(true);
    const handleUnread = (e: Event) => {
      const customEvent = e as CustomEvent<{ hasUnread: boolean }>;
      setHasUnreadResult(customEvent.detail?.hasUnread ?? false);
    };

    window.addEventListener("tryon:open", handleOpen);
    window.addEventListener("tryon:unread-change", handleUnread);

    return () => {
      window.removeEventListener("tryon:open", handleOpen);
      window.removeEventListener("tryon:unread-change", handleUnread);
    };
  }, []);

  return (
    <TryOnGlobalContext
      value={{
        isTryOnOpen,
        openTryOn,
        closeTryOn,
        hasUnreadResult,
        setHasUnreadResult,
        isTryOnGenerating,
        setIsTryOnGenerating: setIsTryOnGeneratingState,
        tasks,
        addTask,
        removeTask,
        activeTaskId,
        setActiveTaskId,
        isCameraActive,
        setIsCameraActive,
        isHistoryOpen,
        setIsHistoryOpen,
      }}
    >
      {children}
    </TryOnGlobalContext>
  );
}

export function useTryOnGlobal() {
  const context = use(TryOnGlobalContext);
  if (!context) {
    throw new Error("useTryOnGlobal must be used within a TryOnGlobalProvider");
  }
  return context;
}
