"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineHome, AiOutlineFundProjectionScreen, AiOutlineUser } from "react-icons/ai";
import { CgFileDocument } from "react-icons/cg";
import { IoGameControllerOutline } from "react-icons/io5";
import { AiFillGithub } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";

const Navbar = () => {
  const [expand, setExpand] = useState(false);
  const [navColour, setNavColour] = useState(false);

  useEffect(() => {
    const scrollHandler = () => {
      if (window.scrollY >= 20) {
        setNavColour(true);
      } else {
        setNavColour(false);
      }
    };

    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  const navItems = [
    { name: "Hjem", path: "/", icon: <AiOutlineHome /> },
    { name: "Mer om meg?", path: "/about", icon: <AiOutlineUser /> },
    { name: "CV", path: "/cv", icon: <CgFileDocument /> },
    { name: "Prosjekter", path: "/projects", icon: <AiOutlineFundProjectionScreen /> },
    { name: "Spill", path: "/game", icon: <IoGameControllerOutline /> },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        navColour ? "bg-black/95 backdrop-blur-md border-b border-gray-800" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          <span className="text-purple">V</span>
          <span className="text-white">U</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center gap-2 text-gray-300 hover:text-purple transition-colors duration-200 text-sm"
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}

          {/* GitHub Button */}
          <a
            href="https://github.com/vuhnger"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple text-white hover:bg-purple-dark transition-all duration-200"
          >
            <AiFillGithub className="text-xl" />
            <span>GitHub</span>
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setExpand(!expand)}
          className="md:hidden text-2xl text-white hover:text-purple transition-colors"
        >
          {expand ? <IoMdClose /> : <GiHamburgerMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {expand && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-4 pt-6 pb-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setExpand(false)}
                  className="flex items-center gap-3 text-lg text-foreground hover:text-[var(--color-purple)] transition-colors duration-200 px-4 py-2"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}

              <a
                href="https://github.com/vuhnger"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-lg px-4 py-3 mt-2 rounded-lg bg-[var(--color-purple)] text-white hover:bg-[var(--color-purple-dark)] transition-colors"
              >
                <AiFillGithub className="text-xl" />
                <span>GitHub</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
