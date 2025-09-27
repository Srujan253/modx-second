const pool = require("../db"); // Your PostgreSQL connection pool
const {
  getUserRecommendations,
  getRelatedProjects,
  searchProjects,
} = require("../grpcClient");
const ErrorHandler = require("../utils/errorHandler");

// Helper function to extract numerical IDs from strings like "project_123"
const extractProjectIds = (idStrings) => {
  if (!Array.isArray(idStrings)) return [];
  return idStrings
    .filter((id) => id && id.startsWith("project_"))
    .map((id) => parseInt(id.split("_")[1]))
    .filter((id) => !isNaN(id));
};

// Helper function to fetch full project details from a list of IDs
const fetchFullProjectDetails = async (projectIds) => {
  if (!projectIds || projectIds.length === 0) return [];

  const queryText = "SELECT * FROM projects WHERE id = ANY($1::int[])";
  const result = await pool.query(queryText, [projectIds]);

  // Create a map: id -> project
  const projectMap = new Map(result.rows.map((p) => [p.id, p]));

  // Reconstruct array in the order of projectIds
  return projectIds.map((id) => projectMap.get(id)).filter(Boolean); // filter out missing projects if any
};

// 1. For the Explore Page (Personalized)
exports.recommendForUser = async (req, res, next) => {
  try {
    const userResult = await pool.query(
      "SELECT interest, other_interest FROM users WHERE id = $1",
      [req.user.id]
    );
    if (userResult.rows.length === 0)
      return next(new ErrorHandler("User not found.", 404));

    const user = userResult.rows[0];
    const profileText = `User with interests in ${user.interest} and skills in ${user.other_interest}.`;

    // Step 1: Get all recommended IDs from the AI service
    const response = await getUserRecommendations(profileText);
    const recommendedIds = extractProjectIds(response.recommended_ids || []);

    if (recommendedIds.length === 0) {
      return res.status(200).json({ success: true, recommendations: [] });
    }

    // Step 2: Split into top 6 and remaining
    const top6Ids = recommendedIds.slice(0, 6);
    const remainingIds = recommendedIds.slice(6);

    // Step 3: Fetch projects in order
    const topProjects = await fetchFullProjectDetails(top6Ids);
    const remainingProjects = await fetchFullProjectDetails(remainingIds);
    // console.log("Top Projects:", topProjects);
    // console.log("Remaining Projects:", remainingProjects);

    // Step 4: Combine them (top first, then remaining)
    const allProjects = [...topProjects, ...remainingProjects];
    // console.log("All Recommended Projects:", allProjects);

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
    const currentProjectId = parseInt(req.params.id);
    const projectResult = await pool.query(
      "SELECT title, description FROM projects WHERE id = $1",
      [currentProjectId]
    );
    if (projectResult.rows.length === 0)
      return next(new ErrorHandler("Project not found.", 404));

    const project = projectResult.rows[0];
    const projectText = `Project titled "${project.title}" with description: ${project.description}`;

    // Step 1: Get the top 6 related project IDs from the AI service
    const response = await getRelatedProjects(projectText);
    const recommendedIds = extractProjectIds(
      response.recommended_ids || []
    ).filter((id) => id !== currentProjectId);

    // Step 2: Fetch the full details for these recommended projects
    const topRecommendations = await fetchFullProjectDetails(recommendedIds);

    // Step 3: Fetch ALL other projects, excluding the current one and the ones already recommended
    const idsToExclude = [
      currentProjectId,
      ...topRecommendations.map((p) => p.id),
    ];
    const otherProjectsResult = await pool.query(
      "SELECT * FROM projects WHERE id != ALL($1::int[]) ORDER BY created_at DESC",
      [idsToExclude]
    );

    res.status(200).json({
      success: true,
      recommendations: {
        top: topRecommendations,
        other: otherProjectsResult.rows,
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
    // console.log("gRPC Search Response:", response);
    const resultIds = extractProjectIds(response.recommended_ids || []);

    // Step 2: Fetch the full details for these IDs
    const projects = await fetchFullProjectDetails(resultIds);

    res.status(200).json({ success: true, results: projects });
  } catch (error) {
    next(error);
  }
};
