"use client";

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  onHelpClick?: () => void;
  actions?: ReactNode;
}

export function PageHeader({ title, description, onHelpClick, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 md:mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
          {title}
        </h1>
        <p className="text-white/70 text-base sm:text-lg">
          {description}
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 shrink-0"
      >
        {onHelpClick && (
          <button
            onClick={onHelpClick}
            className="p-2 rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] hover:border-[var(--color-lavender)]/50 transition-colors cursor-pointer"
            title="Start Guide"
          >
            <HelpCircle className="w-5 h-5 text-[var(--color-lavender)]" />
          </button>
        )}
        {actions}
      </motion.div>
    </div>
  );
}
