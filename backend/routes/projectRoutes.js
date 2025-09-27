// Remove a member from a project (leader only)

const express = require("express");
const router = express.Router();
const projectController = require("../controller/projectController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

// IMPORTANT: Specific routes MUST come before parameterized routes

// Explore projects (public, with filters)
router.get("/explore", protect, projectController.exploreProjects);

// Get all project invitations for the logged-in user
router.get("/invites", protect, projectController.getUserInvites);

// Get all projects where user is a member (accepted) or has a pending request
router.get("/memberships", protect, projectController.getUserMemberships);

// Get all projects for the logged-in user
router.get("/user-projects", protect, projectController.getUserProjects);

// Public project details (no auth required)
router.get("/public/:projectId", projectController.getProjectDetailsPublic);

// Create a new project (with image upload)
router.post(
  "/",
  protect,
  upload.single("projectImage"),
  projectController.createProject
);
router.delete(
  "/:projectId/members/:memberId",
  protect,
  projectController.removeMember
);

// PARAMETERIZED ROUTES - These must come AFTER specific routes

// Get all accepted members of a project (for task assignment, etc.)
router.get("/:projectId/members", protect, projectController.getProjectMembers);

// Apply to join a project
router.post("/:projectId/apply", protect, projectController.applyToProject);

// Get pending join requests (leader only)
router.get(
  "/:projectId/requests",
  protect,
  projectController.getPendingRequests
);

// Accept or reject a join request (leader only)
router.patch(
  "/:projectId/requests/:memberId",
  protect,
  projectController.updateMembershipStatus
);

// Accept a join request (alternative endpoint)
router.post(
  "/:projectId/requests/:requestId/accept",
  protect,
  projectController.acceptJoinRequest
);

// Reject a join request (alternative endpoint)
router.delete(
  "/:projectId/requests/:requestId",
  protect,
  projectController.rejectJoinRequest
);

// Get potential members for invitation
router.get(
  "/:projectId/potential-members",
  protect,
  projectController.getPotentialMembers
);

// Invite a user to a project (leader only)
router.post("/:projectId/invite", protect, projectController.inviteMember);

// Add a member to a project
router.post("/:projectId/members", protect, projectController.addProjectMember);

// Submit a project rating
router.post("/:projectId/rate", protect, projectController.submitProjectRating);

// Add mentor role
router.post("/:projectId/mentor", protect, projectController.addMentorRole);

// Get project messages
router.get(
  "/:projectId/messages",
  protect,
  projectController.getProjectMessages
);

// Post a new message
router.post(
  "/:projectId/messages",
  protect,
  projectController.postProjectMessage
);

// Get project details (protected route)
router.get("/:projectId", protect, projectController.getProjectDetails);

// Edit project (leader only, with image upload)
router.put(
  "/:projectId",
  protect,
  upload.single("projectImage"),
  projectController.editProject
);

// Delete project (leader only)
router.delete("/:projectId", protect, projectController.deleteProject);

module.exports = router;
