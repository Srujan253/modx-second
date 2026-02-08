const Project = require("../models/Project");
const User = require("../models/User");
const mongoose = require("mongoose");
const {
  getUserRecommendations,
  getRelatedProjects,
  searchProjects,
} = require("../grpcClient");
const ErrorHandler = require("../utils/errorHandler");

// Helper function to extract numerical IDs from strings like "project_123"
// MongoDB uses ObjectIds, so we need to validate them
const extractProjectIds = (idStrings) => {
  if (!Array.isArray(idStrings)) return [];
  return idStrings
    .filter((id) => id && id.startsWith("project_"))
    .map((id) => id.split("_")[1])
    .filter((id) => id && mongoose.Types.ObjectId.isValid(id));
};

// Helper function to fetch full project details from a list of IDs
const fetchFullProjectDetails = async (projectIds) => {
  if (!projectIds || projectIds.length === 0) return [];

  const projects = await Project.find({ _id: { $in: projectIds } }).lean();

  // Create a map: id -> project
  const projectMap = new Map(projects.map((p) => [p._id.toString(), p]));

  // Reconstruct array in the order of projectIds
  return projectIds.map((id) => projectMap.get(id)).filter(Boolean);
};

// 1. For the Explore Page (Personalized)
exports.recommendForUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("interest otherInterest");
    if (!user) return next(new ErrorHandler("User not found.", 404));

    let allProjects = [];

    try {
      const profileText = `User with interests in ${user.interest} and skills in ${user.otherInterest}.`;

      // Step 1: Try to get recommendations from AI service
      const response = await getUserRecommendations(profileText);
      const recommendedIds = extractProjectIds(response.recommended_ids || []);

      if (recommendedIds.length > 0) {
        // Step 2: Split into top 6 and remaining
        const top6Ids = recommendedIds.slice(0, 6);
        const remainingIds = recommendedIds.slice(6);

        // Step 3: Fetch projects in order
        const topProjects = await fetchFullProjectDetails(top6Ids);
        const remainingProjects = await fetchFullProjectDetails(remainingIds);

        // Step 4: Combine them (top first, then remaining)
        allProjects = [...topProjects, ...remainingProjects];
      }
    } catch (aiError) {
      console.log("AI recommendation service unavailable, falling back to all projects");
    }

    // Fallback: If AI service failed or returned no results, show all projects
    if (allProjects.length === 0) {
      allProjects = await Project.find()
        .populate("leaderId", "fullName")
        .sort({ createdAt: -1 })
        .lean();
      
      // Add field mappings for frontend compatibility
      allProjects = allProjects.map(project => ({
        ...project,
        id: project._id.toString(),
        project_image: project.projectImage,
        required_skills: project.requiredSkills,
        tech_stack: project.techStack,
        max_members: project.maxMembers,
        leader_name: project.leaderId?.fullName,
        leader_id: project.leaderId?._id.toString(),
        created_at: project.createdAt,
        updated_at: project.updatedAt,
      }));
    }

    res.status(200).json({
      success: true,
      recommendations: allProjects,
    });
  } catch (error) {
    next(error);
  }
};

// 2. For the Project Detail Page (Related: Top 6 + Others)
exports.recommendRelated = async (req, res, next) => {
  try {
    const currentProjectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(currentProjectId)) {
      return next(new ErrorHandler("Invalid project ID.", 400));
    }

    const project = await Project.findById(currentProjectId).select(
      "title description techStack requiredSkills"
    );
    if (!project) return next(new ErrorHandler("Project not found.", 404));

    const skillsStr = project.requiredSkills?.join(", ") || "";
    const techStr = project.techStack?.join(", ") || "";
    const projectText = `Project titled "${project.title}" with description: ${project.description}. Technologies: ${techStr}. Skills: ${skillsStr}`;

    // Step 1: Get the top 6 related project IDs from the AI service
    const response = await getRelatedProjects(projectText);
    const recommendedIds = extractProjectIds(response.recommended_ids || []).filter(
      (id) => id !== currentProjectId
    );

    // Step 2: Fetch the full details for these recommended projects
    const topRecommendations = await fetchFullProjectDetails(recommendedIds);

    // Step 3: Fetch ALL other projects, excluding the current one and the ones already recommended
    const idsToExclude = [
      currentProjectId,
      ...topRecommendations.map((p) => p._id.toString()),
    ];
    const otherProjects = await Project.find({
      _id: { $nin: idsToExclude },
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      recommendations: {
        top: topRecommendations,
        other: otherProjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. For the Search Bar (Top 6 results)
exports.searchByQuery = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q)
      return res
        .status(400)
        .json({ success: false, message: "Search query is required." });

    // Step 1: Get the top 6 search result IDs from the AI service
    const response = await searchProjects(q);
    const resultIds = extractProjectIds(response.recommended_ids || []);

    // Step 2: Fetch the full details for these IDs
    const projects = await fetchFullProjectDetails(resultIds);

    res.status(200).json({ success: true, results: projects });
  } catch (error) {
    next(error);
  }
};
