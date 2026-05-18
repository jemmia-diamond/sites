import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import axiosRetry from "axios-retry";
import JewelryPage from "./pages/JewelryPage";
import DiamondPage from "./pages/DiamondPage";
import { PasswordGate } from "./components/auth/PasswordGate";

// Setup global axios defaults, interceptor and retry
// In development, requests go through the Vite proxy (same-origin, cookies sent automatically).
// In production, set the baseURL to the real API and enable withCredentials for cross-origin cookie support.
if (import.meta.env.PROD) {
  axios.defaults.baseURL = "http://localhost:80";
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
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();

    const handleLogout = () => {
      setIsAuthenticated(false);
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
          <Route path="/" element={<Navigate to="/jewelry" replace />} />
          <Route path="*" element={<Navigate to="/jewelry" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

