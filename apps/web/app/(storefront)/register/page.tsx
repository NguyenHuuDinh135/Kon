"use client";

import { useState } from "react";
import { register } from "@/lib/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Loader2, Lock, User, Mail, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await register({ username, email, password, role: "client" });
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Link href="/login" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Về trang đăng nhập
        </Link>

        <div className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-xl">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/10 blur-[60px]" />

          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold tracking-tight">Tạo tài khoản</span>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-6 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Tạo tài khoản thành công!</h3>
                <p className="text-sm text-muted-foreground mt-2">Đang chuyển hướng...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
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
                  <Label htmlFor="username" className="text-sm font-medium">Tên đăng nhập</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="Chọn tên đăng nhập"
                      className="h-11 pl-10"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Địa chỉ email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="h-11 pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" title="Ít nhất 8 ký tự" className="text-sm font-medium">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Tạo mật khẩu mạnh"
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
                    className="h-11 w-full rounded-xl font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tạo tài khoản...
                      </>
                    ) : (
                      "Tạo tài khoản"
                    )}
                  </Button>
                </div>
              </form>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Bằng việc tạo tài khoản, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
