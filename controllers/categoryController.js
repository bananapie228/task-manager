// controllers/categoryController.js
const Category = require('../models/category');

// GET All Categories for the authenticated user
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ userId: req.user.id });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST New Category
exports.createCategory = async (req, res) => {
    try {
        const categoryData = { ...req.body, userId: req.user.id };
        const newCategory = new Category(categoryData);
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// PUT Update Category
exports.updateCategory = async (req, res) => {
    try {
        const updatedCategory = await Category.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!updatedCategory) return res.status(404).json({ error: 'Category not found' });
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE Category
exports.deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Category.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!deletedCategory) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};