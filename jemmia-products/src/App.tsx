import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import axiosRetry from "axios-retry";
import JewelryPage from "./pages/JewelryPage";
import DiamondPage from "./pages/DiamondPage";
import ComboPage from "./pages/ComboPage";
import { PasswordGate } from "./components/auth/PasswordGate";

import { API_BASE_URL } from "./config";

if (import.meta.env.PROD) {
  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.withCredentials = true;
}
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status ?? 0) >= 500;
  }
});
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("site_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  }
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("/auth/verify");
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem("site_auth_token");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();

    const handleLogout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem("site_auth_token");
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  if (isChecking) return null;

  if (!isAuthenticated) {
    return <PasswordGate onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/jewelry" element={<JewelryPage />} />
          <Route path="/diamonds" element={<DiamondPage />} />
          <Route path="/combos" element={<ComboPage />} />
          <Route path="/" element={<Navigate to="/jewelry" replace />} />
          <Route path="*" element={<Navigate to="/jewelry" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

