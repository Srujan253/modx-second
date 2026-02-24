const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const connectDB = require("../config/database");

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = process.argv[2] || "srujanhm135@gmail.com";
    const password = process.argv[3] || "modxx@sakshath";
    const fullName = process.argv[4] || "Srujan";

    if (!email || !password) {
      console.log("Usage: node scripts/seedAdmin.js <email> <password> [fullName]");
      process.exit(1);
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      console.log(`User ${email} already exists. Promoting to admin...`);
      user.role = "admin";
      user.isVerified = true;
      await user.save();
      console.log(`User ${email} is now an admin.`);
    } else {
      console.log(`Creating new admin user: ${email}...`);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      user = await User.create({
        fullName,
        email,
        passwordHash,
        role: "admin",
        isVerified: true,
      });

      console.log(`Admin user ${email} created successfully.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
