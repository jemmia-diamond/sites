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
    default:
      return "https://cdn.hstatic.net/files/200000355853/file/salesaya_image_131__1_.png";
  }
}
