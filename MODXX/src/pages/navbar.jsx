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
  Home,
  Zap,
  Info,
  Plus,
  Search,
  Compass
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
    { href: "/", label: "Home", icon: Home },
    { href: "/features", label: "Features", icon: Zap },
    { href: "/about", label: "About", icon: Info },
  ];

  // Split nav links for left and right of center button
  const leftNavLinks = [
    { href: "/", label: "Home", icon: Home },
  ];

  const rightNavLinks = [
    { href: "/features", label: "Features", icon: Zap },
    { href: "/about", label: "About", icon: Info },
  ];

  // Render a placeholder while the app checks for a logged-in user to prevent flickering
  if (loading) {
    return <div className="h-16 bg-gray-900 w-full fixed top-0 z-50" />;
  }

  return (
    <nav className="bg-gray-900 shadow-lg fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16 relative">
          {/* Logo - Positioned absolutely on the left */}
          <div className="absolute left-0 flex items-center">
            <Link to="/">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent"
              >
                MODX
              </motion.h1>
            </Link>
          </div>

          {/* Center Navigation: Home | Explore | + | Features | About */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Left side links */}
            {leftNavLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-orange-500 hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium"
                >
                  <IconComponent size={16} />
                  {link.label}
                </Link>
              );
            })}

            {/* Explore Link for logged in users */}
            {isLoggedIn && (
              <Link
                to="/explore"
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-orange-500 hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium"
              >
                <Compass size={16} />
                Explore
              </Link>
            )}

            {/* Center Create Button */}
            {isLoggedIn && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mx-4"
              >
                <Link
                  to="/project/create"
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  title="Create New Project"
                >
                  <Plus size={22} />
                </Link>
              </motion.div>
            )}

            {/* Right side links */}
            {rightNavLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-orange-500 hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium"
                >
                  <IconComponent size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side: User Menu / Auth Buttons - Positioned absolutely on the right */}
          <div className="absolute right-0 flex items-center">
            {isLoggedIn ? (
              // --- Logged In View ---
              <div ref={dropdownRef} className="relative">
                <motion.button
                  onClick={toggleDropdown}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  <img
                    className="h-9 w-9 rounded-full object-cover border-2 border-orange-500/50 hover:border-orange-500 transition-colors"
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
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-orange-500 transition-colors"
                      >
                        <LayoutDashboard size={16} className="mr-3" /> Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-orange-500 transition-colors"
                      >
                        <User size={16} className="mr-3" /> Profile
                      </Link>
                      <Link
                        to={
                          user && user.current_project_id
                            ? `/project-messages/${user.current_project_id}`
                            : "/project-messages"
                        }
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-orange-500 transition-colors"
                      >
                        <MessageSquare size={16} className="mr-3" /> Messages
                      </Link>
                      
                      {/* Mobile Create Project Button */}
                      <Link
                        to="/project/create"
                        className="md:hidden flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-orange-500 transition-colors"
                      >
                        <Plus size={16} className="mr-3" /> Create Project
                      </Link>
                      
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
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
                  className="text-gray-300 hover:text-orange-500 transition duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Signup
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center ml-4">
              <motion.button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-300 hover:text-orange-500 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
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
              {/* Home Link */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 * 0.1 }}
              >
                <Link
                  to="/"
                  className={`${
                    location.pathname === "/" 
                      ? "bg-gray-700 text-orange-500" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-orange-500"
                  } group flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home size={20} className="mr-3" />
                  Home
                </Link>
              </motion.div>

              {/* Explore Link for logged in users */}
              {isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 * 0.1 }}
                >
                  <Link
                    to="/explore"
                    className={`${
                      location.pathname === "/explore" 
                        ? "bg-gray-700 text-orange-500" 
                        : "text-gray-300 hover:bg-gray-700 hover:text-orange-500"
                    } group flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Compass size={20} className="mr-3" />
                    Explore
                  </Link>
                </motion.div>
              )}

              {/* Mobile Create Project Button */}
              {isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 * 0.1 }}
                  className="pt-2"
                >
                  <Link
                    to="/project/create"
                    className="group flex items-center px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Plus size={20} className="mr-3" />
                    Create Project
                  </Link>
                </motion.div>
              )}

              {/* Features Link */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3 * 0.1 }}
              >
                <Link
                  to="/features"
                  className={`${
                    location.pathname === "/features" 
                      ? "bg-gray-700 text-orange-500" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-orange-500"
                  } group flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Zap size={20} className="mr-3" />
                  Features
                </Link>
              </motion.div>

              {/* About Link */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 4 * 0.1 }}
              >
                <Link
                  to="/about"
                  className={`${
                    location.pathname === "/about" 
                      ? "bg-gray-700 text-orange-500" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-orange-500"
                  } group flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Info size={20} className="mr-3" />
                  About
                </Link>
              </motion.div>
              
              <div className="border-t border-gray-700 my-2"></div>
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-orange-500 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={16} className="mr-3" />
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-orange-500 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={16} className="mr-3" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-3 py-2 text-red-400 hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <LogOut size={16} className="mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-orange-500 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-md transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
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
