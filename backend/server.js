require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// --- CORS SETUP ---
const rawOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : ["http://localhost:5173", "http://localhost:5000"];

const allowedOrigins = rawOrigins
  .map(origin => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

console.log("🚀 Server Environment Status:");
console.log("- NODE_ENV:", process.env.NODE_ENV || "development");
console.log("- PORT:", port);
console.log("- ALLOWED_ORIGINS:", allowedOrigins);
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "✔️ Configured" : "❌ Missing");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "✔️ Configured" : "❌ Missing");

const checkOrigin = (origin, callback) => {
  // If no origin (like mobile/curl), allow it
  if (!origin) return callback(null, true);
  
  const normalizedOrigin = origin.replace(/\/+$/, "");
  
  // Check if origin is allowed
  const isAllowed = allowedOrigins.includes("*") || allowedOrigins.includes(normalizedOrigin);
  
  if (isAllowed) {
    callback(null, true);
  } else {
    // In production, let's allow onrender.com subdomains automatically to prevent outages
    if (normalizedOrigin.endsWith(".onrender.com")) {
      console.log(`💡 Auto-allowing onrender.com origin: ${normalizedOrigin}`);
      return callback(null, true);
    }
    console.warn(`⚠️ CORS Rejection: Origin "${origin}" is not in the allowed list.`);
    callback(null, false);
  }
};

const corsOptions = {
  origin: checkOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// --- MIDDLEWARE ---
app.use(helmet({
  contentSecurityPolicy: false, 
}));
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// --- ROUTES ---
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/project", require("./routes/projectRoutes"));
app.use("/api/v1/project", require("./routes/taskRoutes"));
app.use("/api/v1/recommendations", require("./routes/recommendation.routes"));
app.use("/api/v1/ai", require("./routes/geminiRoutes"));
app.use("/api/v1/messages", require("./routes/messageRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));

// Serve uploaded images statically
app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("MoDX Backend is running!");
});

// --- 404 HANDLER ---
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// --- CREATE HTTP SERVER ---
const server = http.createServer(app);

// --- SOCKET.IO SETUP ---
const io = new Server(server, {
  cors: {
    origin: checkOrigin,
    credentials: true,
  },
});

// Import socket handlers
require("./socketHandlers")(io);

// --- SERVER STARTUP ---
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
  console.log(`Socket.IO is ready for real-time messaging`);
});
