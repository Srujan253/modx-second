const { getUserRecommendations, checkAIServiceHealth, triggerIndexing } = require("./backend/grpcClient");
require("dotenv").config({ path: "./backend/.env" });

async function test() {
  console.log("Checking AI Service health...");
  const isHealthy = await checkAIServiceHealth();
  console.log("AI Service Healthy:", isHealthy);

  if (!isHealthy) {
    console.log("AI Service is NOT healthy. Recommendations will fallback to all projects.");
  } else {
    console.log("AI Service is healthy. Testing indexing...");
    const indexStatus = await triggerIndexing();
    console.log("Indexing Status:", indexStatus);

    console.log("Testing recommendation for 'AI and Machine Learning'...");
    const response = await getUserRecommendations("User with interests in AI and Machine Learning");
    console.log("Recommendation Response:", JSON.stringify(response, null, 2));
  }
}

test().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
