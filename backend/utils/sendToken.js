const jwt = require("jsonwebtoken");

const sendToken = (user, statusCode, res, message) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  // --- COOKIE OPTIONS ---
  const cookieOptions = {
    // Set the cookie to expire when the JWT expires
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Example: 1 day
    httpOnly: true, // IMPORTANT: Prevents JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: "strict", // Helps prevent CSRF attacks
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions) // Set the token in a cookie named 'token'
    .json({
      success: true,
      message,
      // We no longer send the token in the body, but we can still send user info
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
};

module.exports = sendToken;
