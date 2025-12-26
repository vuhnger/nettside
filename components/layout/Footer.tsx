"use client";

import { AiFillGithub } from "react-icons/ai";
import { FaLinkedinIn, FaStrava } from "react-icons/fa";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-black border-t border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            <p>Designet og utviklet av Victor Uhnger</p>
            <p className="text-xs mt-1">Copyright © {year} VU</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/vuhnger"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-purple text-white hover:bg-purple-dark hover:scale-110 transition-all duration-200"
              aria-label="GitHub"
            >
              <AiFillGithub className="text-xl" />
            </a>

            <a
              href="https://www.linkedin.com/in/victoruhnger"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-ocean text-white hover:bg-ocean-dark hover:scale-110 transition-all duration-200"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn className="text-lg" />
            </a>

            <a
              href="https://www.strava.com/athletes/34349129"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 hover:scale-110 transition-all duration-200"
              aria-label="Strava"
            >
              <FaStrava className="text-lg" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
