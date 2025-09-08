import React from "react";

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 py-6 mt-12 border-t border-gray-800">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
      <div className="mb-2 md:mb-0">
        <span className="font-bold text-orange-500">MODX</span> &copy;{" "}
        {new Date().getFullYear()} All rights reserved.
      </div>
      <div className="flex space-x-4 text-sm">
        <a href="/about" className="hover:text-orange-400 transition">
          About
        </a>
        <a href="/features" className="hover:text-orange-400 transition">
          Features
        </a>
        <a href="/contact" className="hover:text-orange-400 transition">
          Contact
        </a>
        <a
          href="https://github.com/Srujan253/Modx"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-400 transition"
        >
          GitHub
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
