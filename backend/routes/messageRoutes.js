const express = require("express");
const router = express.Router();
const messageController = require("../controller/messageController");
const protect = require("../middleware/authMiddleware");

// Get all messages for a project (only for members/leaders)
router.get(
  "/:projectId/messages",
  protect,
  messageController.getProjectMessages
);

// Post a new message to a project (only for members/leaders)
router.post(
  "/:projectId/messages",
  protect,
  messageController.postProjectMessage
);

module.exports = router;
