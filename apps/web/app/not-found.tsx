"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950">
      {/* Animated mesh gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-teal-500/15 blur-[140px]"
        />
        <motion.div
          animate={{
            x: [0, -35, 25, 0],
            y: [0, 25, -35, 0],
            scale: [1, 0.85, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-600/10 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 20, -20, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px]"
        />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Large 404 */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[10rem] font-black leading-none tracking-tighter md:text-[14rem]"
        >
          <span className="bg-gradient-to-b from-white via-zinc-400 to-zinc-700 bg-clip-text text-transparent">
            404
          </span>
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="-mt-4 text-lg text-zinc-400 md:text-xl"
        >
          This page drifted into the void.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-2 max-w-md text-sm text-zinc-500"
        >
          The page you are looking for does not exist or has been moved.
        </motion.p>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8"
        >
          <Button
            asChild
            className="h-11 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 font-medium text-white transition-all hover:from-teal-500 hover:to-emerald-500 hover:shadow-[0_0_24px_rgba(20,184,166,0.3)]"
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
