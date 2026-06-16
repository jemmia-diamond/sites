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
  salePriceFrom?: number;
  salePriceTo?: number;
  type?: string;
  warehouseIds?: string[];
  storageSize?: string[];
}

export async function fetchCombos(filters: ComboFilter): Promise<PaginateResponse<ComboItem>> {
  const limit = filters.limit || 10;
  const offset = ((filters.page || 1) - 1) * limit;

  const params: any = {
    limit,
    offset,
  };

  const priceMultiplier = 1000000;
  if (filters.salePriceFrom !== undefined) {
    params.salePriceFrom = filters.salePriceFrom * priceMultiplier;
  }
  if (filters.salePriceTo !== undefined) {
    params.salePriceTo = filters.salePriceTo * priceMultiplier;
  }
  if (filters.type) {
    params.type = filters.type;
  }
  if (filters.warehouseIds && filters.warehouseIds.length > 0) {
    params.warehouseIds = filters.warehouseIds.flatMap(id => id.split(",")).filter(id => id && !isNaN(Number(id)));
  }
  if (filters.storageSize && filters.storageSize.length > 0) {
    params.storageSize = filters.storageSize.flatMap((sizeStr) => {
      const base = parseFloat(sizeStr);
      if (isNaN(base)) return [sizeStr];
      const expanded: string[] = [];
      for (let i = 0; i <= 9; i++) {
        if (i === 0) {
          expanded.push(base.toFixed(1));
        } else {
          expanded.push((base + i * 0.01).toFixed(2));
        }
      }
      return expanded;
    });
  }

  const response = await axios.get<PaginateResponse<ComboItem>>("/site/products/combos", {
    params,
    paramsSerializer: {
      indexes: null,
    }
  });
  return response.data;
}
