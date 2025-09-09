const db = require("../db");

// Create a new task
exports.createTask = async (req, res) => {
  const { projectId } = req.params;
  const { assigned_to, title, description, status, deadline } = req.body;
  const assigned_by = req.user.id; // Assumes auth middleware sets req.user

  try {
    // Check if user is project leader or mentor
    const project = await db.query("SELECT * FROM projects WHERE id = $1", [
      projectId,
    ]);
    if (!project.rows.length)
      return res.status(404).json({ error: "Project not found" });

    // Check if user is leader or mentor in project_members
    const roleRes = await db.query(
      "SELECT role FROM project_members WHERE project_id = $1 AND member_id = $2 AND status = $3",
      [projectId, assigned_by, "accepted"]
    );
    const userRole = roleRes.rows[0]?.role;
    if (userRole !== "leader" && userRole !== "mentor") {
      return res
        .status(403)
        .json({ error: "Only leader or mentor can assign tasks" });
    }

    // Check if assigned_to is a member of the project
    const member = await db.query(
      "SELECT * FROM project_members WHERE project_id = $1 AND member_id = $2 AND status = $3",
      [projectId, assigned_to, "accepted"]
    );
    if (!member.rows.length)
      return res
        .status(400)
        .json({ error: "Assigned user is not a project member" });

    const result = await db.query(
      "INSERT INTO tasks (project_id, assigned_to, assigned_by, title, description, status, deadline, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *",
      [
        projectId,
        assigned_to,
        assigned_by,
        title,
        description,
        status || "pending",
        deadline,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create task", details: err.message });
  }
};

// Get all tasks for a project
exports.getProjectTasks = async (req, res) => {
  const { projectId } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC",
      [projectId]
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch tasks", details: err.message });
  }
};

// Update a task (status, deadline, etc.)
exports.updateTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { status, deadline, title, description } = req.body;
  try {
    const result = await db.query(
      "UPDATE tasks SET status = COALESCE($1, status), deadline = COALESCE($2, deadline), title = COALESCE($3, title), description = COALESCE($4, description) WHERE id = $5 AND project_id = $6 RETURNING *",
      [status, deadline, title, description, taskId, projectId]
    );
    if (!result.rows.length)
      return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update task", details: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  try {
    const result = await db.query(
      "DELETE FROM tasks WHERE id = $1 AND project_id = $2 RETURNING *",
      [taskId, projectId]
    );
    if (!result.rows.length)
      return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete task", details: err.message });
  }
};
