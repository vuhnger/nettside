"use client";

import { motion } from "framer-motion";
import { AiFillGithub } from "react-icons/ai";
import { FaLinkedinIn, FaStrava } from "react-icons/fa";
import MasterCountdown from "./MasterCountdown";
import StatsCards from "./StatsCards";

const BentoGrid = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="grid md:grid-cols-[1fr,300px] gap-8 items-start">
          {/* Left: Intro */}
          <div className="space-y-6">
            <div>
              <p className="text-gray-400 text-sm mb-2">Velkommen</p>
              <h1 className="text-5xl md:text-6xl font-bold mb-2">
                Hei, jeg er <span className="text-purple">Victor Uhnger</span>
              </h1>
              <p className="text-xl text-gray-400">
                masterstudent i Informatikk med fokus på programmering og nettverk.
              </p>
            </div>

            <p className="text-gray-300 max-w-2xl">
              Brenner for utvikling, åpen kildekode, og løsning av komplekse problemer.
              Jobber med alt fra full-stack utvikling til edge computing.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://github.com/vuhnger"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-lg border border-gray-700 hover:border-purple hover:bg-purple/10 transition-all"
              >
                <AiFillGithub className="text-xl" />
              </a>
              <a
                href="https://www.linkedin.com/in/victoruhnger"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-lg border border-gray-700 hover:border-ocean hover:bg-ocean/10 transition-all"
              >
                <FaLinkedinIn className="text-lg" />
              </a>
              <a
                href="https://www.strava.com/athletes/34349129"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-lg border border-gray-700 hover:border-orange-500 hover:bg-orange-500/10 transition-all"
              >
                <FaStrava className="text-lg" />
              </a>
              <a
                href="/cv"
                className="px-6 h-12 flex items-center justify-center rounded-lg bg-purple hover:bg-purple-dark transition-all font-medium"
              >
                Se CV
              </a>
            </div>
          </div>

          {/* Right: Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center md:justify-end"
          >
            <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-purple to-ocean p-1">
              <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                <span className="text-6xl font-bold text-purple">VU</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Master Countdown - Large Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <MasterCountdown />
        </motion.div>

        {/* About Me Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all"
        >
          <h3 className="text-xl font-bold mb-4">Om meg</h3>
          <p className="text-sm text-gray-400 mb-4">
            Full-stack utvikler, løper, og teknologientusiast ved UiO.
          </p>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Tech stack:</p>
            <div className="flex flex-wrap gap-2">
              {["TypeScript", "React", "Next.js", "Node.js", "Python", "Kotlin"].map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 rounded-md bg-gray-800 text-xs text-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <StatsCards />
      </div>
    </div>
  );
};

export default BentoGrid;
