const Message = require("./models/Message");
const Project = require("./models/Project");
const ProjectMember = require("./models/ProjectMember");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cookie = require("cookie");

module.exports = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      // Extract token from cookie
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;
      
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.userId} | Socket ID: ${socket.id}`);

    // Join a project room
    socket.on("join-project", async (projectId) => {
      console.log(`📥 Join request - User: ${socket.userId}, Project: ${projectId}`);
      try {
        // Validate projectId
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
          console.error(`Invalid project ID: ${projectId}`);
          return;
        }

        // Verify user is member or leader
        const membership = await ProjectMember.findOne({
          projectId,
          memberId: socket.userId,
          status: "accepted",
        });

        const project = await Project.findById(projectId);
        const isLeader = project && project.leaderId.toString() === socket.userId.toString();

        if (membership || isLeader) {
          socket.join(`project:${projectId}`);
          console.log(`✅ User ${socket.userId} joined project room: ${projectId}`);
        } else {
          console.log(`❌ User ${socket.userId} not authorized for project: ${projectId}`);
        }
      } catch (err) {
        console.error(`❌ Error joining project ${projectId}:`, err.message);
      }
    });

    // Leave a project room
    socket.on("leave-project", (projectId) => {
      socket.leave(`project:${projectId}`);
      console.log(`🚪 User ${socket.userId} left project ${projectId}`);
    });

    // Send a message
    socket.on("send-message", async (data) => {
      console.log(`📨 Send message request from User ${socket.userId}:`, data);
      try {
        const { projectId, message_text } = data;

        // Validate projectId
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
          console.error(`Invalid project ID in send-message: ${projectId}`);
          return;
        }

        // Verify user is member or leader
        const membership = await ProjectMember.findOne({
          projectId,
          memberId: socket.userId,
          status: "accepted",
        });

        const project = await Project.findById(projectId);
        const isLeader = project && project.leaderId.toString() === socket.userId.toString();

        if (!membership && !isLeader) {
          return;
        }

        // Save message to database
        const newMessage = await Message.create({
          projectId,
          senderId: socket.userId,
          messageText: message_text.trim(),
          sentAt: new Date(),
        });

        // Populate sender info
        await newMessage.populate("senderId", "fullName");

        // Format message for frontend
        const formattedMessage = {
          id: newMessage._id.toString(),
          sender_id: newMessage.senderId._id.toString(),
          sender_name: newMessage.senderId.fullName,
          message_text: newMessage.messageText,
          sent_at: newMessage.sentAt,
        };

        // Broadcast to all users in the project room
        io.to(`project:${projectId}`).emit("new-message", formattedMessage);
        console.log(`✅ Message broadcast to project:${projectId}`);
      } catch (err) {
        console.error(`❌ Error sending message:`, err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.userId} | Socket ID: ${socket.id}`);
    });
  });
};
