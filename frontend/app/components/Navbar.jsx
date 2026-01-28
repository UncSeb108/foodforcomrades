"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaHandHoldingHeart } from "react-icons/fa";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "About Us", href: "#about-us" },
    { name: "What We Do", href: "#what-we-do" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact Us", href: "#contact-us" },
    { name: "Register", href: "/register" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navbarVariants = {
    initial: { backgroundColor: "transparent" },
    scrolled: { backgroundColor: "rgba(4, 91, 57, 1)" }, // Corresponds to bg-emerald-700
  };

  const mobileMenuVariants = {
    hidden: { x: "100vw" },
    visible: {
      x: "0",
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 10,
      },
    },
    exit: {
      x: "100vw",
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 10,
      },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ease-in-out`}
      variants={navbarVariants}
      animate={scrolled ? "scrolled" : "initial"}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Brand Name/Logo */}
        <a href="/home" className="flex items-center space-x-2">
          {" "}
          {/* Use flex to align logo and text */}
          <div className="relative w-10 h-10">
            {" "}
            {/* Container for the rounded image */}
            <img
              src="/images/Final food for comrades logo.pdf"
              alt="Feed A Comrade Logo"
              className="w-full h-full object-cover rounded-full" // Apply rounded-full for circular image
            />
          </div>
          <span className="text-white text-2xl font-bold">FeedAComrade</span>
        </a>

        {/* Desktop Navigation Links and Donate Button */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-white hover:text-gray-300 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <a href="/donate">
            <button className="flex items-center space-x-2 px-6 py-2 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors duration-200">
              <FaHandHoldingHeart />
              <span>Donate</span>
            </button>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white text-2xl"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-emerald-800 z-40 flex flex-col items-center justify-center space-y-8 md:hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-white text-3xl"
              aria-label="Close mobile menu"
            >
              <FaTimes />
            </button>
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="text-white text-3xl font-bold hover:text-gray-300 transition-colors duration-200"
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </motion.a>
            ))}
            <a href="/donate">
              <motion.button
                className="flex items-center space-x-2 px-8 py-3 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors duration-200 text-xl font-bold"
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                custom={navLinks.length}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaHandHoldingHeart />
                <span>Donate</span>
              </motion.button>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
