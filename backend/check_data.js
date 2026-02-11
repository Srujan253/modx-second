const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
require('dotenv').config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connected");

    const usersWithInterests = await User.find({interest: {$exists: true, $ne: ''}}, 'fullName interest otherInterest').limit(5);
    console.log("Users with interests:", JSON.stringify(usersWithInterests, null, 2));

    const projectsWithIndexing = await Project.find({indexedAt: {$exists: true}}, 'title indexedAt').limit(5);
    console.log("Projects already indexed:", JSON.stringify(projectsWithIndexing, null, 2));

    const totalProjects = await Project.countDocuments();
    const indexedProjects = await Project.countDocuments({indexedAt: {$exists: true}});
    console.log(`Summary: ${indexedProjects} out of ${totalProjects} projects indexed.`);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

check();
