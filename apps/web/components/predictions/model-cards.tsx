"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { GitBranch, Target, Layers, BarChart3 } from "lucide-react";
import { MagicCard } from "@workspace/ui/components/magic-card";

const iconMap = {
  "git-branch": GitBranch,
  layers: Layers,
  target: Target,
  "bar-chart": BarChart3,
} as const;

interface ModelData {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  iconName: keyof typeof iconMap;
  accuracy: number | null;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  accentBg: string;
}

interface ModelCardsProps {
  models: ModelData[];
}

export function ModelCards({ models }: ModelCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {models.map((model, i) => {
        const Icon = iconMap[model.iconName];
        return (
          <motion.div
            key={model.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
          >
            <Link href={model.href} className="group block h-full">
              <MagicCard
                className="h-full rounded-2xl"
                gradientFrom={model.gradientFrom}
                gradientTo={model.gradientTo}
                gradientColor="#1a1a2e"
                gradientOpacity={0.6}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border ${model.accentBg}`}
                    >
                      <Icon className={`h-6 w-6 ${model.accentColor}`} />
                    </div>

                    {/* Accuracy Gauge */}
                    {model.accuracy !== null && (
                      <div className="relative flex h-16 w-16 items-center justify-center">
                        <svg
                          className="h-16 w-16 -rotate-90"
                          viewBox="0 0 64 64"
                        >
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="rgba(63,63,70,0.3)"
                            strokeWidth="4"
                          />
                          <motion.circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke={model.gradientFrom}
                            strokeWidth="4"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: "0 175.9" }}
                            animate={{
                              strokeDasharray: `${(model.accuracy / 100) * 175.9} 175.9`,
                            }}
                            transition={{
                              duration: 1.2,
                              delay: 0.4 + i * 0.1,
                              ease: "easeOut",
                            }}
                          />
                        </svg>
                        <span className="absolute text-xs font-bold text-white">
                          {model.accuracy.toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <h3 className="text-lg font-bold text-white">
                      {model.title}
                    </h3>
                    <p className="text-xs font-medium text-zinc-500">
                      {model.subtitle}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                      {model.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-xs font-medium text-zinc-500 transition-colors group-hover:text-teal-400">
                    <span>Explore model</span>
                    <svg
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </div>
                </div>
              </MagicCard>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
