const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
router.get('/', taskController.getAllTasks);

router.post('/', protect, adminOnly, taskController.createTask);
router.put('/:id', protect, adminOnly, taskController.updateTask);
router.delete('/:id', protect, adminOnly, taskController.deleteTask);

// Define the paths
router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;