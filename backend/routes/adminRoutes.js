const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  promoteToAdmin,
  deleteUser,
} = require("../controller/adminController");
const protect = require("../middleware/authMiddleware");
const adminProtect = require("../middleware/adminMiddleware");

// All routes here require being logged in and being an admin
router.use(protect);
router.use(adminProtect);

router.get("/users", getAllUsers);
router.patch("/users/:userId/promote", promoteToAdmin);
router.delete("/users/:userId", deleteUser);

// Projects Management
router.get("/projects", require("../controller/adminController").getAllProjects);
router.delete("/projects/:projectId", require("../controller/adminController").deleteProject);

module.exports = router;
