// filepath: /d:/APPS_home/2025/htmx-express-login-cookie/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        //return res.status(401).send('Access denied. No token provided.');
        return res.redirect('/auth/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        //res.status(400).send('Invalid token.');
        res.redirect('/auth/login');
    }
};

module.exports = authMiddleware;