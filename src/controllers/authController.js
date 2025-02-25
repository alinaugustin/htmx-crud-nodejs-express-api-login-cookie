//const User = require('../models/User'); // Assuming you have a User model for database interactions
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const xss = require('xss');
const fs = require('fs');
const path = require('path');

const users = [
    {
        id: 1,
        name: 'user1',
        email: 'user1@rocnee.ro',
        password: '$2y$10$1CEnor9Yg9Jg3disEIUN.uQegekQLVBSTkLZRCpCzab2897xQ6YiO', // password
    },
    {
        id: 2,
        name: 'user2',
        email: 'user2@rocnee.ro',
        password: '$2y$10$1CEnor9Yg9Jg3disEIUN.uQegekQLVBSTkLZRCpCzab2897xQ6YiO', // password
    },
    {
        id: 3,
        name: 'user3',
        email: 'user3@rocnee.ro',
        password: '$2y$10$1CEnor9Yg9Jg3disEIUN.uQegekQLVBSTkLZRCpCzab2897xQ6YiO', // password
    }
];


const findUserByname = (name) => {
    return users.find(user => user.name === name);
};

const authController = {
    login: async (req, res) => {
        //const { name, password } = req.body;
        const name = xss(req.body.username);
        const password = xss(req.body.password);
        console.log('name + password: ', name + " : " + password);
        try {
            const user = findUserByname(name);
            console.log('user: ', user);
            if (!user) {
                return res.status(401).send('<p> Invalid1 name or password. <br> <a href="/auth/login">Login here</a></p>');
            }
            console.log('user?.password: ', user?.password);
            const isMatch = await bcrypt.compare(password, user?.password);
            //const isMatch = await bcrypt.compare('password', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf4a2Z8F6k6Q8z1F9Z5eW');
            console.log('isMatch: ', isMatch);
            if (!isMatch) {
                return res.status(401).send('<p>Invalid3 name or password. <br> <a href="/auth/login">Login here</a></p>');
            }

            setTimeout(async () => {
                // Create a session and set a cookie
                const idd = user.id;
                const name = user.name;
                const email = user.email;
                console.log('process.env.JWT_SECRET: ', process.env.JWT_SECRET);
                const token = jwt.sign({ id: idd, name: name, email:email }, process.env.JWT_SECRET, { expiresIn: '15min' });
                res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
                //res.send('Login successful');
                res.redirect('/dashboard');
            }, 1000);

        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    },

    logout: (req, res) => {
        res.clearCookie('token');
        //res.send('Logout successful');
        //res.send('<p>You have been logged out. <a href="/login">Login again</a></p>');.
        //res.redirect('/login');
        res.send('<script>window.location.href="/";</script>');
    },

    getLoginForm: (req, res) => {
        console.log("getLoginForm called"); // Add this line
        const csrfToken = req.csrfToken();
        console.log("CSRF Token:", csrfToken); // Add this line
        const loginFilePath = path.join(__dirname, '../views/login.html');
        fs.readFile(loginFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading login.html:", err);
                return res.status(500).send('Server error');
            }
            //console.log("login.html content:", data); // Add this line
            const modifiedData = data.replace('{{csrfToken}}', csrfToken);
            //console.log("Modified HTML:", modifiedData); // Add this line
            res.send(modifiedData);
        });
    }
};

module.exports = authController;