"use client";

import { useState } from "react";
import { login } from "@/lib/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Loader2, Lock, User, Sparkles } from "lucide-react";
import { motion } from "motion/react";

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
      if (username === "admin") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Animated Brand Panel */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-zinc-950 lg:flex">
        {/* Animated mesh gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -40, 20, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-teal-500/25 blur-[120px]"
          />
          <motion.div
            animate={{
              x: [0, -25, 35, 0],
              y: [0, 30, -25, 0],
              scale: [1, 0.9, 1.15, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-emerald-600/20 blur-[100px]"
          />
          <motion.div
            animate={{
              x: [0, 20, -30, 0],
              y: [0, -20, 40, 0],
              scale: [1, 1.05, 0.9, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/15 blur-[80px]"
          />
        </div>

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Brand Content */}
        <div className="relative z-10 px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10">
                <Sparkles className="h-6 w-6 text-teal-400" />
              </div>
              <span className="text-3xl font-bold tracking-tighter text-white">
                KON
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white xl:text-5xl">
              Intelligent Commerce
              <br />
              <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Powered by AI.
              </span>
            </h2>
            <p className="mt-4 max-w-md text-lg text-zinc-400">
              Real-time ERP analytics, ML-driven predictions, and autonomous
              customer intelligence — all in one platform.
            </p>
          </motion.div>

          {/* Floating feature badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            {["RFM Segmentation", "Churn Prediction", "CLV Analytics"].map(
              (feature, i) => (
                <motion.span
                  key={feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className="rounded-full border border-zinc-700/50 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-300 backdrop-blur-sm"
                >
                  {feature}
                </motion.span>
              )
            )}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-zinc-950 px-6 lg:bg-zinc-900/30 lg:backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile brand header */}
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-400" />
              <span className="text-xl font-bold text-white">KON</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-8 backdrop-blur-xl">
            {/* Subtle glow */}
            <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-teal-500/10 blur-[60px]" />

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Welcome back
                </h1>
                <p className="mt-2 text-sm text-zinc-400">
                  Sign in to access your dashboard and analytics.
                </p>
              </motion.div>

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                  >
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-zinc-300"
                  >
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      id="username"
                      placeholder="admin or client"
                      className="h-11 border-zinc-700/50 bg-zinc-800/50 pl-10 text-white placeholder:text-zinc-500 focus:border-teal-500/50 focus:ring-teal-500/20"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-zinc-300"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="h-11 border-zinc-700/50 bg-zinc-800/50 pl-10 text-white placeholder:text-zinc-500 focus:border-teal-500/50 focus:ring-teal-500/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="relative h-11 w-full overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 font-medium text-white transition-all hover:from-teal-500 hover:to-emerald-500 hover:shadow-[0_0_24px_rgba(20,184,166,0.3)] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-center text-xs text-zinc-500"
              >
                Demo credentials: admin / admin123
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
