"use client";

import { motion } from "motion/react";

export function PredictionsHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-950 p-8 md:p-12">
      {/* Mesh gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-teal-500/20 blur-[100px]" />
        <div className="absolute -right-20 top-10 h-60 w-60 rounded-full bg-purple-600/15 blur-[80px]" />
        <div className="absolute -bottom-10 left-1/3 h-48 w-48 rounded-full bg-cyan-500/10 blur-[60px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-medium uppercase tracking-widest text-teal-400/80"
        >
          Machine Learning
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-2 text-4xl font-bold tracking-tight text-white md:text-5xl"
        >
          ML Predictions
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-3 max-w-lg text-base text-zinc-400"
        >
          Huan luyen va du doan voi 3 mo hinh: Cay quyet dinh, Gom cum, va Hoi
          quy Logistic.
        </motion.p>
      </div>
    </div>
  );
}
