require("dotenv").config();

console.log("Testing projectRoutes import...");

try {
  const projectRoutes = require("./routes/projectRoutes");
  console.log("✓ projectRoutes loaded successfully!");
  console.log("Type:", typeof projectRoutes);
} catch (error) {
  console.error("\n✗ Error loading projectRoutes:");
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
