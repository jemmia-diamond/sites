import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JewelryPage from "./pages/JewelryPage";
import DiamondPage from "./pages/DiamondPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/jewelry" element={<JewelryPage />} />
          <Route path="/diamonds" element={<DiamondPage />} />
          <Route path="/" element={<Navigate to="/jewelry" replace />} />
          {/* Fallback for any other path */}
          <Route path="*" element={<Navigate to="/jewelry" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

