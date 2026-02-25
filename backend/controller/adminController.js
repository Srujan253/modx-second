const User = require("../models/User");
const Project = require("../models/Project");
const ProjectMember = require("../models/ProjectMember");
const { deleteProjectFromIndex } = require("../aiHttpClient");
const fs = require("fs");
const path = require("path");

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error fetching users." });
  }
};

// @desc    Promote user to admin
// @route   PATCH /api/v1/admin/users/:userId/promote
// @access  Private/Admin
exports.promoteToAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.role = "admin";
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.fullName} promoted to admin successfully.`,
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    res.status(500).json({ success: false, message: "Server error promoting user." });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:userId
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Prevent deleting itself
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot delete your own admin account." });
    }

    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Server error deleting user." });
  }
};

// @desc    Get all projects
// @route   GET /api/v1/admin/projects
// @access  Private/Admin
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate("leaderId", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const memberCount = await ProjectMember.countDocuments({
          projectId: project._id,
          status: "accepted",
        });

        return {
          ...project,
          id: project._id,
          leader_name: project.leaderId?.fullName || "Unknown",
          leader_email: project.leaderId?.email || "Unknown",
          member_count: memberCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: projectsWithDetails.length,
      projects: projectsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching projects for admin:", error);
    res.status(500).json({ success: false, message: "Server error fetching projects." });
  }
};

// @desc    Admin delete project
// @route   DELETE /api/v1/admin/projects/:projectId
// @access  Private/Admin
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    // Remove project image if exists
    if (project.projectImage && project.projectImage.startsWith("/uploads/")) {
      const imagePath = path.join(__dirname, "..", project.projectImage);
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Error deleting project image by admin:", err);
        }
      });
    }

    // Delete project and related data
    await Project.findByIdAndDelete(projectId);
    await ProjectMember.deleteMany({ projectId });
    await deleteProjectFromIndex(projectId);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully by admin.",
    });
  } catch (error) {
    console.error("Error deleting project by admin:", error);
    res.status(500).json({ success: false, message: "Server error deleting project." });
  }
};
