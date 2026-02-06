require("dotenv").config();
const mongoose = require("mongoose");
const Project = require("./models/Project");

async function checkProjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    const projectCount = await Project.countDocuments();
    console.log(`\nTotal projects in database: ${projectCount}`);

    if (projectCount > 0) {
      const projects = await Project.find().limit(5).lean();
      console.log("\nSample projects:");
      projects.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.title}`);
        console.log(`   - ID: ${p._id}`);
        console.log(`   - Image: ${p.projectImage || 'No image'}`);
        console.log(`   - Leader: ${p.leaderId}`);
      });
    } else {
      console.log("\n⚠️  Your MongoDB database is EMPTY!");
      console.log("This is why you're seeing placeholders instead of actual project images.");
      console.log("\nYou need to either:");
      console.log("1. Create new projects through your frontend, OR");
      console.log("2. Migrate your existing data from PostgreSQL to MongoDB");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkProjects();
