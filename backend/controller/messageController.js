const Message = require("../models/Message");
const Project = require("../models/Project");
const ProjectMember = require("../models/ProjectMember");

// Helper: check if user is a member or leader of the project
async function isProjectMemberOrLeader(projectId, userId) {
  const membership = await ProjectMember.findOne({
    projectId,
    memberId: userId,
    status: "accepted",
  });
  if (membership) return true;

  // Check if leader
  const project = await Project.findById(projectId);
  return project && project.leaderId.toString() === userId.toString();
}

// Get all messages for a project
exports.getProjectMessages = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  try {
    const allowed = await isProjectMemberOrLeader(projectId, userId);
    if (!allowed) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    const messages = await Message.find({ projectId })
      .populate("senderId", "fullName")
      .sort({ sentAt: 1 });

    // Transform to match expected format
    const formattedMessages = messages.map((msg) => ({
      id: msg._id.toString(),
      sender_id: msg.senderId._id.toString(),
      sender_name: msg.senderId.fullName,
      message_text: msg.messageText,
      sent_at: msg.sentAt,
    }));

    res.json({ success: true, messages: formattedMessages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Post a new message to a project
exports.postProjectMessage = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const { message_text } = req.body;

  if (!message_text || !message_text.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Message cannot be empty." });
  }

  try {
    const allowed = await isProjectMemberOrLeader(projectId, userId);
    if (!allowed) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    await Message.create({
      projectId,
      senderId: userId,
      messageText: message_text.trim(),
      sentAt: new Date(),
    });

    res.json({ success: true, message: "Message sent." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};
