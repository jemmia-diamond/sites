import JSZip from "jszip";
import { saveAs } from "file-saver";
import { isVideo } from "./media";

export const downloadFile = async (url: string): Promise<void> => {
  try {
    const urlParts = url.split("/");
    let fileName = urlParts[urlParts.length - 1];
    if (fileName.includes("?")) {
      fileName = fileName.split("?")[0];
    }

    if (!fileName.includes(".")) {
      const ext = isVideo(url) ? "mp4" : "jpg";
      fileName = `media_${Date.now()}.${ext}`;
    }

    const cacheBusterUrl =
      url + (url.includes("?") ? "&" : "?") + "cb=" + new Date().getTime();

    try {
      const response = await fetch(cacheBusterUrl, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      saveAs(blob, fileName);
    } catch (fetchError) {
      console.warn("Fetch failed, falling back to window.open", fetchError);
      window.open(url, "_blank");
    }
  } catch (error) {
    console.error("Lỗi khi tải file:", url, error);
  }
};

export const downloadFiles = async (images: string[]): Promise<void> => {
  if (images.length === 0) return;

  if (images.length === 1) {
    await downloadFile(images[0]);
    return;
  }

  try {
    const zip = new JSZip();

    const fetchPromises = images.map(async (url, index) => {
      let fileName = url.split("/").pop() || `media_${index}`;
      if (fileName.includes("?")) {
        fileName = fileName.split("?")[0];
      }
      if (!fileName.includes(".")) {
        const ext = isVideo(url) ? "mp4" : "jpg";
        fileName = `media_${index}.${ext}`;
      }

      const cacheBusterUrl =
        url + (url.includes("?") ? "&" : "?") + "cb=" + new Date().getTime();
      try {
        const response = await fetch(cacheBusterUrl, {
          method: "GET",
          mode: "cors",
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Fetch failed");
        const blob = await response.blob();
        zip.file(`${index + 1}_${fileName}`, blob);
      } catch (err) {
        console.error("Lỗi khi tải file vào zip:", url, err);
      }
    });

    await Promise.all(fetchPromises);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `Jemmia_Media_${Date.now()}.zip`);
  } catch (error) {
    console.error("Lỗi khi tải file zip:", error);
  }
};

