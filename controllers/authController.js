const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Helper to create Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'secret_key_123',
        { expiresIn: '1h' }
    );
};

// REGISTER
exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Create user (password is hashed automatically by model)
        const user = new User({ email, password, role });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        // 2. Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // 3. Generate Token
        const token = generateToken(user);
        res.json({ token, role: user.role });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};