import axios from "axios";
import { DiamondFilter, DiamondModel, PaginateResponse } from "../types";

export async function fetchDiamonds(filters: DiamondFilter): Promise<PaginateResponse<DiamondModel>> {
  const limit = filters.limit || 10;
  const offset = ((filters.page || 1) - 1) * limit;

  const params: Record<string, any> = {
    limit,
    offset,
  };

  if (filters.searchQuery) {
    params.searchQuery = filters.searchQuery.toUpperCase().replace(/^GIA/, "");
  } else if (filters.salePriceFrom !== undefined) {
    params.salePriceFrom = filters.salePriceFrom * 1000000;
  }

  const response = await axios.get<PaginateResponse<DiamondModel>>("/site/products/diamonds", { params });
  return response.data;
}
