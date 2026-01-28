const Task = require('../models/task'); // Import the model we just created

// GET All Tasks
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .sort({ createdAt: -1 })
            .populate('category'); // 
        console.log('Tasks with populated categories:', tasks);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST New Task
exports.createTask = async (req, res) => {
    try {
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// PUT Update Task
exports.updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
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
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};