import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthContext"; // <-- Import the real useAuth hook

// --- MAIN NAVBAR COMPONENT ---
const Navbar = () => {
  // --- Get REAL auth state from the global context ---
  const auth = useAuth();
  if (!auth) return null; // or show a loading/error UI
  const { isLoggedIn, user, logout, loading } = auth;
  const navigate = useNavigate();

  // State for the mobile and dropdown menus
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    logout(); // <-- Use the real logout function from context
    setIsDropdownOpen(false);
    navigate("/"); // Redirect to home after logout
  };

  // Close dropdown if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ensure dark mode is applied
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/about", label: "About" },
  ];

  // Render a placeholder while the app checks for a logged-in user to prevent flickering
  if (loading) {
    return <div className="h-16 bg-gray-900 w-full fixed top-0 z-50" />;
  }

  return (
    <nav className="bg-gray-900 shadow-lg fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Side: Logo */}
          <div className="flex items-center">
            <Link to="/">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent"
              >
                MODX
              </motion.h1>
            </Link>
            <div className="flex items-center space-x-6 ml-8">
              <Link
                to="/features"
                className="text-gray-300 hover:text-orange-500 transition duration-200 font-medium"
              >
                Features
              </Link>

              <Link
                to="/about"
                className="text-gray-300 hover:text-orange-500 transition duration-200 font-medium"
              >
                About
              </Link>
            </div>
            {isLoggedIn ? (
              // --- Logged In View ---
              <div ref={dropdownRef} className="ml-4">
                <motion.button
                  onClick={toggleDropdown}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <img
                    className="h-9 w-9 rounded-full object-cover border-2 border-orange-500"
                    src={`https://ui-avatars.com/api/?name=${
                      user?.full_name?.replace(" ", "+") || "User"
                    }&background=222&color=FFF`}
                    alt={user?.full_name || "User"}
                  />
                </motion.button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">
                          {user.full_name}
                        </p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        <LayoutDashboard size={16} className="mr-3" /> Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        <User size={16} className="mr-3" /> Profile
                      </Link>
                      <Link
                        to={
                          user && user.current_project_id
                            ? `/project-messages/${user.current_project_id}`
                            : "/project-messages"
                        }
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        <MessageSquare size={16} className="mr-3" /> Messages
                      </Link>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                      >
                        <LogOut size={16} className="mr-3" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // --- Logged Out View ---
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-orange-500 transition duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-orange-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition duration-200"
                >
                  Signup
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-300"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-900 border-t border-gray-700"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block px-3 py-2 text-gray-300 hover:text-orange-500"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gray-700 my-2"></div>
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-gray-300 hover:text-orange-500"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-gray-300 hover:text-orange-500"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 text-red-400 hover:text-orange-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-300 hover:text-orange-500"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 text-gray-300 hover:text-orange-500"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
