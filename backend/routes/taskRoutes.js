const express = require("express");
const router = express.Router();
const taskController = require("../controller/taskController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Create a new task
router.post("/:projectId/tasks", taskController.createTask);
// Get all tasks for a project
router.get("/:projectId/tasks", taskController.getProjectTasks);
// Update a task
router.patch("/:projectId/tasks/:taskId", taskController.updateTask);
// Delete a task
router.delete("/:projectId/tasks/:taskId", taskController.deleteTask);

module.exports = router;
