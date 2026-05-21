import axios from "axios";
import { PaginateResponse } from "../types";
import { ProductModel, DiamondModel } from "../types";

export interface ComboItem {
  variant_serials_id: number;
  diamonds_id: number;
  jewelry: ProductModel;
  diamond: DiamondModel;
}

export interface ComboFilter {
  page?: number;
  limit?: number;
}

export async function fetchCombos(filters: ComboFilter): Promise<PaginateResponse<ComboItem>> {
  const limit = filters.limit || 10;
  const offset = ((filters.page || 1) - 1) * limit;

  const params: any = {
    limit,
    offset,
  };

  const response = await axios.get<PaginateResponse<ComboItem>>("/products/combos", {
    params
  });
  return response.data;
}