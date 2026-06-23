import { API_BASE_URL } from "@/src/config";

export const isVideo = (url: string): boolean =>
  !!url.match(/\.(mp4|webm|ogg|mov)(?:\?|$)|^blob:|^data:video/i);

export const isHeic = (url: string): boolean =>
  !!url.match(/\.(heic|heif)(?:\?|$)/i);

export const getDisplayUrl = (url: string): string => {
  return isHeic(url) ? `${API_BASE_URL}/site/files/cloudflare-transform?url=${encodeURIComponent(url)}` : url;
};
