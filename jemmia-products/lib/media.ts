import { API_BASE_URL } from "@/src/config";
import { toast } from "sonner";

export const isVideo = (url: string): boolean =>
  !!url.match(/\.(mp4|webm|ogg|mov)(?:\?|$)|^blob:|^data:video/i);

export const isHeic = (url: string): boolean =>
  !!url.match(/\.(heic|heif)(?:\?|$)/i);

export const getDisplayUrl = (url: string): string => {
  return isHeic(url) ? `${API_BASE_URL}/site/files/cloudflare-transform?url=${encodeURIComponent(url)}` : url;
};


export function convertToPngBlob(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const objectUrl = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to get 2D context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((pngBlob) => {
        URL.revokeObjectURL(objectUrl);
        if (pngBlob) {
          resolve(pngBlob);
        } else {
          reject(new Error("Failed to convert canvas to png blob"));
        }
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for png conversion"));
    };
    img.src = objectUrl;
  });
}

export async function copyImage(imageUrl: string): Promise<boolean> {
  try {
    let blob: Blob;
    if (imageUrl.startsWith("data:")) {
      const parts = imageUrl.split(",");
      const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      blob = new Blob([u8arr], { type: mime });
    } else {
      const cacheBusterUrl = imageUrl + (imageUrl.includes("?") ? "&" : "?") + "cb=" + new Date().getTime();
      const response = await fetch(cacheBusterUrl, { mode: "cors", cache: "no-store" });
      blob = await response.blob();
    }

    let finalBlob = blob;
    if (blob.type !== "image/png") {
      finalBlob = await convertToPngBlob(blob);
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": finalBlob,
      }),
    ]);
    toast.success("Đã sao chép hình ảnh vào bộ nhớ tạm");
    return true;
  } catch (err) {
    console.error("Failed to copy image:", err);
    toast.error("Không thể sao chép hình ảnh");
    return false;
  }
}

export type RawMediaItem = string | { url?: string } | null | undefined;
export type RawMediaInput = RawMediaItem[] | null | undefined;

/**
 * Normalizes and extracts media URL strings
 * @returns A clean array of valid URL strings.
 */
export const extractUrls = (arr: RawMediaInput): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && typeof item.url === 'string') {
        return item.url;
      }
      return null;
    })
    .filter((url): url is string => !!url);
};
interface ResizeAndCompressOptions {
  url: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export function resizeAndCompressImage({
  url,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.85,
}: ResizeAndCompressOptions): Promise<string> {
  return new Promise((resolve) => {
    if (!url || (!url.startsWith("data:image") && !url.startsWith("http") && !url.startsWith("/"))) {
      resolve(url);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(url);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      } catch (e) {
        console.warn("Failed to compress image due to canvas/CORS error, fallback to original url:", e);
        resolve(url);
      }
    };
    img.onerror = () => {
      resolve(url);
    };
    img.src = url;
  });
}
