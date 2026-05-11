import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PasswordGateProps {
  onSuccess: () => void;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Artificial delay to feel "secure" and show loading state as requested
    setTimeout(() => {
      const sitePassword = import.meta.env.VITE_SITE_PASSWORD;
      
      if (!sitePassword) {
        console.warn("VITE_SITE_PASSWORD is not set in environment variables.");
      }

      if (password === sitePassword) {
        localStorage.setItem("site_authenticated", "true");
        onSuccess();
      } else {
        setError("Mật khẩu không chính xác. Vui lòng thử lại.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full sm:w-[500px] overflow-hidden border-primary-100 shadow-2xl">
          <CardHeader className="bg-white pb-8 pt-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-900 shadow-lg shadow-secondary-900/20">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="font-sans text-2xl font-black uppercase tracking-wider text-secondary-900">
              TRUY CẬP HỆ THỐNG
            </CardTitle>
            <CardDescription className="font-sans text-xs font-bold uppercase tracking-wider text-primary-300">
              Vui lòng nhập mật khẩu để tiếp tục
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-primary-100 bg-primary-50/50 px-4 font-sans font-medium text-secondary-900 placeholder:text-primary-200"
                  autoFocus
                />
                
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert variant="destructive" className="border-none bg-red-50 py-3 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="mt-0.5 text-xs text-red-600 font-bold tracking-tight">
                          {error}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                type="submit"
                disabled={loading || !password}
                className="h-12 w-full bg-secondary-900 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-secondary-800 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
