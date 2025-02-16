require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
//app.use(express.static('public'));

//app.set('view engine', 'html');
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'html');
//app.engine('html', require('ejs').renderFile);
;

// Serve static files from the 'public' folder
//app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRoutes);
app.use('/', dashboardRoutes);

// app.get('/login', (req, res) => {
//     res.sendFile(__dirname + '/views/index.html');
// });


// Serve HTML files from the 'views' folder
app.get('/:page?', (req, res) => {
    const page = req.params.page || 'index';
    res.sendFile(path.join(__dirname, 'views', `${page}.html`));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});