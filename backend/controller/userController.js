// Public profile fetch by userId
exports.getUserPublicProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await pool.query(
      "SELECT id, full_name, email, role, created_at FROM users WHERE id = $1",
      [userId]
    );
    if (!user.rows[0])
      return res.status(404).json({ message: "User not found" });
    res.json({ user: user.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
const pool = require("../db");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/email");
const sendToken = require("../utils/sendToken");
const { triggerIndexing } = require("../grpcClient");

// Handles Step 1 & 2: Register user and send OTP
exports.register = async (req, res) => {
  const { fullName, email, password, role, interest, otherInterest } = req.body;
  try {
    // First, delete any previous unverified attempts with the same email
    await pool.query(
      "DELETE FROM users WHERE email = $1 AND is_verified = FALSE",
      [email]
    );

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role, interest, other_interest, otp_code, otp_expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email",
      [
        fullName,
        email,
        passwordHash,
        role,
        interest,
        otherInterest,
        otp,
        otpExpires,
      ]
    );

    await sendEmail({
      email: newUser.rows[0].email,
      subject: "Your MoDX Verification Code",
      message: `Welcome to MoDX! Your verification code is: ${otp}`,
    });

    res.status(201).json({
      message: "Registration successful! An OTP has been sent to your email.",
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
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user || user.otp_code !== otp || new Date() > user.otp_expires_at) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Mark user as verified and clear the OTP fields
    await pool.query(
      "UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL WHERE email = $1",
      [email]
    );
    triggerIndexing().catch((err) =>
      console.error("Indexing error after verification:", err)
    );

    // THE FIX: Instead of calling sendToken, return a simple success message.
    res.status(200).json({
      success: true,
      message: "Account verified successfully! Please proceed to login.",
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: "Server error during verification." });
  }
};

// --- NEW LOGOUT FUNCTION ---
exports.logout = (req, res) => {
  // To log out, we clear the 'token' cookie by setting its expiration to the past.
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
    httpOnly: true,
  });
  res
    .status(200)
    .json({ success: true, message: "User logged out successfully." });
};

// --- NEW FUNCTION TO VERIFY USER SESSION ---
exports.getMe = async (req, res) => {
  // This is a protected route. A middleware will run first to verify the token
  // and attach the user's ID to req.user.
  try {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    if (!user.rows[0]) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, user: user.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
    // console.log(error);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (!user.is_verified) {
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in." });
    }
    sendToken(user, 200, res, "Login successful.");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// --- NEW UPDATE ME FUNCTION ---
exports.updateMe = async (req, res) => {
  const { full_name, role, interest, other_interest } = req.body;
  try {
    // Only update allowed fields
    const result = await pool.query(
      `UPDATE users SET full_name = $1, role = $2, interest = $3, other_interest = $4 WHERE id = $5 RETURNING id, full_name, role, interest, other_interest`,
      [full_name, role, interest, other_interest, req.user.id]
    );
    if (!result.rows[0]) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    triggerIndexing().catch((err) =>
      console.error("Indexing error after verification:", err)
    );
    res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error updating profile." });
  }
};
