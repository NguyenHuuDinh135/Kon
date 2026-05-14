"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

interface PageHeroBadge {
  icon: LucideIcon;
  text: string;
}

interface PageHeroProps {
  title: string;
  subtitle: string;
  description: string;
  badge?: PageHeroBadge;
}

export function PageHero({ title, subtitle, description, badge }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-8 md:p-12">
      {/* Mesh gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute -right-20 top-10 h-60 w-60 rounded-full bg-primary/15 blur-[80px]" />
        <div className="absolute -bottom-10 left-1/3 h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
          >
            <badge.icon className="h-3.5 w-3.5" />
            {badge.text}
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: badge ? 0.05 : 0 }}
          className="text-sm font-medium uppercase tracking-widest text-primary/80"
        >
          {subtitle}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: badge ? 0.15 : 0.1 }}
          className="mt-2 text-4xl font-bold tracking-tight text-foreground md:text-5xl"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: badge ? 0.25 : 0.2 }}
          className="mt-3 max-w-lg text-base text-muted-foreground"
        >
          {description}
        </motion.p>
      </div>
    </div>
  );
}
