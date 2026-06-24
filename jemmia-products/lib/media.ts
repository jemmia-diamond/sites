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
      const response = await fetch(imageUrl);
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
