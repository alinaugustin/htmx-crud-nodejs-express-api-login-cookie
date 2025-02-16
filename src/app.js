require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const path = require('path');
const helmet = require('helmet'); // Add this line

const app = express();
const PORT = process.env.PORT || 3000;

// Set up CSRF protection
const csrfProtection = csrf({ cookie: true });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRoutes);
app.use('/', dashboardRoutes);

// Middleware to add CSRF token to all views
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Serve the index.html file as the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


// Set Content Security Policy
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"], // Allow resources from the same domain
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow scripts from the same domain, inline scripts, and eval()
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow styles from the same domain and inline styles
            imgSrc: ["'self'", "data:"], // Allow images from the same domain and data URIs
            fontSrc: ["'self'"], // Allow fonts from the same domain
            connectSrc: ["'self'"], // Allow AJAX/fetch requests to the same domain
        },
    })
);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});