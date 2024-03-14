const Task = require("../models/Task");
const { validateObjectId } = require("../utils/validation");

exports.getTasks = async (req, res) => {
  try {
    const { task_completed, sort_priority } = req.query;
    const query = { user: req.user.id };

    // task_completed query parameter is provided
    if (task_completed !== undefined) {
      query.task_completed = task_completed === "true";
    }

    let tasks = await Task.find(query);

    // Sort tasks based on priority
    tasks.sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.task_priority] - priorityOrder[b.task_priority];
    });

    // If sort_priority query parameter is not provided, sort tasks based on task_completed
    if (!sort_priority) {
      tasks.sort((a, b) => {
        if (a.task_completed && !b.task_completed) return 1;
        if (!a.task_completed && b.task_completed) return -1;
        return 0;
      });
    } else {
      tasks.sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };

        if (sort_priority === "false") {
          // Sort in descending order (high to low)
          return (
            priorityOrder[b.task_priority] - priorityOrder[a.task_priority]
          );
        } else if (sort_priority === "true") {
          // Sort in ascending order (low to high)
          return (
            priorityOrder[a.task_priority] - priorityOrder[b.task_priority]
          );
        }
      });
    }

    res
      .status(200)
      .json({ tasks, status: true, msg: "Tasks found successfully.." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

exports.getTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    const task = await Task.findOne({
      user: req.user.id,
      _id: req.params.taskId,
    });
    if (!task) {
      return res.status(400).json({ status: false, msg: "No task found.." });
    }
    res
      .status(200)
      .json({ task, status: true, msg: "Task found successfully.." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

exports.postTask = async (req, res) => {
  try {
    const { description, task_priority, task_completed } = req.body;
    if (!description) {
      return res
        .status(400)
        .json({ status: false, msg: "Description of task not found" });
    }
    if (!task_priority) {
      return res
        .status(400)
        .json({ status: false, msg: "Task Priority not found found" });
    }
    const task = await Task.create({
      user: req.user.id,
      description,
      task_priority,
      task_completed,
    });
    res
      .status(200)
      .json({ task, status: true, msg: "Task created successfully.." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

exports.putTask = async (req, res) => {
  console.log(req.body);
  try {
    const { description, task_priority, task_completed } = req.body;
    if (!description) {
      return res
        .status(400)
        .json({ status: false, msg: "Description of task not found" });
    }
    if (!task_priority) {
      return res
        .status(400)
        .json({ status: false, msg: "Task Priority not found" });
    }

    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    let task = await Task.findById(req.params.taskId);
    if (!task) {
      return res
        .status(400)
        .json({ status: false, msg: "Task with given id not found" });
    }

    if (task.user != req.user.id) {
      return res
        .status(403)
        .json({ status: false, msg: "You can't update task of another user" });
    }

    task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { description, task_priority, task_completed },
      { new: true }
    );
    res
      .status(200)
      .json({ task, status: true, msg: "Task updated successfully.." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    let task = await Task.findById(req.params.taskId);
    if (!task) {
      return res
        .status(400)
        .json({ status: false, msg: "Task with given id not found" });
    }

    if (task.user != req.user.id) {
      return res
        .status(403)
        .json({ status: false, msg: "You can't delete task of another user" });
    }

    await Task.findByIdAndDelete(req.params.taskId);
    res.status(200).json({ status: true, msg: "Task deleted successfully.." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};
