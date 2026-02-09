const Task = require('../models/task');

// GET All Tasks (for authenticated user)
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('category');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST New Task
exports.createTask = async (req, res) => {
    try {
        const taskData = {
            ...req.body,
            userId: req.user.id
        };
        const newTask = new Task(taskData);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// PUT Update Task
exports.updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE Task
exports.deleteTask = async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!deletedTask) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};