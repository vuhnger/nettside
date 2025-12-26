"use client";

import { motion } from "framer-motion";
import { FaCode, FaRunning, FaBeer, FaMusic } from "react-icons/fa";

const StatsCards = () => {
  const stats = [
    {
      icon: <FaCode className="text-2xl text-purple" />,
      value: "Loading...",
      label: "Timer kodet",
      colorClass: "text-purple",
      delay: 0.5,
    },
    {
      icon: <FaRunning className="text-2xl text-ocean" />,
      value: "Loading...",
      label: "Km i år",
      colorClass: "text-ocean",
      delay: 0.6,
    },
    {
      icon: <FaBeer className="text-2xl text-accent-green-dark" />,
      value: "2025",
      label: "Unike øl",
      colorClass: "text-accent-green-dark",
      delay: 0.7,
    },
    {
      icon: <FaMusic className="text-2xl text-purple-light" />,
      value: "Loading...",
      label: "Timer musikk",
      colorClass: "text-purple-light",
      delay: 0.8,
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: stat.delay }}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between"
        >
          <div className="mb-4">
            {stat.icon}
          </div>
          <div>
            <div className={`text-3xl font-bold mb-1 ${stat.colorClass}`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default StatsCards;
