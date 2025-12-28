"use client";

import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div className="text-center space-y-6">
      {/* Main heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <h1 className="text-5xl md:text-7xl font-bold">
          <span className="text-[color:var(--ds-color-accent-base-default)]">Victor Uhnger</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Masterstudent i Informatikk ved UiO
        </p>
      </motion.div>

      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[var(--ds-color-accent-base-default)] to-[var(--ds-color-brand1-base-default)] p-1">
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-3xl md:text-4xl font-bold text-[color:var(--ds-color-accent-base-default)]">
            VU
          </div>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex gap-4 justify-center"
      >
        <a
          href="/cv"
          className="px-6 py-2.5 rounded-lg bg-transparent border border-[var(--ds-color-accent-base-default)] text-[color:var(--ds-color-accent-base-default)] font-medium hover:border-[var(--ds-color-accent-base-hover)] transition-all"
        >
          CV
        </a>
        <a
          href="/projects"
          className="px-6 py-2.5 rounded-lg bg-transparent border border-[var(--ds-color-accent-base-default)] text-[color:var(--ds-color-accent-base-default)] font-medium hover:border-[var(--ds-color-accent-base-hover)] transition-all"
        >
          Prosjekter
        </a>
      </motion.div>
    </div>
  );
};

export default Hero;
