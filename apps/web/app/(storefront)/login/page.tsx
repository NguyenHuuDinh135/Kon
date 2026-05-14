"use client";

import { useState } from "react";
import { login, fetchMe } from "@/lib/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Loader2, Lock, User, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(username, password);
      // Fetch user profile to check role for better redirection
      const user = await fetchMe();
      
      if (user.role === "admin") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setError("Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError(msg || "Sai tên đăng nhập hoặc mật khẩu.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side - Animated Brand Panel */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-muted/30 lg:flex border-r">
        {/* Animated mesh gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -40, 20, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-primary/10 blur-[120px]"
          />
          <motion.div
            animate={{
              x: [0, -25, 35, 0],
              y: [0, 30, -25, 0],
              scale: [1, 0.9, 1.15, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-primary/5 blur-[100px]"
          />
        </div>

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Brand Content */}
        <div className="relative z-10 px-12 text-foreground">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold tracking-tighter">
                KON
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight xl:text-5xl">
              Thương mại thông minh
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Vận hành bởi AI.
              </span>
            </h2>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Phân tích ERP thời gian thực, dự đoán ML và trí tuệ khách hàng
              tự động — tất cả trong một nền tảng.
            </p>
          </motion.div>

          {/* Floating feature badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            {["Phân khúc RFM", "Dự đoán Churn", "Phân tích CLV"].map(
              (feature, i) => (
                <motion.span
                  key={feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className="rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm"
                >
                  {feature}
                </motion.span>
              )
            )}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-1 items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile brand header */}
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold">KON</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-xl">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/10 blur-[60px]" />

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Chào mừng trở lại
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Đăng nhập để truy cập bảng điều khiển và phân tích.
                </p>
              </motion.div>

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3"
                  >
                    <p className="text-sm text-destructive">{error}</p>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">
                    Tên đăng nhập
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="admin hoặc client"
                      className="h-11 pl-10"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" title="Nhập mật khẩu" className="text-sm font-medium text-foreground">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      className="h-11 pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-xl font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang đăng nhập...
                      </>
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Chưa có tài khoản?{" "}
                  <Link href="/register" className="text-primary hover:underline font-medium">
                    Tạo tài khoản
                  </Link>
                </p>
              </form>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
