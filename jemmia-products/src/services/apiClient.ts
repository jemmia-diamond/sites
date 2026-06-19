import axios, { AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
