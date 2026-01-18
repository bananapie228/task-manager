require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json()); // Allows to read JSON from requests
app.use(express.static('public'));

// mongodb connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Connection Error:', err));

// the schema
const taskSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Task title is required'], // validation rule
        trim: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High'], // only these values are allowed
        default: 'Medium' 
    },
    isCompleted: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true }); // automatically adds 'createdAt' and 'updatedAt'

// create the model
const Task = mongoose.model('Task', taskSchema);


// CRUD Operations

// get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 }); // Newest first
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get task by id
app.get('/api/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Invalid ID format' });
    }
});

// create a new task
app.post('/api/tasks', async (req, res) => {
    try {
        // validation handled by Mongoose Schema
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ error: error.message }); 
    }
});

// update a task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // return the updated version, check rules
        );
        if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});