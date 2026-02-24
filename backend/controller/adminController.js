const User = require("../models/User");

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
