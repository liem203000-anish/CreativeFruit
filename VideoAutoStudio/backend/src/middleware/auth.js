const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'videoautostudio_jwt_secret_change_in_production';

// Authenticate middleware
const authenticate = (req, res, next) => {
    try {
        // Check multiple sources for token
        let token = null;
        
        // 1. Check Authorization header
        if (req.headers.authorization) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        // 2. Check cookies
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }
        
        // 3. Check query parameter
        if (!token && req.query.token) {
            token = req.query.token;
        }
        
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};

// Role-based access control
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
        
        next();
    };
};

module.exports = { authenticate, requireRole, JWT_SECRET };
