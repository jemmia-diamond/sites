import axios from "axios";
import { DiamondFilter, DiamondModel, PaginateResponse } from "../types";

export async function fetchDiamonds(filters: DiamondFilter): Promise<PaginateResponse<DiamondModel>> {
  const limit = filters.limit || 10;
  const offset = ((filters.page || 1) - 1) * limit;

  const defaultWarehouses = ["1592770", "1582708", "1110168", "1592778", "1593276"];
  const warehouseIdsToUse = filters.warehouseIds && filters.warehouseIds.length > 0 
    ? filters.warehouseIds 
    : defaultWarehouses;

  const params: any = {
    limit,
    offset,
    stockStatus: filters.stockStatus || "INCOMING",
    warehouseIds: warehouseIdsToUse,
    sortBySalePrice: filters.sortBySalePrice,
  };

  if (filters.searchQuery) {
    params.searchQuery = filters.searchQuery.toUpperCase().replace(/^GIA/, "");
  }

  if (filters.salePriceFrom !== undefined) {
    params.salePriceFrom = filters.salePriceFrom * 1000000;
  }
  if (filters.salePriceTo !== undefined) {
    params.salePriceTo = filters.salePriceTo * 1000000;
  }

  if (filters.edgeSizes && filters.edgeSizes.length > 0) {
    const expandedSizes = filters.edgeSizes.flatMap(size => {
      const results = [];
      // If size is like 6.3, we want 6.3, 6.31, 6.32, ..., 6.39
      // We generate 10 values starting from the selected size with 0.01 increments
      for (let i = 0; i <= 9; i++) {
        const val = size + (i * 0.01);
        results.push(parseFloat(val.toFixed(2)));
      }
      return results;
    });
    params.edgeSizes = expandedSizes;
  }
  if (filters.color && filters.color.length > 0) {
    params.color = filters.color;
  }
  if (filters.clarity && filters.clarity.length > 0) {
    params.clarity = filters.clarity;
  }
  if (filters.fluorescence && filters.fluorescence.length > 0) {
    params.fluorescence = filters.fluorescence;
  }

  const response = await axios.get<PaginateResponse<DiamondModel>>("/products/diamonds", { 
    params,
    paramsSerializer: {
      indexes: null // to produce warehouseIds=1&warehouseIds=2 instead of warehouseIds[0]=1&warehouseIds[1]=2
    }
  });
  return response.data;
}
