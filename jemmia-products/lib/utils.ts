import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDiamondShapeImage(shape?: string): string {
  const normalizedShape = shape?.toUpperCase() || "";
  switch (normalizedShape) {
    case "EMERALD":
      return "https://cdn.hstatic.net/products/200000355853/emerald-diamond_d0a887711dad4c1db4fafaca171c2134_large.png";
    case "HEART":
      return "https://cdn.hstatic.net/products/200000355853/heart-diamond_0219cf2d0efc418dbc4a07fe6f905f97_large.png";
    case "RADIANT":
      return "https://cdn.hstatic.net/products/200000355853/radiant-diamond_a0d3c03bedf5486d9f151ce9aa92af86_large.png";
    case "PEAR":
      return "https://cdn.hstatic.net/products/200000355853/pear-diamond_480779adb258446b99397fa337641506_large.png";
    case "OVAL":
      return "https://cdn.hstatic.net/products/200000355853/oval-diamond_c746e137363a443daed440b3b6b95c70_large.png";
    default:
      return "https://cdn.hstatic.net/files/200000355853/file/salesaya_image_131__1_.png";
  }
}

export function getPaginationRange(currentPage: number, totalPages: number) {
  // Thay đổi delta từ 2 xuống 1 để tiết kiệm diện tích (chỉ hiện 1 trang kề bên)
  const delta = 1;
  const range = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l !== undefined) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

export function formatWarehouseName(name: string | null | undefined): string {
  if (!name) return "";
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes("hcm") || lower.includes("hồ chí minh")) {
    return "Hồ Chí Minh";
  }
  if (lower.includes("hn") || lower.includes("hà nội")) {
    return "Hà Nội";
  }
  if (lower.includes("ct") || lower.includes("cần thơ")) {
    return "Cần Thơ";
  }
  if(lower.includes("sc")) {
    return "Cung ứng";
  }
  return trimmed;
}
