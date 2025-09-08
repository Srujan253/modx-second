import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Zap, Trophy } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const auth = useAuth();
  if (!auth) return null; // or show a loading/error UI
  const { isLoggedIn } = auth;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent mb-6"
            >
              MoDX
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              The ultimate platform for collaborative project development. Build
              your skills, lead teams, and create amazing projects with
              like-minded innovators.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to={isLoggedIn ? "/features" : "/signup"}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition duration-200 flex items-center justify-center gap-2"
              >
                {isLoggedIn ? "View Features" : "Get Started"}{" "}
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/features"
                className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-3 rounded-lg font-semibold transition duration-200"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Overview */}
      <section className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose MoDX?
            </h2>
            <p className="text-gray-400 text-lg">
              Experience the future of collaborative development
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="bg-gray-700 p-8 rounded-lg text-center"
            >
              <Users className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                Unified User Roles
              </h3>
              <p className="text-gray-300">
                Be a member, leader, and mentor all in one platform. Your roles
                adapt to your contributions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="bg-gray-700 p-8 rounded-lg text-center"
            >
              <Zap className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                AI-Powered Team Building
              </h3>
              <p className="text-gray-300">
                Our intelligent system helps you find the perfect team members
                and mentors for your projects.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="bg-gray-700 p-8 rounded-lg text-center"
            >
              <Trophy className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                Skill Tree & Credentials
              </h3>
              <p className="text-gray-300">
                Track your growth with gamified skill progression and earn
                verifiable proof of your contributions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Join thousands of innovators building the future together.
            </p>
            <Link
              to={isLoggedIn ? "/features" : "/signup"}
              className="bg-white text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-200"
            >
              {isLoggedIn ? "Explore Features" : "Join MoDX Today"}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
