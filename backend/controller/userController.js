const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/email");
const sendToken = require("../utils/sendToken");
const { triggerIndexing } = require("../grpcClient");

// Public profile fetch by userId
exports.getUserPublicProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select(
      "fullName email role createdAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Handles Step 1 & 2: Register user and send OTP
exports.register = async (req, res) => {
  const { fullName, email, password, role, interests } = req.body;
  try {
    // First, delete any previous unverified attempts with the same email
    await User.deleteMany({ email, isVerified: false });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await User.create({
      fullName,
      email,
      passwordHash,
      role,
      interests: interests || [],
      otpCode: otp,
      otpExpiresAt: otpExpires,
      isVerified: true, // Automatically verify for now
    });

    // Commented out email verification for now
    /*
    await sendEmail({
      email: newUser.email,
      subject: "Your MoDX Verification Code",
      message: `Welcome to MoDX! Your verification code is: ${otp}`,
    });
    */

    res.status(201).json({
      message: "Registration successful! You can now login.",
      skipVerification: true, // Hint for frontend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// Handles Step 3: Verify OTP and complete signup
exports.verify = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || user.otpCode !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Mark user as verified and clear the OTP fields
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    triggerIndexing().catch((err) =>
      console.error("Indexing error after verification:", err)
    );

    res.status(200).json({
      success: true,
      message: "Account verified successfully! Please proceed to login.",
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: "Server error during verification." });
  }
};

// Logout function
exports.logout = (req, res) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res
    .status(200)
    .json({ success: true, message: "User logged out successfully." });
};

// Get current user session
exports.getMe = async (req, res) => {
  try {
    // req.user.id comes from JWT token and might be a string
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Transform to match frontend expectations (snake_case)
    const transformedUser = {
      id: user._id,
      _id: user._id,
      full_name: user.fullName,
      email: user.email,
      username: user.username,
      profile_image_url: user.profileImageUrl,
      resume_url: user.resumeUrl,
      role: user.role,
      interests: user.interests || [],
      skills: user.skills || [],
      bio: user.bio || "",
      is_verified: user.isVerified,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };

    res.status(200).json({ success: true, user: transformedUser });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    /* 
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in." });
    }
    */
    sendToken(user, 200, res, "Login successful.");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// Update user profile
exports.updateMe = async (req, res) => {
  const { full_name, role, interests, skills, bio, profileImage, resume } = req.body;
  console.log("📝 Update profile request received");
  console.log("Profile image present:", !!profileImage);
  console.log("Resume present:", !!resume);
  
  try {
    const updateData = {
      fullName: full_name,
      role,
      interests: interests || [],
      skills: skills || [],
      bio: bio || "",
    };

    // If profile image is provided, upload to Cloudinary
    if (profileImage) {
      console.log("🖼️ Uploading image to Cloudinary...");
      try {
        const { uploadBase64ToCloudinary } = require("../utils/uploadToCloudinary");
        const imageUrl = await uploadBase64ToCloudinary(profileImage, "modx/profiles");
        console.log("✅ Image uploaded successfully:", imageUrl);
        updateData.profileImageUrl = imageUrl;
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to upload image to Cloudinary",
          error: uploadError.message 
        });
      }
    }

    // If resume is provided, upload to Cloudinary
    if (resume) {
      console.log("📄 Uploading resume to Cloudinary...");
      try {
        const { uploadDocumentToCloudinary } = require("../utils/uploadToCloudinary");
        const resumeUrl = await uploadDocumentToCloudinary(resume, "modx/resumes");
        console.log("✅ Resume uploaded successfully:", resumeUrl);
        updateData.resumeUrl = resumeUrl;
      } catch (uploadError) {
        console.error("❌ Resume upload error:", uploadError);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to upload resume to Cloudinary",
          error: uploadError.message 
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("_id fullName role interests skills bio profileImageUrl resumeUrl");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    console.log("✅ Profile updated successfully");

    triggerIndexing().catch((err) =>
      console.error("Indexing error after update:", err)
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error updating profile.", error: error.message });
  }
};
