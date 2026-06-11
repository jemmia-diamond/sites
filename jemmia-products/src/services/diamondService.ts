import axios from "axios";
import { DiamondFilter, DiamondModel, PaginateResponse } from "../types";

export async function fetchDiamonds(filters: DiamondFilter): Promise<PaginateResponse<DiamondModel>> {
  const limit = filters.limit || 10;
  const offset = ((filters.page || 1) - 1) * limit;

  const defaultWarehouses = ["1592770", "1582708", "1110168", "1592778", "1593276"];
  const warehouseIdsToUse = filters.warehouseIds && filters.warehouseIds.length > 0
    ? filters.warehouseIds
    : defaultWarehouses;

  let params: any = {};

  if (filters.searchQuery) {
    params = {
      limit,
      offset,
      searchQuery: filters.searchQuery.toUpperCase().replace(/^GIA/, ""),
      sortBySalePrice: filters.sortBySalePrice,
    };
  } else {
    params = {
      limit,
      offset,
      stockStatus: filters.stockStatus || "IN_STOCK",
      sortBySalePrice: filters.sortBySalePrice,
    };

    if (filters.stockStatus !== "REAL_INCOMING") {
      params.warehouseIds = warehouseIdsToUse;
    }

    if (filters.salePriceFrom !== undefined) {
      params.salePriceFrom = filters.salePriceFrom * 1000000;
    }
    if (filters.salePriceTo !== undefined) {
      params.salePriceTo = filters.salePriceTo * 1000000;
    }

    if (filters.edgeSizes && filters.edgeSizes.length > 0) {
      let hasCaratFrom = false;
      let hasCaratTo = false;

      const expandedSizes = filters.edgeSizes.flatMap(sizeItem => {
        let sizeVal: number;
        if (typeof sizeItem === "string") {
          if (sizeItem === "6.3_<1C") {
            sizeVal = 6.3;
            if (!hasCaratTo && filters.caratTo === undefined) params.caratTo = 0.99;
            if (!hasCaratFrom && filters.caratFrom === undefined) params.caratFrom = 0;
            hasCaratTo = true;
            hasCaratFrom = true;
          } else if (sizeItem === "6.3_>=1C") {
            sizeVal = 6.3;
            if (!hasCaratFrom && filters.caratFrom === undefined) params.caratFrom = 1;
            if (!hasCaratTo && filters.caratTo === undefined) params.caratTo = 2;
            hasCaratFrom = true;
            hasCaratTo = true;
          } else {
            sizeVal = parseFloat(sizeItem);
          }
        } else {
          sizeVal = sizeItem;
        }

        const results = [];
        for (let i = 0; i <= 9; i++) {
          const val = sizeVal + (i * 0.01);
          results.push(parseFloat(val.toFixed(2)));
        }
        return results;
      });
      // Remove duplicates if both 6.3 options were selected
      params.edgeSizes = Array.from(new Set(expandedSizes));
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
    if (filters.shapes && filters.shapes.length > 0) {
      params.shape = filters.shapes;
    }
    if (filters.caratFrom !== undefined) {
      params.caratFrom = filters.caratFrom;
    }
    if (filters.caratTo !== undefined) {
      params.caratTo = filters.caratTo;
    }
    if (filters.edgeLongFrom !== undefined) {
      params.edgeLongFrom = filters.edgeLongFrom;
    }
    if (filters.edgeLongTo !== undefined) {
      params.edgeLongTo = filters.edgeLongTo;
    }
    if (filters.edgeShortFrom !== undefined) {
      params.edgeShortFrom = filters.edgeShortFrom;
    }
    if (filters.edgeShortTo !== undefined) {
      params.edgeShortTo = filters.edgeShortTo;
    }
  }

  const response = await axios.get<PaginateResponse<DiamondModel>>("/site/products/diamonds", {
    params,
    paramsSerializer: {
      indexes: null // to produce warehouseIds=1&warehouseIds=2 instead of warehouseIds[0]=1&warehouseIds[1]=2
    }
  });
  return response.data;
}
