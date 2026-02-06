require("dotenv").config();
const express = require("express");

console.log("Testing route imports...");

try {
  console.log("1. Loading userRoutes...");
  const userRoutes = require("./routes/userRoutes");
  console.log("✓ userRoutes loaded");

  console.log("2. Loading projectRoutes...");
  const projectRoutes = require("./routes/projectRoutes");
  console.log("✓ projectRoutes loaded");

  console.log("3. Loading taskRoutes...");
  const taskRoutes = require("./routes/taskRoutes");
  console.log("✓ taskRoutes loaded");

  console.log("4. Loading messageRoutes...");
  const messageRoutes = require("./routes/messageRoutes");
  console.log("✓ messageRoutes loaded");

  console.log("5. Loading geminiRoutes...");
  const geminiRoutes = require("./routes/geminiRoutes");
  console.log("✓ geminiRoutes loaded");

  console.log("6. Loading recommendation.routes...");
  const recommendationRoutes = require("./routes/recommendation.routes");
  console.log("✓ recommendation.routes loaded");

  console.log("\n✓ All routes loaded successfully!");
} catch (error) {
  console.error("\n✗ Error loading routes:");
  console.error(error);
  process.exit(1);
}
