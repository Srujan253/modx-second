require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

require("dotenv").config();

const cookieParser = require("cookie-parser");
const path = require("path");

const port = process.env.PORT || 5000;

// --- CORS SETUP ---
const allowedOrigins = ["http://localhost:5173"]; // Add your deployed frontend URL here later
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // This allows the browser to send cookies and credentials
};
app.use(cors(corsOptions));

// --- MIDDLEWARE ---
app.use(express.json());
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

// Serve uploaded images statically
app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("MoDX Backend is running!");
});

// --- SERVER STARTUP ---
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
