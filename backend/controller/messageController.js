const pool = require("../db");

// Helper: check if user is a member or leader of the project
async function isProjectMemberOrLeader(projectId, userId) {
  const result = await pool.query(
    `SELECT * FROM project_members WHERE project_id = $1 AND member_id = $2 AND status = 'accepted'`,
    [projectId, userId]
  );
  if (result.rows.length > 0) return true;
  // Check if leader
  const project = await pool.query(
    `SELECT leader_id FROM projects WHERE id = $1`,
    [projectId]
  );
  return project.rows.length > 0 && project.rows[0].leader_id === userId;
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
    const messages = await pool.query(
      `SELECT m.*, u.full_name AS sender_name FROM project_messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.project_id = $1
       ORDER BY m.sent_at ASC`,
      [projectId]
    );
    res.json({ success: true, messages: messages.rows });
  } catch (err) {
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
    await pool.query(
      `INSERT INTO project_messages (project_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, NOW())`,
      [projectId, userId, message_text.trim()]
    );
    res.json({ success: true, message: "Message sent." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};
