"use client";

import { motion } from "motion/react";
import { BorderBeam } from "@workspace/ui/components/border-beam";
import { Sparkles, ArrowRight } from "lucide-react";

export function AiAgentCta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="group relative h-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl"
    >
      <BorderBeam
        size={300}
        duration={8}
        colorFrom="#14b8a6"
        colorTo="#06b6d4"
        borderWidth={1.5}
      />

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-[60px] transition-all duration-500 group-hover:h-56 group-hover:w-56 group-hover:bg-teal-500/20" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center p-8 text-center">
        {/* Icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 transition-transform duration-300 group-hover:scale-110">
          <Sparkles className="h-7 w-7 text-teal-400" />
        </div>

        {/* Text */}
        <h3 className="text-xl font-semibold text-white">
          AI Agent Ready
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Monitoring{" "}
          <span className="font-medium text-teal-400">110 churn alerts</span>{" "}
          and generating{" "}
          <span className="font-medium text-teal-400">91 recommendations</span>{" "}
          in real-time.
        </p>

        {/* CTA Button */}
        <a
          href="/dashboard/agent"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-6 py-2.5 text-sm font-medium text-teal-300 transition-all duration-300 hover:border-teal-500/50 hover:bg-teal-500/20 hover:text-teal-200 hover:shadow-[0_0_20px_rgba(20,184,166,0.15)]"
        >
          Open Agent
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>

        {/* Status indicator */}
        <div className="mt-5 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
          </span>
          <span className="text-xs text-zinc-500">Active &mdash; Last sync 2m ago</span>
        </div>
      </div>
    </motion.div>
  );
}
