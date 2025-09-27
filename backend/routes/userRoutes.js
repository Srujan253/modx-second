const express = require("express");
const router = express.Router();
const {
  register,
  verify,
  login,
  getMe,
  logout,
} = require("../controller/userController");
const protect = require("../middleware/authMiddleware");

// Get current user profile
router.get("/me", protect, getMe);

// Update current user profile (only allowed fields)
const { updateMe } = require("../controller/userController");
router.patch("/me", protect, updateMe);

// Route for Step 1 & 2
router.post("/register", register);

// Route for Step 3
router.post("/verify", verify);

router.post("/login", login);
router.post("/logout", logout);

const { getUserPublicProfile } = require("../controller/userController");
router.get("/:userId", getUserPublicProfile);

module.exports = router;
