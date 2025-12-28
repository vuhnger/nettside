"use client";

import { motion } from "framer-motion";
import { FaCode, FaRunning, FaBeer, FaMusic } from "react-icons/fa";

const StatsOverview = () => {
  const stats = [
    {
      icon: <FaCode className="text-2xl" />,
      value: "Loading...",
      label: "Timer kodet",
      color: "var(--ds-color-accent-base-default)",
    },
    {
      icon: <FaRunning className="text-2xl" />,
      value: "Loading...",
      label: "Km løpt i år",
      color: "var(--ds-color-brand2-base-default)",
    },
    {
      icon: <FaBeer className="text-2xl" />,
      value: "2025",
      label: "Unike øl",
      color: "var(--ds-color-success-base-default)",
    },
    {
      icon: <FaMusic className="text-2xl" />,
      value: "Loading...",
      label: "Timer musikk",
      color: "var(--ds-color-brand1-base-default)",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="w-full max-w-4xl mx-auto mt-8"
    >
      <p className="text-center text-sm text-muted-foreground mb-4">Meg i tall 📊</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + idx * 0.1 }}
            className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border hover:border-[color:var(--ds-color-accent-border-subtle)] transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div style={{ color: stat.color }}>{stat.icon}</div>
              <div className="text-xl md:text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StatsOverview;
