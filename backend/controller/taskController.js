const Task = require("../models/Task");
const Project = require("../models/Project");
const ProjectMember = require("../models/ProjectMember");

// Create a new task
exports.createTask = async (req, res) => {
  const { projectId } = req.params;
  const { assigned_to, title, description, status, deadline } = req.body;
  const assigned_by = req.user.id;

  try {
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Check if user is leader or mentor in project_members
    const userMembership = await ProjectMember.findOne({
      projectId,
      memberId: assigned_by,
      status: "accepted",
    });

    const userRole = userMembership?.role;
    if (userRole !== "leader" && userRole !== "mentor") {
      return res
        .status(403)
        .json({ error: "Only leader or mentor can assign tasks" });
    }

    // Check if assigned_to is a member of the project
    const memberExists = await ProjectMember.findOne({
      projectId,
      memberId: assigned_to,
      status: "accepted",
    });

    if (!memberExists)
      return res
        .status(400)
        .json({ error: "Assigned user is not a project member" });

    const newTask = await Task.create({
      projectId,
      assignedTo: assigned_to,
      assignedBy: assigned_by,
      title,
      description,
      status: status || "pending",
      deadline,
    });

    res.status(201).json(newTask);
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
    const tasks = await Task.find({ projectId }).sort({ createdAt: -1 });
    res.json(tasks);
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
    const updateFields = {};
    if (status) updateFields.status = status;
    if (deadline) updateFields.deadline = deadline;
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;

    const task = await Task.findOneAndUpdate(
      { _id: taskId, projectId },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
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
    const task = await Task.findOneAndDelete({ _id: taskId, projectId });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete task", details: err.message });
  }
};
