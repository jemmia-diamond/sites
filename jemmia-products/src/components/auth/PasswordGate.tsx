import React, { useState } from "react";
import axios from "axios";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/auth/login", { password });
      if (response.data && response.data.token) {
        localStorage.setItem("site_auth_token", response.data.token);
        onSuccess();
      } else {
        setError("Mật khẩu không chính xác. Vui lòng thử lại.");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Mật khẩu không chính xác. Vui lòng thử lại.");
      } else {
        setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px]"
      >
        <Card className="w-full overflow-hidden border-primary-100 shadow-2xl">
          <CardHeader className="bg-white pb-6 md:pb-8 pt-8 md:pt-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-900 shadow-lg shadow-secondary-900/20">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="font-sans text-lg md:text-2xl font-black uppercase tracking-wide md:tracking-wider text-secondary-900">
              TRUY CẬP HỆ THỐNG
            </CardTitle>
            <CardDescription className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-wide md:tracking-wider text-primary-300">
              Vui lòng nhập mật khẩu để tiếp tục
            </CardDescription>
          </CardHeader>

          <CardContent className="px-5 md:px-8 pb-6 md:pb-8">
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
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
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
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ĐANG ĐĂNG NHẬP...
                  </span>
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
