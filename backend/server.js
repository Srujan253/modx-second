require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const app = express();

require("dotenv").config();

const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");

// Connect to MongoDB
connectDB();

const port = process.env.PORT || 5000;

// --- CORS SETUP ---
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : ["http://localhost:5173", "http://localhost:5000"]; 

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// --- MIDDLEWARE ---
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for now to avoid blocking Cloudinary/Socket.io
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser()); // Use cookie-parser to read cookies from requests

// --- ROUTES ---
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/project", require("./routes/projectRoutes"));
app.use("/api/v1/project", require("./routes/taskRoutes"));
app.use("/api/v1/recommendations", require("./routes/recommendation.routes"));
// Gemini API route
const aiRoutes = require("./routes/geminiRoutes");
app.use("/api/v1/ai", aiRoutes);

const messageRoutes = require("./routes/messageRoutes");
app.use("/api/v1/messages", messageRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/v1/admin", adminRoutes);

// Serve uploaded images statically
app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("MoDX Backend is running!");
});

// --- CREATE HTTP SERVER ---
const server = http.createServer(app);

// --- SOCKET.IO SETUP ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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
