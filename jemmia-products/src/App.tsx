import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JewelryPage from "./pages/JewelryPage";
import DiamondPage from "./pages/DiamondPage";
import { PasswordGate } from "./components/auth/PasswordGate";

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
    const auth = localStorage.getItem("site_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
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

