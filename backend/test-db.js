require("dotenv").config();
const mongoose = require("mongoose");

console.log("Testing MongoDB connection...");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "Not set");

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✓ MongoDB connection successful!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("✗ MongoDB connection failed:");
    console.error(err);
    process.exit(1);
  });
