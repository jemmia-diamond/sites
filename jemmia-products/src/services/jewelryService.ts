import axios from "axios";
import { JewelryFilter, PaginateResponse, ProductModel, ProductType } from "../types";

const API_BASE_URL = "https://api.salesaya.com";

export const jewelryService = {
  getProductTypes: async (): Promise<ProductType[]> => {
    const response = await axios.get<{ data: ProductType[] }>(`${API_BASE_URL}/product-types`);
    return response.data.data;
  },



  getJewelries: async (filters: JewelryFilter): Promise<PaginateResponse<ProductModel>> => {
    const limit = 21;
    const offset = ((filters.page || 1) - 1) * limit;

    // Mapping logic
    const params: any = {
      limit,
      offset,
    };

    if (filters.type) {
      params.type = filters.type;
    }

    // Warehouse logic
    const defaultWarehouses = ["1592770", "1582708", "1110168", "1592778", "1593276"];
    if (filters.warehouseIds && filters.warehouseIds.length > 0) {
      params.warehouseIds = filters.warehouseIds.flatMap(id => id.split(",")).filter(id => id && !isNaN(Number(id)));
    } else {
      params.warehouseIds = defaultWarehouses;
    }

    // Logic for Price
    const priceMultiplier = 1000000;
    let priceDivisor = 1;
    // Normalized type check
    const normalizedType = filters.type?.toLowerCase();
    if (normalizedType === "bông tai" || normalizedType === "bong-tai") {
      priceDivisor = 2;
    }

    if (filters.salePriceFrom !== undefined) {
      params.salePriceFrom = (filters.salePriceFrom * priceMultiplier) / priceDivisor;
    }
    
    if (filters.salePriceTo !== undefined) {
      params.salePriceTo = (filters.salePriceTo * priceMultiplier) / priceDivisor;
    }

    if (filters.stockStatus) {
      if (filters.stockStatus === "all") {
        // If warehouses are selected while in "All" mode, switch to IN_STOCK logic
        // Otherwise, use the default OUT_OF_STOCK logic for comprehensive view
        if (filters.warehouseIds && filters.warehouseIds.length > 0) {
          params.stockStatus = ["IN_STOCK"];
        } else {
          params.stockStatus = ["OUT_OF_STOCK"];
        }
      } else if (filters.stockStatus === "OUT_OF_STOCK") {
        // Map UI "OUT_OF_STOCK" to backend "REAL_OUT_OF_STOCK"
        params.stockStatus = ["REAL_OUT_OF_STOCK"];
      } else {
        params.stockStatus = [filters.stockStatus];
      }
    }

    if (filters.storageSize1 && filters.storageSize1.length > 0) {
      params.storageSize1 = filters.storageSize1;
    }

    if (filters.collectionIds && filters.collectionIds.length > 0) {
      params.collectionIds = filters.collectionIds;
    }

    if (filters.sortBySalePrice) {
      params.sortBySalePrice = filters.sortBySalePrice;
    }
    
    if (filters.designCode) {
      params.designCode = filters.designCode;
    }

    if (filters.searchQuery) {
      params.searchQuery = filters.searchQuery;
    }

    const response = await axios.get<PaginateResponse<ProductModel>>(`${API_BASE_URL}/products/jewelries`, {
      params,
      // Handle the multiple params with same key: ?warehouseIds=1&warehouseIds=2
      paramsSerializer: {
        indexes: null, 
      }
    });

    return response.data;
  }
};
