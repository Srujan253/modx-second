const express = require("express");
const router = express.Router();
const projectController = require("../controller/projectController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

// Explore projects (public, with filters)
router.get("/explore", protect, projectController.exploreProjects);
router.get("/public/:projectId", projectController.getProjectDetailsPublic);

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

// Create a new project (with image upload)
router.post(
  "/",
  protect,
  upload.single("projectImage"),
  projectController.createProject
);
// Get all project invitations for the logged-in user
router.get("/invites", protect, projectController.getUserInvites);

// Get all projects where user is a member (accepted) or has a pending request
router.get("/memberships", protect, projectController.getUserMemberships);

// Get all projects for the logged-in user
router.get("/user-projects", protect, projectController.getUserProjects);
// Add a member to a project
router.post("/:projectId/members", protect, projectController.addProjectMember);
// Get project details
router.get("/:projectId", protect, projectController.getProjectDetails);
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
router.get("/explore", protect, projectController.exploreProjects);

// Apply to join a project
router.post("/:projectId/apply", protect, projectController.applyToProject);

router.post(
  "/:projectId/requests/:requestId/accept",
  protect,
  projectController.acceptJoinRequest
);

// Reject a join request
router.delete(
  "/:projectId/requests/:requestId",
  protect,
  projectController.rejectJoinRequest
);
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

router.get("/memberships", protect, projectController.getUserMemberships);

router.get(
  "/:projectId/potential-members",
  protect,
  projectController.getPotentialMembers
);

// Invite a user to a project (leader only)
router.post("/:projectId/invite", protect, projectController.inviteMember);

// Get all projects for the logged-in user
router.get("/user-projects", protect, projectController.getUserProjects);

router.get("/invites", protect, projectController.getUserInvites);

module.exports = router;
