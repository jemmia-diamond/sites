import { DiamondFilter, DiamondModel, PaginateResponse } from "../types";

const BASE_URL = "https://api.salesaya.com/products/diamonds";

export async function fetchDiamonds(filters: DiamondFilter): Promise<PaginateResponse<DiamondModel>> {
  const params = new URLSearchParams();
  
  const limit = filters.limit || 10;
  const offset = ((filters.page || 1) - 1) * limit;
  
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());

  if (filters.salePriceFrom !== undefined) params.append("salePriceFrom", (filters.salePriceFrom * 1000000).toString());
  if (filters.salePriceTo !== undefined) params.append("salePriceTo", (filters.salePriceTo * 1000000).toString());
  
  if (filters.sortBySalePrice) {
    params.append("sortBySalePrice", filters.sortBySalePrice);
  }

  // Stock status
  if (filters.stockStatus && filters.stockStatus !== "all") {
    params.append("stockStatus", filters.stockStatus);
  }

  // Warehouses
  // If stockStatus is INCOMING, do not pass warehouseIds per user request
  if (filters.stockStatus === "INCOMING") {
    // Skip warehouseIds
  } else if (filters.warehouseIds && filters.warehouseIds.length > 0) {
    filters.warehouseIds.forEach(id => params.append("warehouseIds", id));
  } else {
    // User gave a default list in the example URL
    const defaultWarehouses = ["1592770", "1582708", "1110168", "1592778", "1593276"];
    defaultWarehouses.forEach(id => params.append("warehouseIds", id));
  }

  // Edge Sizes (mapping)
  if (filters.edgeSizes && filters.edgeSizes.length > 0) {
    filters.edgeSizes.forEach(size => {
      // If user selected 4 (4ly), we need to send 4, 4.01, ..., 4.09
      // Assuming filters.edgeSizes contains the base numbers like 4, 4.5, etc.
      // But the requirement says "nếu user chọn 4ly thì truyền edgeSizes=4&edgeSizes=4.01,.... &edgeSizes=4.09"
      // If the filter arrives as [4], we expand it.
      for (let i = 0; i <= 9; i++) {
        const value = size + (i / 100);
        params.append("edgeSizes", value.toFixed(2));
      }
    });
  }

  // Color
  if (filters.color && filters.color.length > 0) {
    filters.color.forEach(c => params.append("color", c));
  }

  // Clarity
  if (filters.clarity && filters.clarity.length > 0) {
    filters.clarity.forEach(c => params.append("clarity", c));
  }

  // Fluorescence
  if (filters.fluorescence && filters.fluorescence.length > 0) {
    filters.fluorescence.forEach(f => params.append("fluorescence", f));
  }

  const response = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch diamonds");
  }
  return response.json();
}
