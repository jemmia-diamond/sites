import { DiamondFilter, DiamondModel, PaginateResponse } from "../types";

const BASE_URL = "https://api.salesaya.com/products/diamonds";

export async function fetchDiamonds(filters: DiamondFilter): Promise<PaginateResponse<DiamondModel>> {
  const params = new URLSearchParams();
  
  const limit = filters.limit || 10;
  const offset = ((filters.page || 1) - 1) * limit;
  
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());

  if (filters.searchQuery) {
    const cleanSearchQuery = filters.searchQuery.toUpperCase().replace(/^GIA/, "");
    params.append("searchQuery", cleanSearchQuery);
    
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch diamonds");
    }
    return response.json();
  }

  if (filters.salePriceFrom !== undefined) params.append("salePriceFrom", (filters.salePriceFrom * 1000000).toString());

  const response = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch diamonds");
  }
  return response.json();
}
