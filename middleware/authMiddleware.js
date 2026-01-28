const jwt = require('jsonwebtoken');

// verify Token
exports.protect = (req, res, next) => {
    
    const token = req.headers.authorization?.split(' ')[1]; 

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');
        req.user = decoded; // Attach user info to the request
        next(); // Pass to the next function
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Verify Admin
exports.adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};