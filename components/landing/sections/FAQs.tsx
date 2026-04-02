"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import { FAQS } from "@/lib/constants";
import { ShineBorder } from "@/components/landing/ui/shine-border";

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group relative glass rounded-md overflow-hidden transition-all duration-300 cursor-pointer ${
        isOpen 
          ? "border-[var(--color-violet-accent)]/50 shadow-[0_0_32px_rgba(124,58,237,0.15)] bg-gradient-to-br from-white/[0.08] to-white/[0.02]" 
          : "glass-hover"
      }`}
      onClick={onToggle}
    >
      
      <ShineBorder shineColor={["#7C3AED", "#FFFFFF", "#7a5af8"]} />
      
      <div className="flex items-center justify-between px-6 py-5 gap-4">
        <span className={`text-lg font-semibold transition-all duration-300 ${
          isOpen ? "text-[var(--color-lavender)]" : "text-[var(--color-text-primary)]"
        }`}>
          {question}
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? "bg-gradient-to-br from-[var(--color-violet-accent)] to-[var(--color-indigo-accent)] shadow-[0_0_16px_rgba(124,58,237,0.6)] scale-110"
              : "bg-white/8"
          }`}
        >
          {isOpen ? (
            <Minus size={16} className="text-white" />
          ) : (
            <Plus size={16} className="text-white" />
          )}
        </motion.span>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="px-6 pb-6 border-t border-white/8"
            >
              <div className="pt-4">
                <p className="text-base text-white leading-relaxed">
                  {answer}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="py-16 md:py-12 relative overflow-x-clip " id="faqs">
      
      <GlowOrb className="top-1/2 right-0" color="rgba(124, 58, 237, 0.4)" size="600px" />
      <GlowOrb className="top-0 left-0" color="rgba(124, 58, 237, 0.4)" size="600px" />

      <div className="section-padding relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-16 lg:gap-24 items-start">

          {/* Left */}
          <motion.div 
            ref={leftRef} 
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                Got questions?{" "}
                <span className="gradient-text">We&apos;ve got answers.</span>
              </h2>
              <p className="text-white text-lg leading-relaxed">
                Everything you need to know about Novare Talent — how we work, who we serve, and what makes us different.
              </p>
            </div>
          </motion.div>

          {/* Right — FAQ Items */}
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <FAQItem
                key={i}
                index={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
