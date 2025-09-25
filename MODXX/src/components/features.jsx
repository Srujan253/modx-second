import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Users,
  Zap,
  Trophy,
  Briefcase,
  MessageSquare,
  Star,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();

  const features = [
    {
      category: "Core Platform & User Management",
      items: [
        {
          icon: User,
          title: "Unified User Account & Dynamic Roles",
          description:
            "A single, flexible account for every user, allowing them to be a member, project leader, and mentor simultaneously without needing separate logins. Users sign up with a default member role. When they create their first project, the leader role is automatically added to their account. They can also apply separately to have the mentor role added. Their permissions and the UI they see change based on the context of their actions.",
        },
        {
          icon: User,
          title: "User Profiles & Portfolios",
          description:
            "A central, dynamic hub for each user's professional identity on the platform. The profile displays a user's bio, their current roles, and a portfolio gallery of their completed MoDX projects. It also serves as the home for their 'Skill Tree' and their 'Proof of Contribution' credentials.",
        },
      ],
    },
    {
      category: "Project Lifecycle & Team Formation",
      items: [
        {
          icon: Briefcase,
          title: "Project Creation",
          description:
            "A simple, structured way for users to post their project ideas and outline the collaborators they need. A user (acting as a leader) fills out a form detailing the project's title, a clear description, goals, expected timeline, and adds specific skill tags (e.g., 'React,' 'Python,' 'UI/UX Design') that they are looking for.",
          action: () => navigate("/project/create"),
        },
        {
          icon: Users,
          title: "Skill-based Project Discovery",
          description:
            "An advanced search and filter system to help users find the perfect project to join. A main 'Explore Projects' page where users can search by keywords or use filters to narrow down projects by required skills, project domain (e.g., 'Healthcare,' 'Fintech'), or whether the project is looking for members or mentors.",
          action: () => navigate("/explore"),
          actionLabel: "Explore Projects",
        },
        {
          icon: Zap,
          title: "AI-Powered 'Dream Team' Builder",
          description:
            "Use a Generative AI to act as an intelligent project manager that helps build the perfect team. A project leader describes their idea in natural language. The AI analyzes this, suggests the ideal roles and skills needed, and then scans the user database to recommend the top 3-5 best-matched members and mentors to invite.",
          action: () => navigate("/dream-team-ai"),
          actionLabel: "Try Dream Team AI",
        },
        {
          icon: Users,
          title: "Find and Invite Members",
          description:
            "An intelligent member discovery and invitation system for building your dream team. Project leaders can search and filter through user profiles, review skill trees and portfolios, then send personalized invitations to the most suitable candidates. Recipients can accept or decline invitations, streamlining the team formation process.",
          action: () => navigate("/apply-join-system"),
          actionLabel: "Find Team Members",
        },
      ],
    },
    {
      category: "Collaboration & Mentorship",
      items: [
        {
          icon: MessageSquare,
          title: "Integrated Collaboration Suite",
          description:
            "A dedicated workspace for each team to manage their project directly on the MoDX platform. Once a team is formed, a private project page unlocks with a real-time team chat, a simple Kanban-style task board (To Do, In Progress, Done), and a shared file repository for project assets.",
        },
        {
          icon: Star,
          title: "Dynamic Mentorship Marketplace",
          description:
            "A system for project teams to find, connect with, and get guidance from experienced mentors. Approved mentors create profiles listing their expertise and availability. Teams can search this marketplace and send requests for help. A rating system allows teams to provide feedback on mentors, building a trusted network.",
        },
      ],
    },
    {
      category: "Reputation & Project Completion",
      items: [
        {
          icon: Trophy,
          title: "Gamified 'Skill Tree' Profiles",
          description:
            "A visual and interactive way for users to track and showcase their skill progression, making it feel like a game. Users have a visual 'skill tree' on their profile. As they complete projects, they gain 'XP' in the skills they used, which 'levels up' those skills and can unlock new, related skills on their tree.",
        },
        {
          icon: Users,
          title: "Skill-based Project Discovery",
          description:
            "An advanced search and filter system to help users find the perfect project to join. A main 'Explore Projects' page where users can search by keywords or use filters to narrow down projects by required skills, project domain (e.g., 'Healthcare,' 'Fintech'), or whether the project is looking for members or mentors.",
        },
        // removed stray JSX <Link> from features array
        {
          icon: Shield,
          title: "'Proof of Contribution' using Verifiable Credentials",
          description:
            "A secure, tamper-proof, and verifiable way for users to prove their project experience to the outside world (e.g., to employers). When a project is marked 'complete,' the project leader (the Issuer) grants each team member a cryptographically signed Verifiable Credential (VC). This digital certificate details the project, the user's role, and their key contributions. Users store these VCs in their profile (Holder) and can share them as undeniable proof of their experience.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent mb-6">
            Features
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Discover the powerful features that make MoDX the ultimate platform
            for collaborative project development.
          </p>
        </motion.div>

        {features.map((category, categoryIndex) => (
          <motion.div
            key={categoryIndex}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.2, duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-orange-500 mb-8 text-center">
              {category.category}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {category.items.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="bg-gray-800 p-8 rounded-lg hover:bg-gray-700 transition duration-200"
                >
                  <feature.icon className="w-12 h-12 text-orange-500 mb-4" />
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 mb-4">{feature.description}</p>
                  {feature.action && (
                    <button
                      onClick={feature.action}
                      className={`mt-2 px-6 py-2 font-semibold rounded-lg shadow transition duration-200 ${
                        feature.actionLabel === "Explore Projects"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-orange-500 hover:bg-orange-600"
                      } text-white`}
                    >
                      {feature.actionLabel || "Create Project"}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Features;
