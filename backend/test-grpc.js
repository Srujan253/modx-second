const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "protos/ai.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const ai_proto = grpc.loadPackageDefinition(packageDefinition).ai;
const client = new ai_proto.AIService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

const testChat = () => {
  console.log("Testing GetChatbotResponse...");
  client.GetChatbotResponse({ query: "Hello" }, (err, response) => {
    if (err) {
      console.error("GetChatbotResponse Error:", err);
    } else {
      console.log("GetChatbotResponse Response:", response);
    }
  });
};

const testRelated = () => {
  console.log("Testing GetRelatedProjects...");
  client.GetRelatedProjects({ query_text: "Project with React" }, (err, response) => {
    if (err) {
      console.error("GetRelatedProjects Error:", err);
    } else {
      console.log("GetRelatedProjects Response:", response);
    }
  });
};

setTimeout(testChat, 1000);
setTimeout(testRelated, 3000);
