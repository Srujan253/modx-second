// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const protect = async (req, res, next) => {
  try {
    // 1. Get token from the cookie.
    // We assume the cookie is named 'token', as you set it in your sendToken function.
    const token = req.cookies.token;

    // Check if the token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You are not logged in. Please log in to get access.",
      });
    }

    // 2. Verify the token
    // The promisify function turns the jwt.verify callback-based function into a Promise
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. Attach the decoded user data to the request object
    // The getMe controller will now be able to access req.user.id
    req.user = decoded;

    // 4. Move to the next middleware or the route handler
    next();
  } catch (error) {
    // Handle invalid or expired tokens
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = protect;
