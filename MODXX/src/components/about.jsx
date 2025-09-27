import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Eye, Heart, ArrowRight, Zap, Shield } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent mb-6">
            About MoDX
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Revolutionizing collaborative project development through
            innovation, community, and cutting-edge technology.
          </p>
        </motion.div>

        {/* What is MoDX */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="bg-gray-800 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-orange-500 mb-6 text-center">
              What is MoDX?
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              MoDX is the ultimate platform designed to empower innovators,
              developers, and creators to collaborate on meaningful projects.
              Whether you're a seasoned professional looking to lead
              groundbreaking initiatives or a newcomer eager to build your
              skills, MoDX provides the tools, community, and AI-powered
              assistance to turn ideas into reality.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mt-4">
              Our platform seamlessly integrates project management, team
              formation, mentorship, and skill development into a single,
              intuitive ecosystem. With features like AI-driven team matching,
              gamified skill progression, and verifiable credentials, MoDX is
              not just a platform—it's your gateway to the future of
              collaborative innovation.
            </p>
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gray-800 p-8 rounded-lg text-center"
          >
            <Target className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-4">
              Our Mission
            </h3>
            <p className="text-gray-300">
              To democratize innovation by providing accessible tools and a
              supportive community where anyone can contribute to transformative
              projects, regardless of their background or experience level.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gray-800 p-8 rounded-lg text-center"
          >
            <Eye className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-4">
              Our Vision
            </h3>
            <p className="text-gray-300">
              A world where collaboration knows no bounds, where every idea has
              the potential to become a reality, and where contributors are
              recognized and rewarded for their impact on global innovation.
            </p>
          </motion.div>
        </div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-orange-500 mb-8 text-center">
            Why Choose MoDX?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Heart className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">
                Community-Driven
              </h4>
              <p className="text-gray-300">
                Built by innovators, for innovators. Our platform thrives on the
                collective creativity and expertise of our diverse community.
              </p>
            </div>
            <div className="text-center">
              <Zap className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">
                AI-Powered
              </h4>
              <p className="text-gray-300">
                Leveraging cutting-edge AI to streamline team formation, project
                matching, and skill development processes.
              </p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">
                Secure & Verifiable
              </h4>
              <p className="text-gray-300">
                Your contributions are protected and verifiable through
                blockchain-based credentials, ensuring trust and recognition.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-gradient-to-r from-orange-500 to-red-500 p-8 rounded-lg"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join the Revolution?
          </h2>
          <p className="text-white/80 text-lg mb-6">
            Start your journey with MoDX today and be part of the future of
            innovation.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
