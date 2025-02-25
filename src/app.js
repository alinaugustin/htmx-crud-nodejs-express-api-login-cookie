require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const sitesRoutes = require('./routes/sitesRoutes');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit'); // Import rateLimit
const compression = require('compression'); // Import compression
const authMiddleware = require('./middleware/authMiddleware');
const testRoutes = require('./routes/testRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// Set up CSRF protection
const csrfProtection = csrf({
    cookie: true
});

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cookieParser());

// Mount auth routes before the CSRF middleware
app.use('/auth', authRoutes);

// CSRF protection middleware
app.use(csrfProtection);

// Remove or comment out the public sites access
// app.use(express.static(path.join(__dirname, 'public/sites'), {
//     maxAge: '1y'
// }));

// Add protected sites routes first
app.use('/sites', sitesRoutes);

// Add test routes
app.use('/test', testRoutes);

// Keep other static file serving for non-protected content
app.use('/public', express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

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

// app.get('/sites', (req, res) => {
//     //res.render('sites');
//     res.sendFile(path.join(__dirname, 'views', 'sites.html'));
// });


// Set Content Security Policy
app.use(helmet()); // Enable all helmet middlewares
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
    }
}));


// Enable compression
app.use(compression());

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});