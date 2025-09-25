// Get all accepted members (and their roles) of a project
exports.getProjectMembers = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Only accepted members, mentors, and leader
    const members = await pool.query(
      `SELECT u.id, u.full_name, u.email, pm.role, pm.status
       FROM project_members pm
       JOIN users u ON pm.member_id = u.id
       WHERE pm.project_id = $1 AND pm.status = 'accepted'`,
      [projectId]
    );
    res.status(200).json({ success: true, members: members.rows });
  } catch (error) {
    console.error("Error fetching project members:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// Get all project invitations for the logged-in user (status: 'invited')
exports.getUserInvites = async (req, res) => {
  const userId = req.user.id;
  try {
    const invites = await pool.query(
      `SELECT pm.id, pm.project_id, p.title AS project_title, u.full_name AS leader_name
       FROM project_members pm
       JOIN projects p ON pm.project_id = p.id
       JOIN users u ON p.leader_id = u.id
       WHERE pm.member_id = $1 AND pm.status = 'invited'`,
      [userId]
    );
    res.status(200).json({ success: true, invites: invites.rows });
  } catch (error) {
    console.error("Error fetching invites:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// Get all users who are not already members (or invited/pending) of a project and not the leader
exports.getPotentialMembers = async (req, res) => {
  const { projectId } = req.params;
  const leaderId = req.user.id;
  try {
    // Get all users who are NOT already in project_members for this project and not the leader
    const users = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.interest
       FROM users u
       WHERE u.id != $1
         AND u.id NOT IN (
           SELECT member_id FROM project_members WHERE project_id = $2
         )`,
      [leaderId, projectId]
    );
    res.status(200).json({ success: true, users: users.rows });
  } catch (error) {
    console.error("Error fetching potential members:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Invite a user to a project (create project_members row with status 'invited')
exports.inviteMember = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.body;
  const leaderId = req.user.id;
  try {
    // Check if leader
    const project = await pool.query(
      "SELECT leader_id, max_members FROM projects WHERE id = $1",
      [projectId]
    );
    if (project.rows.length === 0 || project.rows[0].leader_id !== leaderId) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }
    // Check if already a member/invited/pending
    const exists = await pool.query(
      "SELECT * FROM project_members WHERE project_id = $1 AND member_id = $2",
      [projectId, userId]
    );
    if (exists.rows.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "User already invited or a member." });
    }
    // Check if project is full
    const memberCount = await pool.query(
      "SELECT COUNT(*) FROM project_members WHERE project_id = $1 AND status = 'accepted'",
      [projectId]
    );
    if (parseInt(memberCount.rows[0].count) >= project.rows[0].max_members) {
      return res
        .status(403)
        .json({ success: false, message: "Project is full." });
    }
    // Insert invite
    await pool.query(
      "INSERT INTO project_members (project_id, member_id, role, status) VALUES ($1, $2, 'member', 'invited')",
      [projectId, userId]
    );
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
    // Accepted memberships
    const accepted = await pool.query(
      `SELECT p.* FROM project_members pm
        JOIN projects p ON pm.project_id = p.id
        WHERE pm.member_id = $1 AND pm.status = 'accepted'`,
      [userId]
    );
    // Pending requests
    const pending = await pool.query(
      `SELECT p.* FROM project_members pm
        JOIN projects p ON pm.project_id = p.id
        WHERE pm.member_id = $1 AND pm.status = 'pending'`,
      [userId]
    );
    res.json({
      success: true,
      accepted: accepted.rows,
      pending: pending.rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};
// Accept a join request (set status to 'accepted')
exports.acceptJoinRequest = async (req, res) => {
  const { projectId, requestId } = req.params;
  const leaderId = req.user.id;
  try {
    // Verify leader
    const project = await pool.query(
      "SELECT leader_id, max_members FROM projects WHERE id = $1",
      [projectId]
    );
    if (project.rows.length === 0 || project.rows[0].leader_id !== leaderId) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }
    // Check if project is full
    const memberCount = await pool.query(
      "SELECT COUNT(*) FROM project_members WHERE project_id = $1 AND status = 'accepted'",
      [projectId]
    );
    if (parseInt(memberCount.rows[0].count) >= project.rows[0].max_members) {
      return res
        .status(403)
        .json({ success: false, message: "Project is full." });
    }
    // Set status to accepted
    await pool.query(
      "UPDATE project_members SET status = 'accepted' WHERE id = $1 AND project_id = $2",
      [requestId, projectId]
    );
    res.json({ success: true, message: "Request accepted and member added." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Reject a join request (delete from project_members)
exports.rejectJoinRequest = async (req, res) => {
  const { projectId, requestId } = req.params;
  const leaderId = req.user.id;
  try {
    // Verify leader
    const project = await pool.query(
      "SELECT leader_id FROM projects WHERE id = $1",
      [projectId]
    );
    if (project.rows.length === 0 || project.rows[0].leader_id !== leaderId) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }
    // Delete the request
    await pool.query(
      "DELETE FROM project_members WHERE id = $1 AND project_id = $2",
      [requestId, projectId]
    );
    res.json({ success: true, message: "Request rejected and removed." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};
// Public controller to get project details (no membership restriction)
exports.getProjectDetailsPublic = async (req, res) => {
  const { projectId } = req.params;
  try {
    const projectDetails = await pool.query(
      "SELECT p.*, u.full_name AS leader_name FROM projects p JOIN users u ON p.leader_id = u.id WHERE p.id = $1",
      [projectId]
    );
    if (!projectDetails.rows[0]) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }
    res.status(200).json({ success: true, project: projectDetails.rows[0] });
  } catch (error) {
    console.error("Error fetching public project details:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// --- NEW Controller to explore projects with filters ---
exports.exploreProjects = async (req, res) => {
  try {
    const { search, skills, techStack, lookingFor } = req.query;
    let query = `
      SELECT p.*, COUNT(pm.member_id) AS member_count, u.full_name AS leader_name
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      JOIN users u ON p.leader_id = u.id
      WHERE 1=1
    `;
    const queryParams = [];

    // Add search and filter conditions
    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (p.title ILIKE $${queryParams.length} OR p.description ILIKE $${queryParams.length})`;
    }
    if (skills) {
      const skillArray = skills.split(",").map((s) => s.trim());
      queryParams.push(skillArray);
      query += ` AND p.required_skills @> $${queryParams.length}`;
    }
    if (techStack) {
      const techArray = techStack.split(",").map((s) => s.trim());
      queryParams.push(techArray);
      query += ` AND p.tech_stack @> $${queryParams.length}`;
    }
    if (lookingFor === "member") {
      query += ` AND (SELECT COUNT(*) FROM project_members WHERE project_id = p.id AND status = 'accepted') < p.max_members`;
    }
    // Note: The 'mentor' filter requires more complex logic, as it's not a simple count.
    // We'll leave that for a future refinement.

    query += ` GROUP BY p.id, u.full_name ORDER BY p.created_at DESC`;

    const result = await pool.query(query, queryParams);

    // Get the member count for each project
    const projectsWithCounts = await Promise.all(
      result.rows.map(async (project) => {
        const memberCountResult = await pool.query(
          "SELECT COUNT(*) FROM project_members WHERE project_id = $1 AND status = 'accepted'",
          [project.id]
        );
        return {
          ...project,
          member_count: parseInt(memberCountResult.rows[0].count),
          avg_rating: project.rating || "N/A",
        };
      })
    );

    res.status(200).json({
      success: true,
      projects: projectsWithCounts,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- NEW Controller to handle project applications ---
exports.applyToProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    // Check if the user is already a member of this project
    const existingMembership = await pool.query(
      "SELECT * FROM project_members WHERE project_id = $1 AND member_id = $2",
      [projectId, userId]
    );

    if (existingMembership.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to or are a member of this project.",
      });
    }

    // Create a new membership request with 'pending' status
    await pool.query(
      "INSERT INTO project_members (project_id, member_id, status) VALUES ($1, $2, 'pending')",
      [projectId, userId]
    );

    res.status(200).json({
      success: true,
      message:
        "Application submitted successfully! The project leader will review it.",
    });
  } catch (error) {
    console.error("Error applying to project:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- NEW Controller for the leader to manage requests ---
exports.getPendingRequests = async (req, res) => {
  const { projectId } = req.params;
  const leaderId = req.user.id;

  try {
    // Verify that the user making the request is the project leader
    const project = await pool.query(
      "SELECT leader_id FROM projects WHERE id = $1",
      [projectId]
    );
    if (project.rows.length === 0 || project.rows[0].leader_id !== leaderId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the project leader can view requests.",
      });
    }

    const pendingRequests = await pool.query(
      `SELECT pm.id, pm.status, u.id AS user_id, u.full_name, u.email
       FROM project_members pm
       JOIN users u ON pm.member_id = u.id
       WHERE pm.project_id = $1 AND pm.status = 'pending'`,
      [projectId]
    );

    res.status(200).json({ success: true, requests: pendingRequests.rows });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- NEW Controller for the leader to accept or reject requests ---
exports.updateMembershipStatus = async (req, res) => {
  const { projectId, memberId } = req.params; // memberId is actually the invite row id
  const { status } = req.body;
  const userId = req.user.id;

  try {
    // Look up the invite row
    const invite = await pool.query(
      "SELECT * FROM project_members WHERE id = $1 AND project_id = $2",
      [memberId, projectId]
    );
    if (invite.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found." });
    }
    const inviteRow = invite.rows[0];

    // If the logged-in user is the member and is accepting their own invite
    if (userId == inviteRow.member_id && status === "accepted") {
      if (inviteRow.status !== "invited") {
        return res
          .status(403)
          .json({ success: false, message: "No invitation to accept." });
      }
      await pool.query(
        "UPDATE project_members SET status = 'accepted' WHERE id = $1",
        [memberId]
      );
      return res
        .status(200)
        .json({ success: true, message: "Invitation accepted." });
    }

    // Otherwise, only the leader can accept/reject join requests
    const project = await pool.query(
      "SELECT leader_id, max_members FROM projects WHERE id = $1",
      [projectId]
    );
    if (project.rows.length === 0 || project.rows[0].leader_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the project leader can manage members.",
      });
    }

    // Check if the project is full before accepting a new member
    if (status === "accepted") {
      const memberCount = await pool.query(
        "SELECT COUNT(*) FROM project_members WHERE project_id = $1 AND status = 'accepted'",
        [projectId]
      );
      if (parseInt(memberCount.rows[0].count) >= project.rows[0].max_members) {
        return res.status(403).json({
          success: false,
          message: "Project has reached the maximum member limit.",
        });
      }
    }

    // Update the member's status in the project_members table
    await pool.query("UPDATE project_members SET status = $1 WHERE id = $2", [
      status,
      memberId,
    ]);

    res.status(200).json({
      success: true,
      message: `Member status updated to '${status}'.`,
    });
  } catch (error) {
    console.error("Error updating membership status:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
const pool = require("../db");

// Controller for creating a new project
// Controller for creating a new project
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

  // Handle uploaded image
  let projectImage = null;
  if (req.file) {
    projectImage = `/uploads/${req.file.filename}`;
  }

  try {
    // Check if the user has reached the maximum project limit (6)
    const projectCount = await pool.query(
      "SELECT COUNT(*) FROM projects WHERE leader_id = $1",
      [userId]
    );

    if (parseInt(projectCount.rows[0].count) >= 6) {
      return res.status(403).json({
        success: false,
        message: "You have reached the maximum limit of 6 projects per leader.",
      });
    }

    // Convert requiredSkills and techStack into arrays (Postgres expects text[])
    const skillsArray = requiredSkills
      ? requiredSkills.split(",").map((s) => s.trim())
      : [];

    const techArray = techStack
      ? techStack.split(",").map((t) => t.trim())
      : [];

    // Ensure timeline is an integer
    const timelineInt = timeline ? parseInt(timeline, 10) : null;

    // 1. Create the new project
    const newProject = await pool.query(
      `INSERT INTO projects 
       (title, description, goals, timeline, required_skills, tech_stack, max_members, project_image, leader_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id`,
      [
        title,
        description,
        goals,
        timelineInt,
        skillsArray,
        techArray,
        maxMembers || 8, // default to 8 if not provided
        projectImage,
        userId,
      ]
    );

    const projectId = newProject.rows[0].id;

    // 2. Automatically add the project creator as a member and leader
    await pool.query(
      `INSERT INTO project_members (project_id, member_id, role, status) 
       VALUES ($1, $2, 'leader', 'accepted')`,
      [projectId, userId]
    );

    // 3. Add 'leader' role globally to user if not already present
    await pool.query(
      `UPDATE users 
       SET roles = array_append(roles, 'leader') 
       WHERE id = $1 AND 'leader' <> ALL(roles)`,
      [userId]
    );

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

// Controller to handle adding a new member to a project
exports.addProjectMember = async (req, res) => {
  const { projectId } = req.params;
  const { newMemberEmail } = req.body;
  const leaderId = req.user.id;

  try {
    // 1. Check if the logged-in user is the project leader
    const project = await pool.query(
      "SELECT leader_id, max_members FROM projects WHERE id = $1",
      [projectId]
    );

    if (project.rows.length === 0 || project.rows[0].leader_id !== leaderId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the project leader can add members.",
      });
    }

    // 2. Get the new member's user ID from their email
    const newMember = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [newMemberEmail]
    );

    if (newMember.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User with that email not found." });
    }
    const newMemberId = newMember.rows[0].id;

    // 3. Check if the project is already full (max 8 members)
    const memberCount = await pool.query(
      "SELECT COUNT(*) FROM project_members WHERE project_id = $1 AND status = 'accepted'",
      [projectId]
    );

    if (parseInt(memberCount.rows[0].count) >= project.rows[0].max_members) {
      return res.status(403).json({
        success: false,
        message: "Project has reached the maximum member limit.",
      });
    }

    // 4. Add the new member with a 'pending' status
    await pool.query(
      "INSERT INTO project_members (project_id, member_id, role, status) VALUES ($1, $2, 'member', 'accepted')", // Setting to accepted for simplicity here
      [projectId, newMemberId]
    );

    res
      .status(200)
      .json({ success: true, message: "Member added successfully!" });
  } catch (error) {
    console.error("Error adding project member:", error);
    if (error.code === "23505") {
      // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: "User is already a member of this project.",
      });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// Controller to get project details (for members only)
exports.getProjectDetails = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    // First, verify that the user is a member of the project
    const isMember = await pool.query(
      "SELECT * FROM project_members WHERE project_id = $1 AND member_id = $2 AND status = 'accepted'",
      [projectId, userId]
    );

    if (isMember.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a member of this project.",
      });
    }

    // If the user is a member, fetch the project details
    const projectDetails = await pool.query(
      "SELECT p.*, u.full_name AS leader_name FROM projects p JOIN users u ON p.leader_id = u.id WHERE p.id = $1",
      [projectId]
    );

    if (!projectDetails.rows[0]) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    res.status(200).json({ success: true, project: projectDetails.rows[0] });
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Controller for members to submit a rating for a project
exports.submitProjectRating = async (req, res) => {
  const { projectId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id;

  try {
    // Validate the rating to be between 1 and 5
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5." });
    }

    // Check if the user is an accepted member and has not rated yet
    const member = await pool.query(
      "SELECT has_rated FROM project_members WHERE project_id = $1 AND member_id = $2 AND status = 'accepted'",
      [projectId, userId]
    );

    if (member.rows.length === 0 || member.rows[0].has_rated) {
      return res.status(403).json({
        success: false,
        message:
          "You are not an eligible member or have already rated this project.",
      });
    }

    // Update the project's average rating
    const newRating = await pool.query(
      "UPDATE projects SET rating = (SELECT AVG(rating) FROM project_members WHERE project_id = $1 AND has_rated = TRUE) WHERE id = $1 RETURNING rating",
      [projectId]
    );

    // Mark the member as having rated the project
    await pool.query(
      "UPDATE project_members SET has_rated = TRUE, rating = $1 WHERE project_id = $2 AND member_id = $3",
      [rating, projectId, userId]
    );

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully!",
      newAverageRating: newRating.rows[0].rating,
    });
  } catch (error) {
    console.error("Error submitting project rating:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Controller to add a mentor to a project
exports.addMentorRole = async (req, res) => {
  const { projectId } = req.params;
  const { memberId } = req.body;
  const leaderId = req.user.id;

  try {
    // 1. Check if the logged-in user is the project leader
    const project = await pool.query(
      "SELECT leader_id FROM projects WHERE id = $1",
      [projectId]
    );

    if (project.rows.length === 0 || project.rows[0].leader_id !== leaderId) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Only the project leader can assign mentor roles.",
      });
    }

    // 2. Check if the project already has 2 mentors
    const mentorCount = await pool.query(
      "SELECT COUNT(*) FROM project_members WHERE project_id = $1 AND role = 'mentor'",
      [projectId]
    );

    if (parseInt(mentorCount.rows[0].count) >= 2) {
      return res.status(403).json({
        success: false,
        message:
          "This project has already reached the maximum mentor limit (2).",
      });
    }

    // 3. Update the member's role in the project_members table
    await pool.query(
      "UPDATE project_members SET role = 'mentor' WHERE project_id = $1 AND member_id = $2 AND status = 'accepted'",
      [projectId, memberId]
    );

    // 4. Update the user's global roles to include 'mentor' if they don't have it
    await pool.query(
      "UPDATE users SET roles = array_append(roles, 'mentor') WHERE id = $1 AND 'mentor' <> ALL(roles)",
      [memberId]
    );

    res
      .status(200)
      .json({ success: true, message: "Mentor role assigned successfully!" });
  } catch (error) {
    console.error("Error adding mentor role:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Controller to get project messages
exports.getProjectMessages = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    // First, verify that the user is a member of the project
    const isMember = await pool.query(
      "SELECT * FROM project_members WHERE project_id = $1 AND member_id = $2 AND status = 'accepted'",
      [projectId, userId]
    );

    if (isMember.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a member of this project.",
      });
    }

    const messages = await pool.query(
      "SELECT pm.id, pm.message_text, pm.sent_at, u.full_name AS sender_name FROM project_messages pm JOIN users u ON pm.sender_id = u.id WHERE pm.project_id = $1 ORDER BY pm.sent_at ASC",
      [projectId]
    );

    res.status(200).json({ success: true, messages: messages.rows });
  } catch (error) {
    console.error("Error fetching project messages:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Controller to post a new message
exports.postProjectMessage = async (req, res) => {
  const { projectId } = req.params;
  const { messageText } = req.body;
  const userId = req.user.id;

  try {
    // First, verify that the user is an accepted member of the project
    const isMember = await pool.query(
      "SELECT * FROM project_members WHERE project_id = $1 AND member_id = $2 AND status = 'accepted'",
      [projectId, userId]
    );

    if (isMember.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not an active member of this project.",
      });
    }

    // Insert the new message
    await pool.query(
      "INSERT INTO project_messages (project_id, sender_id, message_text) VALUES ($1, $2, $3)",
      [projectId, userId, messageText]
    );

    res
      .status(201)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error posting message:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Controller to get all projects for the logged-in user
exports.getUserProjects = async (req, res) => {
  const userId = req.user.id;
  try {
    const projects = await pool.query(
      `SELECT p.*, 
        (SELECT AVG(rating) FROM project_members WHERE project_id = p.id AND has_rated = TRUE) AS avg_rating
      FROM projects p
      WHERE p.leader_id = $1
      ORDER BY p.created_at DESC`,
      [userId]
    );
    // Parse tech_stack and required_skills from Postgres arrays if needed
    const formatted = projects.rows.map((p) => ({
      ...p,
      tech_stack: Array.isArray(p.tech_stack)
        ? p.tech_stack
        : typeof p.tech_stack === "string"
        ? p.tech_stack
            .replace(/[{}]/g, "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      required_skills: Array.isArray(p.required_skills)
        ? p.required_skills
        : typeof p.required_skills === "string"
        ? p.required_skills
            .replace(/[{}]/g, "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    }));
    res.status(200).json({ success: true, projects: formatted });
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ message: "Server error fetching user projects." });
  }
};

// Apply to join a project
exports.applyToProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  
  try {
    // Check if user is already a member or has pending request
    const existingMembership = await pool.query(
      "SELECT * FROM project_members WHERE project_id = $1 AND member_id = $2",
      [projectId, userId]
    );

    if (existingMembership.rows.length > 0) {
      const status = existingMembership.rows[0].status;
      if (status === 'accepted') {
        return res.status(400).json({ message: "You are already a member of this project." });
      } else if (status === 'pending') {
        return res.status(400).json({ message: "You have already applied to this project." });
      }
    }

    // Check if project exists and get project details
    const project = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [projectId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Check if user is the project leader
    if (project.rows[0].leader_id === userId) {
      return res.status(400).json({ message: "You cannot apply to your own project." });
    }

    // Check if project has reached max members
    const currentMembers = await pool.query(
      "SELECT COUNT(*) as member_count FROM project_members WHERE project_id = $1 AND status = 'accepted'",
      [projectId]
    );

    const memberCount = parseInt(currentMembers.rows[0].member_count);
    if (memberCount >= project.rows[0].max_members) {
      return res.status(400).json({ message: "This project has reached its maximum number of members." });
    }

    // Insert the application with 'pending' status
    await pool.query(
      "INSERT INTO project_members (project_id, member_id, role, status) VALUES ($1, $2, $3, $4)",
      [projectId, userId, 'member', 'pending']
    );

    res.status(200).json({ 
      success: true, 
      message: "Application submitted successfully! The project leader will review your request." 
    });
  } catch (error) {
    console.error("Error applying to project:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
