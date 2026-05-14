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
      className="group relative h-full overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl"
    >
      <BorderBeam
        size={300}
        duration={8}
        colorFrom="var(--color-primary)"
        colorTo="var(--color-primary)"
        borderWidth={1.5}
      />

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[60px] transition-all duration-500 group-hover:h-56 group-hover:w-56 group-hover:bg-primary/20" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center p-8 text-center">
        {/* Icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 transition-transform duration-300 group-hover:scale-110">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>

        {/* Text */}
        <h3 className="text-xl font-semibold">
          AI Agent sẵn sàng
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Đang giám sát{" "}
          <span className="font-medium text-primary">110 cảnh báo rời bỏ</span>{" "}
          và tạo{" "}
          <span className="font-medium text-primary">91 đề xuất</span>{" "}
          theo thời gian thực.
        </p>

        {/* CTA Button */}
        <a
          href="/dashboard/agent"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-2.5 text-sm font-medium text-primary transition-all duration-300 hover:border-primary/50 hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(var(--primary),0.15)]"
        >
          Mở Agent
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>

        {/* Status indicator */}
        <div className="mt-5 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs text-muted-foreground">Đang hoạt động &mdash; Đồng bộ 2 phút trước</span>
        </div>
      </div>
    </motion.div>
  );
}
