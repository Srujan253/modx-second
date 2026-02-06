const Project = require("../models/Project");
const ProjectMember = require("../models/ProjectMember");
const User = require("../models/User");
const { triggerIndexing, deleteProjectFromIndex } = require("../grpcClient");

// Remove a member from a project (leader only)
exports.removeMember = async (req, res) => {
  const { projectId, memberId } = req.params;
  const leaderId = req.user.id;
  try {
    // Verify leader
    const project = await Project.findById(projectId);
    if (!project || project.leaderId.toString() !== leaderId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Prevent removing leader
    const member = await ProjectMember.findOne({ projectId, memberId });
    if (member && member.role === "leader") {
      return res.status(400).json({ success: false, message: "Cannot remove the project leader." });
    }

    // Remove member
    await ProjectMember.deleteOne({ projectId, memberId });
    res.json({ success: true, message: "Member removed." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Get all accepted members (and their roles) of a project
exports.getProjectMembers = async (req, res) => {
  const { projectId } = req.params;
  try {
    const members = await ProjectMember.find({ projectId, status: "accepted" })
      .populate("memberId", "fullName email")
      .lean();

    const formattedMembers = members.map((m) => ({
      id: m.memberId._id,
      full_name: m.memberId.fullName,
      email: m.memberId.email,
      role: m.role,
      status: m.status,
    }));

    res.status(200).json({ success: true, members: formattedMembers });
  } catch (error) {
    console.error("Error fetching project members:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Edit project (leader only, supports image upload)
exports.editProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    if (project.leaderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the project leader can edit this project." });
    }

    const {
      title,
      timeline,
      description,
      goals,
      requiredSkills,
      techStack,
      maxMembers,
    } = req.body;

    let projectImage = project.projectImage;
    if (req.file) {
      projectImage = "/uploads/" + req.file.filename;
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (timeline) updateFields.timeline = timeline;
    if (description) updateFields.description = description;
    if (goals) updateFields.goals = goals;
    if (requiredSkills) updateFields.requiredSkills = requiredSkills.split(",").map((s) => s.trim());
    if (techStack) updateFields.techStack = techStack.split(",").map((s) => s.trim());
    if (maxMembers) updateFields.maxMembers = maxMembers;
    if (projectImage) updateFields.projectImage = projectImage;

    await Project.findByIdAndUpdate(projectId, updateFields);
    await triggerIndexing();

    res
      .status(200)
      .json({ success: true, message: "Project updated successfully." });
  } catch (error) {
    console.error("Error editing project:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete project (leader only)
exports.deleteProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    if (project.leaderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the project leader can delete this project." });
    }

    // Remove project image from uploads folder if exists
    if (project.projectImage && project.projectImage.startsWith("/uploads/")) {
      const fs = require("fs");
      const path = require("path");
      const imagePath = path.join(__dirname, "..", project.projectImage);
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Error deleting project image:", err);
        }
      });
    }

    // Delete project and related data
    await Project.findByIdAndDelete(projectId);
    await ProjectMember.deleteMany({ projectId });
    await deleteProjectFromIndex(projectId);

    res
      .status(200)
      .json({ success: true, message: "Project deleted successfully." });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all project invitations for the logged-in user (status: 'invited')
exports.getUserInvites = async (req, res) => {
  const userId = req.user.id;
  try {
    const invites = await ProjectMember.find({ memberId: userId, status: "invited" })
      .populate("projectId", "title")
      .lean();

    const formattedInvites = await Promise.all(
      invites.map(async (inv) => {
        const project = await Project.findById(inv.projectId).populate("leaderId", "fullName");
        return {
          id: inv._id,
          project_id: inv.projectId._id,
          project_title: inv.projectId.title,
          leader_name: project.leaderId.fullName,
        };
      })
    );

    res.status(200).json({ success: true, invites: formattedInvites });
  } catch (error) {
    console.error("Error fetching invites:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all users who are not already members of a project and not the leader
exports.getPotentialMembers = async (req, res) => {
  const { projectId } = req.params;
  const leaderId = req.user.id;
  try {
    const existingMembers = await ProjectMember.find({ projectId }).distinct("memberId");
    const users = await User.find({
      _id: { $ne: leaderId, $nin: existingMembers },
    }).select("fullName email interest").lean();

    const usersWithMapping = users.map(user => ({
      ...user,
      id: user._id.toString(),
      full_name: user.fullName,
    }));

    res.status(200).json({ success: true, users: usersWithMapping });
  } catch (error) {
    console.error("Error fetching potential members:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Invite a user to a project
exports.inviteMember = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.body;
  const leaderId = req.user.id;
  try {
    const project = await Project.findById(projectId);
    if (!project || project.leaderId.toString() !== leaderId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    // Check if already a member/invited/pending
    const exists = await ProjectMember.findOne({ projectId, memberId: userId });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "User already invited or a member." });
    }

    // Check if project is full
    const memberCount = await ProjectMember.countDocuments({ projectId, status: "accepted" });
    if (memberCount >= project.maxMembers) {
      return res
        .status(403)
        .json({ success: false, message: "Project is full." });
    }

    // Insert invite
    await ProjectMember.create({
      projectId,
      memberId: userId,
      role: "member",
      status: "invited",
    });

    res.status(200).json({ success: true, message: "Invitation sent." });
  } catch (error) {
    console.error("Error inviting member:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all projects where user is a member (accepted) or has a pending request
exports.getUserMemberships = async (req, res) => {
  const userId = req.user.id;
  try {
    const acceptedMemberships = await ProjectMember.find({
      memberId: userId,
      status: "accepted",
    }).populate("projectId").lean();

    const pendingMemberships = await ProjectMember.find({
      memberId: userId,
      status: "pending",
    }).populate("projectId").lean();

    const acceptedProjects = acceptedMemberships
      .map((m) => m.projectId)
      .filter(Boolean)
      .map(addIdField);

    const pendingProjects = pendingMemberships
      .map((m) => m.projectId)
      .filter(Boolean)
      .map(addIdField);

    res.json({
      success: true,
      accepted: acceptedProjects,
      pending: pendingProjects,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Accept a join request
exports.acceptJoinRequest = async (req, res) => {
  const { projectId, requestId } = req.params;
  const leaderId = req.user.id;
  try {
    const project = await Project.findById(projectId);
    if (!project || project.leaderId.toString() !== leaderId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    // Check if project is full
    const memberCount = await ProjectMember.countDocuments({ projectId, status: "accepted" });
    if (memberCount >= project.maxMembers) {
      return res
        .status(403)
        .json({ success: false, message: "Project is full." });
    }

    // Set status to accepted
    await ProjectMember.findOneAndUpdate(
      { _id: requestId, projectId },
      { status: "accepted" }
    );

    res.json({ success: true, message: "Request accepted and member added." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Reject a join request
exports.rejectJoinRequest = async (req, res) => {
  const { projectId, requestId } = req.params;
  const leaderId = req.user.id;
  try {
    const project = await Project.findById(projectId);
    if (!project || project.leaderId.toString() !== leaderId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    await ProjectMember.findOneAndDelete({ _id: requestId, projectId });
    res.json({ success: true, message: "Request rejected and removed." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Public controller to get project details
exports.getProjectDetailsPublic = async (req, res) => {
  const { projectId } = req.params;
  
  // Validate projectId
  if (!projectId || projectId === 'undefined' || projectId === 'null') {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid project ID provided." 
    });
  }

  try {
    const project = await Project.findById(projectId).populate("leaderId", "fullName").lean();
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    const formattedProject = {
      ...project,
      leader_name: project.leaderId.fullName,
    };

    res.status(200).json({ success: true, project: formattedProject });
  } catch (error) {
    console.error("Error fetching public project details:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Helper function to add 'id' field and map camelCase to snake_case for frontend compatibility
const addIdField = (doc) => {
  if (!doc) return doc;
  return {
    ...doc,
    id: doc._id.toString(),
    project_image: doc.projectImage,
    required_skills: doc.requiredSkills,
    tech_stack: doc.techStack,
    max_members: doc.maxMembers,
    created_at: doc.createdAt,
    updated_at: doc.updatedAt,
  };
};

// Explore projects with filters
exports.exploreProjects = async (req, res) => {
  try {
    const { search, skills, techStack, lookingFor } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (skills) {
      const skillArray = skills.split(",").map((s) => s.trim());
      query.requiredSkills = { $all: skillArray };
    }

    if (techStack) {
      const techArray = techStack.split(",").map((s) => s.trim());
      query.techStack = { $all: techArray };
    }

    const projects = await Project.find(query)
      .populate("leaderId", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const memberCount = await ProjectMember.countDocuments({
          projectId: project._id,
          status: "accepted",
        });

        // Filter by lookingFor
        if (lookingFor === "member" && memberCount >= project.maxMembers) {
          return null;
        }

        return addIdField({
          ...project,
          leader_name: project.leaderId.fullName,
          leader_id: project.leaderId._id.toString(),
          member_count: memberCount,
          avg_rating: project.rating || "N/A",
        });
      })
    );

    const filteredProjects = projectsWithCounts.filter((p) => p !== null);

    res.status(200).json({
      success: true,
      projects: filteredProjects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Apply to project
exports.applyToProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    const existingMembership = await ProjectMember.findOne({ projectId, memberId: userId });

    if (existingMembership) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to or are a member of this project.",
      });
    }

    await ProjectMember.create({
      projectId,
      memberId: userId,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      message: "Application submitted successfully! The project leader will review it.",
    });
  } catch (error) {
    console.error("Error applying to project:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get pending requests for a project
exports.getPendingRequests = async (req, res) => {
  const { projectId } = req.params;
  const leaderId = req.user.id;

  try {
    const project = await Project.findById(projectId);
    if (!project || project.leaderId.toString() !== leaderId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the project leader can view requests.",
      });
    }

    const pendingRequests = await ProjectMember.find({ projectId, status: "pending" })
      .populate("memberId", "fullName email")
      .lean();

    const formattedRequests = pendingRequests.map((req) => ({
      id: req._id,
      status: req.status,
      user_id: req.memberId._id,
      full_name: req.memberId.fullName,
      email: req.memberId.email,
    }));

    res.status(200).json({ success: true, requests: formattedRequests });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update membership status
exports.updateMembershipStatus = async (req, res) => {
  const { projectId, memberId } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  try {
    const invite = await ProjectMember.findOne({ _id: memberId, projectId });
    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found." });
    }

    // If user is accepting their own invite
    if (userId.toString() === invite.memberId.toString() && status === "accepted") {
      if (invite.status !== "invited") {
        return res
          .status(403)
          .json({ success: false, message: "No invitation to accept." });
      }
      invite.status = "accepted";
      await invite.save();
      return res
        .status(200)
        .json({ success: true, message: "Invitation accepted." });
    }

    // Otherwise, only leader can accept/reject
    const project = await Project.findById(projectId);
    if (!project || project.leaderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the project leader can manage members.",
      });
    }

    // Check if project is full before accepting
    if (status === "accepted") {
      const memberCount = await ProjectMember.countDocuments({ projectId, status: "accepted" });
      if (memberCount >= project.maxMembers) {
        return res.status(403).json({
          success: false,
          message: "Project has reached the maximum member limit.",
        });
      }
    }

    invite.status = status;
    await invite.save();

    res.status(200).json({
      success: true,
      message: `Member status updated to '${status}'.`,
    });
  } catch (error) {
    console.error("Error updating membership status:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create a new project
exports.createProject = async (req, res) => {
  const {
    title,
    description,
    goals,
    timeline,
    requiredSkills,
    techStack,
    maxMembers,
  } = req.body;
  const userId = req.user.id;

  let projectImage = null;
  if (req.file) {
    projectImage = `/uploads/${req.file.filename}`;
  }

  try {
    const projectCount = await Project.countDocuments({ leaderId: userId });

    if (projectCount >= 6) {
      return res.status(403).json({
        success: false,
        message: "You have reached the maximum limit of 6 projects per leader.",
      });
    }

    const skillsArray = requiredSkills
      ? requiredSkills.split(",").map((s) => s.trim())
      : [];

    const techArray = techStack
      ? techStack.split(",").map((t) => t.trim())
      : [];

    const timelineInt = timeline ? parseInt(timeline, 10) : null;

    const newProject = await Project.create({
      title,
      description,
      goals,
      timeline: timelineInt,
      requiredSkills: skillsArray,
      techStack: techArray,
      maxMembers: maxMembers || 8,
      projectImage,
      leaderId: userId,
    });

    const projectId = newProject._id;

    // Add creator as leader
    await ProjectMember.create({
      projectId,
      memberId: userId,
      role: "leader",
      status: "accepted",
    });

    // Add 'leader' role to user if not present
    await User.findByIdAndUpdate(userId, {
      $addToSet: { roles: "leader" },
    });

    await triggerIndexing();

    res.status(201).json({
      success: true,
      message: "Project created successfully! You are the new team leader.",
      projectId,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Server error during project creation." });
  }
};

// Add project member
exports.addProjectMember = async (req, res) => {
  const { projectId } = req.params;
  const { newMemberEmail } = req.body;
  const leaderId = req.user.id;

  try {
    const project = await Project.findById(projectId);

    if (!project || project.leaderId.toString() !== leaderId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the project leader can add members.",
      });
    }

    const newMember = await User.findOne({ email: newMemberEmail });

    if (!newMember) {
      return res
        .status(404)
        .json({ success: false, message: "User with that email not found." });
    }

    const memberCount = await ProjectMember.countDocuments({ projectId, status: "accepted" });

    if (memberCount >= project.maxMembers) {
      return res.status(403).json({
        success: false,
        message: "Project has reached the maximum member limit.",
      });
    }

    await ProjectMember.create({
      projectId,
      memberId: newMember._id,
      role: "member",
      status: "accepted",
    });

    res
      .status(200)
      .json({ success: true, message: "Member added successfully!" });
  } catch (error) {
    console.error("Error adding project member:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User is already a member of this project.",
      });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// Get project details (for members only)
exports.getProjectDetails = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  // Validate projectId
  if (!projectId || projectId === 'undefined' || projectId === 'null') {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid project ID provided." 
    });
  }

  try {
    const isMember = await ProjectMember.findOne({
      projectId,
      memberId: userId,
      status: "accepted",
    });

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a member of this project.",
      });
    }

    const project = await Project.findById(projectId).populate("leaderId", "fullName").lean();

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    const formattedProject = {
      ...project,
      leader_name: project.leaderId.fullName,
    };

    res.status(200).json({ success: true, project: formattedProject });
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Submit project rating
exports.submitProjectRating = async (req, res) => {
  const { projectId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id;

  try {
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const member = await ProjectMember.findOne({
      projectId,
      memberId: userId,
      status: "accepted",
    });

    if (!member || member.hasRated) {
      return res.status(403).json({
        success: false,
        message: "You are not an eligible member or have already rated this project.",
      });
    }

    // Mark member as having rated
    member.hasRated = true;
    await member.save();

    // Update project rating
    const project = await Project.findById(projectId);
    const newRatingCount = project.ratingCount + 1;
    const newRating = ((project.rating * project.ratingCount) + rating) / newRatingCount;

    project.rating = newRating;
    project.ratingCount = newRatingCount;
    await project.save();

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully!",
      newAverageRating: newRating,
    });
  } catch (error) {
    console.error("Error submitting project rating:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add mentor role
exports.addMentorRole = async (req, res) => {
  const { projectId } = req.params;
  const { memberId } = req.body;
  const leaderId = req.user.id;

  try {
    const project = await Project.findById(projectId);

    if (!project || project.leaderId.toString() !== leaderId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the project leader can assign mentor roles.",
      });
    }

    const mentorCount = await ProjectMember.countDocuments({ projectId, role: "mentor" });

    if (mentorCount >= 2) {
      return res.status(403).json({
        success: false,
        message: "This project has already reached the maximum mentor limit (2).",
      });
    }

    await ProjectMember.findOneAndUpdate(
      { projectId, memberId, status: "accepted" },
      { role: "mentor" }
    );

    await User.findByIdAndUpdate(memberId, {
      $addToSet: { roles: "mentor" },
    });

    res
      .status(200)
      .json({ success: true, message: "Mentor role assigned successfully!" });
  } catch (error) {
    console.error("Error adding mentor role:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all projects for the logged-in user
exports.getUserProjects = async (req, res) => {
  const userId = req.user.id;
  try {
    const projects = await Project.find({ leaderId: userId })
      .sort({ createdAt: -1 })
      .lean();

    const projectsWithId = projects.map(addIdField);

    res.status(200).json({ success: true, projects: projectsWithId });
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ message: "Server error fetching user projects." });
  }
};
