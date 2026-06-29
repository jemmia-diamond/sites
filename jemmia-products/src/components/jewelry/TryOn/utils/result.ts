import { resizeAndCompressImage } from "@/lib/media";

export async function processTryOnResult(
  result?: { base64?: string; mimeType?: string; url?: string }
): Promise<string> {
  const useBase64Env = import.meta.env.VITE_TRYON_USE_BASE64 === "true";
  if (useBase64Env) {
    if (result?.base64) {
      const imageUrl = `data:${result.mimeType || "image/png"};base64,${result.base64}`;
      return await resizeAndCompressImage({ url: imageUrl });
    }
  } else {
    if (result?.url) {
      return result.url;
    }
  }
  return "";
}
